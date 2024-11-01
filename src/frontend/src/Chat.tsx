import React, { useState } from 'react';
import UserMessage from './UserMessage';
import { v4 as uuidv4 } from 'uuid';
import { log } from 'util';

type UserMessageProps = {
  id: string;
  message: string;
  amenity: string;
  timestamp: Date;
};

interface ChatProps {
  amenities: string[];
}

const Chat: React.FC<ChatProps> = ({ amenities }) => {
  const [message, setMessage] = useState('');
  const [selectedAmenity, setSelectedAmenity] = useState('');
  const [messages, setMessages] = useState<UserMessageProps[]>([]);

  const handleSendMessage = () => {
    if (message.trim() === '' || selectedAmenity === '') {
      return;
    }

    const newMessage: UserMessageProps = {
      id: uuidv4(),
      message,
      amenity: selectedAmenity,
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);

    // Clear the input fields
    setMessage('');
    setSelectedAmenity('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
        <h2>Chat</h2>
        {messages.map((msg) => (
          <UserMessage key={msg.id} message={msg} />
        ))}
      </div>
      <div style={{ padding: '10px', borderTop: '1px solid #ccc' }}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here..."
          style={{ width: '100%', height: '100px' }}
        />
        <div>
          <select
            value={selectedAmenity}
            onChange={(e) => setSelectedAmenity(e.target.value)}
            style={{ width: '100%', marginTop: '10px' }}
          >
            <option value="">Select an amenity</option>
            {amenities.map((amenity, index) => (
              <option key={index} value={amenity}>
                {amenity}
              </option>
            ))}
          </select>
        </div>
        <button onClick={handleSendMessage} style={{ marginTop: '10px' }}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;