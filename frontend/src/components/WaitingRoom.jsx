import React, { useState, useEffect } from 'react';
import './WaitingRoom.css';

const WaitingRoom = ({ 
    meetingCode, 
    username, 
    setUsername,
    onJoin, 
    isConnecting,
    connectionStatus 
}) => {
    const [animatedDots, setAnimatedDots] = useState('');
    const [joinSound, setJoinSound] = useState(null);

    useEffect(() => {
        // Animate loading dots
        const interval = setInterval(() => {
            setAnimatedDots(prev => {
                if (prev === '...') return '';
                return prev + '.';
            });
        }, 500);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Create join sound
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmFgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
        setJoinSound(audio);
    }, []);

    const playJoinSound = () => {
        if (joinSound) {
            joinSound.play().catch(e => console.log('Could not play sound:', e));
        }
    };

    const handleJoin = () => {
        if (username.trim()) {
            playJoinSound();
            onJoin();
        }
    };

    return (
        <div className="waiting-room">
            <div className="waiting-room-background">
                <div className="animated-background">
                    <div className="floating-shapes">
                        <div className="shape shape-1"></div>
                        <div className="shape shape-2"></div>
                        <div className="shape shape-3"></div>
                        <div className="shape shape-4"></div>
                        <div className="shape shape-5"></div>
                    </div>
                </div>
            </div>

            <div className="waiting-room-content">
                <div className="waiting-room-card">
                    <div className="waiting-room-header">
                        <div className="meeting-icon">
                            <div className="icon-circle">
                                <span className="icon-text">📹</span>
                            </div>
                        </div>
                        <h1>Video Meeting</h1>
                        <p className="meeting-subtitle">Connect with anyone, anywhere</p>
                    </div>

                    <div className="meeting-info">
                        <div className="meeting-code-section">
                            <label>Meeting Code</label>
                            <div className="meeting-code-display">
                                <input 
                                    type="text" 
                                    value={meetingCode} 
                                    readOnly 
                                    className="code-input"
                                />
                                <button 
                                    className="copy-btn"
                                    onClick={() => navigator.clipboard.writeText(meetingCode)}
                                    title="Copy meeting code"
                                >
                                    📋
                                </button>
                            </div>
                        </div>

                        <div className="username-section">
                            <label>Your Name</label>
                            <input
                                type="text"
                                placeholder="Enter your name"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="username-input"
                                maxLength={50}
                            />
                            <div className="character-count">
                                {username.length}/50
                            </div>
                        </div>
                    </div>

                    <div className="connection-status">
                        {isConnecting && (
                            <div className="status-connecting">
                                <div className="loading-spinner"></div>
                                <span>Connecting{animatedDots}</span>
                            </div>
                        )}
                        
                        {connectionStatus === 'connected' && (
                            <div className="status-connected">
                                <span className="status-indicator connected"></span>
                                <span>Connected to meeting</span>
                            </div>
                        )}
                        
                        {connectionStatus === 'error' && (
                            <div className="status-error">
                                <span className="status-indicator error"></span>
                                <span>Connection failed. Please try again.</span>
                            </div>
                        )}
                    </div>

                    <div className="waiting-room-actions">
                        <button 
                            className="join-meeting-btn"
                            onClick={handleJoin}
                            disabled={!username.trim() || isConnecting}
                        >
                            {isConnecting ? (
                                <>
                                    <div className="btn-spinner"></div>
                                    Joining...
                                </>
                            ) : (
                                <>
                                    <span className="btn-icon"></span>
                                    Join Meeting
                                </>
                            )}
                        </button>
                        
                        <div className="meeting-tips">
                            <h3> Tips for a great meeting:</h3>
                            <ul>
                                <li>Use a quiet, well-lit space</li>
                                <li>Test your camera and microphone</li>
                                <li>Use headphones for better audio</li>
                                <li>Close unnecessary browser tabs</li>
                            </ul>
                        </div>
                    </div>

                    <div className="waiting-room-footer">
                        <div className="security-notice">
                            <span className="security-icon">🔒</span>
                            <span>This meeting is secure and encrypted</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WaitingRoom;
