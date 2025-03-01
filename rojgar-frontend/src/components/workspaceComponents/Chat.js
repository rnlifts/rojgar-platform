import axios from 'axios';
import { UserCircle } from "lucide-react";
import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { useOpposingParty } from '../../hooks/useOpposingParty';

const Chat = ({ proposal, jobId }) => {
  const { opposingParty, userRole, currentUserId, error: opposingPartyError } = useOpposingParty(proposal);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const socketRef = useRef();
  const messagesEndRef = useRef(null);

  // Fetch existing messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!proposal?._id) return;
      
      try {
        console.log('Fetching messages for proposal:', proposal._id);
        const response = await axios.get(
          `http://localhost:5000/api/messages/proposal/${proposal._id}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          }
        );
        console.log('Fetched messages:', response.data);
        if (response.data.success) {
          setMessages(response.data.messages);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [proposal]);

  // Socket connection
  useEffect(() => {
    socketRef.current = io('http://localhost:5000');

    if (proposal?._id) {
      console.log('Joining chat room:', proposal._id);
      socketRef.current.emit('join_chat', proposal._id);
    }

    socketRef.current.on('receive_message', (newMessage) => {
      console.log('Received new message:', newMessage);
      setMessages(prev => [...prev, newMessage]);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [proposal]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !opposingParty || !currentUserId) {
      console.log('Missing required data:', {
        message: newMessage.trim(),
        opposingParty,
        currentUserId
      });
      return;
    }

    const messageData = {
      proposalId: proposal._id,
      jobId,
      senderId: currentUserId,
      receiverId: opposingParty._id,
      content: newMessage
    };

    console.log('Sending message data:', messageData);

    try {
      socketRef.current.emit('send_message', messageData);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="space-y-6">
      {/* Opposing Party Details */}
      {opposingParty && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <UserCircle className="w-6 h-6 text-gray-600" />
            <h3 className="text-lg font-semibold">
              {userRole === "Client" ? "Freelancer" : "Client"} Details:
            </h3>
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

      {/* Chat Messages */}
      <div className="flex flex-col h-[calc(100vh-400px)] bg-white rounded-lg shadow">
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((message, index) => (
            <div
              key={message._id || index}
              className={`mb-4 ${
                message.senderId === currentUserId ? 'text-right' : 'text-left'
              }`}
            >
              <div
                className={`inline-block p-3 rounded-lg ${
                  message.senderId === currentUserId
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <span className="text-xs opacity-75">
                  {formatTimestamp(message.timestamp)}
                </span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-4 border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat;