import axios from 'axios';

// Cấu hình URL cơ sở - được tập trung ở một nơi duy nhất
const API_URL = 'http://localhost:5000';

// Tạo instance axios với cấu hình mặc định
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Thêm interceptor để tự động gắn token vào mỗi request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Thêm interceptor để xử lý các lỗi response
apiClient.interceptors.response.use(
  response => response,
  error => {
    // Xử lý lỗi chung - ví dụ: refresh token khi 401, chuyển hướng khi 403, v.v.
    if (error.response) {
      // Xử lý dựa trên mã lỗi
      switch (error.response.status) {
        case 401:
          // Có thể xử lý refresh token hoặc đăng xuất
          console.log('Lỗi xác thực - có thể yêu cầu đăng nhập lại');
          break;
        case 403:
          console.log('Không có quyền truy cập');
          break;
        case 500:
          console.log('Lỗi server');
          break;
        default:
          break;
      }
    }
    return Promise.reject(error);
  }
);

// Hàm trợ giúp để thay đổi URL cơ sở nếu cần
export const setBaseURL = (newURL) => {
  apiClient.defaults.baseURL = newURL;
};

export default apiClient; 