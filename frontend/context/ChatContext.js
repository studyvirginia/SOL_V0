import { createContext, useContext } from 'react';

const ChatContext = createContext({
  onSwitch: () => {},
  onSend: () => {},
});

export const ChatProvider = ChatContext.Provider;

export const useChatContext = () => useContext(ChatContext);
