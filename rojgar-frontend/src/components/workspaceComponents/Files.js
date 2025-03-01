import axios from "axios";
import { Download, Eye, File as FileIcon, Trash2, Upload, UserCircle } from "lucide-react";
import React, { useEffect, useState } from "react";

const Files = ({ jobId, proposal, opposingPartyDetails }) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [myFiles, setMyFiles] = useState([]);
  const [opposingPartyFiles, setOpposingPartyFiles] = useState([]);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [opposingParty, setOpposingParty] = useState(null);

  // Fetch current user details and role
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/auth/get-user", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        setUserRole(response.data.currentRole);
        setCurrentUserId(response.data.id);
      } catch (error) {
        console.error("Error fetching user details:", error);
        setError("Failed to load user details");
      }
    };
    fetchUserDetails();
  }, []);

  // Set opposing party from proposal data
  useEffect(() => {
    if (proposal && userRole) {
      const opposingPartyData = userRole === "Client" ? proposal.freelancerId : proposal.clientId;
      setOpposingParty(opposingPartyData);
    }
  }, [proposal, userRole]);

  const getAuthHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`
  });

  // Fetch both sets of files
  useEffect(() => {
    const fetchAllFiles = async () => {
      try {
        // Fetch current user's files
        const myFilesResponse = await axios.get(
          `http://localhost:5000/api/files`, {
            params: { jobId },
            headers: getAuthHeader()
          }
        );
        setMyFiles(myFilesResponse.data);

        // Fetch opposing party's files
        if (opposingParty?._id) {
          const opposingPartyFilesResponse = await axios.get(
            `http://localhost:5000/api/files`, {
              params: { 
                userId: opposingParty._id,
                jobId 
              },
              headers: getAuthHeader()
            }
          );
          setOpposingPartyFiles(opposingPartyFilesResponse.data);
        }
      } catch (error) {
        console.error("Error fetching files:", error);
        setError("Failed to load files. Please try again later.");
      }
    };

    if (jobId && opposingParty?._id) {
      fetchAllFiles();
    }
  }, [jobId, opposingParty]);

  const handleFileSelect = (e) => {
    setSelectedFiles(e.target.files);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFiles?.length) {
      setError("Please select files to upload");
      return;
    }

    setIsUploading(true);
    setError(null);
    const formData = new FormData();
    Array.from(selectedFiles).forEach(file => formData.append("files", file));
    
    if (jobId) {
      formData.append("jobId", jobId);
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/upload",
        formData,
        {
          headers: {
            ...getAuthHeader(),
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        }
      );

      // Refresh the files list after successful upload
      const updatedFilesResponse = await axios.get(
        `http://localhost:5000/api/files`,
        {
          params: { jobId },
          headers: getAuthHeader()
        }
      );
      setMyFiles(updatedFilesResponse.data);

      setSelectedFiles(null);
      document.querySelector('input[type="file"]').value = "";
      setError(null);
    } catch (error) {
      console.error("Upload error:", error);
      setError("Failed to upload files. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDownload = async (file) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/files/${file._id}/download`,
        {
          headers: getAuthHeader(),
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      setError("Failed to download file. Please try again.");
    }
  };

  const handlePreview = async (file) => {
    try {
      const token = localStorage.getItem('token');
  
      // Check file type and handle accordingly
      if (file.mimetype?.startsWith('image/')) {
        // For images, fetch with auth and create blob URL
        const response = await axios.get(
          `http://localhost:5000/api/files/${file._id}/view`,
          {
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'blob'
          }
        );
        const blob = new Blob([response.data], { type: response.headers['content-type'] });
        const blobUrl = window.URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
        
        // Clean up blob URL after opening
        setTimeout(() => {
          window.URL.revokeObjectURL(blobUrl);
        }, 100);
  
      } else if (
        file.mimetype === 'application/pdf' || 
        file.mimetype?.includes('text/') ||
        file.mimetype?.includes('image/') ||
        file.mimetype === 'application/vnd.ms-excel' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ) {
        // For PDFs, text files, and Excel files
        const response = await axios.get(
          `http://localhost:5000/api/files/${file._id}/view`,
          {
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'blob'
          }
        );
        const blob = new Blob([response.data], { type: response.headers['content-type'] });
        const blobUrl = window.URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
        
        // Clean up blob URL after opening
        setTimeout(() => {
          window.URL.revokeObjectURL(blobUrl);
        }, 100);
  
      } else {
        // For other files, better to download
        handleDownload(file);
        alert('This file type might not preview correctly in browser. Downloading instead.');
      }
    } catch (error) {
      console.error("Preview error:", error);
      setError("Failed to preview file. Please try again.");
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      await axios.delete(
        `http://localhost:5000/api/files/${fileId}`,
        { headers: getAuthHeader() }
      );

      // Update the files list after deletion
      setMyFiles(prevFiles => prevFiles.filter(file => file._id !== fileId));
      setError(null);
    } catch (error) {
      console.error("Delete error:", error);
      setError("Failed to delete file. Please try again.");
    }
  };

  // File item component
  const FileItem = ({ file, isOpposingParty = false }) => (
    <div className={`p-4 border rounded-lg ${isOpposingParty ? 'bg-gray-50' : ''}`}>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <FileIcon className="w-8 h-8 text-blue-500" />
          <div className="flex-1 min-w-0">
            <p className="truncate font-medium">{file.filename}</p>
            <p className="text-sm text-gray-500">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {new Date(file.uploadedAt).toLocaleDateString()}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handlePreview(file)}
              className="p-1 rounded-full hover:bg-gray-100"
              title="Preview"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDownload(file)}
              className="p-1 rounded-full hover:bg-gray-100"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
            {!isOpposingParty && (
              <button
                onClick={() => handleDelete(file._id)}
                className="p-1 rounded-full hover:bg-gray-100 text-red-500"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 space-y-8">
      {/* Opposing Party Details Section */}
      {opposingParty && (
        <div className="mb-6 bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <UserCircle className="w-6 h-6 text-gray-600" />
            <h3 className="text-lg font-semibold">Shared Workspace with:</h3>
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

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {/* Upload Section */}
      <div>
        <h3 className="mb-6 text-2xl font-semibold">Upload Files</h3>
        <div className="p-6 border rounded-lg">
          <div className="space-y-4">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-10 h-10 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                multiple
                onChange={handleFileSelect}
              />
            </label>

            {selectedFiles && (
              <div className="space-y-4">
                {Array.from(selectedFiles).map((file, index) => (
                  <div key={`selected-${index}`} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center space-x-2">
                      <FileIcon className="w-4 h-4" />
                      <span>{file.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                ))}

                {isUploading && (
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full bg-blue-600"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}

                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="w-full px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? "Uploading..." : "Upload Files"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Your Files Section */}
      {myFiles.length > 0 && (
        <div>
          <h4 className="mb-4 text-xl font-medium">Your Files</h4>
          <div className="flex flex-col gap-4 overflow-y-auto max-h-96">
            {myFiles.map((file) => (
              <FileItem key={file._id} file={file} />
            ))}
          </div>
        </div>
      )}

      {/* Opposing Party Files Section */}
      {opposingPartyFiles.length > 0 && (
        <div>
          <h4 className="mb-4 text-xl font-medium">
            {userRole === "Client" ? "Freelancer's" : "Client's"} Files
          </h4>
          <div className="flex flex-col gap-4 overflow-y-auto max-h-96">
            {opposingPartyFiles.map((file) => (
              <FileItem key={file._id} file={file} isOpposingParty={true} />
            ))}
          </div>
        </div>
      )}

      {myFiles.length === 0 && opposingPartyFiles.length === 0 && !error && (
        <div className="text-center py-8 text-gray-500">
          No files uploaded yet
        </div>
      )}
    </div>
  );
};

export default Files;