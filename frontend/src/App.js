import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  // Link, // Link không còn được dùng trong App.js nếu SiteHeader bị xóa
  // useLocation // useLocation không còn cần thiết
} from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ChatbotInterface from './pages/ChatbotInterface'; // Import from new location
// import logo from './logo.svg'; // Default CRA import, can be removed if not used
import './App.css'; // Default CRA import for styling

// SiteHeader component đã được xóa

function App() {
  // useLocation và noHeaderPaths đã được xóa

  return (
    <div className="App">
      {/* SiteHeader đã được xóa hoàn toàn */}

      <main>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/chatbot" element={<ChatbotInterface />} /> {/* Original chatbot route */}
          <Route path="/chat" element={<ChatbotInterface />} /> {/* New route for chat without session ID */}
          <Route path="/chat/:sessionId" element={<ChatbotInterface />} /> {/* New route for accessing specific chat sessions */}
          <Route path="/" element={<LandingPage />} />
        </Routes>
      </main>
    </div>
  );
}

// Bọc App bằng Router ở đây để useLocation hoạt động
function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;
