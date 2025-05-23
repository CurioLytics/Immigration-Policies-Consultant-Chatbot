import React from 'react';
import RegisterForm from '../components/auth/RegisterForm';
import TopBar from '../components/layout/TopBar'; // Import TopBar
import '../App.css';

function RegisterPage() {
  return (
    <div className="register-page-container">
      {/* Sử dụng TopBar với pageType giống như các trang khác */}
      <TopBar isLoggedIn={false} pageType="default" />
      
      <RegisterForm />
    </div>
  );
}

export default RegisterPage;
