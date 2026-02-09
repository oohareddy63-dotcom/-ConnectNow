import React, { useState, useEffect, useRef } from 'react';
import './EnhancedChat.css';

const EnhancedChat = ({ 
    messages, 
    isOpen, 
    onClose, 
    onSendMessage, 
    username,
    currentUserId 
}) => {
    const [messageInput, setMessageInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [typingUsers, setTypingUsers] = useState([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const fileInputRef = useRef(null);
    const chatEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const emojis = ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', 
                   '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😜', '🤪', '😝', '🤑', 
                   '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄',
                   '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮',
                   '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇',
                   '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '💔', '❣️', '💕', '💞', '💓',
                   '🎉', '🎊', '🎈', '🎁', '🎂', '🎄', '🎃', '🎆', '🎇', '🧨', '✨', '🎠',
                   '🔥', '💧', '🌊', '🌈', '☁️', '⛈️', '🌤️', '🌥️', '🌦️', '🌧️', '⛈️'];

    useEffect(() => {
        // Auto-scroll to bottom when new messages arrive
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        // Listen for typing events
        if (window.socket) {
            window.socket.on('user-typing', (data) => {
                setTypingUsers(prev => {
                    const filtered = prev.filter(u => u.userId !== data.userId);
                    if (data.isTyping) {
                        return [...filtered, data];
                    }
                    return filtered;
                });
            });
        }
    }, []);

    const handleTyping = (e) => {
        const value = e.target.value;
        setMessageInput(value);

        // Send typing indicator
        if (window.socket && username) {
            if (!isTyping && value.length > 0) {
                setIsTyping(true);
                window.socket.emit('typing', { userId: currentUserId, username, isTyping: true });
            }

            // Clear previous timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            // Set new timeout to stop typing indicator
            typingTimeoutRef.current = setTimeout(() => {
                setIsTyping(false);
                window.socket.emit('typing', { userId: currentUserId, username, isTyping: false });
            }, 1000);
        }
    };

    const handleSendMessage = () => {
        if (messageInput.trim() || selectedFiles.length > 0) {
            const messageData = {
                sender: username,
                message: messageInput.trim(),
                timestamp: new Date().toISOString(),
                files: selectedFiles,
                userId: currentUserId
            };

            onSendMessage(messageData);
            setMessageInput('');
            setSelectedFiles([]);
            setShowEmojiPicker(false);

            // Stop typing indicator
            if (isTyping && window.socket) {
                setIsTyping(false);
                window.socket.emit('typing', { userId: currentUserId, username, isTyping: false });
            }
        }
    };

    const handleEmojiSelect = (emoji) => {
        setMessageInput(prev => prev + emoji);
        setShowEmojiPicker(false);
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(prev => [...prev, ...files]);
    };

    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (filename) => {
        const ext = filename.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return '🖼️';
        if (['pdf'].includes(ext)) return '📄';
        if (['doc', 'docx'].includes(ext)) return '📝';
        if (['xls', 'xlsx'].includes(ext)) return '📊';
        if (['ppt', 'pptx'].includes(ext)) return '📈';
        return '📎';
    };

    return (
        <div className={`enhanced-chat ${isOpen ? 'open' : ''}`}>
            <div className="chat-header">
                <h3>Chat</h3>
                <button className="close-btn" onClick={onClose}>×</button>
            </div>

            <div className="chat-messages">
                {messages.length === 0 ? (
                    <div className="empty-chat">
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <div 
                            key={index} 
                            className={`message ${msg.userId === currentUserId ? 'own' : 'other'}`}
                        >
                            <div className="message-header">
                                <span className="sender">{msg.sender}</span>
                                <span className="timestamp">
                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                </span>
                            </div>
                            
                            {msg.message && (
                                <div className="message-content">{msg.message}</div>
                            )}
                            
                            {msg.files && msg.files.length > 0 && (
                                <div className="message-files">
                                    {msg.files.map((file, fileIndex) => (
                                        <div key={fileIndex} className="file-attachment">
                                            <span className="file-icon">{getFileIcon(file.name)}</span>
                                            <div className="file-info">
                                                <div className="file-name">{file.name}</div>
                                                <div className="file-size">{formatFileSize(file.size)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
                
                {typingUsers.length > 0 && (
                    <div className="typing-indicator">
                        <span className="typing-text">
                            {typingUsers.map(u => u.username).join(', ')} 
                            {typingUsers.length === 1 ? ' is' : ' are'} typing
                        </span>
                        <div className="typing-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                )}
                
                <div ref={chatEndRef} />
            </div>

            <div className="chat-input-container">
                {selectedFiles.length > 0 && (
                    <div className="selected-files">
                        {selectedFiles.map((file, index) => (
                            <div key={index} className="selected-file">
                                <span className="file-icon">{getFileIcon(file.name)}</span>
                                <span className="file-name">{file.name}</span>
                                <button 
                                    className="remove-file"
                                    onClick={() => removeFile(index)}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                
                <div className="chat-input">
                    <div className="input-actions">
                        <button 
                            className="action-btn"
                            onClick={() => fileInputRef.current?.click()}
                            title="Attach file"
                        >
                            📎
                        </button>
                        
                        <button 
                            className="action-btn"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            title="Add emoji"
                        >
                            😊
                        </button>
                    </div>
                    
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        style={{ display: 'none' }}
                        onChange={handleFileSelect}
                    />
                    
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={messageInput}
                        onChange={handleTyping}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="message-input"
                    />
                    
                    <button 
                        className="send-btn"
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim() && selectedFiles.length === 0}
                    >
                        Send
                    </button>
                </div>
                
                {showEmojiPicker && (
                    <div className="emoji-picker">
                        <div className="emoji-grid">
                            {emojis.map((emoji, index) => (
                                <button
                                    key={index}
                                    className="emoji-btn"
                                    onClick={() => handleEmojiSelect(emoji)}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EnhancedChat;
