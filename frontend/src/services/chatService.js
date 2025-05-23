import apiClient from './apiClient';

const chatService = {
  /**
   * Gửi tin nhắn tới chatbot và nhận phản hồi
   * @param {string} message - Nội dung tin nhắn người dùng
   * @param {string|null} sessionId - ID phiên chat (nếu có)
   * @returns {Promise<Object>} - Phản hồi từ chatbot
   */
  sendMessage: async (message, sessionId = null) => {
    try {
      const response = await apiClient.post('/chat/message', {
        message,
        session_id: sessionId
      });
      return response.data;
    } catch (error) {
      console.error('Lỗi gửi tin nhắn:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Tạo phiên chat mới (nếu backend hỗ trợ)
   * @returns {Promise<Object>} - Thông tin phiên chat mới
   */
  createSession: async () => {
    try {
      const response = await apiClient.post('/chat/sessions');
      return response.data;
    } catch (error) {
      console.error('Lỗi tạo phiên chat:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Lấy lịch sử chat của một phiên (nếu backend hỗ trợ)
   * @param {string} sessionId - ID của phiên chat
   * @returns {Promise<Array>} - Danh sách tin nhắn
   */
  getSessionHistory: async (sessionId) => {
    try {
      const response = await apiClient.get(`/chat/sessions/${sessionId}/messages`);
      return response.data;
    } catch (error) {
      console.error('Lỗi lấy lịch sử chat:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Lấy danh sách các phiên chat (nếu backend hỗ trợ)
   * @returns {Promise<Array>} - Danh sách phiên chat
   */
  getSessions: async () => {
    try {
      const response = await apiClient.get('/chat/sessions');
      return response.data;
    } catch (error) {
      console.error('Lỗi lấy danh sách phiên chat:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default chatService; 