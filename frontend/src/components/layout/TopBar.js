import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './TopBar.css';
// Import icons
import { ReactComponent as ShareIcon } from '../../assets/icons/share.svg';
import { ReactComponent as MoreIcon } from '../../assets/icons/more_vertical.svg';
import { ReactComponent as EditIcon } from '../../assets/icons/edit.svg';
// import { ReactComponent as MenuIcon } from '../../assets/icons/menu.svg'; // Thay thế bằng icon chuẩn nếu có

const TopBar = ({ isLoggedIn, pageType }) => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Xử lý cuộn đến section khi URL có fragment
    useEffect(() => {
        if (location.hash) {
            const sectionId = location.hash.substring(1); // Loại bỏ dấu # từ hash
            const element = document.getElementById(sectionId);
            if (element) {
                // Thêm độ trễ nhỏ để đảm bảo DOM đã tải hoàn toàn
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }
    }, [location.hash]);

    // Hàm điều hướng đến section với hiệu ứng trượt
    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            // Cập nhật URL fragment mà không reload trang
            window.history.pushState(null, '', `#${sectionId}`);
        } else if (location.pathname !== '/') {
            // Nếu không ở trang chủ, điều hướng về trang chủ với fragment
            navigate(`/#${sectionId}`);
        }
    };

    // Placeholder for user information, replace with actual auth context or props
    const user = isLoggedIn ? { avatar: 'https://via.placeholder.com/40' } : null; // Example avatar

    const handleLogout = () => {
        // Add logout logic here
        console.log('User logged out');
        navigate('/login');
    };

    const renderLogo = () => (
        <Link to="/" className="topbar-logo">
            <span className="logo-visamade">visamade</span>
            <span className="logo-easy">easy</span>
        </Link>
    );

    // Chuẩn bị classes cho thanh topbar
    const getTopBarClasses = (baseClass) => {
        return `topbar ${baseClass}`;
    };

    if (!isLoggedIn) {
        if (pageType === 'in-chat') {
            return (
                <nav className={getTopBarClasses('topbar-not-logged-in-chat')}>
                    <div className="topbar-left">
                        <button className="topbar-icon-button">
                            <EditIcon className="topbar-icon" />
                        </button>
                        {renderLogo()}
                    </div>
                    <div className="topbar-center">
                        <Link to="/" className="topbar-link">Trang chủ</Link>
                        <Link to="/chatbot" className="topbar-link">Chatbot</Link>
                    </div>
                    <div className="topbar-right">
                        <Link to="/login" className="topbar-button topbar-button-login">Đăng nhập</Link>
                        <Link to="/register" className="topbar-button topbar-button-register">Đăng ký</Link>
                    </div>
                </nav>
            );
        } else if (pageType === 'started') { // Corresponds to 'state=started, isLoggedIn=no'
            return (
                <nav className={getTopBarClasses('topbar-not-logged-in-started')}>
                    <div className="topbar-left">
                        {renderLogo()}
                    </div>
                    <div className="topbar-center">
                        <Link to="/" className="topbar-link">Trang chủ</Link>
                        <Link to="/chatbot" className="topbar-link">Chatbot</Link>
                    </div>
                    <div className="topbar-right">
                        <Link to="/login" className="topbar-button topbar-button-login-alt">Đăng nhập</Link>
                        <Link to="/register" className="topbar-button topbar-button-register-alt">Đăng ký</Link>
                    </div>
                </nav>
            );
        } else { // Default for not logged in (Landing Page) - Corresponds to 'state=default, isLoggedIn=no'
            return (
                <nav className={getTopBarClasses('topbar-not-logged-in-default')}>
                    <div className="topbar-left">
                        {renderLogo()}
                    </div>
                    <div className="topbar-center">
                        <button onClick={() => scrollToSection('features')} className="topbar-link">Tính năng</button>
                        <button onClick={() => scrollToSection('about')} className="topbar-link">Về chúng tôi</button>
                        <button onClick={() => scrollToSection('faq')} className="topbar-link">FAQs</button>
                    </div>
                    <div className="topbar-right">
                        <Link to="/login" className="topbar-button topbar-button-login">Đăng nhập</Link>
                        <Link to="/register" className="topbar-button topbar-button-register">Đăng ký</Link>
                    </div>
                </nav>
            );
        }
    } else { // Logged In
        if (pageType === 'in-chat') {
            return (
                <nav className={getTopBarClasses('topbar-logged-in-chat')}>
                    <div className="topbar-left">
                        {renderLogo()}
                    </div>
                    <div className="topbar-right">
                        <button className="topbar-button topbar-button-share">
                            <ShareIcon className="topbar-icon" />
                            Chia sẻ
                        </button>
                        <button className="topbar-icon-button">
                            <MoreIcon className="topbar-icon" />
                        </button>
                        <img src={user.avatar} alt="User Avatar" className="topbar-avatar" onClick={handleLogout} />
                    </div>
                </nav>
            );
        } else { // Default for logged in (e.g., HomePage) - Corresponds to 'state=default, isLoggedIn=yes'
            return (
                <nav className={getTopBarClasses('topbar-logged-in-default')}>
                    <div className="topbar-left">
                        {renderLogo()}
                    </div>
                    <div className="topbar-right">
                        <img src={user.avatar} alt="User Avatar" className="topbar-avatar" onClick={handleLogout} />
                    </div>
                </nav>
            );
        }
    }
};

export default TopBar;
