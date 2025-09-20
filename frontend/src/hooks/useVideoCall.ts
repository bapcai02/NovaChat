'use client';

import { useEffect, useRef, useState } from 'react';
import { getWebSocketClient } from '@/lib/websocket';

interface UseVideoCallOptions {
  conversationId: number;
  currentUserId: number;
}

export function useVideoCall(options: UseVideoCallOptions) {
  const { conversationId, currentUserId } = options;
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const originalVideoTrackRef = useRef<MediaStreamTrack | null>(null);
  const [isInCall, setIsInCall] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const ensurePeer = () => {
    if (pcRef.current) return pcRef.current;
    const turn: any =
      (typeof window !== 'undefined' && (window as any).NC_TURN) || null;
    const forceRelay: boolean = Boolean(
      typeof window !== 'undefined' && (window as any).NC_TURN_FORCE
    );
    const iceServers: RTCIceServer[] = [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:global.stun.twilio.com:3478' },
    ];
    if (turn && turn.urls && turn.username && turn.credential) {
      iceServers.push({
        urls: Array.isArray(turn.urls) ? turn.urls : [turn.urls],
        username: turn.username,
        credential: turn.credential,
      });
    }
    const pc = new RTCPeerConnection({
      iceServers,
      // @ts-expect-error: allow optional policy
      iceTransportPolicy: forceRelay ? 'relay' : 'all',
    });
    pc.onicecandidate = ev => {
      if (ev.candidate) {
        const ws = getWebSocketClient();
        ws.send({
          type: 'rtc_candidate',
          conversation_id: conversationId,
          from: currentUserId,
          candidate: ev.candidate,
        } as any);
      }
    };
    pc.ontrack = ev => {
      if (!remoteStreamRef.current) {
        remoteStreamRef.current = new MediaStream();
      }
      const remote = remoteStreamRef.current;
      ev.streams[0]?.getTracks().forEach(t => remote.addTrack(t));
    };
    pcRef.current = pc;
    return pc;
  };

  const getLocalStream = async () => {
    if (localStreamRef.current) return localStreamRef.current;

    try {
      // Try with preferred video settings first
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: { width: 1280, height: 720 },
      });
      localStreamRef.current = stream;
      return stream;
    } catch (error) {
      console.warn(
        'Failed to get preferred video settings, trying fallback:',
        error
      );

      try {
        // Fallback to basic video settings
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        localStreamRef.current = stream;
        return stream;
      } catch (fallbackError) {
        console.warn('Failed to get video, trying audio only:', fallbackError);

        try {
          // Audio only fallback
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false,
          });
          localStreamRef.current = stream;
          return stream;
        } catch (audioError) {
          console.error('Failed to get any media stream:', audioError);
          throw new Error(
            'Camera and microphone not available. Please check your permissions and device connections.'
          );
        }
      }
    }
  };

  const call = async () => {
    try {
      const pc = ensurePeer();
      const local = await getLocalStream();
      local.getTracks().forEach(t => pc.addTrack(t, local));
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      const ws = getWebSocketClient();
      ws.send({
        type: 'rtc_offer',
        conversation_id: conversationId,
        from: currentUserId,
        sdp: offer,
        media: 'video',
      } as any);
      setIsInCall(true);
    } catch (error) {
      console.error('Failed to start video call:', error);
      throw error;
    }
  };

  const handleRemoteOffer = async (sdp: any) => {
    try {
      const pc = ensurePeer();
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const local = await getLocalStream();
      local.getTracks().forEach(t => pc.addTrack(t, local));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      const ws = getWebSocketClient();
      ws.send({
        type: 'rtc_answer',
        conversation_id: conversationId,
        from: currentUserId,
        sdp: answer,
        media: 'video',
      } as any);
      setIsInCall(true);
    } catch (error) {
      console.error('Failed to handle remote offer:', error);
      throw error;
    }
  };

  const handleRemoteAnswer = async (sdp: any) => {
    const pc = ensurePeer();
    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    setIsInCall(true);
  };

  const addIceCandidate = async (candidate: RTCIceCandidateInit) => {
    if (!pcRef.current) return;
    try {
      await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    } catch {}
  };

  const hangup = () => {
    const ws = getWebSocketClient();
    ws.send({
      type: 'rtc_end',
      conversation_id: conversationId,
      from: currentUserId,
    } as any);
    pcRef.current?.getSenders().forEach(s => {
      try {
        s.track?.stop();
      } catch {}
    });
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
    screenStreamRef.current?.getTracks().forEach(t => t.stop());
    screenStreamRef.current = null;
    originalVideoTrackRef.current = null;
    isInCall && setIsInCall(false);
    setIsScreenSharing(false);
  };

  // Screen share: replace outgoing video track with display track
  const startScreenShare = async () => {
    if (!pcRef.current) return;
    if (isScreenSharing) return;
    try {
      const display = (await (navigator.mediaDevices as any).getDisplayMedia({
        video: true,
        audio: false,
      })) as MediaStream;
      screenStreamRef.current = display;

      const sender = pcRef.current
        .getSenders()
        .find(s => s.track && s.track.kind === 'video');
      if (!sender) return;
      // cache original camera track to restore later
      originalVideoTrackRef.current = sender.track || null;
      const screenTrack = display.getVideoTracks()[0];
      await sender.replaceTrack(screenTrack);
      setIsScreenSharing(true);

      // When user stops sharing from browser UI
      screenTrack.onended = async () => {
        await stopScreenShare();
      };
    } catch (e) {
      console.error('Failed to start screen share', e);
    }
  };

  const stopScreenShare = async () => {
    if (!pcRef.current) return;
    if (!isScreenSharing) return;
    try {
      const sender = pcRef.current
        .getSenders()
        .find(s => s.track && s.track.kind === 'video');
      const original = originalVideoTrackRef.current;
      if (sender && original) {
        await sender.replaceTrack(original);
      }
      screenStreamRef.current?.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;
      setIsScreenSharing(false);
    } catch (e) {
      console.error('Failed to stop screen share', e);
    }
  };

  useEffect(() => {
    return () => {
      try {
        pcRef.current?.close();
      } catch {}
      localStreamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  return {
    call,
    handleRemoteOffer,
    handleRemoteAnswer,
    addIceCandidate,
    hangup,
    isInCall,
    localStreamRef,
    remoteStreamRef,
    // screen share
    startScreenShare,
    stopScreenShare,
    isScreenSharing,
  };
}
