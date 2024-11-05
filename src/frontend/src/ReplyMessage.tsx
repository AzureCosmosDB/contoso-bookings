import React from 'react';
import './ReplyMessage.css';
import type { ReplyMessage as ReplyMessageProps } from './ChatMessage';

const ReplyMessage: React.FC<{ replies: ReplyMessageProps[] }> = ({ replies }) => {
  return (
    <div className="reply-messages">
      {replies.map((reply, index) => (
        <div className="reply-message">
          <div className="reply-message-content">
            Description: {reply.description} <br />
            Price: {reply.price}
          </div>
          <div className="reply-message-timestamp">
            {reply.timestamp.toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReplyMessage;