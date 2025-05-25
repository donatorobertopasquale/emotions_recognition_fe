import React from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

const NotificationSystem = ({ notifications, removeNotification }) => {
  return (
    <ToastContainer position="top-end" className="p-3">
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          onClose={() => removeNotification(notification.id)}
          show={true}
          delay={notification.duration || 5000}
          autohide={notification.autohide !== false}
          bg={notification.variant || 'primary'}
        >
          <Toast.Header>
            <strong className="me-auto">
              {notification.title || 'Notification'}
            </strong>
            <small>{new Date().toLocaleTimeString()}</small>
          </Toast.Header>
          {notification.message && (
            <Toast.Body className="text-white">
              {notification.message}
            </Toast.Body>
          )}
        </Toast>
      ))}
    </ToastContainer>
  );
};

export default NotificationSystem;
