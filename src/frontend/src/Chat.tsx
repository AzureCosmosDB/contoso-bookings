import React, { useEffect, useState } from 'react';
import UserMessageComp from './UserMessage';
import ReplyMessageComp from './ReplyMessage';
import { ChatMessage, UserMessage, ReplyMessage } from './ChatMessage';
import { v4 as uuidv4 } from 'uuid';

interface ChatProps {
  setSearchCoordinates: (coordinates: { lat: number; lng: number }) => void;
}

const Chat: React.FC<ChatProps> = ({ setSearchCoordinates }) => {
  const [message, setMessage] = useState('');
  const [amenities, setAmenities] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {}, []);

  const handleSendMessage = async () => {

    const newMessage: UserMessage = {
      id: uuidv4(),
      message,
      amenity: amenities,
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);


    let amenities_list = amenities.split(',').map((amenity) => amenity.trim());
  
    try {
      const response = await fetch('http://localhost:8000/query_message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        
        body: JSON.stringify({ content: message, amenities: amenities_list }),
      });

      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      const coordinates = data.listings.map((reply: any) => ({
        lat: reply.location.coordinates[1],
        lng: reply.location.coordinates[0],
      }));


      const newReply: ReplyMessage = {
              id: uuidv4(),
              message: data.message,
              timestamp: new Date(),
              replyTo: newMessage.id,
        };

      setMessages((prevMessages) => [...prevMessages, newReply]);
      setSearchCoordinates(coordinates);
      setMessage('');
      setAmenities('');

    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

return (
  <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
    <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
      <h2>Chat</h2>
      {messages.map((msg) =>
          'amenity' in msg ? (
            <UserMessageComp message={msg as UserMessage}/>
          ) : (
            <ReplyMessageComp replies={[msg as ReplyMessage]} />
          )
        )}
    </div>
    <div style={{ padding: '10px', borderTop: '1px solid #ccc' }}>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message here..."
        style={{ width: '100%', height: '100px' }}
      />
      <div>

        <label htmlFor="amenity">Add Amenities:</label>
        <textarea value={amenities} 
         onChange={(e) => setAmenities(e.target.value)}
         style={{ width: '100%', marginTop: '10px' }}
        />

        {/* <select
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
        </select> */}
      </div>
      <button onClick={handleSendMessage} style={{ marginTop: '10px' }}>
        Send
      </button>
    </div>
  </div>
);
};

export default Chat;