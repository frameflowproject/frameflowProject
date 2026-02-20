import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { useConversations } from "../context/ConversationContext";
import { useChat } from "../context/ChatContext";
import { useIsDesktop } from "../hooks/useMediaQuery";
import NewConversation from "./NewConversation";
import SkeletonLoader from "./SkeletonLoader";
import socketManager from "../utils/socket"; // Import socket manager directly for signaling

// Notification sound
const playNotificationSound = () => {
  try {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2Onp6jop+dmZmYmZqbnaCgoJ+enp2dnZ2cnJybnJycnJ2dnZ6enp+fn5+goKChoaGioqKjo6OkpKSlpaWmpqanp6eoqKipqamqqqqrq6usrKytra2urq6vr6+wsLCxsbGysrKzs7O0tLS1tbW2tra3t7e4uLi5ubm6urq7u7u8vLy9vb2+vr6/v7/AwMDBwcHCwsLDw8PExMTFxcXGxsbHx8fIyMjJycnKysrLy8vMzMzNzc3Ozs7Pz8/Q0NDR0dHS0tLT09PU1NTV1dXW1tbX19fY2NjZ2dna2trb29vc3Nzd3d3e3t7f39/g4ODh4eHi4uLj4+Pk5OTl5eXm5ubn5+fo6Ojp6enq6urr6+vs7Ozt7e3u7u7v7+/w8PDx8fHy8vLz8/P09PT19fX29vb39/f4+Pj5+fn6+vr7+/v8/Pz9/f3+/v7///8=');
    audio.volume = 0.3;
    audio.play().catch(() => { });
  } catch (e) { }
};

// --- REAL WebRTC Call Modal ---
const CallModal = ({ isOpen, onClose, user: otherUser, callType, isIncoming, callerSignal, callerSocketId }) => {
  const { user } = useAuth();
  const [callStatus, setCallStatus] = useState(isIncoming ? 'incoming' : 'calling'); // calling, incoming, connected, ended
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(callType === 'video');
  const [remoteStream, setRemoteStream] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [error, setError] = useState(null);
  const [remoteVideoAvailable, setRemoteVideoAvailable] = useState(false);

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const remoteAudioRef = useRef();
  const peerRef = useRef();
  const socketRef = useRef(socketManager.socket);
  const otherUserRef = useRef(otherUser);
  const targetSocketIdRef = useRef(callerSocketId);
  const ringtoneRef = useRef(new Audio('/projectringtone.mpeg'));

  const iceCandidatesQueue = useRef([]);

  // Keep socket ref in sync
  useEffect(() => {
    socketRef.current = socketManager.socket;
  }, [socketManager.socket]);

  // Keep ref in sync with props
  useEffect(() => {
    if (otherUser) otherUserRef.current = otherUser;
    if (callerSocketId) targetSocketIdRef.current = callerSocketId;
  }, [otherUser, callerSocketId]);

  const [logs, setLogs] = useState(['Modal opened']);
  const addLog = (msg) => {
    console.log(`[CALL DEBUG] ${msg}`);
    setLogs(prev => [...prev.slice(-8), msg]);
  };

  // WebRTC Configuration
  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' },
      { urls: 'stun:global.stun.twilio.com:3478' }
    ],
    iceCandidatePoolSize: 20,
    iceTransportPolicy: 'all'
  };

  const processIceQueue = async () => {
    if (!peerRef.current || !peerRef.current.remoteDescription) return;
    while (iceCandidatesQueue.current.length > 0) {
      const candidate = iceCandidatesQueue.current.shift();
      try {
        await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error("ICE error:", e);
      }
    }
  };

  // Ringtone Effect
  useEffect(() => {
    if (isOpen && callStatus === 'incoming') {
      ringtoneRef.current.loop = true;
      ringtoneRef.current.play().catch(e => console.warn("Ringtone blocked:", e));
    } else {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
    }
    return () => {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
    };
  }, [isOpen, callStatus]);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setCallStatus(isIncoming ? 'incoming' : 'calling');
      setCallDuration(0);
      setError(null);
      setLogs(['Ready...']);
      iceCandidatesQueue.current = [];
      targetSocketIdRef.current = callerSocketId;
      setRemoteVideoAvailable(false);
      setRemoteStream(null);
      setLocalStream(null);
    }
  }, [isOpen, isIncoming, callerSocketId]);

  // Cleanup on close
  useEffect(() => {
    if (!isOpen) cleanupCall();
  }, [isOpen]);

  // Auto-start outgoing
  useEffect(() => {
    if (isOpen && !isIncoming && callStatus === 'calling') {
      startCall();
    }
  }, [isOpen, isIncoming, callStatus]);

  // --- Track Management ---
  const handleRemoteTrack = useCallback((event) => {
    addLog(`Got ${event.track.kind}`);

    if (event.track.kind === 'video') {
      setRemoteVideoAvailable(true);
      // Force play on the ref directly if it exists
      if (remoteVideoRef.current) {
        setTimeout(() => {
          if (remoteVideoRef.current) remoteVideoRef.current.play().catch(e => addLog("Play Err"));
        }, 100);
      }
    }

    setRemoteStream(prevStream => {
      let stream = prevStream;
      if (!stream) {
        stream = (event.streams && event.streams[0]) ? event.streams[0] : new MediaStream();
      }
      if (!stream.getTracks().some(t => t.id === event.track.id)) {
        stream.addTrack(event.track);
      }
      return new MediaStream(stream.getTracks());
    });
  }, []);

  // Sync streams to DOM
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch(() => { });
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteStream) {
      const hasAudio = remoteStream.getAudioTracks().length > 0;
      const hasVideo = remoteStream.getVideoTracks().length > 0;
      addLog(`Status: A:${hasAudio ? 1 : 0} V:${hasVideo ? 1 : 0}`);

      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = remoteStream;
        remoteAudioRef.current.play()
          .then(() => addLog("Audio Live"))
          .catch(e => {
            console.warn("Audio play blocked", e);
            addLog("Tap screen for sound");
          });
      }

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
        remoteVideoRef.current.play().catch(e => console.warn("Video blocked", e));
      }
    }
  }, [remoteStream]);


  const startCall = async () => {
    addLog("Setting up...");
    try {
      const peer = new RTCPeerConnection(rtcConfig);
      peerRef.current = peer;

      peer.oniceconnectionstatechange = () => {
        addLog(`Ice: ${peer.iceConnectionState}`);
        if (peer.iceConnectionState === 'failed') setError("Connection error");
      };

      peer.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.emit("ice-candidate", {
            to: targetSocketIdRef.current || null,
            targetUserId: otherUserRef.current.id,
            candidate: event.candidate
          });
        }
      };

      peer.ontrack = handleRemoteTrack;

      // 1. Explicit Transceivers
      peer.addTransceiver('audio', { direction: 'sendrecv' });
      if (callType === 'video') {
        peer.addTransceiver('video', { direction: 'sendrecv' });
      }

      // 2. Local Media
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
          video: callType === 'video' ? { width: 1280, height: 720 } : false
        });

        setLocalStream(stream);
        stream.getTracks().forEach(track => {
          const transceiver = peer.getTransceivers().find(t => t.receiver.track.kind === track.kind);
          if (transceiver) {
            transceiver.sender.replaceTrack(track);
          } else {
            peer.addTrack(track, stream);
          }
        });

        addLog("Media Ready");
      } catch (err) {
        console.error("Mic/Cam Error:", err);
        setError("Permissions denied");
        addLog("No Mic/Video");
      }

      // 3. Signaling
      if (isIncoming && callerSignal) {
        addLog("Answering...");
        await peer.setRemoteDescription(new RTCSessionDescription(callerSignal));
        processIceQueue();

        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);

        socketRef.current.emit("answer-call", {
          to: callerSocketId,
          answer: answer
        });
        setCallStatus('connected');
      } else {
        addLog("Connecting...");
        if (!socketRef.current?.connected) {
          setError("Offline");
          setCallStatus('ended');
          return;
        }

        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);

        socketRef.current.emit("call-user", {
          userToCall: otherUserRef.current.id,
          offer: offer,
          callType: callType
        });
      }

    } catch (err) {
      console.error("WebRTC Error:", err);
      setError("Call initialisation failed");
      setCallStatus('ended');
    }
  };

  // Signal Listeners
  useEffect(() => {
    const socket = socketRef.current;
    if (socket && isOpen) {
      const onAnswer = async (data) => {
        addLog("Connected!");
        if (peerRef.current && !peerRef.current.currentRemoteDescription) {
          targetSocketIdRef.current = data.socket;
          await peerRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
          setCallStatus('connected');
          processIceQueue();
        }
      };

      const onIce = async (data) => {
        if (data.candidate && peerRef.current) {
          if (peerRef.current.remoteDescription) {
            try {
              await peerRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
            } catch (e) { }
          } else {
            iceCandidatesQueue.current.push(data.candidate);
          }
        }
      };

      const onEnd = () => {
        setCallStatus('ended');
        setTimeout(onClose, 800);
      };

      const onFail = (data) => {
        setError(data.reason);
        setCallStatus('ended');
        cleanupCall();
        setTimeout(onClose, 1500);
      };

      socket.on("call-answered", onAnswer);
      socket.on("ice-candidate", onIce);
      socket.on("call-ended", onEnd);
      socket.on("call-failed", onFail);

      return () => {
        socket.off("call-answered", onAnswer);
        socket.off("ice-candidate", onIce);
        socket.off("call-ended", onEnd);
        socket.off("call-failed", onFail);
      };
    }
  }, [isOpen, onClose]);


  // Timer
  useEffect(() => {
    if (callStatus !== 'connected') return;
    const timer = setInterval(() => setCallDuration(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [callStatus]);


  const cleanupCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (peerRef.current) {
      peerRef.current.close();
    }
    setLocalStream(null);
    setRemoteStream(null);
    if (!isOpen) {
      setCallStatus('ended');
      setCallDuration(0);
      setError(null);
    }
  };

  const handleEndCall = () => {
    if (socketRef.current) {
      socketRef.current.emit("end-call", {
        to: otherUserRef.current.id,
        socketId: targetSocketIdRef.current || callerSocketId
      });
    }
    cleanupCall();
    onClose();
  };

  const handleAcceptCall = () => {
    startCall();
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    }
  };

  const resumeAudio = () => {
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.play()
        .then(() => addLog("Audio Playing"))
        .catch(e => console.log("Resume failed", e));
    }
  };

  const formatDuration = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  if (!isOpen) return null;

  return (
    <div
      onClick={resumeAudio}
      style={{
        position: 'fixed', inset: 0,
        background: 'linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%)',
        zIndex: 2000, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'space-between', padding: '40px 20px 40px'
      }}
    >
      {/* Hidden Audio for Voice Calls */}
      <audio
        ref={remoteAudioRef}
        autoPlay
        playsInline
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
      />

      {/* Logs Overlay */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 100, color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', pointerEvents: 'none' }}>
        {logs.map((log, i) => <div key={i}>{log}</div>)}
      </div>

      {/* Remote Video (Full Screen) */}
      {callType === 'video' && (
        <video
          ref={remoteVideoRef}
          autoPlay
          muted={false}
          playsInline
          style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            objectFit: 'cover', zIndex: 0,
            opacity: (callStatus === 'connected' && remoteVideoAvailable) ? 1 : 0,
            transition: 'opacity 0.6s ease',
            background: 'black'
          }}
        />
      )}

      {/* Background Dimmer (Only shows when video is NOT available) */}
      {(!remoteVideoAvailable || callStatus !== 'connected') && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%)',
          zIndex: 1
        }} />
      )}


      {/* Incoming Call Overlay */}
      {callStatus === 'incoming' && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            width: '140px', height: '140px', borderRadius: '50%',
            background: otherUser?.avatar ? `url(${otherUser.avatar}) center/cover` : '#7c3aed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: '3rem', fontWeight: '600', marginBottom: '20px',
            border: '4px solid white', animation: 'pulse 1.5s infinite'
          }}>
            {!otherUser?.avatar && otherUser?.fullName?.charAt(0)?.toUpperCase()}
          </div>
          <h2 style={{ color: 'white', fontSize: '2rem', marginBottom: '40px' }}>{otherUser?.fullName}</h2>

          <div style={{ display: 'flex', gap: '60px' }}>
            <button onClick={handleEndCall} style={{
              width: '80px', height: '80px', borderRadius: '50%', background: '#ef4444',
              border: 'none', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(239, 68, 68, 0.4)'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '40px' }}>call_end</span>
            </button>

            <button onClick={handleAcceptCall} style={{
              width: '80px', height: '80px', borderRadius: '50%', background: '#22c55e',
              border: 'none', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(34, 197, 94, 0.4)', animation: 'bounce 1s infinite'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '40px' }}>call</span>
            </button>
          </div>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '60px', zIndex: 10, opacity: callStatus === 'incoming' ? 0 : 1 }}>
        {/* Avatar shown if friend's video is NOT currently active */}
        {(!remoteVideoAvailable || callStatus !== 'connected') && (
          <div style={{
            width: '120px', height: '120px', borderRadius: '50%',
            background: otherUser?.avatar ? `url(${otherUser.avatar}) center/cover` : '#7c3aed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: '3rem', fontWeight: '600', margin: '0 auto 20px',
            border: '4px solid rgba(255,255,255,0.2)',
            animation: (callStatus === 'calling') ? 'pulse 2s ease-in-out infinite' : 'none'
          }}>
            {!otherUser?.avatar && otherUser?.fullName?.charAt(0)?.toUpperCase()}
          </div>
        )}

        <h2 style={{ color: 'white', fontSize: '1.8rem', marginBottom: '8px', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
          {otherUser?.fullName}
        </h2>
        <p style={{ color: callStatus === 'connected' ? '#22c55e' : 'rgba(255,255,255,0.8)', fontSize: '1.1rem', fontWeight: '500', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
          {callStatus === 'calling' ? (callType === 'video' ? 'Video calling...' : 'Calling...') :
            callStatus === 'connected' ? formatDuration(callDuration) :
              error || 'Call ended'}
        </p>
      </div>

      {/* Local Video Preview (Picture in Picture) */}
      {callType === 'video' && callStatus === 'connected' && (
        <div style={{
          position: 'absolute', bottom: '140px', right: '20px',
          width: '120px', height: '160px', borderRadius: '16px',
          overflow: 'hidden', border: '2px solid rgba(255,255,255,0.4)',
          background: '#000', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 100
        }}>
          <video
            ref={localVideoRef}
            muted
            autoPlay
            playsInline
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transform: 'scaleX(-1)',
              opacity: isVideoOn ? 1 : 0.3
            }}
          />
          {!isVideoOn && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }}>
              <span className="material-symbols-outlined" style={{ color: 'white' }}>videocam_off</span>
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      {callStatus !== 'incoming' && callStatus !== 'ended' && (
        <div style={{ display: 'flex', gap: '24px', zIndex: 10, paddingBottom: '20px' }}>
          <button onClick={toggleMute} style={{
            width: '60px', height: '60px', borderRadius: '50%',
            background: isMuted ? 'white' : 'rgba(255,255,255,0.2)',
            border: 'none', cursor: 'pointer', color: isMuted ? '#ef4444' : 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(10px)'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>{isMuted ? 'mic_off' : 'mic'}</span>
          </button>

          <button onClick={handleEndCall} style={{
            width: '72px', height: '72px', borderRadius: '50%', background: '#ef4444',
            border: 'none', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(239, 68, 68, 0.4)'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '36px' }}>call_end</span>
          </button>

          {callType === 'video' && (
            <button onClick={toggleVideo} style={{
              width: '60px', height: '60px', borderRadius: '50%',
              background: !isVideoOn ? 'white' : 'rgba(255,255,255,0.2)',
              border: 'none', cursor: 'pointer', color: !isVideoOn ? '#ef4444' : 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(10px)'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>{isVideoOn ? 'videocam' : 'videocam_off'}</span>
            </button>
          )}
        </div>
      )}
      <style>{`@keyframes pulse { 0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255,255,255,0.4); } 50% { transform: scale(1.05); box-shadow: 0 0 0 20px rgba(255,255,255,0); } } @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }`}</style>
    </div>
  );
};
// ------------------------------------

const ReactionPicker = ({ onSelect, onClose, isMe }) => {
  const reactions = ['👍', '❤️', '🥰', '😂', '😮', '😢', '😡', '🔥', '🎉', '👏', '✨', '🤯'];

  return (
    <div style={{
      position: 'absolute',
      bottom: '100%',
      left: isMe ? 'auto' : '0',
      right: isMe ? '0' : 'auto',
      transform: 'none',
      background: 'var(--card-bg)', borderRadius: '16px', padding: '8px',
      display: 'grid',
      gridTemplateColumns: 'repeat(6, 1fr)',
      gap: '4px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      border: '1px solid var(--border-color)', marginBottom: '8px', zIndex: 100,
      width: 'max-content'
    }}>
      {reactions.map(r => (
        <button key={r} onClick={() => { onSelect(r); onClose(); }} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '4px', borderRadius: '50%', transition: 'transform 0.15s',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.3)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
          <img
            src={`https://emojicdn.elk.sh/${r}?style=google`}
            alt={r}
            style={{ width: '28px', height: '28px', display: 'block' }}
          />
        </button>
      ))}
    </div>
  );
};

const MessageContextMenu = ({ x, y, isMe, onEdit, onDelete, onReply, onReact, onClose }) => {
  // Prevent menu from going off-screen on mobile
  const menuWidth = 150;
  const screenWidth = window.innerWidth;
  const adjustedX = (x + menuWidth > screenWidth) ? (screenWidth - menuWidth - 20) : x;

  useEffect(() => {
    const handler = () => onClose();
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [onClose]);

  return (
    <div onClick={(e) => e.stopPropagation()} style={{
      position: 'fixed', top: y, left: adjustedX, background: 'var(--card-bg)',
      borderRadius: '12px', padding: '6px', minWidth: '140px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', zIndex: 1000
    }}>
      <button onClick={onReply} style={menuBtnStyle}>
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>reply</span> Reply
      </button>
      <button onClick={onReact} style={menuBtnStyle}>
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_reaction</span> React
      </button>
      {isMe && (
        <>
          <button onClick={onEdit} style={menuBtnStyle}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span> Edit
          </button>
          <button onClick={onDelete} style={{ ...menuBtnStyle, color: '#ef4444' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span> Delete
          </button>
        </>
      )}
    </div>
  );
};

const menuBtnStyle = {
  display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
  padding: '10px 12px', background: 'none', border: 'none',
  color: 'var(--text)', fontSize: '0.9rem', cursor: 'pointer', borderRadius: '8px',
  transition: 'background 0.15s', textAlign: 'left'
};

const Messages = () => {
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const { user } = useAuth();
  const { markAllMessagesAsRead } = useNotifications();
  const { conversations, markConversationAsRead, loading } = useConversations();
  const { sendMessage, getConversationMessages, startTyping, stopTyping, isUserOnline, isUserTyping, connectionStatus, loadConversationMessages, deleteMessage: apiDeleteMessage, editMessage } = useChat();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [viewMode, setViewMode] = useState("grid");

  // Call States
  const [showCallModal, setShowCallModal] = useState(false);
  const [callType, setCallType] = useState('audio');
  const [incomingCall, setIncomingCall] = useState(null); // { offer, from, socket }

  // New feature states
  const [messageSearch, setMessageSearch] = useState("");
  const [showMessageSearch, setShowMessageSearch] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('favoriteChats') || '[]'); } catch { return []; }
  });
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [messageReactions, setMessageReactions] = useState({});
  const [deletedMessages, setDeletedMessages] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [showReactionPicker, setShowReactionPicker] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeFolder, setActiveFolder] = useState('primary');
  const { updateUser } = useAuth();
  const [filterMode, setFilterMode] = useState('all'); // all, favorites, unread

  // Media & Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const fileInputRef = useRef(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const prevMessageCountRef = useRef(0);
  const socket = socketManager.socket; // Listen for incoming calls

  // --- Recording Logic ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        handleRecordingComplete(audioBlob);
        stream.getTracks().forEach(track => track.stop()); // Stop mic
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingTimerRef.current);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop(); // Stop stream but don't process
      // Hack: clear chunks so nothing sends
      audioChunksRef.current = [];
      setIsRecording(false);
      clearInterval(recordingTimerRef.current);
    }
  };

  const handleRecordingComplete = (audioBlob) => {
    if (audioChunksRef.current.length === 0) return; // Cancelled
    const file = new File([audioBlob], "voice_note.webm", { type: 'audio/webm' });
    uploadFile(file);
  };

  // --- Upload Logic ---
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadFile(file);
    }
    // Reset input
    e.target.value = '';
  };

  const uploadFile = async (file) => {
    if (!selectedConversation) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('media', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/media/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        // Send message with URL and correct type
        sendMessage(selectedConversation.participant.id, data.url, data.resourceType);
      } else {
        alert("Upload failed: " + data.message);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading file");
    } finally {
      setIsUploading(false);
    }
  };

  // --- Listen for Incoming Calls ---
  useEffect(() => {
    if (socket) {
      socket.on("call-made", (data) => {
        console.log("Incoming call detected:", data);
        // Find user info who is calling - we might need to fetch this if not consistent
        setIncomingCall(data);
        setCallType(data.callType || 'audio');
        setShowCallModal(true);
      });
    }
    return () => {
      if (socket) socket.off("call-made");
    };
  }, [socket]);

  // Helper to find caller details
  const getCallerDetails = () => {
    if (incomingCall) {
      // Try to find in existing conversations first
      const conv = conversations.find(c => c.participant.id === incomingCall.userCalling);
      if (conv) return conv.participant;
      // Fallback dummy (should actually fetch user)
      return { fullName: "Incoming Call...", id: incomingCall.userCalling };
    }
    return selectedConversation?.participant;
  };

  useEffect(() => { markAllMessagesAsRead(); }, [markAllMessagesAsRead]);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('favoriteChats', JSON.stringify(favorites));
  }, [favorites]);

  const handleConversationClick = (conversation) => {
    markConversationAsRead(conversation.participant.username, conversation.participant.id);
    setSelectedConversation(conversation);
    if (!isDesktop) setTimeout(() => inputRef.current?.focus(), 100);
    loadConversationMessages(conversation.participant.id);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    const messageText = newMessage.trim();

    if (editingMessage) {
      const success = await editMessage(editingMessage.id, messageText);
      if (success) {
        setEditingMessage(null);
        setNewMessage("");
      } else {
        alert("Failed to edit message");
      }
      return;
    }

    const replyToId = replyingTo?.id || null;

    setNewMessage("");
    setReplyingTo(null);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    stopTyping(selectedConversation.participant.id);

    sendMessage(selectedConversation.participant.id, messageText, 'text', replyToId);

    // --- Instant Frontend Friendship Update ---
    // If we are replying to someone NOT in our following list, 
    // update local user state so the conversation stays in Primary
    const currentFollowing = (user?.following || []).map(f => String(f._id || f));
    if (!currentFollowing.includes(String(selectedConversation.participant.id))) {
      console.log('✨ Updating local following list for instant Primary move');
      updateUser({
        following: [...(user.following || []), selectedConversation.participant.id]
      });
    }
    // ------------------------------------------

    markConversationAsRead(selectedConversation.participant.username);
    setTimeout(() => scrollToBottom(), 100);
  };

  const handleTyping = (value) => {
    setNewMessage(value);
    if (selectedConversation?.participant.id && value.trim()) {
      startTyping(selectedConversation.participant.id);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => stopTyping(selectedConversation.participant.id), 2000);
    }
  };

  const handleStartCall = (type) => {
    setCallType(type);
    setIncomingCall(null); // Ensure we are caller
    setShowCallModal(true);
  };

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  const conversationMessages = selectedConversation?.participant.id
    ? getConversationMessages(selectedConversation.participant.id).filter(m => !deletedMessages.includes(m.id)) : [];

  // INSTANT SCROLL TO NEW MESSAGES
  useEffect(() => {
    if (conversationMessages.length > 0) {
      // Small delay to ensure DOM is updated
      setTimeout(() => scrollToBottom(), 50);
    }
  }, [conversationMessages.length, conversationMessages]);

  // Play sound on new message (improved)
  useEffect(() => {
    if (conversationMessages.length > prevMessageCountRef.current && soundEnabled) {
      const lastMsg = conversationMessages[conversationMessages.length - 1];
      // Only play sound for received messages (not sent by current user)
      if (lastMsg?.senderId !== user?.id && lastMsg?.status !== 'sending') {
        console.log('🔔 Playing notification sound for new message');
        playNotificationSound();
      }
    }
    prevMessageCountRef.current = conversationMessages.length;
  }, [conversationMessages.length, soundEnabled, user?.id]);

  // INSTANT SCROLL when new messages arrive
  useEffect(() => {
    if (conversationMessages.length > 0) {
      console.log('📜 Auto-scrolling to new message');
      scrollToBottom();
    }
  }, [conversationMessages]);

  const toggleFavorite = (convId) => {
    setFavorites(prev => prev.includes(convId) ? prev.filter(id => id !== convId) : [...prev, convId]);
  };

  const addReaction = (messageId, reaction) => {
    setMessageReactions(prev => ({
      ...prev,
      [messageId]: [...(prev[messageId] || []).filter(r => r.userId !== user?.id), { userId: user?.id, reaction }]
    }));
  };

  const handleDeleteMessage = async (messageId) => {
    if (window.confirm("Delete this message permanently?")) {
      const success = await apiDeleteMessage(messageId);
      if (success) {
        setDeletedMessages(prev => [...prev, messageId]);
      } else {
        alert("Failed to delete message");
      }
    }
    setContextMenu(null);
  };

  const handleContextMenu = (e, message) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, message, isMe: message.senderId === user?.id });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    if (diffInHours < 1) return 'now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatMessageTime = (timestamp) => new Date(timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  const handleCoWatchInvite = () => {
    // In a real app, this would send an invite message first
    // For now, jump straight to the experience
    navigate(`/videos?cowatch=true&friendId=${selectedConversation.participant.id}`);
  };

  const getUserColor = (name) => {
    const colors = ['#7c3aed', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    return colors[(name?.charCodeAt(0) || 0) % colors.length];
  };

  const filteredConversations = Array.isArray(conversations) ? conversations.filter(conv => {
    if (!conv?.participant) return false;

    // --- Message Request Logic ---
    const currentUserId = user?.id || user?._id;

    // Check if following (handle ID strings/objects)
    const isFollowing = (user?.following || []).some(f =>
      String(f._id || f) === String(conv.participant.id)
    );

    // Check if I sent the last message
    const isSentByMe = String(conv.lastMessage?.senderId) === String(currentUserId);

    // Primary: I follow them OR I interacted (sent any message)
    const isPrimary = isFollowing || isSentByMe || !!conv.anySentByMe;

    if (activeFolder === 'requests' && isPrimary) return false;
    if (activeFolder === 'primary' && !isPrimary) return false;
    // -----------------------------

    const matchesSearch = conv.participant.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.participant.username?.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterMode === 'favorites') return matchesSearch && favorites.includes(conv.id);
    if (filterMode === 'unread') return matchesSearch && conv.unreadCount > 0;
    return matchesSearch;
  }) : [];

  const displayMessages = messageSearch
    ? conversationMessages.filter(m => m.text?.toLowerCase().includes(messageSearch.toLowerCase()))
    : conversationMessages;

  // Chat View
  if (selectedConversation) {
    const userColor = getUserColor(selectedConversation.participant.fullName);
    const isFavorite = favorites.includes(selectedConversation.id);

    return (
      <div style={{ height: isDesktop ? '100vh' : 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column', background: 'var(--background)' }}>

        {/* Real Call Modal */}
        <CallModal
          isOpen={showCallModal}
          onClose={() => { setShowCallModal(false); setIncomingCall(null); }}
          user={incomingCall ? getCallerDetails() : selectedConversation.participant}
          callType={callType}
          isIncoming={!!incomingCall}
          callerSignal={incomingCall?.offer}
          callerSocketId={incomingCall?.socket}
          userColor={userColor}
        />

        {/* Context Menu */}
        {contextMenu && (
          <MessageContextMenu
            x={contextMenu.x} y={contextMenu.y} isMe={contextMenu.isMe}
            onReply={() => { setReplyingTo(contextMenu.message); setContextMenu(null); inputRef.current?.focus(); }}
            onReact={() => { setShowReactionPicker(contextMenu.message.id); setContextMenu(null); }}
            onEdit={() => { setEditingMessage(contextMenu.message); setNewMessage(contextMenu.message.text); setContextMenu(null); inputRef.current?.focus(); }}
            onDelete={() => handleDeleteMessage(contextMenu.message.id)}
            onClose={() => setContextMenu(null)}
          />
        )}

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '10px 12px', gap: '8px', background: 'var(--card-bg)', borderBottom: '1px solid var(--border-color)', height: '60px', boxSizing: 'border-box' }}>
          <button onClick={() => setSelectedConversation(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', padding: '4px', display: 'flex' }}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>

          <div onClick={() => navigate(`/profile/${selectedConversation.participant.username}`)} style={{ flex: '0 1 auto', display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '10px', overflow: 'hidden', minWidth: '120px', paddingRight: '10px' }}>
            <div style={{ flexShrink: 0, width: '36px', height: '36px', borderRadius: '50%', background: selectedConversation.participant.avatar ? `url(${selectedConversation.participant.avatar}) center/cover` : userColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.9rem', fontWeight: '600' }}>
              {!selectedConversation.participant.avatar && selectedConversation.participant.fullName?.charAt(0)?.toUpperCase()}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
              <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedConversation.participant.fullName}</span>
              <span style={{ fontSize: '0.7rem', color: isUserOnline(selectedConversation.participant.id) ? '#22c55e' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                {isUserOnline(selectedConversation.participant.id) ? 'Active' : 'Offline'}
              </span>
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', gap: '2px', alignItems: 'center', overflowX: 'auto', justifyContent: 'flex-end', paddingLeft: '0', scrollbarWidth: 'none', msOverflowStyle: 'none', minWidth: 0 }}>
            <style>{`
              div::-webkit-scrollbar { display: none; }
            `}</style>

            {/* Favorite */}
            <button onClick={() => toggleFavorite(selectedConversation.id)} title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: isFavorite ? '#f59e0b' : 'var(--text-secondary)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '22px', fontVariationSettings: isFavorite ? '"FILL" 1' : '"FILL" 0' }}>star</span>
            </button>
            {/* Search */}
            <button onClick={() => setShowMessageSearch(!showMessageSearch)} style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: showMessageSearch ? 'var(--primary)' : 'var(--text-secondary)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>search</span>
            </button>
            {/* Sound */}
            <button onClick={() => setSoundEnabled(!soundEnabled)} title={soundEnabled ? 'Mute notifications' : 'Unmute notifications'}
              style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: soundEnabled ? 'var(--primary)' : 'var(--text-secondary)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>{soundEnabled ? 'volume_up' : 'volume_off'}</span>
            </button>
            {/* Co-Watch Invite */}
            <button onClick={handleCoWatchInvite} title="Watch Together"
              style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: 'var(--primary)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>slideshow</span>
            </button>
            {/* Calls */}
            <button onClick={() => handleStartCall('audio')} style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: 'var(--primary)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>call</span>
            </button>
            <button onClick={() => handleStartCall('video')} style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: 'var(--primary)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>videocam</span>
            </button>
          </div>
        </div>

        {/* Message Search Bar */}
        {showMessageSearch && (
          <div style={{ padding: '10px 16px', background: 'var(--card-bg)', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--background)', borderRadius: '10px', padding: '8px 12px' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--text-muted)', fontSize: '20px' }}>search</span>
              <input type="text" placeholder="Search in conversation..." value={messageSearch} onChange={(e) => setMessageSearch(e.target.value)}
                style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '0.9rem', color: 'var(--text)' }} />
              {messageSearch && (
                <button onClick={() => setMessageSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                </button>
              )}
            </div>
            {messageSearch && <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '8px' }}>{displayMessages.length} result(s) found</p>}
          </div>
        )}

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px' }}>
          {displayMessages.length === 0 && !messageSearch && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: selectedConversation.participant.avatar ? `url(${selectedConversation.participant.avatar}) center/cover` : userColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem', fontWeight: '600', margin: '0 auto 16px' }}>
                {!selectedConversation.participant.avatar && selectedConversation.participant.fullName?.charAt(0)?.toUpperCase()}
              </div>
              <h3 style={{ color: 'var(--text)', marginBottom: '4px' }}>{selectedConversation.participant.fullName}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '16px' }}>Say hi to start!</p>
            </div>
          )}

          {displayMessages.map((message, idx) => {
            // Robust ID check
            const currentUserId = user?.id || user?._id;
            const isMe = message.senderId === currentUserId;
            const prevMessage = displayMessages[idx - 1];
            const showAvatar = !isMe && (!prevMessage || prevMessage.senderId !== message.senderId);
            const timeDiff = prevMessage ? new Date(message.timestamp) - new Date(prevMessage.timestamp) : Infinity;
            const showTime = timeDiff > 300000;
            const reactions = messageReactions[message.id] || [];

            return (
              <div key={message.id || message.tempId}>
                {showTime && <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-muted)', fontSize: '0.75rem' }}>{formatMessageTime(message.timestamp)}</div>}
                <div style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: '8px', marginBottom: '4px', paddingLeft: isMe ? '50px' : '0', paddingRight: isMe ? '0' : '50px' }}>
                  {!isMe && (
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: showAvatar ? (selectedConversation.participant.avatar ? `url(${selectedConversation.participant.avatar}) center/cover` : userColor) : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem', fontWeight: '600' }}>
                      {showAvatar && !selectedConversation.participant.avatar && selectedConversation.participant.fullName?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                  <div style={{ maxWidth: '70%', position: 'relative' }}
                    onContextMenu={(e) => handleContextMenu(e, message)}
                    onDoubleClick={() => setShowReactionPicker(message.id)}>

                    {/* Reply preview */}
                    {message.replyTo && (
                      <div style={{
                        fontSize: '0.75rem',
                        color: isMe ? 'rgba(255,255,255,0.85)' : 'var(--text-secondary)',
                        padding: '6px 10px',
                        background: isMe ? 'rgba(255,255,255,0.1)' : 'var(--hover-bg)',
                        borderRadius: '8px',
                        marginBottom: '6px',
                        borderLeft: `3px solid ${isMe ? 'rgba(255,255,255,0.5)' : 'var(--primary)'}`
                      }}>
                        <div style={{ fontWeight: '600', marginBottom: '2px', opacity: 0.8 }}>
                          {message.replyTo.senderUsername === user?.username ? 'You' : (message.replyTo.senderFullName || message.replyTo.senderUsername || 'them')}
                        </div>
                        <div style={{ opacity: 0.9, fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {message.replyTo.text}
                        </div>
                      </div>
                    )}

                    {/* Reaction Picker */}
                    {showReactionPicker === message.id && (
                      <ReactionPicker
                        onSelect={(r) => addReaction(message.id, r)}
                        onClose={() => setShowReactionPicker(null)}
                        isMe={isMe}
                      />
                    )}

                    <div style={{ padding: 0, borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px', background: isMe ? 'var(--primary)' : 'var(--card-bg)', color: isMe ? 'white' : 'var(--text)', border: isMe ? 'none' : '1px solid var(--border-color)', cursor: 'pointer', overflow: 'hidden' }}>
                      {message.messageType === 'image' ? (
                        <div style={{ padding: '4px' }}>
                          <img src={message.text.startsWith('http') ? message.text : `${import.meta.env.VITE_API_URL}${message.text}`} alt="Shared image" style={{ maxWidth: '280px', maxHeight: '300px', borderRadius: '16px', display: 'block' }} onClick={() => window.open(message.text.startsWith('http') ? message.text : `${import.meta.env.VITE_API_URL}${message.text}`, '_blank')} />
                        </div>
                      ) : message.messageType === 'video' ? (
                        <div style={{ padding: '4px' }}>
                          <video src={message.text.startsWith('http') ? message.text : `${import.meta.env.VITE_API_URL}${message.text}`} controls style={{ maxWidth: '280px', maxHeight: '300px', borderRadius: '16px', display: 'block' }} />
                        </div>
                      ) : message.messageType === 'audio' ? (
                        <div style={{ padding: '12px 14px', minWidth: '200px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="material-symbols-outlined">mic</span>
                          <audio src={message.text.startsWith('http') ? message.text : `${import.meta.env.VITE_API_URL}${message.text}`} controls style={{ height: '30px', maxWidth: '200px' }} />
                        </div>
                      ) : (
                        <div style={{ padding: '10px 14px', lineHeight: '1.4', fontSize: '0.9rem' }}>
                          {message.text.includes('?cowatch=true') ? (
                            <div>
                              {message.text.split('http')[0]}
                              <button
                                onClick={() => {
                                  const urlMatch = message.text.match(/http[s]?:\/\/[^ ]+/);
                                  if (urlMatch) {
                                    const url = new URL(urlMatch[0]);
                                    const roomId = url.searchParams.get('roomId');
                                    navigate(`/videos?cowatch=true&roomId=${roomId}`);
                                  }
                                }}
                                style={{
                                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                  marginTop: '8px',
                                  padding: '8px 16px',
                                  background: isMe ? 'rgba(255,255,255,0.2)' : 'var(--primary)',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '20px',
                                  width: '100%',
                                  cursor: 'pointer',
                                  fontWeight: '600',
                                  fontSize: '0.9rem',
                                  transition: 'background 0.2s'
                                }}
                              >
                                <span className="material-symbols-outlined">group_add</span>
                                Join Watch Party
                              </button>
                            </div>
                          ) : (
                            message.text
                          )}
                        </div>
                      )}
                    </div>

                    {/* Reactions display */}
                    {reactions.length > 0 && (
                      <div style={{ display: 'flex', gap: '2px', marginTop: '4px', flexWrap: 'wrap' }}>
                        {Object.entries(reactions.reduce((acc, r) => { acc[r.reaction] = (acc[r.reaction] || 0) + 1; return acc; }, {})).map(([reaction, count]) => (
                          <span key={reaction} style={{ background: 'var(--hover-bg)', padding: '2px 6px', borderRadius: '10px', fontSize: '0.75rem' }}>
                            {reaction} {count > 1 && count}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Read receipt & Timestamp */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginTop: '2px' }}>
                      {message.isEdited && (
                        <span style={{
                          fontSize: '0.65rem',
                          color: isMe ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px',
                          marginRight: '6px'
                        }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '10px' }}>edit</span>
                          edited
                        </span>
                      )}
                      <span style={{ fontSize: '0.65rem', color: isMe ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)' }}>{formatMessageTime(message.timestamp)}</span>
                      {isMe && (
                        <span className="material-symbols-outlined" style={{
                          fontSize: '14px',
                          color: message.status === 'seen' ? '#3b82f6' :
                            message.status === 'delivered' ? '#22c55e' :
                              message.status === 'sent' ? '#6b7280' :
                                message.status === 'failed' ? '#ef4444' : '#f59e0b'
                        }}>
                          {message.status === 'failed' ? 'error' :
                            message.status === 'sending' ? 'schedule' :
                              message.status === 'sent' ? 'check' : 'done_all'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {isUserTyping(selectedConversation.participant.id) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '36px' }}>
              <div style={{ padding: '10px 14px', borderRadius: '20px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', display: 'flex', gap: '4px' }}>
                <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply/Edit Bar */}
        {(replyingTo || editingMessage) && (
          <div style={{ padding: '10px 16px', background: 'var(--card-bg)', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ flex: 1, padding: '8px 12px', background: 'var(--hover-bg)', borderRadius: '8px', borderLeft: '3px solid var(--primary)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '600' }}>
                {replyingTo ? 'Replying to' : 'Editing message'}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {(replyingTo || editingMessage)?.text}
              </div>
            </div>
            <button onClick={() => { setReplyingTo(null); setEditingMessage(null); setNewMessage(''); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '8px' }}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        )}

        {/* Input */}
        {/* Input */}
        <div style={{ padding: '12px 16px', background: 'var(--card-bg)', borderTop: '1px solid var(--border-color)' }}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*,video/*"
            style={{ display: 'none' }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => fileInputRef.current.click()}
              style={{
                flexShrink: 0, width: '40px', height: '40px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)',
                border: 'none', cursor: 'pointer', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>add</span>
            </button>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'var(--background)', borderRadius: '24px', border: (editingMessage || isRecording) ? '2px solid' : '1px solid var(--border-color)', borderColor: isRecording ? '#ef4444' : (editingMessage ? 'var(--primary)' : 'var(--border-color)'), padding: '6px 6px 6px 16px', transition: 'all 0.2s' }}>

              {isRecording ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', height: '30px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1s infinite' }} />
                  <span style={{ color: '#ef4444', fontWeight: '600', fontSize: '0.95rem' }}>
                    Recording {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}...
                  </span>
                  <div style={{ flex: 1 }} />
                  <button onClick={cancelRecording} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem' }}>Cancel</button>
                </div>
              ) : isUploading ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', height: '30px', color: 'var(--text-secondary)' }}>
                  <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite' }}>sync</span>
                  Uploading media...
                </div>
              ) : (
                <input ref={inputRef} type="text"
                  placeholder={editingMessage ? 'Edit your message...' : replyingTo ? 'Reply...' : 'Message...'}
                  value={newMessage} onChange={(e) => handleTyping(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '0.95rem', color: 'var(--text)', padding: '4px 0' }} />
              )}

              {!isRecording && !isUploading && newMessage.trim() ? (
                <button onClick={handleSendMessage} style={{ background: 'var(--primary)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '4px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{editingMessage ? 'check' : 'send'}</span>
                </button>
              ) : !isRecording && !isUploading && (
                <button
                  onMouseDown={startRecording}
                  onMouseUp={stopRecording}
                  onTouchStart={(e) => { e.preventDefault(); startRecording(); }}
                  onTouchEnd={(e) => { e.preventDefault(); stopRecording(); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '8px', borderRadius: '50%' }}
                  title="Hold to record"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>mic</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <style>{`
          .typing-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--text-secondary); animation: typingBounce 1.4s ease-in-out infinite; }
          .typing-dot:nth-child(2) { animation-delay: 0.2s; }
          .typing-dot:nth-child(3) { animation-delay: 0.4s; }
          @keyframes typingBounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-4px); } }
        `}</style>
      </div>
    );
  }

  // Main View
  return (
    <div style={{ minHeight: isDesktop ? '100vh' : 'calc(100vh - 60px)', background: 'var(--background)', padding: isDesktop ? '24px 32px' : '16px' }}>

      {/* Real Call Modal listener (for landing page) */}
      <CallModal
        isOpen={showCallModal}
        onClose={() => { setShowCallModal(false); setIncomingCall(null); }}
        user={incomingCall ? getCallerDetails() : null}
        callType={callType}
        isIncoming={!!incomingCall}
        callerSignal={incomingCall?.offer}
        callerSocketId={incomingCall?.socket}
        userColor={'#7c3aed'}
      />

      {connectionStatus !== 'connected' && (
        <div style={{
          position: 'fixed',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: connectionStatus === 'error' ? '#ef4444' : '#f59e0b',
          color: 'white',
          padding: '8px 20px',
          borderRadius: '20px',
          fontSize: '0.85rem',
          fontWeight: '500',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'currentColor',
            animation: connectionStatus === 'error' ? 'none' : 'pulse 1.5s infinite'
          }} />
          {connectionStatus === 'error' ? '❌ Connection failed - Check your internet' : '🔄 Connecting to server...'}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: isDesktop ? '2rem' : '1.5rem', fontWeight: '700', color: 'var(--text)', margin: 0 }}>Messages</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>{filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {/* Folder Toggle */}
          <div style={{ display: 'flex', background: 'var(--card-bg)', borderRadius: '10px', padding: '4px', border: '1px solid var(--border-color)', height: 'fit-content' }}>
            {['primary', 'requests'].map(folder => (
              <button key={folder} onClick={() => setActiveFolder(folder)} style={{
                padding: '8px 14px', borderRadius: '8px', border: 'none',
                background: activeFolder === folder ? 'var(--primary)' : 'transparent',
                color: activeFolder === folder ? 'white' : 'var(--text-secondary)',
                cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600', textTransform: 'capitalize'
              }}>
                {folder}
              </button>
            ))}
          </div>

          {/* Filter Buttons */}
          <div style={{ display: 'flex', background: 'var(--card-bg)', borderRadius: '10px', padding: '4px', border: '1px solid var(--border-color)' }}>
            {['all', 'favorites', 'unread'].map(mode => (
              <button key={mode} onClick={() => setFilterMode(mode)} style={{
                padding: '8px 14px', borderRadius: '8px', border: 'none',
                background: filterMode === mode ? 'var(--primary)' : 'transparent',
                color: filterMode === mode ? 'white' : 'var(--text-secondary)',
                cursor: 'pointer', fontSize: '0.8rem', fontWeight: '500', textTransform: 'capitalize'
              }}>
                {mode === 'favorites' && <span style={{ marginRight: '4px' }}>⭐</span>}
                {mode}
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <div style={{ display: 'flex', background: 'var(--card-bg)', borderRadius: '10px', padding: '4px', border: '1px solid var(--border-color)' }}>
            <button onClick={() => setViewMode('grid')} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', background: viewMode === 'grid' ? 'var(--primary)' : 'transparent', color: viewMode === 'grid' ? 'white' : 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>grid_view</span>
            </button>
            <button onClick={() => setViewMode('list')} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', background: viewMode === 'list' ? 'var(--primary)' : 'transparent', color: viewMode === 'list' ? 'white' : 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>view_list</span>
            </button>
          </div>

          <button onClick={() => setShowNewConversation(true)} style={{ background: 'var(--primary)', border: 'none', borderRadius: '10px', padding: '10px 16px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: '600' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
            {isDesktop && 'New Chat'}
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 16px',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        background: 'var(--card-bg)',
        marginBottom: '20px'
      }}>
        <span className="material-symbols-outlined" style={{
          color: 'var(--text-secondary)',
          fontSize: '20px',
          flexShrink: 0
        }}>search</span>
        <input
          type="text"
          placeholder="Search messages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            border: 'none',
            background: 'transparent',
            fontSize: '0.95rem',
            color: 'var(--text)',
            outline: 'none',
            padding: 0,
            margin: 0,
            minWidth: 0
          }}
        />
      </div>

      {/* Conversations */}
      {loading ? <SkeletonLoader type="message" /> : filteredConversations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--hover-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: 'var(--text-secondary)' }}>
              {filterMode === 'favorites' ? 'star' : filterMode === 'unread' ? 'mark_email_read' : 'chat_bubble_outline'}
            </span>
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: 'var(--text)', marginBottom: '8px' }}>
            {filterMode === 'favorites' ? 'No favorites yet' : filterMode === 'unread' ? 'All caught up!' : 'No messages yet'}
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            {filterMode === 'favorites' ? 'Star conversations to see them here' : filterMode === 'unread' ? 'You have no unread messages' : 'Start a conversation!'}
          </p>
          {filterMode === 'all' && (
            <button onClick={() => setShowNewConversation(true)} style={{ padding: '12px 24px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer' }}>
              Start a chat
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr', gap: '16px' }}>
          {filteredConversations.map((conversation) => {
            const userColor = getUserColor(conversation.participant.fullName);
            const isOnline = isUserOnline(conversation.participant.id);
            const isFav = favorites.includes(conversation.id);

            return (
              <div key={conversation.id} onClick={() => handleConversationClick(conversation)} style={{
                background: 'var(--card-bg)', borderRadius: '16px', padding: '20px', cursor: 'pointer',
                border: isFav ? '2px solid #f59e0b' : '1px solid var(--border-color)', transition: 'all 0.2s', position: 'relative'
              }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>

                {isFav && <span style={{ position: 'absolute', top: '12px', left: '12px', fontSize: '1rem' }}>⭐</span>}
                {conversation.unreadCount > 0 && (
                  <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'var(--accent)', color: 'white', borderRadius: '12px', padding: '2px 8px', fontSize: '0.75rem', fontWeight: '600' }}>
                    {conversation.unreadCount} new
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: conversation.participant.avatar ? `url(${conversation.participant.avatar}) center/cover` : userColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.3rem', fontWeight: '600', border: `3px solid ${isOnline ? '#22c55e' : 'var(--border-color)'}` }}>
                    {!conversation.participant.avatar && conversation.participant.fullName?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text)', margin: 0 }}>{conversation.participant.fullName}</h3>
                    <p style={{ fontSize: '0.8rem', color: isOnline ? '#22c55e' : 'var(--text-muted)', margin: '2px 0 0' }}>{isOnline ? '● Online' : `Last seen ${formatTime(conversation.lastMessage?.timestamp)}`}</p>
                  </div>
                </div>

                <div style={{ background: 'var(--hover-bg)', borderRadius: '12px', padding: '12px 14px' }}>
                  <p style={{ fontSize: '0.85rem', color: conversation.unreadCount > 0 ? 'var(--text)' : 'var(--text-secondary)', fontWeight: conversation.unreadCount > 0 ? '500' : '400', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {conversation.lastMessage?.senderId === user?.id && <span style={{ color: 'var(--primary)' }}>You: </span>}
                    {conversation.lastMessage?.text || 'No messages yet'}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatTime(conversation.lastMessage?.timestamp)}</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--text-muted)' }}>arrow_forward</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredConversations.map((conversation) => {
            const userColor = getUserColor(conversation.participant.fullName);
            const isOnline = isUserOnline(conversation.participant.id);
            const isFav = favorites.includes(conversation.id);

            return (
              <div key={conversation.id} onClick={() => handleConversationClick(conversation)} style={{
                display: 'flex', alignItems: 'center', gap: '14px', background: 'var(--card-bg)', borderRadius: '12px', padding: '14px 16px',
                cursor: 'pointer', border: isFav ? '2px solid #f59e0b' : '1px solid var(--border-color)', transition: 'background 0.15s'
              }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--card-bg)'}>

                {isFav && <span style={{ fontSize: '0.9rem' }}>⭐</span>}
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: conversation.participant.avatar ? `url(${conversation.participant.avatar}) center/cover` : userColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.1rem', fontWeight: '600', flexShrink: 0, border: `2px solid ${isOnline ? '#22c55e' : 'transparent'}` }}>
                  {!conversation.participant.avatar && conversation.participant.fullName?.charAt(0)?.toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: conversation.unreadCount > 0 ? '600' : '500', color: 'var(--text)' }}>{conversation.participant.fullName}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatTime(conversation.lastMessage?.timestamp)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: '0.85rem', color: conversation.unreadCount > 0 ? 'var(--text)' : 'var(--text-secondary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>
                      {conversation.lastMessage?.senderId === user?.id && 'You: '}{conversation.lastMessage?.text}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <span style={{ background: 'var(--primary)', color: 'white', borderRadius: '10px', padding: '2px 8px', fontSize: '0.7rem', fontWeight: '600' }}>{conversation.unreadCount}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showNewConversation && (
        <NewConversation onClose={() => setShowNewConversation(false)} onSelectUser={(selectedUser) => {
          setSelectedConversation({ id: selectedUser.id || selectedUser._id, participant: { id: selectedUser.id || selectedUser._id, username: selectedUser.username, fullName: selectedUser.fullName, avatar: selectedUser.avatar }, lastMessage: { text: '', timestamp: new Date().toISOString() }, unreadCount: 0 });
          setShowNewConversation(false);
        }} />
      )}
    </div>
  );
};

export default Messages;