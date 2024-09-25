import './App.css';
import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { Stomp } from "@stomp/stompjs";
import ChatHeader from './ChatHeader';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

function App() {

  const stompClient = useRef(null);
  const [messages, setMessages] = useState([]);  // 메시지 배열
  const [inputValue, setInputValue] = useState('');  // 입력된 메시지

  // 입력 필드에 변화가 있을 때마다 inputValue 업데이트
  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  // 웹소켓 연결 설정
  const connect = () => {
    const socket = new WebSocket("ws://localhost:8080/ws");
    stompClient.current = Stomp.over(socket);
    stompClient.current.connect({}, () => {
      stompClient.current.subscribe(`/sub/chatroom/1`, (message) => {
        const newMessage = JSON.parse(message.body);
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      });
    });
  };

  // 웹소켓 연결 해제
  const disconnect = () => {
    if (stompClient.current) {
      stompClient.current.disconnect();
    }
  };

  // 기존 채팅 메시지를 서버로부터 가져오는 함수
  const fetchMessages = () => {
    return axios.get("http://localhost:8080/chat/1")
           .then(response => { setMessages(response.data) });
  };

  useEffect(() => {
    connect();
    fetchMessages();
    return () => disconnect();
  }, []);

  // 메시지 전송
  const sendMessage = () => {
    if (stompClient.current && inputValue) {
      const body = {
        id: 1,
        name: "테스트1",
        message: inputValue
      };
      stompClient.current.send(`/pub/message`, {}, JSON.stringify(body));
      setInputValue('');  // 전송 후 입력 필드 초기화
    }
  };

  return (
    <div className="App">
      <ChatHeader />
      <ChatMessage messages={messages} />
      <ChatInput
        inputValue={inputValue}
        handleInputChange={handleInputChange}
        sendMessage={sendMessage}
      />
    </div>
  );
}

export default App;