import React, { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import { TaskStatus, TaskPriority } from '../types/tasks';

interface TaskManagerProps {
  projectId: string;
}

export const TaskManager: React.FC<TaskManagerProps> = ({ projectId }) => {
  const { tasks, loading, error, createTask, updateTask, deleteTask } = useTasks(projectId);
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all');
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>('todo');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    await createTask({
      project_id: projectId,
      title: newTaskTitle,
      description: '',
      status: newTaskStatus,
      priority: 'medium',
      assigned_to: null,
    });
    setNewTaskTitle('');
  };

  const filteredTasks = tasks.filter(t => filter === 'all' || t.status === filter);

  return (
    <div className="task-manager p-6 bg-white rounded shadow">
      <div className="header flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Gestor de Tareas</h2>
        <div className="realtime-indicator flex items-center text-green-500 text-sm">
          <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
          En vivo / Live Updates
        </div>
      </div>

      {error && (
        <div className="error-alert bg-red-100 text-red-700 p-3 rounded mb-4">
          Error: {error}
        </div>
      )}

      <form onSubmit={handleCreate} className="create-form flex gap-2 mb-6">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Nueva tarea..."
          className="border p-2 rounded flex-1"
        />
        <select
          value={newTaskStatus}
          onChange={(e) => setNewTaskStatus(e.target.value as TaskStatus)}
          className="border p-2 rounded"
        >
          <option value="todo">Por Hacer</option>
          <option value="in_progress">En Progreso</option>
          <option value="completed">Completado</option>
        </select>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Añadir
        </button>
      </form>

      <div className="filters mb-4">
        <span className="mr-2">Filtrar:</span>
        {(['all', 'todo', 'in_progress', 'completed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`mr-2 px-3 py-1 rounded ${filter === f ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
          >
            {f === 'all' ? 'Todos' : f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading flex justify-center py-8">
          <div className="spinner border-4 border-blue-500 border-t-transparent rounded-full w-8 h-8 animate-spin"></div>
          <span className="ml-2 text-gray-500">Cargando tareas...</span>
        </div>
      ) : (
        <ul className="task-list space-y-3">
          {filteredTasks.length === 0 ? (
            <li className="text-gray-500 italic">No hay tareas.</li>
          ) : (
            filteredTasks.map(task => (
              <li key={task.id} className="task-item border p-3 rounded flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{task.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${
                    task.status === 'completed' ? 'bg-green-100 text-green-700' :
                    task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100'
                  }`}>
                    {task.status}
                  </span>
                </div>
                <div className="actions flex gap-2">
                  <select
                    value={task.status}
                    onChange={(e) => updateTask(task.id, { status: e.target.value as TaskStatus })}
                    className="border text-sm p-1 rounded"
                  >
                    <option value="todo">Por Hacer</option>
                    <option value="in_progress">En Progreso</option>
                    <option value="completed">Completado</option>
                  </select>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};
