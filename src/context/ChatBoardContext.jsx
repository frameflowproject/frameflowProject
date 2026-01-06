import React, { createContext, useContext, useState } from 'react';

const ChatBoardContext = createContext();

export const useChatBoard = () => {
  const context = useContext(ChatBoardContext);
  if (!context) {
    throw new Error('useChatBoard must be used within a ChatBoardProvider');
  }
  return context;
};

export const ChatBoardProvider = ({ children }) => {
  const [openChats, setOpenChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);

  const openChat = (user) => {
    // Check if chat is already open
    const existingChat = openChats.find(chat => chat.id === user.id);
    if (existingChat) {
      setActiveChat(user);
      return;
    }

    // Add new chat (limit to 3 open chats on desktop)
    const newChats = [...openChats];
    if (newChats.length >= 3) {
      newChats.shift(); // Remove oldest chat
    }
    newChats.push(user);
    setOpenChats(newChats);
    setActiveChat(user);
  };

  const closeChat = (userId) => {
    setOpenChats(prev => prev.filter(chat => chat.id !== userId));
    if (activeChat?.id === userId) {
      setActiveChat(null);
    }
  };

  const minimizeChat = (userId) => {
    setOpenChats(prev => prev.map(chat => 
      chat.id === userId 
        ? { ...chat, isMinimized: !chat.isMinimized }
        : chat
    ));
  };

  const closeAllChats = () => {
    setOpenChats([]);
    setActiveChat(null);
  };

  return (
    <ChatBoardContext.Provider value={{
      openChats,
      activeChat,
      openChat,
      closeChat,
      minimizeChat,
      closeAllChats,
      setActiveChat
    }}>
      {children}
    </ChatBoardContext.Provider>
  );
};