# Emotion Recognition Workflow - Testing Guide

## Overview
The complete emotion recognition workflow has been implemented and is ready for testing. The application now follows the exact specified workflow:

1. **Login** → Get images list and userId
2. **Display Images** → One at a time with video recording
3. **Collect Reactions** → Video + comments for each image
4. **Emotion Prediction** → Call classifier API for each video
5. **Final Submission** → Submit structured results to register-result endpoint

## Application Flow

### 1. HomePage (/)
- Welcome screen with navigation to profile setup

### 2. ProfilePage (/profile)
- **Form Fields:**
  - Name (required)
  - Age (required, 18-100)
  - Gender (required: Male/Female/Other)
  - Nationality (dropdown with predefined options)
  - Email (required, valid format)

- **API Call:** `POST /api/v1/login`
- **Expected Response:**
  ```json
  {
    "userId": "string",
    "images": ["image1.jpg", "image2.jpg", ...]
  }
  ```

### 3. ImagePage (/image)
- **Sequential Image Display:** Shows one image at a time
- **Progress Tracking:** Shows current image number (e.g., "Image 1 of 5")
- **For Each Image:**
  1. Download image via `GET /api/v1/download-image?imageName={name}`
  2. Display image to user
  3. Start webcam for video recording
  4. Collect user comment/description
  5. Record video of user's reaction
  6. Submit video to `POST /api/classifier/predict` for emotion analysis
  7. Store all reaction data
  8. Move to next image

- **Navigation:** 
  - "Next Image" button (after recording and processing)
  - "Submit Assessment" button (on last image)

### 4. FinalPage (/final)
- **Final Submission:** `POST /api/v1/register-result`
- **Payload Structure:**
  ```json
  {
    "userId": "string",
    "imagesDescriptionsAndReactions": [
      {
        "imageId": "string",
        "description": "user comment",
        "reaction": "predicted_emotion",
        "aiComment": "ai response text"
      }
    ]
  }
  ```

- **Results Display:**
  - Overall emotion summary
  - Individual image reactions
  - Emotion breakdown percentages

## API Endpoints Used

1. **Login:** `POST /api/v1/login`
2. **Download Image:** `GET /api/v1/download-image?imageName={name}`
3. **Emotion Prediction:** `POST /api/classifier/predict`
4. **Final Submission:** `POST /api/v1/register-result`

## Testing Checklist

### Frontend Testing (Without Backend)
- ✅ Application builds successfully
- ✅ No ESLint warnings
- ✅ All pages render without errors
- ✅ Form validation works on ProfilePage
- ✅ Webcam access request works
- ✅ Navigation between pages works

### Integration Testing (Requires Backend)
- [ ] Profile submission returns userId and images list
- [ ] Image download endpoint works for each image name
- [ ] Video upload to classifier returns emotion prediction
- [ ] Final result submission accepts structured payload
- [ ] Error handling for failed API calls

### User Experience Testing
- [ ] Webcam permission request
- [ ] Video recording indicators
- [ ] Loading states during API calls
- [ ] Progress indication through images
- [ ] Clear instructions for user

## Mock Data for Testing

If backend is not available, you can test with mock API responses:

### Mock Profile Response:
```json
{
  "userId": "test-user-123",
  "images": ["happy_child.jpg", "sad_person.jpg", "angry_scene.jpg"]
}
```

### Mock Emotion Response:
```json
{
  "dominant_emotion": "happy",
  "emotion_analysis": "The person appears joyful and content"
}
```

## Common Issues & Solutions

1. **Webcam Not Working:**
   - Ensure browser permissions are granted
   - Check if other apps are using the camera
   - Try refreshing the page

2. **API Errors:**
   - Check browser console for detailed error messages
   - Verify backend endpoints are running
   - Check CORS configuration if cross-origin requests

3. **Navigation Issues:**
   - Ensure all required data is collected before navigation
   - Check browser console for state management errors

## Development Notes

- **State Management:** Uses React Context for global state
- **Video Recording:** Uses MediaRecorder API
- **Image Display:** Blob URL creation for downloaded images
- **Form Validation:** Real-time validation with error messages
- **Error Handling:** Graceful error handling with user feedback

## Next Steps for Production

1. **Backend Integration:** Test with actual API endpoints
2. **Error Handling:** Enhance error messages and recovery
3. **UI/UX Polish:** Add animations and better loading states
4. **Performance:** Optimize video recording and image loading
5. **Accessibility:** Add proper ARIA labels and keyboard navigation
6. **Testing:** Add unit tests and integration tests

The application is ready for backend integration and end-to-end testing!
