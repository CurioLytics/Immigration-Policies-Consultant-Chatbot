import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar'; // Import the Sidebar component
import TopBar from '../components/layout/TopBar'; // Import the TopBar component
import authService from '../services/authService'; // Import authService
import TextInputField from '../components/layout/TextInputField'; // Import TextInputField
import unlockIcon from '../assets/icons/unlock.svg';
import checkboxShapeIcon from '../assets/icons/checkbox_shape.svg'; // Import checkbox shape
import checkboxVectorIcon from '../assets/icons/checkbox_vector.svg'; // Import checkbox vector (tick)
import '../App.css';

// --- HomePage for GUEST users (default view) ---
function HomePageGuestView() {
  const [chatInput, setChatInput] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  // State để theo dõi xem guest session đã được khởi tạo cho tương tác chat chưa
  const [guestSessionInitiatedForChat, setGuestSessionInitiatedForChat] = useState(authService.isGuestSessionActive());
  const navigate = useNavigate(); // Add useNavigate hook

  const handleChatSubmit = async () => {
    if (chatInput.trim() === '') return;

    let currentGuestToken = localStorage.getItem('accessToken');
    let currentTokenType = localStorage.getItem('tokenType');

    // Start transition animation
    setIsTransitioning(true);

    // Nếu chưa có guest token hợp lệ, thử khởi tạo
    if (!currentGuestToken || currentTokenType !== 'guest') {
      try {
        console.log("No active guest session for chat, initiating...");
        await authService.initiateGuestSession();
        setGuestSessionInitiatedForChat(true); // Đánh dấu đã khởi tạo
        // Sau khi khởi tạo, token mới đã được lưu vào localStorage bởi authService
        // Interceptor của axios sẽ tự động gắn token này vào request tiếp theo
      } catch (error) {
        console.error("Failed to initiate guest session for chat:", error);
        // Có thể hiển thị thông báo lỗi cho người dùng ở đây
        // Nếu không khởi tạo được session, không nên tiếp tục gửi chat
        setIsTransitioning(false);
        return; 
      }
    }
    
    // Add slightly longer delay to allow transition animation and also
    // give time for the backend to initialize the session if needed
    setTimeout(() => {
      // Navigate to chatbot page with the input
      navigate('/chatbot', { state: { initialMessage: chatInput } });
    }, 500); // Increased from 400ms to 500ms for smoother transition
  };

  return (
    <div className={`home-page-container ${isTransitioning ? 'transitioning' : ''}`}> {/* Main container for the guest page */}
      {/* Replace hardcoded top bar with TopBar component */}
      <TopBar isLoggedIn={false} pageType="started" /> 

      {/* Main content wrapper for Guest View (Previously home-content-wrapper) */}
      <div className={`home-guest-content-wrapper ${isTransitioning ? 'fade-out' : ''}`}> {/* Unique class for guest content */}
        {/* Updated chat interaction section based on Figma node 411-2396 */}
        <section className="chat-interaction-section new-chat-onboard-layout">
          <h1 className="chat-main-heading onboard-main-heading" style={{ marginBottom: '-2rem' }}>Mình có thể giúp gì cho bạn?</h1>
          
          {/* TextInputField moved before prompt buttons */}
          <div className={`home-chat-input-container onboard-input-container ${isTransitioning ? 'sliding-input' : ''}`}>
            <TextInputField
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Hỏi mình về hồ sơ du học nè"
              onSend={handleChatSubmit}
              variant="home"
            />
          </div>

          <div className={`prompt-buttons-container onboard-prompt-buttons ${isTransitioning ? 'fade-out' : ''}`}>
            {/* Updated prompt buttons based on Figma */}
            <button className="prompt-button onboard-prompt-button">Tra cứu</button>
            <button className="prompt-button onboard-prompt-button">Kiểm tra tiến độ</button>
            <button className="prompt-button onboard-prompt-button">Cập nhật thông tin</button>
            <button className="prompt-button onboard-prompt-button">Tóm tắt văn bản</button>
          </div>
        </section>

        {/* Login Prompt Frame - Copied from previous HomePage (guest) implementation */}
        <section className={`login-prompt-frame ${isTransitioning ? 'fade-out' : ''}`}>
          <div className="login-prompt-header">
            {/* Replace div with img tag for unlock icon */}
            <img src={unlockIcon} alt="Unlock Icon" className="unlock-icon-svg" /> 
            {/* Ensure h2 and p are styled appropriately if needed, or simplify structure */}
            <h2 className="login-prompt-title">Đăng nhập để mở ra cơ hội</h2>
          </div>
          <ul className="login-prompt-features-list">
            <li className="feature-bullet-point">
              {/* Replace span with actual checkbox SVG structure */}
              <div className="custom-checkbox-icon">
                <img src={checkboxShapeIcon} alt="Checkbox shape" className="checkbox-shape-svg" />
                <img src={checkboxVectorIcon} alt="Checkbox tick" className="checkbox-vector-svg" />
              </div>
              Tạo hồ sơ để sắp xếp tài liệu và theo dõi tiến trình
            </li>
            <li className="feature-bullet-point">
              <div className="custom-checkbox-icon">
                <img src={checkboxShapeIcon} alt="Checkbox shape" className="checkbox-shape-svg" />
                <img src={checkboxVectorIcon} alt="Checkbox tick" className="checkbox-vector-svg" />
              </div>
              Lưu hội thoại với chatbot để dễ dàng xem lại sau
            </li>
            <li className="feature-bullet-point">
              <div className="custom-checkbox-icon">
                <img src={checkboxShapeIcon} alt="Checkbox shape" className="checkbox-shape-svg" />
                <img src={checkboxVectorIcon} alt="Checkbox tick" className="checkbox-vector-svg" />
              </div>
              Nhận nhắc nhở hạn nộp để không bỏ lỡ bước nào
            </li>
            <li className="feature-bullet-point">
              <div className="custom-checkbox-icon">
                <img src={checkboxShapeIcon} alt="Checkbox shape" className="checkbox-shape-svg" />
                <img src={checkboxVectorIcon} alt="Checkbox tick" className="checkbox-vector-svg" />
              </div>
              Đồng bộ hồ sơ và hội thoại để chatbot hỗ trợ tốt hơn
            </li>
          </ul>
          <Link to="/login" className="login-prompt-cta-button">
            Đăng nhập
          </Link>
        </section>
      </div>
    </div>
  );
}

// --- HomePage for REGISTERED users (kept for later use) ---
// Placeholder data - replace with actual data later
const sampleTasksRegistered = [
  { id: 1, name: 'Hộ chiếu', dueDate: 'Ngày mai', completed: false },
  { id: 2, name: 'Bằng tốt nghiệp đại h...', dueDate: '14/4', completed: false },
  { id: 3, name: 'Bằng điểm đại học', dueDate: '14/4', completed: false },
  { id: 4, name: 'Ảnh thẻ', dueDate: '14/4', completed: false },
  { id: 5, name: 'Xác nhận lương', dueDate: '16/4', completed: false },
  { id: 6, name: 'Lý lịch tư pháp số 2', dueDate: '20/4', completed: false },
];

const samplePinnedChatsRegistered = [
  { id: 1, title: 'Giấy tờ tài chính cần thiết', date: 'Hôm qua' },
  { id: 2, title: 'Thông tin đơn xin visa Mỹ', date: '10/4/2025' },
];

function HomePageForRegisteredUserView() { // Renamed component
  const [chatInput, setChatInput] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  // Add state for active task tab if needed, e.g., const [activeTaskTab, setActiveTaskTab] = useState('Cần hoàn thành');
  const navigate = useNavigate(); // Add useNavigate hook

  const handleChatSubmitRegistered = () => { // Renamed handler
    if (chatInput.trim() === '') return;
    
    // Start transition animation
    setIsTransitioning(true);
    
    // Add slightly longer delay for smoother transition
    setTimeout(() => {
      // Navigate to chatbot page with the input
      navigate('/chatbot', { state: { initialMessage: chatInput } });
    }, 500); // Increased from 400ms to 500ms for smoother transition
  };

  return (
    <div className={`home-registered-main-container ${isTransitioning ? 'transitioning' : ''}`} style={{ display: 'flex', height: '100vh' }}>
      <Sidebar />
      <main className={`home-main-content-area ${isTransitioning ? 'fade-out' : ''}`} style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        {/* TopBar will be sticky within this main area */}
        <TopBar isLoggedIn={true} pageType="default" /> {/* pageType="default" for logged-in homepage */}
        <div 
          className="main-content-inner-wrapper" 
          style={{
            paddingLeft: '20px', 
            paddingTop: '70px', /* Adjust based on actual TopBar height */
            flexGrow: 1, 
            display: 'flex', 
            flexDirection: 'column',
            // justifyContent: 'center', // Center content vertically in the remaining space
            // alignItems: 'center' // Center content horizontally
          }}
        >
          <section 
            className="chat-interaction-section main-chat-area"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              flexGrow: 1 // Allow this section to take available space for centering
            }}
          >
            <h1 className="chat-main-heading" style={{ fontSize: '2rem', marginBottom: '-1.5rem', marginRight: '1rem' }}>Mình có thể giúp gì cho bạn?</h1>
            <div className={`home-chat-input-container ${isTransitioning ? 'sliding-input' : ''}`} style={{ width: '130%', marginLeft: '4rem' }}>
              <TextInputField
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Hỏi mình về hồ sơ du học nè"
                onSend={handleChatSubmitRegistered}
                variant="home"
              />
            </div>
            <div className={`prompt-buttons-container ${isTransitioning ? 'fade-out' : ''}`} style={{ marginTop: '1rem' }}>
              <button className="prompt-button">Tra cứu</button>
              <button className="prompt-button">Kiểm tra tiến độ</button>
              <button className="prompt-button">Cập nhật thông tin</button>
              <button className="prompt-button">Tóm tắt văn bản</button>
            </div>
          </section>
          {/* The user-tasks-pinned-chats-container will now be below the centered chat section */}
          {/* If this also needs specific layout, it can be adjusted */}
          <section className={`user-tasks-pinned-chats-container ${isTransitioning ? 'fade-out' : ''}`}>
            <div className="my-tasks-section">
              <h2 className="section-title-main">Việc của tôi</h2>
              <div className="task-tabs-container">
                <button className="task-tab active">Cần hoàn thành</button>
                <button className="task-tab">Quá hạn</button>
                <button className="task-tab">Đã hoàn thành</button>
              </div>
              <ul className="tasks-list-container">
                {sampleTasksRegistered.map(task => (
                  <li key={task.id} className="task-item">
                    <div className="task-info">
                      <span className="checkmark-icon-placeholder task-checkbox"></span>
                      <span className="task-name">{task.name}</span>
                    </div>
                    <div className="task-due-date">
                      <span>{task.dueDate}</span>
                      <span className="icon-placeholder-sidebar arrow-right-icon"></span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="pinned-chats-section">
              <h2 className="section-title-main">Đoạn chat đã ghim</h2>
              <ul className="pinned-chats-list-container">
                {samplePinnedChatsRegistered.map(chat => (
                  <li key={chat.id} className="pinned-chat-item">
                    <span className="pinned-chat-title">{chat.title}</span>
                    <span className="pinned-chat-date">{chat.date}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div> 
      </main>
    </div>
  );
}

// --- Main HomePage Component to decide which view to render ---
function HomePage() {
  // State để lưu thông tin người dùng/guest và trạng thái loading
  const [currentUserInfo, setCurrentUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserStatus = async () => {
      setIsLoading(true);
      try {
        const userInfo = await authService.getCurrentUser(); // Hàm này gọi /auth/whoami
        setCurrentUserInfo(userInfo); // userInfo có thể là null, hoặc { type: 'guest', ... }, hoặc { type: 'registered', ... }
      } catch (error) {
        // Lỗi có thể đã được xử lý trong getCurrentUser (ví dụ: tự logout nếu token lỗi)
        console.error("Error fetching user status in HomePage:", error);
        setCurrentUserInfo(null); // Đảm bảo là null nếu có lỗi
      }
      setIsLoading(false);
    };

    fetchUserStatus();
  }, []); // Chạy một lần khi component mount

  if (isLoading) {
    return <div>Loading...</div>; // Hoặc một spinner component đẹp hơn
  }

  // Dựa vào currentUserInfo.type để quyết định view nào sẽ render
  if (currentUserInfo && currentUserInfo.type === 'registered') {
    return <HomePageForRegisteredUserView />;
  } else {
    // Bao gồm cả trường hợp currentUserInfo là null (chưa có session nào)
    // hoặc currentUserInfo.type === 'guest' (đã có guest session từ trước, ví dụ từ LoginForm)
    return <HomePageGuestView />;
  }
}

// Export HomePage chính thay vì HomePageGuestView
export default HomePage;
