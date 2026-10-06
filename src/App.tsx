import React from 'react';
import { TaskManager } from './components/TaskManager';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">TaskMaster AI - Lab 4</h1>
        <TaskManager projectId="proj-123" />
      </div>
    </div>
  );
}

export default App;
