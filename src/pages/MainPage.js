import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig'; // Đảm bảo đường dẫn này đúng
import styles from './MainPage.module.css'; // Import CSS module

function MainPage() {
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const chatHistoryRef = useRef(null); // Ref cho khu vực chat

    // ... existing code ...

    const handleSendMessage = async () => {
        if (!message.trim()) return; // Không gửi tin nhắn trống

        const userMessage = { sender: 'You', text: message };
        setChatHistory(prev => [...prev, userMessage]); // Hiển thị tin nhắn người dùng ngay lập tức
        setMessage(''); // Xóa nội dung input
        setLoading(true);

        try {
            // ... existing code ...
        } catch (error) {
            // ... existing code ...
        } finally {
            setLoading(false);
        }
    };

    // Cuộn xuống dưới cùng khi có tin nhắn mới
    useEffect(() => {
        if (chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
    }, [chatHistory]);

    return (
        <div className={styles.mainContainer}>
            {/* Header */}
            <div className={styles.header}>
                AI Chatbot
            </div>

            {/* Chat History */}
            <div className={styles.chatHistory} ref={chatHistoryRef}>
                {chatHistory.map((msg, index) => (
                    <div
                        key={index}
                        className={`${styles.messageBubble} ${
                            msg.sender === 'You' ? styles.userMessage : styles.aiMessage
                        }`}
                    >
                        {/* Có thể thêm tên người gửi nếu muốn */}
                        {/* <strong>{msg.sender}:</strong> */}
                        {msg.text}
                    </div>
                ))}
                {/* Hiển thị loading indicator nếu cần */}
                {loading && <div className={styles.aiMessage}>AI is thinking...</div>}
            </div>

            {/* Input Area */}
            <div className={styles.inputArea}>
                <input
                    type="text"
                    className={styles.inputField}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !loading && handleSendMessage()} // Gửi bằng Enter
                    placeholder="Type your message..."
                    disabled={loading} // Vô hiệu hóa input khi đang chờ AI
                />
                <button
                    className={styles.sendButton}
                    onClick={handleSendMessage}
                    disabled={loading || !message.trim()} // Vô hiệu hóa nút khi đang chờ hoặc input trống
                >
                    Send
                </button>
            </div>
             {/* Nút Logout giữ nguyên hoặc điều chỉnh vị trí/style nếu cần */}
             <button onClick={handleLogout} style={{ margin: '10px', padding: '5px 10px', alignSelf: 'center' }}>Logout</button>
        </div>
    );
}

export default MainPage; 