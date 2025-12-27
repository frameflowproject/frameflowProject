import { useChat } from '../context/ChatContext';

const ChatStatus = () => {
  const { connectionStatus, onlineUsers } = useChat();

  // User requested to remove this status badge
  return null;
};

export default ChatStatus;