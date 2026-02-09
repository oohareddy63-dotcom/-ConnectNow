import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import MeetingControls from '../components/MeetingControls';
import ParticipantList from '../components/ParticipantList';
import EnhancedChat from '../components/EnhancedChat';
import WaitingRoom from '../components/WaitingRoom';
import '../VideoMeet.css';

const VideoMeet = () => {
    const { url } = useParams();
    const [socket, setSocket] = useState(null);
    const [remoteSocketId, setRemoteSocketId] = useState(null);
    const [myStream, setMyStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [username, setUsername] = useState('');
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [isVideoMuted, setIsVideoMuted] = useState(false);
    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [isHandRaised, setIsHandRaised] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isHost, setIsHost] = useState(false);
    const [showParticipants, setShowParticipants] = useState(false);
    const [showChat, setShowChat] = useState(true);
    const [showWaitingRoom, setShowWaitingRoom] = useState(true);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [participants, setParticipants] = useState([]);
    const [reactions, setReactions] = useState([]);

    const myVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const myStreamRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const recordedChunksRef = useRef([]);

    const handleJoinMeeting = () => {
        if (username.trim()) {
            setConnectionStatus('connecting');
            setTimeout(() => setShowWaitingRoom(false), 800);
        }
    };

    // ================= SOCKET =================
    useEffect(() => {
        if (!showWaitingRoom && username.trim()) {
            const newSocket = io('http://localhost:8000');
            setSocket(newSocket);

            newSocket.on('connect', () => {
                setIsConnected(true);
                setConnectionStatus('connected');
                newSocket.emit('join-call', url);
                newSocket.emit('check-host', { roomId: url, userId: newSocket.id });
            });

            newSocket.on('host-assigned', data => setIsHost(data.isHost));

            newSocket.on('user-joined', (id, users) => {
                setRemoteSocketId(id);
                setParticipants(users.map(u => ({
                    id: u,
                    username: u === newSocket.id ? username : `User-${u.slice(-4)}`
                })));
            });

            newSocket.on('user-left', id => {
                setParticipants(p => p.filter(x => x.id !== id));
                setRemoteStream(null);
            });

            newSocket.on('chat-message', (data, senderName, socketId) => {
                const messageData = {
                    sender: senderName,
                    message: data,
                    timestamp: new Date().toISOString(),
                    socketId: socketId,
                    userId: socketId
                };
                setChatMessages(prev => [...prev, messageData]);
            });

            newSocket.on('recording-toggled', (data) => {
                setIsRecording(data.isRecording);
                const notification = data.isRecording ? 
                    '🔴 Recording started' : 
                    '⏹️ Recording stopped';
                const notificationMessage = {
                    sender: 'System',
                    message: notification,
                    timestamp: new Date().toISOString(),
                    socketId: 'system',
                    userId: 'system'
                };
                setChatMessages(prev => [...prev, notificationMessage]);
            });

            newSocket.on('meeting-ended', () => {
                alert('Meeting has been ended by the host.');
                window.location.href = '/home';
            });

            newSocket.on('reaction', (emoji, senderId) => {
                const reactionData = {
                    emoji: emoji,
                    senderId: senderId,
                    timestamp: Date.now()
                };
                setReactions(prev => [...prev, reactionData]);
                
                // Remove reaction after 3 seconds
                setTimeout(() => {
                    setReactions(prev => prev.filter(r => r.timestamp !== reactionData.timestamp));
                }, 3000);
            });

            return () => newSocket.disconnect();
        }
    }, [showWaitingRoom, username, url]);

    // ================= MEDIA =================
    useEffect(() => {
        const startMedia = async () => {
            try {
                console.log('🎥 Requesting camera and microphone access...');
                
                // Request camera with explicit settings
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                        facingMode: 'user'
                    }, 
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true
                    }
                });
                
                console.log('✅ Media stream obtained:', stream);
                console.log('📹 Video tracks:', stream.getVideoTracks());
                console.log('🎤 Audio tracks:', stream.getAudioTracks());
                
                // Check if video track is active
                const videoTrack = stream.getVideoTracks()[0];
                if (videoTrack) {
                    console.log('📹 Video track enabled:', videoTrack.enabled);
                    console.log('📹 Video track state:', videoTrack.readyState);
                    console.log('📹 Video track settings:', videoTrack.getSettings());
                    
                    // Ensure video track is enabled
                    videoTrack.enabled = true;
                    setIsVideoMuted(false);
                }
                
                // Check if audio track is active
                const audioTrack = stream.getAudioTracks()[0];
                if (audioTrack) {
                    console.log('🎤 Audio track enabled:', audioTrack.enabled);
                    audioTrack.enabled = true;
                    setIsAudioMuted(false);
                }
                
                setMyStream(stream);
                myStreamRef.current = stream;
                
                // Set video element source immediately
                if (myVideoRef.current) {
                    console.log('📹 Setting video source to stream');
                    myVideoRef.current.srcObject = stream;
                    
                    // Force video to play
                    myVideoRef.current.play().then(() => {
                        console.log('✅ Video playing successfully');
                    }).catch(e => {
                        console.log('⚠️ Auto-play prevented:', e);
                        
                        // Try to play with user interaction
                        const playVideo = () => {
                            myVideoRef.current.play().then(() => {
                                console.log('✅ Video started after user interaction');
                                document.removeEventListener('click', playVideo);
                                document.removeEventListener('touchstart', playVideo);
                            }).catch(err => {
                                console.error('❌ Still cannot play video:', err);
                            });
                        };
                        
                        // Add event listeners for user interaction
                        document.addEventListener('click', playVideo, { once: true });
                        document.addEventListener('touchstart', playVideo, { once: true });
                    });
                }
                
            } catch (error) {
                console.error('❌ Error accessing media devices:', error);
                
                // Show user-friendly error message
                let errorMessage = 'Unable to access camera/microphone. ';
                
                if (error.name === 'NotAllowedError') {
                    errorMessage += 'Please allow camera and microphone access in your browser settings.';
                } else if (error.name === 'NotFoundError') {
                    errorMessage += 'No camera or microphone found. Please check your devices.';
                } else if (error.name === 'NotReadableError') {
                    errorMessage += 'Camera is already in use by another application.';
                } else {
                    errorMessage += 'Please check your device permissions and try again.';
                }
                
                alert(errorMessage);
            }
        };
        startMedia();

        return () => {
            // Stop screen recording if active
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.stop();
            }
            
            // Stop media tracks
            if (myStreamRef.current) {
                console.log('🛑 Stopping media tracks...');
                myStreamRef.current.getTracks().forEach(track => {
                    track.stop();
                    console.log('🛑 Track stopped:', track.kind);
                });
            }
        };
    }, []);

    const toggleVideo = () => {
        console.log('📹 Toggling video, current state:', isVideoMuted);
        
        if (myStreamRef.current) {
            const videoTrack = myStreamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                const newMutedState = !isVideoMuted;
                videoTrack.enabled = !newMutedState; // Enable track when not muted
                setIsVideoMuted(newMutedState);
                
                console.log('📹 Video track enabled:', videoTrack.enabled, 'Muted:', newMutedState);
                
                // If enabling video, make sure it's displayed
                if (!newMutedState && myVideoRef.current) {
                    myVideoRef.current.srcObject = myStreamRef.current;
                    myVideoRef.current.play().catch(e => {
                        console.log('⚠️ Video play error:', e);
                    });
                }
            } else {
                console.log('❌ No video track found');
            }
        } else {
            console.log('❌ No stream available');
        }
    };

    const toggleAudio = () => {
        console.log('🎤 Toggling audio, current state:', isAudioMuted);
        
        if (myStreamRef.current) {
            const audioTrack = myStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                const newMutedState = !isAudioMuted;
                audioTrack.enabled = !newMutedState; // Enable track when not muted
                setIsAudioMuted(newMutedState);
                console.log('🎤 Audio track enabled:', audioTrack.enabled, 'Muted:', newMutedState);
            } else {
                console.log('❌ No audio track found');
            }
        } else {
            console.log('❌ No stream available');
        }
    };

    const handleSendMessage = (messageData) => {
        if (socket) {
            socket.emit('chat-message', messageData.message, messageData.sender, socket.id);
            setChatMessages(prev => [...prev, messageData]);
        }
    };

    const toggleScreenShare = async () => {
        try {
            if (!isScreenSharing) {
                console.log('🖥️ Starting screen recording...');
                
                // Request screen capture
                const screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: true,
                    audio: true
                });
                
                // Create media recorder
                const mediaRecorder = new MediaRecorder(screenStream, {
                    mimeType: 'video/webm;codecs=vp9'
                });
                
                const chunks = [];
                
                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        chunks.push(event.data);
                    }
                };
                
                mediaRecorder.onstop = () => {
                    console.log('🖥️ Screen recording stopped, processing download...');
                    
                    // Create blob from chunks
                    const blob = new Blob(chunks, { type: 'video/webm' });
                    const url = URL.createObjectURL(blob);
                    
                    // Create download link
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `screen-recording-${new Date().toISOString().slice(0, 19)}.webm`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    
                    console.log('✅ Screen recording downloaded successfully');
                    
                    // Stop all tracks
                    screenStream.getTracks().forEach(track => track.stop());
                };
                
                // Start recording
                mediaRecorder.start();
                mediaRecorderRef.current = mediaRecorder;
                recordedChunksRef.current = chunks;
                
                setIsScreenSharing(true);
                console.log('✅ Screen recording started');
                
                // Handle screen share end by user
                screenStream.getVideoTracks()[0].onended = () => {
                    console.log('🖥️ User stopped screen sharing');
                    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                        mediaRecorderRef.current.stop();
                    }
                    setIsScreenSharing(false);
                };
                
                // Show notification to all participants
                const notificationMessage = {
                    sender: 'System',
                    message: '🔴 Screen recording started',
                    timestamp: new Date().toISOString(),
                    socketId: 'system',
                    userId: 'system'
                };
                setChatMessages(prev => [...prev, notificationMessage]);
                
            } else {
                console.log('🖥️ Stopping screen recording...');
                
                if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                    mediaRecorderRef.current.stop();
                }
                
                setIsScreenSharing(false);
                
                // Show notification to all participants
                const notificationMessage = {
                    sender: 'System',
                    message: '⏹️ Screen recording stopped',
                    timestamp: new Date().toISOString(),
                    socketId: 'system',
                    userId: 'system'
                };
                setChatMessages(prev => [...prev, notificationMessage]);
            }
        } catch (error) {
            console.error('❌ Screen recording error:', error);
            alert('Failed to start screen recording. Please check permissions.');
            setIsScreenSharing(false);
        }
    };

    const toggleRecording = () => {
        const newRecordingState = !isRecording;
        setIsRecording(newRecordingState);
        
        if (socket) {
            socket.emit('toggle-recording', { 
                isRecording: newRecordingState,
                roomId: url 
            });
        }
        
        console.log(newRecordingState ? '🔴 Recording started' : '⏹️ Recording stopped');
        
        // Show notification to all participants
        const notification = newRecordingState ? 
            '🔴 Recording started by host' : 
            '⏹️ Recording stopped by host';
        
        // Add notification to chat
        const notificationMessage = {
            sender: 'System',
            message: notification,
            timestamp: new Date().toISOString(),
            socketId: 'system',
            userId: 'system'
        };
        setChatMessages(prev => [...prev, notificationMessage]);
    };

    const endMeeting = () => {
        if (window.confirm('Are you sure you want to end the meeting for all participants?')) {
            console.log('📞 Ending meeting...');
            
            if (socket) {
                socket.emit('end-meeting', { roomId: url });
            }
            
            // Stop all media streams
            if (myStreamRef.current) {
                myStreamRef.current.getTracks().forEach(track => track.stop());
            }
            if (remoteStream) {
                remoteStream.getTracks().forEach(track => track.stop());
            }
            
            // Redirect to home
            window.location.href = '/home';
        }
    };

    if (showWaitingRoom) {
        return (
            <WaitingRoom
                meetingCode={url}
                username={username}
                setUsername={setUsername}
                onJoin={handleJoinMeeting}
                isConnecting={connectionStatus === 'connecting'}
            />
        );
    }

    if (connectionStatus === 'connecting') {
        return (
            <div style={{
                height: '100vh',
                background: '#0D1117',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
            }}>
                <div style={{
                    width: 60,
                    height: 60,
                    border: '4px solid #1f2937',
                    borderTop: '4px solid #F59E0B',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }} />
                <h2 style={{ marginTop: 20 }}>Joining Meeting…</h2>
                <p style={{ color: '#9CA3AF' }}>{url}</p>
            </div>
        );
    }

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            background: 'radial-gradient(circle at top right, #1f2937, #0D1117 70%)',
            color: '#fff',
            position: 'relative'
        }}>

            {/* HOST BADGE */}
            {isHost && (
                <div style={{
                    position: 'absolute',
                    top: 20,
                    right: 20,
                    background: '#F59E0B',
                    color: '#000',
                    padding: '8px 16px',
                    borderRadius: 20,
                    fontWeight: 'bold'
                }}>
                    👑 Host
                </div>
            )}

            {/* REMOTE VIDEO */}
            <div style={{ flex: 1, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {remoteStream ? (
                    <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <p style={{ color: '#9CA3AF' }}>Waiting for someone to join…</p>
                )}
            </div>

            {/* SELF VIDEO */}
            <div style={{
                position: 'absolute',
                bottom: 110,
                right: 20,
                width: 220,
                height: 150,
                borderRadius: 12,
                overflow: 'hidden',
                border: isHandRaised ? '3px solid #F59E0B' : '2px solid #1f2937'
            }}>
                <video
                    ref={myVideoRef}
                    autoPlay
                    muted
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
                />
            </div>

            {/* FLOATING REACTIONS */}
            <div className="floating-reactions">
                {reactions.map((reaction, index) => (
                    <div 
                        key={index} 
                        className="floating-reaction"
                        style={{
                            left: `${Math.random() * 80 + 10}%`,
                            animationDelay: `${Math.random() * 0.5}s`
                        }}
                    >
                        {reaction.emoji}
                    </div>
                ))}
            </div>

            {/* CONTROLS */}
            <MeetingControls
                isVideoMuted={isVideoMuted}
                isAudioMuted={isAudioMuted}
                isScreenSharing={isScreenSharing}
                isHandRaised={isHandRaised}
                isRecording={isRecording}
                isHost={isHost}
                participantCount={participants.length}
                onToggleVideo={toggleVideo}
                onToggleAudio={toggleAudio}
                onToggleScreenShare={toggleScreenShare}
                onToggleRecording={toggleRecording}
                onRaiseHand={() => setIsHandRaised(!isHandRaised)}
                onEndMeeting={endMeeting}
                onToggleParticipants={() => setShowParticipants(!showParticipants)}
                onToggleChat={() => setShowChat(!showChat)}
            />

            <ParticipantList
                participants={participants}
                isOpen={showParticipants}
                onClose={() => setShowParticipants(false)}
                isHost={isHost}
            />

            <EnhancedChat
                messages={chatMessages}
                isOpen={showChat}
                onClose={() => setShowChat(false)}
                onSendMessage={handleSendMessage}
                username={username}
            />
        </div>
    );
};

export default VideoMeet;
