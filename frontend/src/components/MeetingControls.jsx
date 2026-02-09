import React, { useState, useEffect } from 'react';
import './MeetingControls.css';

const MeetingControls = ({ 
    isVideoMuted, 
    isAudioMuted, 
    isScreenSharing,
    isHandRaised,
    isRecording,
    isHost,
    participantCount,
    onToggleVideo,
    onToggleAudio,
    onToggleScreenShare,
    onToggleRecording,
    onRaiseHand,
    onEndMeeting,
    onToggleParticipants,
    onToggleChat
}) => {
    const [showReactions, setShowReactions] = useState(false);

    const reactions = ['👍', '❤️', '😂', '😮', '😢', '👏'];

    const sendReaction = (emoji) => {
        // Emit reaction to all participants
        if (window.socket) {
            window.socket.emit('reaction', emoji);
        }
        setShowReactions(false);
    };

    return (
        <div className="meeting-controls">
            {/* Main Controls */}
            <div className="controls-row main-controls">
                <button 
                    className={`control-btn ${isAudioMuted ? 'muted' : ''}`}
                    onClick={onToggleAudio}
                    title={isAudioMuted ? 'Unmute' : 'Mute'}
                >
                    {isAudioMuted ? '🔇' : '🎤'}
                </button>
                
                <button 
                    className={`control-btn ${isVideoMuted ? 'muted' : ''}`}
                    onClick={onToggleVideo}
                    title={isVideoMuted ? 'Start Video' : 'Stop Video'}
                >
                    {isVideoMuted ? '📹' : '📷'}
                </button>
                
                <button 
                    className={`control-btn ${isScreenSharing ? 'active' : ''}`}
                    onClick={onToggleScreenShare}
                    title={isScreenSharing ? 'Stop Recording' : 'Start Screen Recording'}
                >
                    {isScreenSharing ? '⏹️' : '🖥️'}
                </button>
                
                {isHost && (
                    <button 
                        className={`control-btn ${isRecording ? 'recording' : ''}`}
                        onClick={onToggleRecording}
                        title={isRecording ? 'Stop Recording' : 'Start Recording'}
                    >
                        {isRecording ? '⏹️' : '⏺️'}
                    </button>
                )}
                
                <button 
                    className={`control-btn ${isHandRaised ? 'raised' : ''}`}
                    onClick={onRaiseHand}
                    title={isHandRaised ? 'Lower Hand' : 'Raise Hand'}
                >
                    ✋
                </button>
            </div>

            {/* Secondary Controls */}
            <div className="controls-row secondary-controls">
                <button 
                    className="control-btn"
                    onClick={onToggleParticipants}
                    title="Participants"
                >
                    👥 {participantCount}
                </button>
                
                <button 
                    className="control-btn"
                    onClick={onToggleChat}
                    title="Chat"
                >
                    💬
                </button>
                
                <div className="reactions-container">
                    <button 
                        className="control-btn"
                        onClick={() => setShowReactions(!showReactions)}
                        title="Reactions"
                    >
                        😊
                    </button>
                    
                    {showReactions && (
                        <div className="reactions-panel">
                            {reactions.map((emoji, index) => (
                                <button
                                    key={index}
                                    className="reaction-btn"
                                    onClick={() => sendReaction(emoji)}
                                    title={`Send ${emoji}`}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                
                {isHost && (
                    <button 
                        className="control-btn danger"
                        onClick={onEndMeeting}
                        title="End Meeting"
                    >
                        📞
                    </button>
                )}
            </div>
        </div>
    );
};

export default MeetingControls;
