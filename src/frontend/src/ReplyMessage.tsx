import React from 'react';
import { provideFluentDesignSystem, fluentCard } from '@fluentui/web-components';
import { provideReactWrapper } from '@microsoft/fast-react-wrapper';
import type { ReplyMessage as ReplyMessageProps } from './ChatMessage';
import './ReplyMessage.css';



const { wrap } = provideReactWrapper(React, provideFluentDesignSystem());
export const FluentCard = wrap(fluentCard());

const ReplyMessage: React.FC<{ replies: ReplyMessageProps[] }> = ({ replies }) => {
  return (
    <FluentCard className="reply-message">
      {replies.map((reply) => (
        <div className="reply-message">
          <div className="reply-message-content">
            {reply.message}
          </div>
          <div className="reply-message-timestamp">
            {reply.timestamp.toLocaleString()}
          </div>
        </div>
      ))}
    </FluentCard>
  );
};

export default ReplyMessage;