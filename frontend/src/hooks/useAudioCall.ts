export type AudioCallState =
  | 'idle'
  | 'calling'
  | 'ringing'
  | 'in_call'
  | 'ended'
  | 'error';

interface UseAudioCallOptions {
  conversationId: number;
  currentUserId: number;
  peerUserId?: number;
  stunUrls?: string[];
  turnConfig?: { urls: string[]; username: string; credential: string } | null;
}

export function useAudioCall({
  conversationId,
  currentUserId,
  stunUrls = ['stun:stun.l.google.com:19302'],
  turnConfig = null,
}: UseAudioCallOptions) {
  let pc: RTCPeerConnection | null = null;
  let localStream: MediaStream | null = null;
  let remoteAudioEl: HTMLAudioElement | null = null;
  let state: AudioCallState = 'idle';

  const getIceServers = (): RTCIceServer[] => {
    const servers: RTCIceServer[] = [];
    if (stunUrls?.length) servers.push({ urls: stunUrls });
    if (turnConfig)
      servers.push({
        urls: turnConfig.urls,
        username: turnConfig.username,
        credential: turnConfig.credential,
      });
    return servers;
  };

  const initPeer = async () => {
    if (pc) return pc;
    pc = new RTCPeerConnection({ iceServers: getIceServers() });
    pc.onicecandidate = e => {
      if (e.candidate) {
        // Send candidate via WS
        const ws = (window as any).getWebSocketClient?.() || null;
        if (ws) {
          ws.send({
            type: 'rtc_candidate',
            conversation_id: conversationId,
            from: currentUserId,
            candidate: e.candidate,
          });
        }
      }
    };
    pc.ontrack = e => {
      try {
        if (!remoteAudioEl) {
          remoteAudioEl = new Audio();
          remoteAudioEl.autoplay = true;
          document.body.appendChild(remoteAudioEl);
        }
        remoteAudioEl.srcObject = e.streams[0];
      } catch {}
    };
    return pc;
  };

  const startLocalAudio = async () => {
    if (localStream) return localStream;
    localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
    const peer = await initPeer();
    localStream.getTracks().forEach(t => peer.addTrack(t, localStream!));
    return localStream;
  };

  const call = async () => {
    try {
      state = 'calling';
      await startLocalAudio();
      const peer = await initPeer();
      const offer = await peer.createOffer({ offerToReceiveAudio: true });
      await peer.setLocalDescription(offer);
      const ws = (window as any).getWebSocketClient?.() || null;
      if (ws) {
        ws.send({
          type: 'rtc_offer',
          conversation_id: conversationId,
          from: currentUserId,
          sdp: offer,
        });
      }
    } catch (e) {
      console.error('Failed to call:', e);
      state = 'error';
    }
  };

  const answer = async (remoteSdp: any) => {
    try {
      await startLocalAudio();
      const peer = await initPeer();
      await peer.setRemoteDescription(new RTCSessionDescription(remoteSdp));
      const ans = await peer.createAnswer();
      await peer.setLocalDescription(ans);
      const ws = (window as any).getWebSocketClient?.() || null;
      if (ws) {
        ws.send({
          type: 'rtc_answer',
          conversation_id: conversationId,
          from: currentUserId,
          sdp: ans,
        });
      }
      state = 'in_call';
    } catch (e) {
      console.error('Failed to answer:', e);
      state = 'error';
    }
  };

  const handleRemoteOffer = async (sdp: any) => {
    try {
      await startLocalAudio();
      const peer = await initPeer();
      await peer.setRemoteDescription(new RTCSessionDescription(sdp));
      const ans = await peer.createAnswer();
      await peer.setLocalDescription(ans);
      const ws = (window as any).getWebSocketClient?.() || null;
      if (ws) {
        ws.send({
          type: 'rtc_answer',
          conversation_id: conversationId,
          from: currentUserId,
          sdp: ans,
        });
      }
      state = 'ringing';
    } catch (e) {
      console.error('Failed to handle remote offer:', e);
      state = 'error';
    }
  };

  const handleRemoteAnswer = async (sdp: any) => {
    try {
      const peer = await initPeer();
      await peer.setRemoteDescription(new RTCSessionDescription(sdp));
      state = 'in_call';
    } catch (e) {
      console.error('Failed to handle remote answer:', e);
      state = 'error';
    }
  };

  const addIceCandidate = async (candidate: any) => {
    try {
      const peer = await initPeer();
      await peer.addIceCandidate(new RTCIceCandidate(candidate));
    } catch {}
  };

  const hangup = async () => {
    try {
      const ws = (window as any).getWebSocketClient?.() || null;
      if (ws) {
        ws.send({
          type: 'rtc_end',
          conversation_id: conversationId,
          from: currentUserId,
        });
      }
      if (pc) {
        pc.getSenders().forEach(s => s.track && s.track.stop());
        pc.close();
      }
      if (localStream) {
        localStream.getTracks().forEach(t => t.stop());
      }
      pc = null;
      localStream = null;
      state = 'ended';
    } catch {}
  };

  return {
    call,
    answer,
    handleRemoteOffer,
    handleRemoteAnswer,
    addIceCandidate,
    hangup,
    get state() {
      return state;
    },
  };
}
