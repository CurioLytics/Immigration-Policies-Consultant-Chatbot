import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../api';
import '../App.css';
import chatAiBg from '../assets/chat-ai-bg.png';

const MainPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const chatMessagesRef = useRef(null);

  useEffect(() => {
    // Check if the user is logged in
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (message.trim() === '') return;

    // Add user message to chat history
    setChatHistory([...chatHistory, { sender: 'user', text: message }]);

    // Simulate a bot response
    setLoading(true);
    setTimeout(() => {
      setChatHistory(prev => [...prev, { 
        sender: 'bot', 
        text: `Artificial Intelligence (AI) offers numerous advantages and has the potential to revolutionize various aspects of our lives. Here are some key advantages of AI:

Automation: AI can automate repetitive and mundane tasks, saving time and effort for humans. It can handle large volumes of data, perform complex calculations, and execute tasks with precision and consistency. This automation leads to increased productivity and efficiency in various industries.

Decision-making: AI systems can analyze vast amounts of data, identify patterns, and make informed decisions based on that analysis. This ability is particularly useful in complex scenarios where humans may struggle to process large datasets or where quick and accurate decisions are crucial.` 
      }]);
      setLoading(false);
    }, 1000);

    setMessage(''); // Clear input field
  };

  // Templates for suggested messages
  const suggestedMessages = [
    "Tell me about more",
    "Make Response Shorter",
    "Explain it to me like a lawyer"
  ];

  return (
    <div className="aiva-chatbot-container">
      {/* Left Sidebar */}
      <div className="aiva-sidebar">
        <div className="aiva-logo">AIVA CHATBOT</div>
        <div className="aiva-separator"></div>
        
        <div className="aiva-new-chat">
          <button className="aiva-new-chat-button">
            <span className="aiva-add-icon">+</span>
            New Chat
          </button>
        </div>
        
        <div className="aiva-chat-history-section">
          <div className="aiva-history-label">Yesterday</div>
          <div className="aiva-chat-history-item active">
            <span>The advantages of Artificial Intelligence</span>
          </div>
          <div className="aiva-chat-history-item">
            <span>Give me a proposal for company name</span>
          </div>
          
          <div className="aiva-history-label">Last week</div>
          <div className="aiva-chat-history-item">
            <span>Can you write a short paragraph for</span>
          </div>
          <div className="aiva-chat-history-item">
            <span>Research about ui ux</span>
          </div>
        </div>
        
        <div className="aiva-sidebar-footer">
          <button className="aiva-model-selector">
            <span className="aiva-model-active">Model 1</span>
            <span className="aiva-model-option">Model 2</span>
            <span className="aiva-model-option">Model 3</span>
          </button>
          <button className="aiva-logout-button" onClick={handleLogout} disabled={loading}>
            {loading ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="aiva-main">
        <div className="aiva-header">
          <div className="aiva-header-title">AI Chatbot</div>
        </div>
        
        <div className="aiva-chat-messages" ref={chatMessagesRef}>
          {chatHistory.length === 0 ? (
            <div className="aiva-empty-chat">
              <div className="aiva-avatar">A</div>
              <h2>How can I help you today?</h2>
              <p>Ask me anything about AI, technology, or general knowledge.</p>
              
              <div className="aiva-suggestions">
                {["Come up with concepts for a retro style arcade game", 
                  "Give me ideas for what to do with my kid's art",
                  "Explain why popcorn pops to a kid who loves to watch in the microwave",
                  "Plan a trip to see the northern lights in norway"].map((suggestion, index) => (
                  <div key={index} className="aiva-suggestion-card" 
                       onClick={() => {
                         setMessage(suggestion);
                         setTimeout(() => handleSendMessage(), 100);
                       }}>
                    <strong>{suggestion.split(' ').slice(0, 3).join(' ')}</strong>
                    <span>{suggestion.split(' ').slice(3).join(' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="aiva-question-card">
                <div className="aiva-question-text">The advantages of Artificial Intelligence</div>
              </div>
              
              {chatHistory.map((msg, index) => (
                <div key={index} className={`aiva-message ${msg.sender}`}>
                  {msg.sender === 'bot' && <div className="aiva-bot-avatar">A</div>}
                  <div className="aiva-message-content">{msg.text}</div>
                </div>
              ))}
              
              {loading && (
                <div className="aiva-message bot">
                  <div className="aiva-bot-avatar">A</div>
                  <div className="aiva-loading">AI is thinking...</div>
                </div>
              )}
              
              {chatHistory.length > 0 && !loading && (
                <div className="aiva-response-actions">
                  {suggestedMessages.map((text, index) => (
                    <button key={index} className="aiva-action-button">{text}</button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        
        <div className="aiva-input-area">
          <input
            type="text"
            className="aiva-input-field"
            placeholder="Send a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={loading}
          />
          <button 
            className="aiva-send-button" 
            onClick={handleSendMessage}
            disabled={!message.trim() || loading}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 2L11 13" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainPage;