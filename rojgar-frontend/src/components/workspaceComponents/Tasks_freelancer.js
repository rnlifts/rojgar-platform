// src/components/workspaceComponents/Tasks_Freelancer.js
import axios from 'axios';
import { UserCircle } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useOpposingParty } from '../../hooks/useOpposingParty';
import TaskModal from './TaskModal';

const Tasks_Freelancer = ({ proposal, jobId }) => {
  const { opposingParty, error: opposingPartyError } = useOpposingParty(proposal);
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/tasks/job/${jobId}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }
        );
        setTasks(response.data.tasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setError('Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchTasks();
    }
  }, [jobId]);

  // Handle task status update
  const handleMarkComplete = async (taskId, e) => {
    e.stopPropagation();
    try {
      const response = await axios.patch(
        `http://localhost:5000/api/tasks/${taskId}/status`,
        { status: 'completed' },
        {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Update tasks in the state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task._id === taskId ? response.data.task : task
        )
      );

      // Optional: Show success message
      setError(null);
    } catch (error) {
      console.error('Error marking task as complete:', error);
      setError(error.response?.data?.message || 'Failed to mark task as complete');
    }
  };

  const handleTaskUpdate = (updatedTask) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task._id === updatedTask._id ? updatedTask : task
      )
    );
  };
  

  const StatusBadge = ({ status }) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      under_review: "bg-purple-100 text-purple-800",
      revision_needed: "bg-red-100 text-red-800"
    };

    return (
      <span className={`px-2 py-1 rounded-full text-sm ${statusColors[status]}`}>
        {status?.replace('_', ' ').toUpperCase() || 'PENDING'}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {opposingParty && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <UserCircle className="w-6 h-6 text-gray-600" />
            <h3 className="text-lg font-semibold">Client Details:</h3>
          </div>
          <div className="ml-9 space-y-1">
            <p className="text-gray-700">
              <span className="font-medium">Name:</span> {opposingParty.name}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Email:</span> {opposingParty.email}
            </p>
          </div>
        </div>
      )}

      {/* Tasks List */}
      {loading ? (
        <div>Loading tasks...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Tasks</h3>
          <ul className="space-y-2">
            {tasks.map((task) => (
              <li 
                key={task._id}
                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  setSelectedTask(task);
                  setIsModalOpen(true);
                }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{task.title}</h4>
                    <p className="text-sm text-gray-600">
                      Due: {new Date(task.deadline).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={task.status} />
                    {task.status !== 'completed' && (
                      <button 
                        onClick={(e) => handleMarkComplete(task._id, e)}
                        className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={selectedTask}
        proposal={proposal}
        userRole="Freelancer"
        onTaskUpdate={handleTaskUpdate} // Add this
      />
    </div>
  );
};

export default Tasks_Freelancer;