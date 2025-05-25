import { API_ENDPOINTS } from '../constants';

class ApiService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || '';
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Profile related API calls
  async submitProfile(profileData) {
    return this.request(API_ENDPOINTS.PROFILE, {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  }

  // Recognition related API calls
  async submitRecognition(imageData, comment = '') {
    return this.request(API_ENDPOINTS.RECOGNITION, {
      method: 'POST',
      body: JSON.stringify({
        image: imageData,
        comment: comment,
        timestamp: new Date().toISOString()
      }),
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

export default new ApiService();
