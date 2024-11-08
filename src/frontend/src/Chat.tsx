import React, { useEffect, useState } from 'react';
import UserMessageComp from './UserMessage';
import ReplyMessageComp from './ReplyMessage';
import { ChatMessage, UserMessage, ReplyMessage } from './ChatMessage';
import { v4 as uuidv4 } from 'uuid';
import { log } from 'console';

interface ChatProps {
  setCoordinates: (coordinates: { lat: number; lng: number }[]) => void;
}

const Chat: React.FC<ChatProps> = ({ setCoordinates }) => {
  const [message, setMessage] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [selectedAmenity, setSelectedAmenity] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const response = await fetch('http://localhost:8000/amenities');
        const data = await response.json();        
        setAmenities(data.amenities);
      } catch (error) {
        console.error('Error fetching amenities:', error);
      }
    };

    fetchAmenities();
  }, []);

  const handleSendMessage = async () => {

    const newMessage: UserMessage = {
      id: uuidv4(),
      message,
      amenity: selectedAmenity,
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);


    try {
      const response = await fetch('http://localhost:8000/query-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        
        body: JSON.stringify({ content: message, amenity: selectedAmenity }),
      });

      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      // Clear the message input after sending
      setMessage('');


      // const coordinates = data.map((reply: any) => ({
      //   lat: reply.location.coordinates[1],
      //   lng: reply.location.coordinates[0],
      // }));


      const newReply: ReplyMessage = {
              id: uuidv4(),
              message: data.message,
              timestamp: new Date(),
              replyTo: newMessage.id,
        };

      setMessages((prevMessages) => [...prevMessages, newReply]);
      // setCoordinates(coordinates);
      setMessage('');

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