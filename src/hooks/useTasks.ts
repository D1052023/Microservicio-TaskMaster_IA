import { useState, useEffect, useCallback } from 'react';
import { Task, CreateTaskPayload, UpdateTaskPayload } from '../types/tasks';

// Supabase mock/client - Replace with actual import in real app
// import { supabase } from '../lib/supabase';
const supabase = null as any; // Simulating no supabase configured

let mockTasks: Task[] = [
  {
    id: '1',
    project_id: 'proj-123',
    title: 'Diseñar la base de datos',
    description: 'Crear esquema inicial',
    status: 'in_progress',
    priority: 'high',
    assigned_to: null,
    created_at: new Date().toISOString()
  }
];

export const useTasks = (projectId: string) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (supabase) {
        const { data, error: fetchError } = await supabase
          .from('tasks')
          .select('*')
          .eq('project_id', projectId);
        
        if (fetchError) throw fetchError;
        setTasks(data || []);
      } else {
        // Fallback to mock data
        setTimeout(() => {
          setTasks(mockTasks.filter(t => t.project_id === projectId));
          setLoading(false);
        }, 500);
        return; // Early return for mock
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching tasks');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchTasks();

    if (!supabase) return; // Fallback: no realtime if no supabase

    // Supabase Realtime Subscription
    const channel = supabase
      .channel(`tasks-project-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `project_id=eq.${projectId}`,
        },
        (payload: any) => {
          if (payload.eventType === 'INSERT') {
            setTasks((prev) => [...prev, payload.new as Task]);
          } else if (payload.eventType === 'UPDATE') {
            setTasks((prev) =>
              prev.map((t) => (t.id === payload.new.id ? (payload.new as Task) : t))
            );
          } else if (payload.eventType === 'DELETE') {
            setTasks((prev) => prev.filter((t) => t.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Cleanup function
    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, fetchTasks]);

  const createTask = async (payload: CreateTaskPayload) => {
    if (supabase) {
      const { data, error } = await supabase.from('tasks').insert([payload]).select().single();
      if (error) throw error;
      // Realtime will handle state update, or we can do it optimistically
    } else {
      const newTask: Task = {
        ...payload,
        id: Math.random().toString(36).substring(2, 9),
        created_at: new Date().toISOString(),
      };
      mockTasks.push(newTask);
      setTasks(prev => [...prev, newTask]);
    }
  };

  const updateTask = async (taskId: string, payload: UpdateTaskPayload) => {
    if (supabase) {
      const { error } = await supabase.from('tasks').update(payload).eq('id', taskId);
      if (error) throw error;
    } else {
      mockTasks = mockTasks.map(t => t.id === taskId ? { ...t, ...payload } : t);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...payload } : t));
    }
  };

  const deleteTask = async (taskId: string) => {
    if (supabase) {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);
      if (error) throw error;
    } else {
      mockTasks = mockTasks.filter(t => t.id !== taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    }
  };

  return { tasks, loading, error, createTask, updateTask, deleteTask };
};
