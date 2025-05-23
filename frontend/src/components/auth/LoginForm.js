import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import { ReactComponent as EyeOpenIcon } from '../../assets/icons/eye-open.svg';
import { ReactComponent as EyeHideIcon } from '../../assets/icons/eye-hide.svg';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await authService.login(email, password);
      // Chuyển hướng người dùng đến trang chính sau khi đăng nhập (registered user)
      // Giả sử trang chính cho user đã đăng nhập là '/home' hoặc một trang dashboard nào đó
      navigate('/home'); // Hoặc navigate('/') nếu HomePage tự điều hướng
    } catch (err) {
      console.error('Login submit error:', err.response?.data || err.message);
      setError(
        err.response?.data?.error || // Backend thường trả về lỗi trong 'error'
        err.response?.data?.message || 
        'Đăng nhập không thành công. Vui lòng kiểm tra thông tin đăng nhập.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSession = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await authService.initiateGuestSession(); // Sử dụng hàm mới
      // Chuyển hướng người dùng đến trang chính (nơi HomePage.js được render) 
      // sau khi vào với vai trò khách.
      // Giả sử '/home' là route của HomePage.js
      navigate('/home'); 
    } catch (err) {
      console.error('Guest session initiation error:', err.response?.data || err.message);
      setError(
        err.response?.data?.error ||
        err.response?.data?.message || 
        'Không thể bắt đầu phiên khách.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form-component">
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-input-field">
        <label htmlFor="email" className="form-label">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="username@email.com"
          required
          disabled={loading}
          className="form-input"
        />
      </div>
      
      <div className="form-input-field">
        <label htmlFor="password" className="form-label">Mật khẩu</label>
        <div className="password-input-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="************"
            required
            disabled={loading}
            className="form-input"
          />
          <button 
            type="button" 
            className="password-toggle-button"
            onClick={togglePasswordVisibility}
            disabled={loading}
          >
            {showPassword ? <EyeHideIcon /> : <EyeOpenIcon />}
          </button>
        </div>
      </div>
      
      <button type="submit" className="submit-button" disabled={loading}>
        {loading ? "Đang xử lý..." : "Đăng nhập"}
      </button>
      
      <div className="form-text-link">
        Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
      </div>

      <div className="form-text-link">
        <Link to="/forgot-password">Quên mật khẩu?</Link>
      </div>

      <div className="form-text-link">
        <a href="#" onClick={handleGuestSession} className="guest-login-link">
          Tiếp tục với vai trò khách
        </a>
      </div>
    </form>
  );
}

export default LoginForm;
