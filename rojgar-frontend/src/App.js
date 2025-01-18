import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

import LoginProtectedRoute from "./components/LoginProtectedRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import KhaltiTestComponent from "./pages/KhaltiTestComponent";
import Login from "./pages/Login";
import OnBoarding from "./pages/OnBoarding";
import Signup from "./pages/Signup";

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
          <Route path="/KhaltiTestComponent" element={<KhaltiTestComponent />} /> {/* Added a route for Khalti component */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
