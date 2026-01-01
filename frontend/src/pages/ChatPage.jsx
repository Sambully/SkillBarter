import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Phone, Video, Paperclip, MoreVertical, Search, MessageSquare, UserPlus, Check, X, File } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io("http://localhost:5000");

export default function ChatPage() {
    const { user, token } = useAuth();
    const [activeTab, setActiveTab] = useState('inbox'); // 'inbox' or 'requests'
    const [conversations, setConversations] = useState([]);
    const [requests, setRequests] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [rating, setRating] = useState(5);
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [tempLink, setTempLink] = useState("");

    // Fetch initial data
    useEffect(() => {
        if (!token) return;
        fetchConversations();
        fetchRequests();
    }, [token, activeTab]);

    // Socket setup
    useEffect(() => {
        if (!user) return;
        socket.emit("join_room", user.id); // Join own room

        socket.on("receive_message", (data) => {
            if (selectedChat && (data.sender === selectedChat.partner._id || data.sender === user._id)) {
                setMessages((prev) => {
                    // Deduplicate
                    if (prev.some(m => m._id === data._id)) return prev;
                    return [...prev, data];
                });
            }
        });

        return () => {
            socket.off("receive_message");
        };
    }, [user, selectedChat]);

    // Fetch messages when chat is selected
    useEffect(() => {
        if (selectedChat) {
            fetchMessages(selectedChat.partner._id);
            socket.emit("join_room", selectedChat.partner._id);
        }
    }, [selectedChat]);

    // Auto-scroll on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const fetchConversations = async () => {
        try {
            const res = await axios.get('http://localhost:5000/chat/conversations', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setConversations(res.data);
            // Sync selectedChat if it exists (to update activeSessionInitiator)
            if (selectedChat) {
                const updatedChat = res.data.find(c => c.requestId === selectedChat.requestId);
                if (updatedChat) setSelectedChat(updatedChat);
            }
            setIsLoading(false);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchRequests = async () => {
        try {
            const res = await axios.get('http://localhost:5000/chat/requests', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRequests(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchMessages = async (partnerId) => {
        try {
            const res = await axios.get(`http://localhost:5000/chat/${partnerId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedChat) return;

        const messageData = {
            sender: user._id,
            recipient: selectedChat.partner._id,
            content: newMessage,
            timestamp: new Date()
        };

        // Optimistic update done by socket listener for sender too? 
        // Backend emits to sender, so we just wait for it? 
        // Or emit socket event first.
        socket.emit("send_message", messageData);
        setNewMessage("");
    };

    const handleAcceptRequest = async (requestId) => {
        try {
            await axios.post(`http://localhost:5000/chat/request/${requestId}/accept`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchRequests();
            fetchConversations(); // refresh conversations
        } catch (err) {
            console.error(err);
        }
    };

    const handleRejectRequest = async (requestId) => {
        try {
            await axios.post(`http://localhost:5000/chat/request/${requestId}/reject`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchRequests();
        } catch (err) {
            console.error(err);
        }
    };

    const handleVideoCall = async () => {
        if (!selectedChat) return;

        // request/revert: User specifically asked for Google Meet
        window.open('https://meet.google.com/new', '_blank');

        // Show the helper modal for the user to paste the link
        setShowLinkInput(true);

        // Call backend to persist session start (for payment button visibility)
        if (selectedChat?.requestId) {
            try {
                await axios.post('http://localhost:5000/chat/start-session',
                    { requestId: selectedChat.requestId },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                // Refresh to get updated activeSessionInitiator status
                fetchConversations();
            } catch (err) {
                console.error("Failed to start session:", err);
            }
        }
    };

    const submitMeetingLink = (e) => {
        e.preventDefault();
        if (!tempLink.trim()) return;

        const messageData = {
            sender: user._id,
            recipient: selectedChat.partner._id,
            content: `🎥 I started a Google Meet video call! Join here: ${tempLink}`,
            timestamp: new Date()
        };
        socket.emit("send_message", messageData);
        setMessages(prev => [...prev, messageData]);
        setShowLinkInput(false);
        setTempLink("");
    };

    const fileInputRef = useRef(null);

    const handleFileUpload = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            // Upload to backend
            const res = await axios.post("http://localhost:5000/upload", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });

            const { fileUrl, fileType } = res.data;

            // Send message with file
            const messageData = {
                sender: user._id,
                recipient: selectedChat.partner._id,
                content: "", // Sent only as file
                fileUrl,
                fileType,
                timestamp: new Date()
            };

            socket.emit("send_message", messageData);
            // setMessages(prev => [...prev, messageData]); // Removed optimistic update to prevent duplicates (socket event will handle it)

        } catch (err) {
            console.error("File upload failed:", err);
            alert(`Failed to upload file: ${err.response?.data?.message || err.message}`);
        } finally {
            setIsUploading(false);
            e.target.value = null; // Reset input
        }
    };

    const handleCompleteSession = async () => {
        if (!selectedChat) return;
        try {
            const res = await axios.post('http://localhost:5000/chat/complete-session',
                { requestId: selectedChat.requestId, rating },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert(`Session ended! ${res.data.message}`);
            setShowCompleteModal(false);
            fetchConversations(); // Refresh data
            // Optionally refresh user credits logic here if we had user state updater
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Failed to complete session");
        }
    };

    return (
        <div className="flex h-[calc(100vh-80px)] mt-0 bg-black text-white relative top-0 left-0 w-full overflow-hidden">
            {/* Adjusted height/margin if Sidebar is present in Layout. Usually Layout provides padding. 
            If this page is inside Layout, it might need to fit. 
            Let's assume Layout renders children in a main area.
        */}

            {/* Chat Sidebar */}
            <div className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col">
                <div className="p-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur">
                    <h2 className="text-xl font-bold mb-4">Messages</h2>
                    <div className="flex gap-2 p-1 bg-gray-800 rounded-lg">
                        <button
                            onClick={() => setActiveTab('inbox')}
                            className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-all ${activeTab === 'inbox' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
                        >
                            Inbox
                        </button>
                        <button
                            onClick={() => setActiveTab('requests')}
                            className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-all ${activeTab === 'requests' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
                        >
                            Requests {requests.length > 0 && <span className="ml-1 bg-blue-600 text-xs px-1.5 py-0.5 rounded-full">{requests.length}</span>}
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {activeTab === 'inbox' ? (
                        <div className="space-y-1">
                            {conversations.map((chat) => (
                                <div
                                    key={chat.requestId}
                                    onClick={() => setSelectedChat(chat)}
                                    className={`p-3 rounded-xl cursor-pointer flex items-center gap-3 transition-all duration-200 ${selectedChat?.requestId === chat.requestId ? "bg-white/10" : "hover:bg-white/5"
                                        }`}
                                >
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center font-bold text-white shadow-lg">
                                            {chat.partner.username?.[0].toUpperCase() || "U"}
                                        </div>
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full"></div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-white truncate">{chat.partner.username || "User"}</h3>
                                        <p className="text-xs text-gray-400 truncate">Click to chat</p>
                                    </div>
                                </div>
                            ))}
                            {conversations.length === 0 && <div className="text-center text-gray-500 py-8 text-sm">No active chats</div>}
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {requests.map((request) => (
                                <div key={request._id} className="p-3 bg-gray-900/50 rounded-xl border border-gray-800 flex items-center justify-between hover:bg-gray-800 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-500 to-orange-500 flex items-center justify-center font-bold text-black shadow-lg">
                                            {request.sender.username[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white text-sm">{request.sender.username}</h3>
                                            <p className="text-xs text-gray-400">Sent a request</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleAcceptRequest(request._id)} className="p-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition shadow-lg transition-transform hover:scale-105">
                                            <Check size={14} />
                                        </button>
                                        <button onClick={() => handleRejectRequest(request._id)} className="p-1.5 bg-gray-700 text-gray-300 rounded-full hover:bg-red-500 hover:text-white transition shadow-lg transition-transform hover:scale-105">
                                            <X size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {requests.length === 0 && <div className="text-center text-gray-500 py-8 text-sm">No pending requests</div>}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-black">
                {selectedChat ? (
                    <>
                        {/* Header */}
                        <div className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-gray-900/30">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center font-bold">
                                    {selectedChat.partner.username?.[0].toUpperCase() || "U"}
                                </div>
                                <div>
                                    <h2 className="font-bold">{selectedChat.partner.username || "User"}</h2>
                                    <span className="flex items-center gap-1.5 text-xs text-green-400">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> Online
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                {(selectedChat.activeSessionInitiator === user._id) && (
                                    <button
                                        onClick={() => setShowCompleteModal(true)}
                                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition flex items-center gap-1"
                                    >
                                        <Check size={16} /> Complete Session
                                    </button>
                                )}
                                <button
                                    onClick={handleVideoCall}
                                    className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"
                                    title="Start Video Call (Google Meet)"
                                >
                                    <Video size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
                            {!isLoading ? (
                                messages.map((msg, index) => {
                                    const isMe = msg.sender === user._id; // Updated to _id
                                    const showAvatar = !isMe && (index === 0 || messages[index - 1].sender !== msg.sender);

                                    return (
                                        <div key={index} className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
                                            {!isMe && (
                                                <div className={`w-8 h-8 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center text-xs font-bold ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
                                                    {selectedChat.partner.username?.[0].toUpperCase()}
                                                </div>
                                            )}
                                            <div
                                                className={`max-w-[70%] px-4 py-2.5 shadow-sm relative group text-sm ${isMe
                                                    ? "bg-blue-600 text-white rounded-2xl rounded-tr-sm"
                                                    : "bg-[#262626] text-white rounded-2xl rounded-tl-sm"
                                                    }`}
                                            >
                                                {msg.fileUrl ? (
                                                    msg.fileType?.startsWith("image/") ? (
                                                        <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">
                                                            <img
                                                                src={msg.fileUrl}
                                                                alt="Shared content"
                                                                className="max-w-full rounded-lg mb-1 cursor-zoom-in hover:brightness-90 transition"
                                                                style={{ maxHeight: "200px" }}
                                                            />
                                                        </a>
                                                    ) : (
                                                        <a
                                                            href={msg.fileUrl.replace("/upload/", "/upload/fl_attachment/")}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-2 bg-black/20 p-2 rounded-lg hover:bg-black/30 transition"
                                                        >
                                                            <File size={20} />
                                                            <span className="underline truncate max-w-[150px]">
                                                                {msg.fileUrl.endsWith('.pdf') ? 'Download PDF' : 'Download File'}
                                                            </span>
                                                        </a>
                                                    )
                                                ) : (
                                                    <p className="leading-relaxed">{msg.content}</p>
                                                )}
                                                <span className={`text-[10px] opacity-0 group-hover:opacity-60 transition-opacity absolute bottom-0 ${isMe ? '-left-12' : '-right-12'} translate-y-[-50%] text-gray-400 whitespace-nowrap`}>
                                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="flex justify-center items-center h-full">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-black">
                            <form onSubmit={handleSendMessage} className="flex items-center gap-3 relative">
                                <button
                                    type="button"
                                    onClick={handleFileUpload}
                                    className="text-gray-400 hover:text-white transition p-2 hover:bg-gray-900 rounded-full"
                                    title="Send File"
                                >
                                    <Paperclip size={22} />
                                </button>
                                <input
                                    type="text"
                                    className="flex-1 bg-[#262626] text-white rounded-full px-5 py-3 focus:outline-none focus:ring-1 focus:ring-gray-700 placeholder-gray-500 transition-all"
                                    placeholder="Message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                {isUploading && (
                                    <div className="absolute bottom-full mb-2 left-0 right-0 flex justify-center">
                                        <div className="bg-gray-800 text-white text-xs px-3 py-1 rounded-full shadow-lg flex items-center gap-2 animate-pulse">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                            Sending file...
                                        </div>
                                    </div>
                                )}
                                {newMessage.trim() && (
                                    <button
                                        type="submit"
                                        disabled={isUploading}
                                        className="text-blue-500 font-semibold hover:text-blue-400 transition pr-2 text-sm disabled:opacity-50"
                                    >
                                        Send
                                    </button>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                        <div className="w-24 h-24 rounded-full border-2 border-gray-800 flex items-center justify-center mb-4">
                            <MessageSquare size={48} className="opacity-50" />
                        </div>
                        <h2 className="text-xl font-semibold text-white mb-2">Your Messages</h2>
                        <p className="text-sm">Send private photos and messages to a friend or group.</p>
                    </div>
                )}
            </div>
            {/* Complete Session Modal */}
            <AnimatePresence>
                {showCompleteModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-gray-900 border border-white/10 p-6 rounded-3xl w-full max-w-sm shadow-2xl text-center"
                        >
                            <h2 className="text-xl font-bold text-white mb-2">Rate & Pay</h2>
                            <p className="text-gray-400 text-sm mb-6">
                                1 credit will be transferred to the tutor. Please rate your experience.
                            </p>

                            <div className="flex justify-center gap-2 mb-6">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className={`transform transition-all duration-200 hover:scale-110 p-1 ${rating >= star ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]' : 'text-gray-600 hover:text-gray-500'}`}
                                    >
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill={rating >= star ? "currentColor" : "none"} stroke="currentColor" strokeWidth={rating >= star ? "0" : "1.5"} strokeLinecap="round" strokeLinejoin="round">
                                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                        </svg>
                                    </button>
                                ))}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowCompleteModal(false)}
                                    className="flex-1 py-3 text-gray-400 hover:text-white font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCompleteSession}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition shadow-lg shadow-green-900/20"
                                >
                                    Confirm
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Meet Link Input Modal */}
            <AnimatePresence>
                {showLinkInput && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-[#262626] border border-gray-700 p-6 rounded-2xl w-full max-w-md shadow-2xl relative"
                        >
                            <button
                                onClick={() => setShowLinkInput(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex flex-col items-center mb-6">
                                <div className="w-12 h-12 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center mb-3">
                                    <Video size={24} />
                                </div>
                                <h3 className="text-lg font-bold text-white">Paste Meeting Link</h3>
                                <p className="text-gray-400 text-sm text-center mt-1">
                                    Copy the link from the Google Meet tab and paste it here to send it instantly.
                                </p>
                            </div>

                            <form onSubmit={submitMeetingLink} className="space-y-4">
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder="Paste https://meet.google.com/..."
                                    value={tempLink}
                                    onChange={(e) => setTempLink(e.target.value)}
                                    className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                />
                                <button
                                    type="submit"
                                    disabled={!tempLink.trim()}
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-900/20"
                                >
                                    Send Link
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
}
