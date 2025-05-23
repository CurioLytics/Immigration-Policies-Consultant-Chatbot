import apiClient from './apiClient';

// Service functions
const authService = {
  // Đăng nhập cho người dùng đã đăng ký
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      // Backend trả về token_type là "registered"
      if (response.data.tokens && response.data.tokens.access_token && response.data.token_type === "registered") {
        localStorage.setItem('accessToken', response.data.tokens.access_token);
        localStorage.setItem('tokenType', 'registered'); // Lưu loại token
        if (response.data.tokens.refresh_token) {
          localStorage.setItem('refreshToken', response.data.tokens.refresh_token);
        }
        // Trả về thông tin người dùng nếu có, hoặc toàn bộ response
        return response.data; 
      }
      // Xử lý trường hợp không nhận được token hoặc sai loại token
      throw new Error('Login failed or invalid token type received.');
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Đăng ký
  register: async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Đăng xuất
  logout: async () => {
    try {
      // Gọi API logout nếu có token (guest hoặc registered)
      if (localStorage.getItem('accessToken')) {
        await apiClient.get('/auth/logout'); // Endpoint này giờ đã xử lý cả guest và user
      }
    } catch (error) {
      // Lỗi ở backend không nên ngăn cản việc logout ở client
      console.error('Logout API error:', error.response?.data || error.message);
    } finally {
      // Luôn xóa tokens và thông tin session khỏi localStorage khi logout
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('tokenType'); // Xóa loại token
      localStorage.removeItem('guestId'); // Xóa guestId nếu có
    }
  },

  // Kiểm tra xem người dùng đã đăng nhập (là registered user) chưa
  isAuthenticated: () => {
    const tokenType = localStorage.getItem('tokenType');
    return localStorage.getItem('accessToken') !== null && tokenType === 'registered';
  },

  // Kiểm tra xem có session guest đang hoạt động không
  isGuestSessionActive: () => {
    const tokenType = localStorage.getItem('tokenType');
    return localStorage.getItem('accessToken') !== null && tokenType === 'guest';
  },
  
  // Lấy thông tin người dùng/guest hiện tại từ backend
  getCurrentUser: async () => {
    if (!localStorage.getItem('accessToken')) {
      return null; // Không có token, không cần gọi API
    }
    try {
      const response = await apiClient.get('/auth/whoami');
      return response.data.user_info; // Backend trả về user_info { type, id/guest_id, username, email? }
    } catch (error) {
      console.error('Get current user error:', error.response?.data || error.message);
      // Nếu token không hợp lệ (ví dụ hết hạn), có thể cần logout ở đây
      if (error.response && (error.response.status === 401 || error.response.status === 422)) {
         // 422 Unprocessable Entity có thể được trả về bởi flask-jwt-extended nếu token sai định dạng
         await authService.logout(); // Xóa token không hợp lệ
      }
      return null; // Hoặc throw error tùy theo cách xử lý ở component
    }
  },

  // Khởi tạo session cho khách (thay thế loginAsGuest cũ)
  initiateGuestSession: async () => {
    try {
      // Gọi endpoint mới trên backend
      const response = await apiClient.post('/auth/api/v1/guest/session/initiate');
      // Backend trả về token_type là "guest"
      if (response.data.access_token && response.data.token_type === "guest") {
        localStorage.setItem('accessToken', response.data.access_token);
        localStorage.setItem('tokenType', 'guest'); // Lưu loại token là guest
        if(response.data.guest_id) {
            localStorage.setItem('guestId', response.data.guest_id); // Lưu guestId nếu backend trả về
        }
        // Guest không có refresh token
        localStorage.removeItem('refreshToken'); 
        return response.data; 
      }
      // Xử lý trường hợp không nhận được token hoặc sai loại token
      throw new Error('Guest session initiation failed or invalid token type received.');
    } catch (error) {
      console.error('Guest session initiation error:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default authService;