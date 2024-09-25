import React from 'react';

const ChatMessage = ({ messages }) => {
  return (
    <div className="chat-window">
      {messages.map((item, index) => (
        <div key={index} className="message">
          <strong>{item.name}:</strong> {item.message}
        </div>
      ))}
    </div>
  );
};

export default ChatMessage;