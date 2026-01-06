import React from 'react';
import { useChatBoard } from '../context/ChatBoardContext';
import { useIsDesktop } from '../hooks/useMediaQuery';
import ChatBoard from './ChatBoard';

const ChatBoardManager = () => {
  const isDesktop = useIsDesktop();
  const { openChats, activeChat, closeChat, setActiveChat } = useChatBoard();

  // On mobile, show only active chat
  if (!isDesktop) {
    return activeChat ? (
      <ChatBoard
        isOpen={true}
        selectedUser={activeChat}
        onClose={() => setActiveChat(null)}
      />
    ) : null;
  }

  // On desktop, show multiple floating chats
  return (
    <>
      {openChats.map((user, index) => (
        <div
          key={user.id}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: `${20 + (index * 370)}px`, // Stack chats horizontally
            zIndex: 1000 + index
          }}
        >
          <ChatBoard
            isOpen={true}
            selectedUser={user}
            onClose={() => closeChat(user.id)}
          />
        </div>
      ))}
    </>
  );
};

export default ChatBoardManager;