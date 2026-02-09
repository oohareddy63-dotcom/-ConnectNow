import React, { useState, useEffect } from 'react';
import './ParticipantList.css';

const ParticipantList = ({ 
    participants, 
    isOpen, 
    onClose, 
    isHost, 
    onMuteParticipant, 
    onRemoveParticipant,
    currentUserId 
}) => {
    const [raisedHands, setRaisedHands] = useState([]);

    useEffect(() => {
        // Listen for hand raise events
        if (window.socket) {
            window.socket.on('hand-raised', (userId) => {
                setRaisedHands(prev => [...prev, userId]);
            });

            window.socket.on('hand-lowered', (userId) => {
                setRaisedHands(prev => prev.filter(id => id !== userId));
            });
        }
    }, []);

    const handleMuteParticipant = (participantId) => {
        if (isHost) {
            onMuteParticipant(participantId);
        }
    };

    const handleRemoveParticipant = (participantId) => {
        if (isHost && window.confirm('Are you sure you want to remove this participant?')) {
            onRemoveParticipant(participantId);
        }
    };

    return (
        <div className={`participant-list ${isOpen ? 'open' : ''}`}>
            <div className="participant-list-header">
                <h3>Participants ({participants.length})</h3>
                <button className="close-btn" onClick={onClose}>×</button>
            </div>
            
            <div className="participant-list-content">
                {participants.map((participant) => (
                    <div 
                        key={participant.id} 
                        className={`participant-item ${participant.isHost ? 'host' : ''} ${participant.isSpeaking ? 'speaking' : ''}`}
                    >
                        <div className="participant-avatar">
                            {participant.isVideoOff ? (
                                <div className="avatar-placeholder">
                                    {participant.username.charAt(0).toUpperCase()}
                                </div>
                            ) : (
                                <video 
                                    ref={participant.videoRef}
                                    autoPlay 
                                    muted={participant.id === currentUserId}
                                    playsInline
                                    className="participant-video"
                                />
                            )}
                            
                            {participant.isHost && (
                                <div className="host-badge">👑</div>
                            )}
                            
                            {raisedHands.includes(participant.id) && (
                                <div className="hand-indicator">✋</div>
                            )}
                        </div>
                        
                        <div className="participant-info">
                            <div className="participant-name">
                                {participant.username}
                                {participant.id === currentUserId && ' (You)'}
                            </div>
                            <div className="participant-status">
                                <span className={`status-indicator ${participant.isAudioMuted ? 'muted' : ''}`}>
                                    {participant.isAudioMuted ? '🔇' : '🎤'}
                                </span>
                                <span className={`status-indicator ${participant.isVideoOff ? 'off' : ''}`}>
                                    {participant.isVideoOff ? '📹' : '📷'}
                                </span>
                                <span className="join-time">
                                    Joined {new Date(participant.joinTime).toLocaleTimeString()}
                                </span>
                            </div>
                        </div>
                        
                        {isHost && participant.id !== currentUserId && (
                            <div className="host-controls">
                                <button 
                                    className="host-control-btn mute-btn"
                                    onClick={() => handleMuteParticipant(participant.id)}
                                    title={participant.isAudioMuted ? 'Unmute' : 'Mute'}
                                >
                                    {participant.isAudioMuted ? '🎤' : '🔇'}
                                </button>
                                <button 
                                    className="host-control-btn remove-btn"
                                    onClick={() => handleRemoveParticipant(participant.id)}
                                    title="Remove from meeting"
                                >
                                    🚫
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            
            {isHost && (
                <div className="host-actions">
                    <button className="host-action-btn" onClick={() => onMuteParticipant('all')}>
                        Mute All
                    </button>
                    <button className="host-action-btn" onClick={() => onRemoveParticipant('all')}>
                        Remove All
                    </button>
                </div>
            )}
        </div>
    );
};

export default ParticipantList;
