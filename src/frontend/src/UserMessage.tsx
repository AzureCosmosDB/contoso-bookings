import React from 'react';
import { provideFluentDesignSystem, fluentCard } from '@fluentui/web-components';
import { provideReactWrapper } from '@microsoft/fast-react-wrapper';
import type { UserMessage as UserMessageProps } from './ChatMessage';
import './UserMessage.css';


const { wrap } = provideReactWrapper(React, provideFluentDesignSystem());
export const FluentCard = wrap(fluentCard());

const UserMessage: React.FC<{ message: UserMessageProps }> = ({ message }) => {
  return (
    <FluentCard className="user-message">
      <div className="user-message-content">
      {message.message} <br />
      Chosen Amenities: {message.amenity} 
      </div>
      <div className="user-message-timestamp">
        {message.timestamp.toLocaleString()}
      </div>
    </FluentCard>
  );
};

export default UserMessage;