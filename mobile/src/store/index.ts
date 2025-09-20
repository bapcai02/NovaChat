import { configureStore } from '@reduxjs/toolkit';
import { authSlice } from './slices/authSlice';
import { chatSlice } from './slices/chatSlice';
import { callSlice } from './slices/callSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    chat: chatSlice.reducer,
    call: callSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['chat/setMessages', 'call/setLocalStream', 'call/setRemoteStream'],
        ignoredPaths: ['chat.messages', 'call.localStream', 'call.remoteStream'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
