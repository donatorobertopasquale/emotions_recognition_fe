import { API_ENDPOINTS } from '../constants';

class ApiService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || '';
  }
  // Helper method to get JWT token from cookies
  getAccessToken() {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'accessToken') {
        return value;
      }
    }
    return null;
  }
  // Helper method to set JWT tokens as HTTP cookies
  setAuthTokens(accessToken, refreshToken) {
    // Check if we're in production (HTTPS) or development (HTTP)
    const isProduction = window.location.protocol === 'https:';
    const secureFlag = isProduction ? 'secure;' : '';
    
    if (accessToken) {
      // Set access token cookie (secure only in production)
      document.cookie = `accessToken=${accessToken}; path=/; ${secureFlag} SameSite=Strict; max-age=900`; // 15 minutes
    }
    if (refreshToken) {
      // Set refresh token cookie (secure only in production)
      document.cookie = `refreshToken=${refreshToken}; path=/; ${secureFlag} SameSite=Strict; max-age=604800`; // 7 days
    }
  }
  // Helper method to clear JWT tokens
  clearAuthTokens() {
    document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  }

  // Helper method to refresh access token
  async refreshAccessToken() {
    try {
      const response = await this.request('/auth/refresh', {
        method: 'POST',
      });
        if (response && response.accessToken) {
        // Update access token cookie (respect secure flag based on protocol)
        const isProduction = window.location.protocol === 'https:';
        const secureFlag = isProduction ? 'secure;' : '';
        document.cookie = `accessToken=${response.accessToken}; path=/; ${secureFlag} SameSite=Strict; max-age=900`;
        return response.accessToken;
      }
      
      throw new Error('Failed to refresh token');
    } catch (error) {
      // If refresh fails, clear all tokens
      this.clearAuthTokens();
      throw error;
    }
  }

  // Logout method
  async logout() {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
      });    } catch (error) {
      // Even if logout fails on server, clear tokens locally
    } finally {
      this.clearAuthTokens();
    }
  }
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const accessToken = this.getAccessToken();
    
    const config = {
      headers: options.body instanceof FormData ? {} : {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies in requests
      ...options,
    };

    // Add Authorization header if we have an access token
    if (accessToken) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${accessToken}`
      };
    }

    // Merge headers for non-FormData requests
    if (options.headers && !(options.body instanceof FormData)) {
      config.headers = { ...config.headers, ...options.headers };
    }try {
      const response = await fetch(url, config);
      
      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401 && !endpoint.includes('/auth/refresh') && !endpoint.includes(API_ENDPOINTS.PROFILE)) {
        try {
          await this.refreshAccessToken();
          // Retry the original request with new token
          const retryResponse = await fetch(url, config);
          if (!retryResponse.ok) {
            if (retryResponse.status === 401) {
              // Still unauthorized after refresh, clear tokens
              this.clearAuthTokens();
              throw new Error('Session expired. Please log in again.');
            }
            throw new Error(`HTTP error! status: ${retryResponse.status}`);
          }
          return await retryResponse.json();
        } catch (refreshError) {
          // If refresh fails, clear tokens and throw error
          this.clearAuthTokens();
          throw new Error('Session expired. Please log in again.');
        }
      }
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Access forbidden. Please check your permissions.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
        return await response.json();
    } catch (error) {
      // Re-throw authentication errors as-is
      if (error.message.includes('Session expired') || error.message.includes('log in again')) {
        throw error;
      }
      // For other errors, provide a more generic message
      throw new Error(error.message || 'Network error occurred');
    }
  }  // Profile related API calls - Login endpoint
  async submitProfile(profileData) {
    const response = await this.request(API_ENDPOINTS.PROFILE, {
      method: 'POST',
      body: JSON.stringify(profileData),
    });

    // Handle JWT tokens from response
    if (response && response.accessToken && response.refreshToken) {
      this.setAuthTokens(response.accessToken, response.refreshToken);
    }

    return response;
  }  // Download image by name
  async downloadImage(imageName) {
    try {
      const accessToken = this.getAccessToken();
      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.IMAGE}?imageName=${encodeURIComponent(imageName)}`, {
        credentials: 'include', // Include cookies for authentication
        headers: accessToken ? {
          'Authorization': `Bearer ${accessToken}`
        } : {}
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          // Try to refresh token and retry
          try {
            await this.refreshAccessToken();
            const newAccessToken = this.getAccessToken();
            const retryResponse = await fetch(`${this.baseURL}${API_ENDPOINTS.IMAGE}?name=${encodeURIComponent(imageName)}`, {
              credentials: 'include',
              headers: newAccessToken ? {
                'Authorization': `Bearer ${newAccessToken}`
              } : {}
            });
            
            if (!retryResponse.ok) {
              throw new Error(`HTTP error! status: ${retryResponse.status}`);
            }
            return retryResponse.blob();
          } catch (refreshError) {
            this.clearAuthTokens();
            throw new Error('Session expired. Please log in again.');
          }
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.blob();
    } catch (error) {
      throw error;
    }
  }

  // Recognition related API calls - For emotion prediction
  async submitRecognition(videoFile) {
    const formData = new FormData();
    formData.append('file', videoFile);

    return this.request(API_ENDPOINTS.RECOGNITION, {
      method: 'POST',
      headers: {
        // Remove Content-Type to let browser set it with boundary for FormData
      },
      body: formData,
    });
  }

  // Assessment related API calls
  async submitAssessment(assessmentData) {
    return this.request(API_ENDPOINTS.SUBMIT_ASSESSMENT, {
      method: 'POST',
      body: JSON.stringify(assessmentData),
    });
  }
  async getAssessmentResults(sessionId) {
    return this.request(`${API_ENDPOINTS.SUBMIT_ASSESSMENT}/${sessionId}`, {
      method: 'GET',
    });
  }
}

const apiService = new ApiService();
export default apiService;
