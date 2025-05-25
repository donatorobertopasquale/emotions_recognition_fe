import { API_ENDPOINTS } from '../constants';

class ApiService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || '';
  }
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: options.body instanceof FormData ? {} : {
        'Content-Type': 'application/json',
      },
      ...options,
    };

    // Merge headers for non-FormData requests
    if (options.headers && !(options.body instanceof FormData)) {
      config.headers = { ...config.headers, ...options.headers };
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
        return await response.json();
    } catch (error) {
      throw error;
    }
  }
  // Profile related API calls - Login endpoint
  async submitProfile(profileData) {
    return this.request(API_ENDPOINTS.PROFILE, {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  }

  // Download image by name
  async downloadImage(imageName) {
    try {
      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.IMAGE}?name=${encodeURIComponent(imageName)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }      return response.blob();
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
