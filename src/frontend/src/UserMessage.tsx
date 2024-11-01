// UserMessage.tsx
import React from 'react';
import './UserMessage.css';

type UserMessageProps = {
  id: string;
  message: string;
  amenity: string;
  timestamp: Date;
};

const UserMessage: React.FC<{ message: UserMessageProps }> = ({ message }) => {
  return (
    <div className="user-message">
      <div className="user-message-content">
      Messasge: {message.message} <br />
      Chosen Amenities: {message.amenity} 
      </div>
      <div className="user-message-timestamp">
        {message.timestamp.toLocaleString()}
      </div>
    </div>
  );
};

export default UserMessage;