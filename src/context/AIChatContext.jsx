import React, { createContext, useContext, useState } from 'react';

const AIChatContext = createContext();

export const useAIChat = () => {
  const context = useContext(AIChatContext);
  if (!context) {
    throw new Error('useAIChat must be used within an AIChatProvider');
  }
  return context;
};

export const AIChatProvider = ({ children }) => {
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [unreadAIMessages, setUnreadAIMessages] = useState(0);

  const openAIChat = () => {
    setIsAIChatOpen(true);
    setUnreadAIMessages(0); // Clear unread count when opening
  };

  const closeAIChat = () => {
    setIsAIChatOpen(false);
  };

  const toggleAIChat = () => {
    if (isAIChatOpen) {
      closeAIChat();
    } else {
      openAIChat();
    }
  };

  const addMessageToHistory = (message) => {
    setChatHistory(prev => [...prev, message]);
    
    // If chat is closed and it's an AI message, increment unread count
    if (!isAIChatOpen && message.sender === 'ai') {
      setUnreadAIMessages(prev => prev + 1);
    }
  };

  const clearChatHistory = () => {
    setChatHistory([]);
    setUnreadAIMessages(0);
  };

  const markAsRead = () => {
    setUnreadAIMessages(0);
  };

  return (
    <AIChatContext.Provider value={{
      isAIChatOpen,
      chatHistory,
      unreadAIMessages,
      openAIChat,
      closeAIChat,
      toggleAIChat,
      addMessageToHistory,
      clearChatHistory,
      markAsRead
    }}>
      {children}
    </AIChatContext.Provider>
  );
};

export default AIChatProvider;