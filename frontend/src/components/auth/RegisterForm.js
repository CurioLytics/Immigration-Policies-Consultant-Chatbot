import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import { ReactComponent as EyeOpenIcon } from '../../assets/icons/eye-open.svg';
import { ReactComponent as EyeHideIcon } from '../../assets/icons/eye-hide.svg';

function RegisterForm() {
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1 fields
  const [name, setName] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [educationLevel, setEducationLevel] = useState('');

  // Step 2 fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleNextStep = (event) => {
    event.preventDefault();
    setError('');
    // Kiểm tra thông tin bước 1
    if (!name || !birthYear || !educationLevel) {
      setError('Vui lòng điền đầy đủ thông tin cá nhân.');
      return;
    }
    setCurrentStep(2);
  };

  const handlePreviousStep = () => {
    setError('');
    setCurrentStep(1);
  };

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Mật khẩu không khớp.');
      return;
    }
    if (!termsAgreed) {
      setError('Bạn phải đồng ý với Điều khoản dịch vụ.');
      return;
    }
    
    setLoading(true);
    
    try {
      const userData = {
        username: name, 
        birth_year: birthYear,
        education_level: educationLevel,
        email: email,
        password: password,
      };
      
      await authService.register(userData);
      navigate('/login');
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        'Có lỗi xảy ra trong quá trình đăng ký. Vui lòng thử lại.'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="form-step">
      <div className="form-legend">
        <h3 className="legend-title">Thông tin cá nhân</h3>
      </div>
        
      <div className="form-input-field">
        <label htmlFor="name" className="form-label">Tên</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nhập thông tin"
          required
          disabled={loading}
          className="form-input"
        />
      </div>
      
      <div className="form-input-field">
        <label htmlFor="birthYear" className="form-label">Năm sinh</label>
        <input
          type="number"
          id="birthYear"
          value={birthYear}
          onChange={(e) => setBirthYear(e.target.value)}
          placeholder="Nhập thông tin"
          required
          disabled={loading}
          min="1900"
          max={new Date().getFullYear()}
          className="form-input"
        />
      </div>
      
      <div className="form-select-field">
        <label htmlFor="educationLevel" className="form-label">Trình độ học vấn</label>
        <div className="select-wrapper">
          <select
            id="educationLevel"
            value={educationLevel}
            onChange={(e) => setEducationLevel(e.target.value)}
            required
            disabled={loading}
            className="form-select"
          >
            <option value="" disabled>Chọn trình độ</option>
            <option value="high_school">Trung học</option>
            <option value="bachelor">Cử nhân</option>
            <option value="master">Thạc sĩ</option>
            <option value="phd">Tiến sĩ</option>
            <option value="other">Khác</option>
          </select>
        </div>
      </div>
      
      <button type="submit" className="submit-button" disabled={loading}>
        {loading ? "Đang xử lý..." : "Tiếp tục"}
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="form-step">
      <div className="form-legend">
        <h3 className="legend-title">Thông tin đăng nhập</h3>
      </div>

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
            onClick={() => setShowPassword(!showPassword)} 
            className="password-toggle-button"
          >
            {showPassword ? <EyeHideIcon /> : <EyeOpenIcon />} 
          </button>
        </div>
      </div>

      <div className="form-input-field">
        <label htmlFor="confirmPassword" className="form-label">Nhập lại mật khẩu</label>
        <div className="password-input-wrapper">
          <input
            type={showConfirmPassword ? "text" : "password"}
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="************"
            required
            disabled={loading}
            className="form-input"
          />
          <button 
            type="button" 
            onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
            className="password-toggle-button"
          >
            {showConfirmPassword ? <EyeHideIcon /> : <EyeOpenIcon />}
          </button>
        </div>
      </div>

      <div className="form-checkbox-field">
        <div className="checkbox-wrapper">
          <input
            type="checkbox"
            id="termsAgreed"
            checked={termsAgreed}
            onChange={(e) => setTermsAgreed(e.target.checked)}
            required
            disabled={loading}
            className="form-checkbox"
          />
          <label htmlFor="termsAgreed" className="form-label checkbox-label">
            Tôi đồng ý với <a href="/terms" className="terms-link">Điều khoản dịch vụ</a>
          </label>
        </div>
      </div>
      
      <div className="button-group">
        <button type="button" onClick={handlePreviousStep} className="secondary-button" disabled={loading}>
          Quay lại
        </button>
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? "Đang tạo..." : "Tạo tài khoản"}
        </button>
      </div>

      <div className="form-text-link">
        Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
      </div>
    </div>
  );

  return (
    <div className="register-wrapper">
      <h2 className="register-title">Tạo tài khoản</h2>
      <form 
        onSubmit={currentStep === 1 ? handleNextStep : handleRegisterSubmit} 
        className="login-form-component register-form"
      >
        {error && <div className="error-message">{error}</div>}
        {currentStep === 1 ? renderStep1() : renderStep2()}
        
        <div className="step-indicator">
          <span className={`step ${currentStep === 1 ? 'active' : 'completed'}`}></span>
          <span className={`step ${currentStep === 2 ? 'active' : ''}`}></span>
        </div>
      </form>
    </div>
  );
}

export default RegisterForm; 