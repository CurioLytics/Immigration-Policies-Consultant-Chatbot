import React from 'react';
import LoginForm from '../components/auth/LoginForm';
import TopBar from '../components/layout/TopBar'; // Import TopBar
import '../App.css';

function LoginPage() {
  return (
    <div className="login-page-container">
      {/* Replace hardcoded top bar with TopBar component */}
      <TopBar isLoggedIn={false} pageType="default" /> 

      <h1 className="login-page-title">Chào mừng trở lại</h1>
      
      <LoginForm />
    </div>
  );
}

export default LoginPage;
