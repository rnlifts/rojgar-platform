// src/components/workspaceComponents/TaskModal.js
import axios from "axios";
import { X } from "lucide-react";
import React, { useState } from "react";

const TaskModal = ({ isOpen, onClose, task, proposal, userRole, onTaskUpdate }) => {
  const [revisionReason, setRevisionReason] = useState("");
  const [error, setError] = useState(null);

  if (!isOpen || !task) return null;

  const calculateTimeRemaining = (deadline) => {
    const remaining = new Date(deadline) - new Date();
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    return `${days} days remaining`;
  };

  const handleStatusTransition = async (status, reason = null) => {
    try {
      const response = await axios.patch(
        `http://localhost:5000/api/tasks/${task._id}/transition`,
        { status, reason },
        {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Callback to update task in parent component
      if (onTaskUpdate) {
        onTaskUpdate(response.data.task);
      }

      // Close modal after successful update
      onClose();
    } catch (error) {
      console.error('Error updating task status:', error);
      setError(error.response?.data?.message || 'Failed to update task status');
    }
  };

  const StatusBadge = ({ status }) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-blue-100 text-blue-800",
      submitted: "bg-purple-100 text-purple-800",
      under_review: "bg-orange-100 text-orange-800",
      revision_needed: "bg-red-100 text-red-800",
      completed: "bg-green-100 text-green-800"
    };

    return (
      <span className={`px-2 py-1 rounded-full text-sm ${statusColors[status]}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  // Render actions based on user role and task status
  const renderActions = () => {
    if (userRole === 'Client') {
      switch (task.status) {
        case 'submitted':
          return (
            <div className="border-t pt-4 flex gap-3">
              <button 
                onClick={() => handleStatusTransition('under_review')}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Start Review
              </button>
            </div>
          );
        
        case 'under_review':
          return (
            <div className="border-t pt-4 space-y-4">
              <div className="flex gap-3">
                <button 
                  onClick={() => handleStatusTransition('completed')}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Approve Task
                </button>
                <button 
                  onClick={() => {
                    // Open revision reason input
                    const reason = prompt("Please provide revision instructions:");
                    if (reason) {
                      handleStatusTransition('revision_needed', reason);
                    }
                  }}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                >
                  Request Revision
                </button>
              </div>
            </div>
          );
        
        default:
          return null;
      }
    } else if (userRole === 'Freelancer') {
      switch (task.status) {
        case 'in_progress':
          return (
            <div className="border-t pt-4 flex gap-3">
              <button 
                onClick={() => handleStatusTransition('submitted')}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Submit Work
              </button>
            </div>
          );
        
        case 'revision_needed':
          return (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Revision Reason</h3>
              <p className="text-red-600 mb-4">{task.revisionReason}</p>
              <button 
                onClick={() => handleStatusTransition('submitted')}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Resubmit After Revision
              </button>
            </div>
          );
        
        default:
          return null;
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-4">
          {/* Header with Close Button */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">{task.title}</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-100 text-red-800 p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Existing task details... */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Job ID: {task.jobId}</p>
                <p className="text-gray-600">Proposal ID: {task.proposalId}</p>
              </div>
              <div className="text-right">
                <StatusBadge status={task.status} />
              </div>
            </div>

            {/* Description */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-700">{task.description}</p>
            </div>

            {/* Timeline */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Timeline</h3>
              <p>Deadline: {new Date(task.deadline).toLocaleDateString()}</p>
              <p>{calculateTimeRemaining(task.deadline)}</p>
            </div>
          </div>

          {/* Dynamic Actions */}
          {renderActions()}
        </div>
      </div>
    </div>
  );
};

export default TaskModal;