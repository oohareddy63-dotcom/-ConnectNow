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
    const [activeSpeaker, setActiveSpeaker] = useState(null);
    
    const myVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const myStreamRef = useRef(null);
    const chatEndRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const recordedChunksRef = useRef([]);

    const handleSignal = useCallback(async (signal, socketInstance, remoteId, currentStream) => {
        try {
            const peerConnection = new RTCPeerConnection({
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            });

            if (signal.type === 'offer') {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(signal));
                const answer = await peerConnection.createAnswer();
                await peerConnection.setLocalDescription(answer);
                socketInstance.emit('signal', remoteId, answer);
            } else if (signal.type === 'answer') {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(signal));
            } else if (signal.type === 'candidate') {
                await peerConnection.addIceCandidate(new RTCIceCandidate(signal.candidate));
            }

            peerConnection.ontrack = (event) => {
                setRemoteStream(event.streams[0]);
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                }
            };
        } catch (error) {
            console.error('Error handling signal:', error);
        }
    }, []);

    const createOffer = useCallback(async (socketInstance, remoteId, stream) => {
        try {
            const peerConnection = new RTCPeerConnection({
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            });

            stream.getTracks().forEach(track => {
                peerConnection.addTrack(track, stream);
            });

            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            socketInstance.emit('signal', remoteId, offer);

            peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    socketInstance.emit('signal', remoteId, {
                        type: 'candidate',
                        candidate: event.candidate
                    });
                }
            };

            peerConnection.ontrack = (event) => {
                setRemoteStream(event.streams[0]);
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                }
            };
        } catch (error) {
            console.error('Error creating offer:', error);
        }
    }, []);

    const testCamera = async () => {
        console.log('🔍 Testing camera...');
        try {
            // First, check if media devices are available
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            
            console.log('📹 Available video devices:', videoDevices);
            
            if (videoDevices.length === 0) {
                alert('No camera devices found. Please connect a camera and try again.');
                return;
            }
            
            // Try to get camera access
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                },
                audio: false // Only test video
            });
            
            console.log('✅ Camera test successful');
            console.log('📹 Video tracks:', stream.getVideoTracks());
            
            // Test video element
            const testVideo = document.createElement('video');
            testVideo.srcObject = stream;
            testVideo.autoplay = true;
            testVideo.muted = true;
            testVideo.style.width = '320px';
            testVideo.style.height = '240px';
            testVideo.style.border = '2px solid green';
            testVideo.style.position = 'fixed';
            testVideo.style.top = '10px';
            testVideo.style.right = '10px';
            testVideo.style.zIndex = '9999';
            testVideo.style.borderRadius = '8px';
            
            document.body.appendChild(testVideo);
            
            // Show success message
            const successDiv = document.createElement('div');
            successDiv.innerHTML = '✅ Camera Test Successful! Video should be visible in top-right corner.';
            successDiv.style.position = 'fixed';
            successDiv.style.top = '260px';
            successDiv.style.right = '10px';
            successDiv.style.background = 'green';
            successDiv.style.color = 'white';
            successDiv.style.padding = '10px';
            successDiv.style.borderRadius = '8px';
            successDiv.style.zIndex = '9999';
            successDiv.style.fontSize = '14px';
            
            document.body.appendChild(successDiv);
            
            // Clean up after 5 seconds
            setTimeout(() => {
                stream.getTracks().forEach(track => track.stop());
                document.body.removeChild(testVideo);
                document.body.removeChild(successDiv);
                console.log('🛑 Camera test completed');
            }, 5000);
            
        } catch (error) {
            console.error('❌ Camera test failed:', error);
            
            let errorMessage = 'Camera test failed: ';
            if (error.name === 'NotAllowedError') {
                errorMessage += 'Camera permission denied. Please allow camera access in your browser.';
            } else if (error.name === 'NotFoundError') {
                errorMessage += 'No camera found. Please check your camera connection.';
            } else if (error.name === 'NotReadableError') {
                errorMessage += 'Camera is already in use by another application.';
            } else {
                errorMessage += error.message;
            }
            
            alert(errorMessage);
        }
    };

    const testChat = () => {
        console.log('=== TEST CHAT FUNCTION ===');
        if (socket && socket.connected) {
            console.log('✅ Socket is connected, sending test message');
            socket.emit('chat-message', 'Test Message', 'TestUser');
        } else {
            console.log('❌ Socket not connected');
        }
    };

    const handleJoinMeeting = () => {
        if (username.trim()) {
            setConnectionStatus('connecting');
            setTimeout(() => {
                setShowWaitingRoom(false);
            }, 1000);
        }
    };

    const handleRaiseHand = () => {
        const newState = !isHandRaised;
        setIsHandRaised(newState);
        if (socket) {
            socket.emit('hand-raise', { userId: socket.id, isRaised: newState });
        }
    };

    const handleToggleRecording = () => {
        if (!isRecording) {
            startRecording();
        } else {
            stopRecording();
        }
    };

    const startRecording = () => {
        if (myStreamRef.current) {
            const stream = myStreamRef.current;
            const options = { mimeType: 'video/webm' };
            
            try {
                mediaRecorderRef.current = new MediaRecorder(stream, options);
                recordedChunksRef.current = [];

                mediaRecorderRef.current.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        recordedChunksRef.current.push(event.data);
                    }
                };

                mediaRecorderRef.current.onstop = () => {
                    const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `meeting-recording-${Date.now()}.webm`;
                    a.click();
                };

                mediaRecorderRef.current.start();
                setIsRecording(true);
                
                if (socket) {
                    socket.emit('recording-started', { userId: socket.id });
                }
            } catch (error) {
                console.error('Error starting recording:', error);
            }
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            
            if (socket) {
                socket.emit('recording-stopped', { userId: socket.id });
            }
        }
    };

    const handleMuteParticipant = (participantId) => {
        if (socket && isHost) {
            socket.emit('mute-participant', { targetUserId: participantId, hostId: socket.id });
        }
    };

    const handleRemoveParticipant = (participantId) => {
        if (socket && isHost && window.confirm('Are you sure you want to remove this participant?')) {
            socket.emit('remove-participant', { targetUserId: participantId, hostId: socket.id });
        }
    };

    const handleEndMeeting = () => {
        if (socket && isHost && window.confirm('Are you sure you want to end this meeting for everyone?')) {
            socket.emit('end-meeting', { hostId: socket.id });
            window.location.href = '/';
        }
    };

    const handleSendMessage = (messageData) => {
        if (socket) {
            socket.emit('chat-message', messageData.message, messageData.sender);
            setChatMessages(prev => [...prev, messageData]);
        }
    };

    const showReaction = (emoji) => {
        const reaction = {
            id: Date.now(),
            emoji,
            x: Math.random() * 80 + 10,
            y: Math.random() * 60 + 20
        };
        
        setReactions(prev => [...prev, reaction]);
        
        setTimeout(() => {
            setReactions(prev => prev.filter(r => r.id !== reaction.id));
        }, 3000);
    };

    const toggleVideo = () => {
        console.log('📹 Toggling video, current state:', isVideoMuted);
        
        if (myStreamRef.current) {
            const videoTrack = myStreamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                const newState = !isVideoMuted;
                videoTrack.enabled = newState;
                setIsVideoMuted(!newState);
                
                console.log('📹 Video track enabled:', videoTrack.enabled);
                
                // If enabling video, make sure it's displayed
                if (newState && myVideoRef.current) {
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
        if (myStreamRef.current) {
            const audioTrack = myStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !isAudioMuted;
                setIsAudioMuted(!isAudioMuted);
            }
        }
    };

    const toggleScreenShare = async () => {
        try {
            if (!isScreenSharing) {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: true,
                    audio: true
                });
                
                if (myStreamRef.current) {
                    myStreamRef.current.getVideoTracks().forEach(track => track.stop());
                    screenStream.getTracks().forEach(track => {
                        myStreamRef.current.addTrack(track);
                    });
                }
                setIsScreenSharing(true);
            } else {
                if (myStreamRef.current) {
                    myStreamRef.current.getVideoTracks().forEach(track => track.stop());
                    const cameraStream = await navigator.mediaDevices.getUserMedia({
                        video: true,
                        audio: true
                    });
                    cameraStream.getTracks().forEach(track => {
                        myStreamRef.current.addTrack(track);
                    });
                }
                setIsScreenSharing(false);
            }
        } catch (error) {
            console.error('Error toggling screen share:', error);
        }
    };

    const sendMessage = () => {
        if (!chatInput.trim()) {
            return;
        }
        
        if (!socket || !socket.connected) {
            return;
        }
        
        if (!username.trim()) {
            return;
        }
        
        const messageData = {
            sender: username,
            message: chatInput.trim(),
            timestamp: new Date().toISOString()
        };
        
        socket.emit('chat-message', messageData.message, messageData.sender);
        setChatMessages(prev => [...prev, messageData]);
        setChatInput('');
    };

    // Socket connection effect
    useEffect(() => {
        if (!showWaitingRoom && username.trim()) {
            console.log('=== SOCKET CONNECTION SETUP ===');
            setConnectionStatus('connecting');
            const newSocket = io('http://localhost:8000');
            setSocket(newSocket);
            window.socket = newSocket;

            newSocket.on('connect', () => {
                console.log('✅ Connected to server');
                setIsConnected(true);
                setConnectionStatus('connected');
                
                newSocket.emit('join-call', url);
                newSocket.emit('check-host', { roomId: url, userId: newSocket.id });
            });

            newSocket.on('disconnect', () => {
                console.log('❌ Disconnected from server');
                setIsConnected(false);
                setConnectionStatus('disconnected');
            });

            newSocket.on('connect_error', (error) => {
                console.log('❌ Connection error:', error);
                setConnectionStatus('error');
            });

            newSocket.on('host-assigned', (data) => {
                console.log('👑 Host assigned:', data.isHost);
                setIsHost(data.isHost);
            });

            newSocket.on('user-joined', (socketId, users) => {
                console.log('👤 User joined:', socketId);
                setRemoteSocketId(socketId);
                
                const updatedParticipants = users.map(userId => ({
                    id: userId,
                    username: userId === newSocket.id ? username : `User ${userId.slice(-4)}`,
                    isHost: userId === newSocket.id ? isHost : false,
                    isAudioMuted: false,
                    isVideoOff: false,
                    joinTime: new Date(),
                    isSpeaking: false
                }));
                setParticipants(updatedParticipants);
            });

            newSocket.on('user-left', (socketId) => {
                console.log('👤 User left:', socketId);
                setRemoteSocketId(null);
                setRemoteStream(null);
                setParticipants(prev => prev.filter(p => p.id !== socketId));
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

            newSocket.on('signal', async (fromId, signal) => {
                if (fromId !== newSocket.id) {
                    await handleSignal(signal, newSocket, fromId, myStream);
                }
            });

            return () => {
                newSocket.disconnect();
                window.socket = null;
            };
        }
    }, [url, handleSignal, myStream, showWaitingRoom, username, isHost]);

    // Media setup effect
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
            if (myStreamRef.current) {
                console.log('🛑 Stopping media tracks...');
                myStreamRef.current.getTracks().forEach(track => {
                    track.stop();
                    console.log('🛑 Track stopped:', track.kind);
                });
            }
        };
    }, []);

    // Auto-scroll chat effect
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    // Video element setup effect
    useEffect(() => {
        if (myStream && myVideoRef.current) {
            console.log('📹 Setting up video element with stream');
            
            // Set the stream to video element
            myVideoRef.current.srcObject = myStream;
            
            // Ensure video plays when source is set
            myVideoRef.current.play().then(() => {
                console.log('✅ Video playing successfully');
            }).catch(e => {
                console.log('⚠️ Video auto-play prevented:', e);
                
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
            
            // Log video element state
            console.log('📹 Video element readyState:', myVideoRef.current.readyState);
            console.log('📹 Video element videoWidth:', myVideoRef.current.videoWidth);
            console.log('📹 Video element videoHeight:', myVideoRef.current.videoHeight);
        }
    }, [myStream]);

    // Create offer effect
    useEffect(() => {
        if (remoteSocketId && myStream && socket) {
            createOffer(socket, remoteSocketId, myStream);
        }
    }, [remoteSocketId, myStream, socket, createOffer]);

    // Show waiting room if user hasn't joined
    if (showWaitingRoom) {
        return (
            <WaitingRoom
                meetingCode={url}
                username={username}
                setUsername={setUsername}
                onJoin={handleJoinMeeting}
                isConnecting={connectionStatus === 'connecting'}
                connectionStatus={connectionStatus}
            />
        );
    }

    // Show loading screen while connecting
    if (connectionStatus === 'connecting') {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                backgroundColor: '#1a1a1a',
                color: 'white',
                flexDirection: 'column',
                gap: '20px'
            }}>
                <div style={{
                    width: '60px',
                    height: '60px',
                    border: '4px solid #333',
                    borderTop: '4px solid #007bff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <h2>Joining Meeting...</h2>
                <p style={{ color: '#666' }}>Connecting to {url}</p>
            </div>
        );
    }

    return (
        <div style={{ 
            display: 'flex', 
            height: '100vh', 
            backgroundColor: '#1a1a1a',
            color: 'white',
            fontFamily: 'Arial, sans-serif',
            position: 'relative'
        }}>
            {/* Main Video Area */}
            <div style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                position: 'relative'
            }}>
                {/* Recording Indicator */}
                {isRecording && (
                    <div style={{
                        position: 'absolute',
                        top: '20px',
                        left: '20px',
                        background: 'rgba(220, 53, 69, 0.9)',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        zIndex: 1000,
                        animation: 'pulse 2s infinite'
                    }}>
                        <span style={{ width: '8px', height: '8px', background: 'white', borderRadius: '50%' }}></span>
                        🔴 Recording
                    </div>
                )}

                {/* Host Badge */}
                {isHost && (
                    <div style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        background: 'rgba(255, 193, 7, 0.9)',
                        color: 'black',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontWeight: 'bold',
                        zIndex: 1000
                    }}>
                        👑 Host
                    </div>
                )}

                {/* Remote Video (Large) */}
                <div style={{ 
                    flex: 1, 
                    position: 'relative', 
                    backgroundColor: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {remoteStream ? (
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover'
                            }}
                        />
                    ) : (
                        <div style={{ textAlign: 'center', color: '#666' }}>
                            <p>Waiting for someone to join...</p>
                        </div>
                    )}
                </div>

                {/* Small Self Video */}
                <div style={{ 
                    position: 'absolute', 
                    bottom: '100px', 
                    right: '20px', 
                    width: '200px', 
                    height: '150px', 
                    backgroundColor: '#000',
                    border: isHandRaised ? '3px solid #ffc107' : '2px solid #444',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease',
                    overflow: 'hidden'
                }}>
                    {myStream ? (
                        <video
                            ref={myVideoRef}
                            autoPlay
                            muted
                            playsInline
                            style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover',
                                borderRadius: '6px',
                                transform: 'scaleX(-1)' // Mirror effect for better UX
                            }}
                            onLoadedMetadata={() => {
                                console.log('📹 Video metadata loaded');
                                console.log('📹 Video dimensions:', myVideoRef.current.videoWidth, 'x', myVideoRef.current.videoHeight);
                            }}
                            onCanPlay={() => {
                                console.log('📹 Video can play');
                            }}
                            onError={(e) => {
                                console.error('❌ Video error:', e);
                            }}
                        />
                    ) : (
                        <div style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#666',
                            fontSize: '14px',
                            backgroundColor: '#111'
                        }}>
                            <div style={{ fontSize: '24px', marginBottom: '10px' }}>📹</div>
                            <div>Camera loading...</div>
                            <div style={{ fontSize: '12px', marginTop: '5px' }}>Please allow camera access</div>
                        </div>
                    )}
                    
                    {isHandRaised && (
                        <div style={{
                            position: 'absolute',
                            top: '-10px',
                            left: '-10px',
                            background: '#ffc107',
                            color: 'black',
                            borderRadius: '50%',
                            width: '30px',
                            height: '30px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px',
                            animation: 'wave 1s infinite'
                        }}>
                            ✋
                        </div>
                    )}
                    
                    {/* Video status indicator */}
                    <div style={{
                        position: 'absolute',
                        bottom: '5px',
                        right: '5px',
                        background: isVideoMuted ? 'rgba(220, 53, 69, 0.8)' : 'rgba(40, 167, 69, 0.8)',
                        color: 'white',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px'
                    }}>
                        {isVideoMuted ? '📹' : '📷'}
                    </div>
                </div>

                {/* Meeting Controls */}
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
                    onToggleRecording={handleToggleRecording}
                    onRaiseHand={handleRaiseHand}
                    onEndMeeting={handleEndMeeting}
                    onToggleParticipants={() => setShowParticipants(!showParticipants)}
                    onToggleChat={() => setShowChat(!showChat)}
                />
            </div>

            {/* Floating Reactions */}
            {reactions.map(reaction => (
                <div
                    key={reaction.id}
                    style={{
                        position: 'absolute',
                        left: `${reaction.x}%`,
                        top: `${reaction.y}%`,
                        fontSize: '48px',
                        animation: 'floatUp 3s ease-out forwards',
                        zIndex: 2000,
                        pointerEvents: 'none'
                    }}
                >
                    {reaction.emoji}
                </div>
            ))}

            {/* Participant List Panel */}
            <ParticipantList
                participants={participants}
                isOpen={showParticipants}
                onClose={() => setShowParticipants(false)}
                isHost={isHost}
                onMuteParticipant={handleMuteParticipant}
                onRemoveParticipant={handleRemoveParticipant}
                currentUserId={socket?.id}
            />

            {/* Enhanced Chat Panel */}
            <EnhancedChat
                messages={chatMessages}
                isOpen={showChat}
                onClose={() => setShowChat(false)}
                onSendMessage={handleSendMessage}
                username={username}
                currentUserId={socket?.id}
            />

            {/* Debug Buttons */}
            <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '20px',
                display: 'flex',
                gap: '10px',
                zIndex: 1000
            }}>
                <button
                    onClick={testCamera}
                    style={{
                        padding: '8px 16px',
                        background: 'rgba(40, 167, 69, 0.9)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px'
                    }}
                >
                    TEST CAMERA
                </button>
                
                <button
                    onClick={testChat}
                    style={{
                        padding: '8px 16px',
                        background: 'rgba(255, 193, 7, 0.9)',
                        color: 'black',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px'
                    }}
                >
                    TEST CHAT
                </button>
            </div>
        </div>
    );
};

export default VideoMeet;
