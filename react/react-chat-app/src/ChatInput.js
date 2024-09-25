import React from 'react';

function ChatInput({ inputValue, handleInputChange, sendMessage }) {

  // 엔터키를 누르면 sendMessage 함수 호출
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}  // 엔터키 이벤트 추가
      />
      <button onClick={sendMessage}>입력</button>
    </div>
  );
}

export default ChatInput;