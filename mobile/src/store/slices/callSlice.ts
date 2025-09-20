import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CallState, User } from '../../types';

const initialState: CallState = {
  isInCall: false,
  isRinging: false,
  callType: null,
  participants: [],
  localStream: undefined,
  remoteStream: undefined,
};

export const callSlice = createSlice({
  name: 'call',
  initialState,
  reducers: {
    startCall: (state, action: PayloadAction<{ type: 'audio' | 'video'; participants: User[] }>) => {
      state.isInCall = true;
      state.isRinging = true;
      state.callType = action.payload.type;
      state.participants = action.payload.participants;
    },
    answerCall: (state) => {
      state.isRinging = false;
    },
    endCall: (state) => {
      state.isInCall = false;
      state.isRinging = false;
      state.callType = null;
      state.participants = [];
      state.localStream = undefined;
      state.remoteStream = undefined;
    },
    setLocalStream: (state, action: PayloadAction<MediaStream | undefined>) => {
      state.localStream = action.payload;
    },
    setRemoteStream: (state, action: PayloadAction<MediaStream | undefined>) => {
      state.remoteStream = action.payload;
    },
    addParticipant: (state, action: PayloadAction<User>) => {
      const existingIndex = state.participants.findIndex(p => p.id === action.payload.id);
      if (existingIndex < 0) {
        state.participants.push(action.payload);
      }
    },
    removeParticipant: (state, action: PayloadAction<number>) => {
      state.participants = state.participants.filter(p => p.id !== action.payload);
    },
  },
});

export const {
  startCall,
  answerCall,
  endCall,
  setLocalStream,
  setRemoteStream,
  addParticipant,
  removeParticipant,
} = callSlice.actions;

export default callSlice.reducer;
