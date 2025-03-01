import React, { useState } from 'react';

const CVUploader = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [step, setStep] = useState(1); // Track the current step
    const [serverResponse, setServerResponse] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setResult(null); // Reset result when new file is selected
        setError(null);
        setServerResponse(null);
        setStep(1); // Reset to step 1 when new file is selected
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Please select a file to upload.");
            return;
        }

        const formData = new FormData();
        formData.append('cv', file);
        setUploading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch('http://localhost:5000/api/cv/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.statusText}`);
            }

            const data = await response.json();
            console.log("Received data from CV upload:", data);
            setResult(data.result);
            setStep(2); // Move to step 2 after successful upload
        } catch (err) {
            setError("Error uploading file: " + err.message);
            console.error("Upload error:", err);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async () => {
        if (!result) {
            setError("No CV data to submit.");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            console.log("Submitting data:", result);
            
            // Send the result data directly
            const response = await fetch('http://localhost:5000/api/profile/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(result),
            });

            const responseData = await response.json();
            setServerResponse(responseData);
            
            if (!response.ok) {
                throw new Error(responseData.error || `Server error: ${response.statusText}`);
            }

            // Handle successful submission
            setStep(3); // Move to final step after submission
        } catch (err) {
            setError("Error submitting data: " + err.message);
            console.error("Submission error:", err);
        } finally {
            setSubmitting(false);
        }
    };

    // Helper function to render CV data
    const renderCVData = (data) => {
        return (
            <div className="bg-gray-100 p-4 rounded mb-4">
                <div className="mb-2">
                    <span className="font-bold">Name:</span> {data.name}
                </div>
                <div className="mb-2">
                    <span className="font-bold">Email:</span> {data.email}
                </div>
                <div className="mb-2">
                    <span className="font-bold">Contact:</span> {data.contact}
                </div>
                <div className="mb-2">
                    <span className="font-bold">Bio:</span> {data.short_bio || data.bio}
                </div>

                {/* Education - handle different formats */}
                <div className="mb-2">
                    <span className="font-bold">Education:</span> 
                    <div className="ml-4">
                        {data.education && typeof data.education === 'object' ? (
                            <>
                                {data.education.current && (
                                    <div>Current: {data.education.current}</div>
                                )}
                                {data.education.degree && (
                                    <div>Degree: {data.education.degree} - {data.education.institution} ({data.education.year})</div>
                                )}
                                {data.education.previous && Array.isArray(data.education.previous) && (
                                    <div>
                                        Previous: 
                                        <ul className="list-disc ml-4">
                                            {data.education.previous.map((edu, i) => (
                                                <li key={i}>{edu}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div>{JSON.stringify(data.education)}</div>
                        )}
                    </div>
                </div>

                {/* Skills */}
                <div className="mb-2">
                    <span className="font-bold">Skills:</span> {data.skills}
                </div>

                {/* Experience */}
                <div className="mb-2">
                    <span className="font-bold">Experience:</span>
                    <ul className="list-disc ml-4">
                        {Array.isArray(data.experience) ? 
                            data.experience.map((exp, i) => (
                                <li key={i}>{exp}</li>
                            )) : 
                            <li>{data.experience}</li>
                        }
                    </ul>
                </div>

                {/* Languages (if exists) */}
                {data.languages && (
                    <div className="mb-2">
                        <span className="font-bold">Languages:</span> 
                        <div className="ml-4">
                            {data.languages.mother_tongue && (
                                <div>Mother Tongue: {Array.isArray(data.languages.mother_tongue) ? 
                                    data.languages.mother_tongue.join(', ') : 
                                    data.languages.mother_tongue}
                                </div>
                            )}
                            {data.languages.other && (
                                <div>Other: {Array.isArray(data.languages.other) ? 
                                    data.languages.other.join(', ') : 
                                    data.languages.other}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Additional Info */}
                {data.additional_info && (
                    <div className="mb-2">
                        <span className="font-bold">Additional Info:</span> {data.additional_info}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-6">CV Uploader</h2>
            
            {/* Progress indicator */}
            <div className="mb-6">
                <div className="flex justify-between">
                    <span className={`font-medium ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                        Upload CV
                    </span>
                    <span className={`font-medium ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                        Review Information
                    </span>
                    <span className={`font-medium ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                        Complete
                    </span>
                </div>
            </div>

            {/* Step 1: File Upload */}
            <div className="mb-6">
                <input 
                    type="file" 
                    accept="application/pdf" 
                    onChange={handleFileChange}
                    className="mb-4" 
                />
                <button 
                    onClick={handleUpload} 
                    disabled={uploading || !file}
                    className={`px-4 py-2 rounded ${
                        uploading || !file 
                            ? 'bg-gray-300 cursor-not-allowed' 
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                >
                    {uploading ? "Uploading..." : "Upload CV"}
                </button>
            </div>

            {/* Error Messages */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                    {serverResponse && serverResponse.details && (
                        <ul className="list-disc ml-4 mt-2">
                            {Object.entries(serverResponse.details).map(([field, message]) => (
                                <li key={field}>{field}: {message}</li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {/* Step 2: Review Information */}
            {result && step === 2 && (
                <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-4">YOUR INFORMATION</h3>
                    {renderCVData(result)}
                    <button 
                        onClick={handleSubmit}
                        disabled={submitting}
                        className={`px-4 py-2 rounded ${
                            submitting 
                                ? 'bg-gray-300 cursor-not-allowed' 
                                : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                    >
                        {submitting ? "Submitting..." : "Save Profile"}
                    </button>
                </div>
            )}

            {/* Step 3: Completion */}
            {step === 3 && (
                <div className="text-center">
                    <h3 className="text-xl font-semibold text-green-600 mb-4">
                        Profile Created Successfully!
                    </h3>
                    <p>Your CV information has been successfully processed and saved.</p>
                    <button 
                        onClick={() => setStep(1)}
                        className="mt-4 px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white"
                    >
                        Upload Another CV
                    </button>
                </div>
            )}
        </div>
    );
};

export default CVUploader;