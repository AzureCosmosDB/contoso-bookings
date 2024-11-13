import React, { useEffect, useState } from 'react';
import UserMessageComp from './UserMessage';
import ReplyMessageComp from './ReplyMessage';
import { ChatMessage, UserMessage, ReplyMessage } from './ChatMessage';
import { v4 as uuidv4 } from 'uuid';
import { provideFluentDesignSystem, fluentButton } from '@fluentui/web-components';
import { provideReactWrapper } from '@microsoft/fast-react-wrapper';
import './Chat.css';
import {Textarea} from "@fluentui/react-components";


const { wrap } = provideReactWrapper(React, provideFluentDesignSystem());
export const FluentButton = wrap(fluentButton());


interface ChatProps {
  setSearchResults: (search_results: { name: String, price:number, similarity_score:number, lat: number; lng: number }[]) => void;
}

const Chat: React.FC<ChatProps> = ({ setSearchResults }) => {
  const [message, setMessage] = useState('');
  const [amenities, setAmenities] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {}, []);

  const handleSendMessage = async () => {

    if(message.trim() === '') {
      alert('Please enter a message');
      return;
    }

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



      const newReply: ReplyMessage = {
              id: uuidv4(),
              message: data.message,
              timestamp: new Date(),
              replyTo: newMessage.id,
        };

      setMessages((prevMessages) => [...prevMessages, newReply]);
      setMessage('');
      setAmenities('');

      if (!data.listings) {
        return;
      }
      const search_results = data.listings.map((reply: any) => ({
        lat: reply.location.coordinates[1],
        lng: reply.location.coordinates[0],
        name: reply.name,
        price: reply.price,
        similarity_score: reply.similarity_score
      }));

      setSearchResults(search_results);


    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

return (
  <div className='chat-container'>
    <div className='chat-messages'>
      <h2>Chat</h2> 
      {messages.map((msg) =>
          'amenity' in msg ? (
            <UserMessageComp message={msg as UserMessage}/>
          ) : (
            <ReplyMessageComp replies={[msg as ReplyMessage]} />
          )
        )}
    </div>
    <div>
      <Textarea className='chat-input'
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message here..."
        required
      />
      <div>
        <label htmlFor="amenity">Add Amenities: </label>
        <Textarea value={amenities} 
         onChange={(e) => setAmenities(e.target.value)}
         style={{ width: '100%', marginTop: '10px' }}
        />
      </div>
      <div className='send-button-container'>
      
      <FluentButton 
      onClick={handleSendMessage} 
      className='send-button' 
      disabled={message.length < 5}>
        Send Message
      </FluentButton>
      </div>
    </div>
  </div>
);
};

export default Chat;