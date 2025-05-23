import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom'; // Assuming you'll use React Router for navigation
import './Sidebar.css';
import homeIconSVG from '../../assets/icons/home.svg';
import editIconSVG from '../../assets/icons/edit.svg';
import searchIconSVG from '../../assets/icons/search.svg';
import pinIconSVG from '../../assets/icons/pin.svg';
import arrowDropDownIconSVG from '../../assets/landing_page_icons/arrow_drop_down.svg';
import apiClient from '../../services/apiClient'; // Import apiClient

// Old ArrowDropDownIcon component (text-based)
// const ArrowDropDownIcon = ({ isOpen }) => (
//   <span style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)', display: 'inline-block', transition: 'transform 0.2s' }}>
//     ▼
//   </span>
// );

// Helper function to get JWT token (replace with your actual auth service if available)
// No longer strictly needed here as apiClient handles token attachment
// const getAuthToken = () => {
//   return localStorage.getItem('jwtToken'); 
// };

const Sidebar = () => {
  const [hoSoOpen, setHoSoOpen] = useState(true); // Default open
  const [doanChatOpen, setDoanChatOpen] = useState(true); // Default open
  const location = useLocation(); // Get the current location to determine active chat
  const [newChatId, setNewChatId] = useState(null);

  const [chatHistoryGroups, setChatHistoryGroups] = useState({
    pinned: [],
    today: [],
    yesterday: [],
    previous7Days: [],
    previous30Days: [],
    older: [],
  });
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [errorHistory, setErrorHistory] = useState(null);

  // Get current session ID from URL if it exists
  const currentSessionId = React.useMemo(() => {
    const match = location.pathname.match(/\/chat\/(\d+)/);
    return match ? match[1] : null;
  }, [location.pathname]);

  // Sample data based on the image
  const hoSoItems = [
    { id: 1, name: 'Du học bằng thạc sĩ Mỹ', link: '/profile/ths-my' },
    { id: 2, name: 'Du học bằng cử nhân Canad...', link: '/profile/cn-canada' },
  ];

  // Function to fetch chat sessions - wrap in useCallback to prevent dependency issues
  const fetchAndGroupSessions = useCallback(async () => {
    setIsLoadingHistory(true);
    setErrorHistory(null);
    try {
      // Use apiClient for the request
      const response = await apiClient.get('/chat_history/sessions');

      // Axios nests the actual data in `response.data`
      const data = response.data;
      const sessions = data.sessions || [];

      // Group sessions by time
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterdayStart = new Date(todayStart);
      yesterdayStart.setDate(todayStart.getDate() - 1);
      const sevenDaysAgoStart = new Date(todayStart);
      sevenDaysAgoStart.setDate(todayStart.getDate() - 7);
      const thirtyDaysAgoStart = new Date(todayStart);
      thirtyDaysAgoStart.setDate(todayStart.getDate() - 30);

      const groups = {
        pinned: [], // Pinned items are not fetched from DB in this version
        today: [],
        yesterday: [],
        previous7Days: [],
        previous30Days: [],
        older: [],
      };

      sessions.forEach(session => {
        const sessionDate = new Date(session.updated_at);
        const isNew = session.id.toString() === newChatId;
        const item = { 
          id: session.id, 
          name: session.title || 'Untitled Chat', 
          link: `/chat/${session.id}`, // Assuming chat route is /chat/:sessionId
          active: currentSessionId === session.id.toString(), // Set active based on URL, ensure both are strings
          isNewChat: isNew // Flag to highlight new chats
        };

        if (sessionDate >= todayStart) {
          groups.today.push(item);
        } else if (sessionDate >= yesterdayStart) {
          groups.yesterday.push(item);
        } else if (sessionDate >= sevenDaysAgoStart) {
          groups.previous7Days.push(item);
        } else if (sessionDate >= thirtyDaysAgoStart) {
          groups.previous30Days.push(item);
        } else {
          groups.older.push(item);
        }
      });
      setChatHistoryGroups(groups);

    } catch (err) {
      console.error("Failed to fetch chat history:", err);
      // Axios error structure: err.response.data for server error response, or err.message for network/other errors
      const errorMessage = err.response?.data?.error || err.message || "Could not load chat history.";
      setErrorHistory(errorMessage);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [currentSessionId, newChatId]); // Include dependencies that affect the function

  // Refactor the useEffect to use our extracted fetch function
  useEffect(() => {
    if (doanChatOpen) { // Fetch only if the section is open or intended to be open
        fetchAndGroupSessions();
    }
  }, [doanChatOpen, fetchAndGroupSessions]); // fetchAndGroupSessions as dependency is safe now

  // Add listener for new chat session events
  useEffect(() => {
    const handleNewChatSession = (event) => {
      // Set the new chat ID to enable highlight animation
      setNewChatId(event.detail.sessionId);
      
      // Ensure the chat section is open to show the new entry
      setDoanChatOpen(true);
      
      // Refresh sidebar to show the new chat
      fetchAndGroupSessions();
      
      // Clear the new chat ID after a few seconds to remove highlight
      setTimeout(() => {
        setNewChatId(null);
      }, 3000); // Remove highlight after 3 seconds
    };

    // Add event listener
    window.addEventListener('newChatSessionCreated', handleNewChatSession);
    
    // Clean up
    return () => {
      window.removeEventListener('newChatSessionCreated', handleNewChatSession);
    };
  }, [fetchAndGroupSessions]); // Include fetchAndGroupSessions as dependency

  const renderChatGroup = (title, items, iconSrc = null, groupKey) => {
    if (!items || items.length === 0) {
      // Optionally, don't render the group at all if empty, handled by overall empty check later for specific groups
      // For "Pinned", we always show the title.
      if (groupKey !== 'pinned' && items.length === 0) return null;
    }

    return (
      <div className="sidebar-chat-group">
        <div className="sidebar-chat-group-header">
          <span className="sidebar-chat-group-title">{title}</span>
          {iconSrc && (
            <div className="sidebar-chat-group-icon">
              <img src={iconSrc} alt={title} style={{ width: '15px', height: '15px' }} />
            </div>
          )}
        </div>
        <div className="sidebar-subitems-list" style={{ paddingLeft: 0 }}>
          {items.map(item => (
            <Link 
              to={item.link} 
              key={item.id} 
              className={`sidebar-subitem-tag ${item.active ? 'active' : ''} ${item.isNewChat ? 'new-chat-highlight' : ''}`}
              title={item.name}
            >
              <span className="sidebar-subitem-text">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>
    );
  };
  
  const allChatItemsEmpty = () => {
    return Object.values(chatHistoryGroups).every(group => group.length === 0);
  };

  return (
    <div className="sidebar">
      {/* Frame 98 - Top Icons */}
      <div className="sidebar-frame98">
        <Link to="/chat">
        <img src={editIconSVG} alt="Edit" className="icon-edit-img" />
        </Link>
        <img src={searchIconSVG} alt="Search" className="icon-search-img" />
      </div>

      {/* Menu tag - Home Link */}
      <Link to="/home" className="sidebar-menu-tag">
        <div className="sidebar-menu-tag-icon">
          <img src={homeIconSVG} alt="Home" />
        </div>
        <span className="sidebar-menu-tag-text">Trang chủ</span>
      </Link>

      {/* Hồ sơ Section */}
      <div className="sidebar-section-container ho-so-section">
        <div className="sidebar-dropdown-header" onClick={() => setHoSoOpen(!hoSoOpen)}>
          <span className="sidebar-dropdown-title">Hồ sơ</span>
          <div className="sidebar-dropdown-icon">
            <img 
              src={arrowDropDownIconSVG} 
              alt="Toggle section" 
              style={{ 
                transform: hoSoOpen ? 'rotate(0deg)' : 'rotate(90deg)', 
                transition: 'transform 0.2s',
                width: '10px', /* Reduced size */
                height: '10px' /* Reduced size */
              }} 
            />
          </div>
        </div>
        {hoSoOpen && (
          <div className="sidebar-subitems-list">
            {hoSoItems.map(item => (
              <Link to={item.link} key={item.id} className="sidebar-subitem-tag">
                {/* Icon placeholder if needed: <div className="sidebar-subitem-icon"></div> */}
                <span className="sidebar-subitem-text">{item.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Đoạn chat Section */}
      <div className="sidebar-section-container doan-chat-section">
        <div className="sidebar-dropdown-header" onClick={() => setDoanChatOpen(!doanChatOpen)}>
          <span className="sidebar-dropdown-title">Đoạn chat</span>
          <div className="sidebar-dropdown-icon">
            <img 
              src={arrowDropDownIconSVG} 
              alt="Toggle section" 
              style={{ 
                transform: doanChatOpen ? 'rotate(0deg)' : 'rotate(90deg)', 
                transition: 'transform 0.2s',
                width: '10px', /* Reduced size */
                height: '10px' /* Reduced size */
              }} 
            />
          </div>
        </div>
        {doanChatOpen && (
          <div className="sidebar-chat-history-container">
            {isLoadingHistory && <p className="sidebar-loading-text">Đang tải lịch sử chat...</p>}
            {errorHistory && <p className="sidebar-error-text">Lỗi: {errorHistory}</p>}
            
            {!isLoadingHistory && !errorHistory && (
              <>
                {renderChatGroup("Đã ghim", chatHistoryGroups.pinned, pinIconSVG, 'pinned')}
                {renderChatGroup("Hôm nay", chatHistoryGroups.today, null, 'today')}
                {renderChatGroup("Hôm qua", chatHistoryGroups.yesterday, null, 'yesterday')}
                {renderChatGroup("7 ngày trước đó", chatHistoryGroups.previous7Days, null, 'previous7Days')}
                {renderChatGroup("30 ngày trước đó", chatHistoryGroups.previous30Days, null, 'previous30Days')}
                {renderChatGroup("Cũ hơn", chatHistoryGroups.older, null, 'older')}
                
                {allChatItemsEmpty() && !chatHistoryGroups.pinned.length && ( // Show if all dynamic groups are empty
                  <p className="sidebar-no-items-text" style={{padding: '10px 20px'}}>Không có lịch sử chat nào.</p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
