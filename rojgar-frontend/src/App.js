import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import LoginProtectedRoute from "./components/LoginProtectedRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import CVUploader from "./pages/CVUploader";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import KhaltiTestComponent from "./pages/KhaltiTestComponent";
import Login from "./pages/Login";
import OnBoarding from "./pages/OnBoarding";
import PaymentSuccess from './pages/PaymentSuccess';
import ProposalSubmission from './pages/ProposalSubmission';
import Signup from "./pages/Signup";
import Workspace from "./pages/Workspace";



function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginProtectedRoute><Login /></LoginProtectedRoute>} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/onboarding" element={<ProtectedRoute><OnBoarding /></ProtectedRoute>} />
          <Route path="/submit-proposal/:jobId" element={<ProposalSubmission />} />
          <Route path="/KhaltiTestComponent" element={<KhaltiTestComponent />} /> {/* Added a route for Khalti component */}
         
          <Route path="/workspace/:jobId" element={<Workspace />} />
          <Route path="/cv-upload" element={<ProtectedRoute><CVUploader /></ProtectedRoute>} /> 
          <Route path="/payment/success" element={<PaymentSuccess />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
