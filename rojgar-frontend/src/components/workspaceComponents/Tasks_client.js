// src/components/workspaceComponents/Tasks_Client.js
import axios from 'axios';
import { UserCircle } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useOpposingParty } from '../../hooks/useOpposingParty';
import TaskModal from './TaskModal';

const Tasks_Client = ({ proposal, jobId }) => {
  const { opposingParty, error: opposingPartyError } = useOpposingParty(proposal);
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    deadline: ''
  });
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

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      // Ensure you're passing all required fields
      const taskData = {
        title: newTask.title,
        description: newTask.description,
        jobId: jobId, // Make sure this is a string of a valid MongoDB ObjectId
        proposalId: proposal._id, // Ensure this is a valid ObjectId string
        freelancerId: proposal.freelancerId._id, // Ensure this is a valid ObjectId string
        deadline: newTask.deadline
      };
  
      console.log('Task Creation Data:', taskData);
  
      const response = await axios.post(
        'http://localhost:5000/api/tasks',
        taskData,
        {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      console.log('Task creation response:', response.data);
  
      setTasks([response.data.task, ...tasks]);
      setNewTask({ title: '', description: '', deadline: '' });
    } catch (error) {
      console.error('Full Error creating task:', error.response ? error.response.data : error);
      setError(error.response?.data?.message || 'Failed to create task');
    }
  };

  const handleTaskUpdate = (updatedTask) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task._id === updatedTask._id ? updatedTask : task
      )
    );
  };
  

  return (
    <div className="space-y-6">
      {opposingParty && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <UserCircle className="w-6 h-6 text-gray-600" />
            <h3 className="text-lg font-semibold">Freelancer Details:</h3>
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

      {/* Create Task Form */}
      <form onSubmit={handleCreateTask} className="space-y-4">
        <div>
          <input
            type="text"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            placeholder="Task title"
            className="w-full p-2 border rounded-lg"
            required
          />
        </div>
        <div>
          <textarea
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            placeholder="Task description"
            className="w-full p-2 border rounded-lg"
            rows={3}
            required
          />
        </div>
        <div>
          <input
            type="datetime-local"
            value={newTask.deadline}
            onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
            className="w-full p-2 border rounded-lg"
            required
          />
        </div>
        <button 
          type="submit"
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Create Task
        </button>
      </form>

      {/* Tasks List */}
      {loading ? (
        <div>Loading tasks...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Assigned Tasks</h3>
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
                  <span className="px-2 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                    {task.status}
                  </span>
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
        userRole="Client"
        onTaskUpdate={handleTaskUpdate} // Add this
      />
    </div>
  );
};

export default Tasks_Client;