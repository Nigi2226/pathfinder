import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api, { collaborationAPI, BASE_URL } from '../services/api';
import { Search, Send, FileText, MessageSquare, X, User, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const CollaborationSpace = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [attachments, setAttachments] = useState([]);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        fetchChats();
        const userId = searchParams.get('userId');
        if (userId) {
            setupActiveChat(userId);
        }
    }, [searchParams]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (activeChat) {
            const interval = setInterval(() => fetchMessages(activeChat.user._id), 3000);
            return () => clearInterval(interval);
        }
    }, [activeChat]);

    const fetchChats = async () => {
        try {
            const res = await api.get('/collaboration/chats');
            setChats(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const setupActiveChat = async (userId) => {
        try {
            // Find in existing chats or verify user exists
            const res = await api.get(`/students/all`); // Simplified for mock
            const targetUser = res.data.find(u => u._id === userId);
            if (targetUser) {
                setActiveChat({ user: targetUser });
                fetchMessages(userId);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchMessages = async (userId) => {
        try {
            const res = await api.get(`/collaboration/messages/${userId}`);
            setMessages(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() && attachments.length === 0) return;

        try {
            await api.post('/collaboration/messages', {
                recipientId: activeChat.user._id,
                content: newMessage,
                attachments
            });
            setNewMessage('');
            setAttachments([]);
            fetchMessages(activeChat.user._id);
        } catch (err) {
            addToast('Failed to send message', 'error');
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Mock upload
            setAttachments([...attachments, {
                name: file.name,
                url: '#', // In real app, upload to S3/Firebase and get URL
                type: file.type
            }]);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-6 h-[calc(100vh-100px)]">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex h-full">

                {/* Sidebar: Group List / Contacts */}
                <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50/50">
                    <div className="p-6">
                        <h2 className="text-xl font-extrabold text-slate-800 mb-4 flex items-center gap-2">
                            <MessageSquare className="text-indigo-600" size={24} />
                            {user?.role === 'student' ? 'My Counselors' : 'Student Groups'}
                        </h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-3 space-y-1">
                        {loading ? (
                            <div className="p-4 text-center text-slate-400 text-sm">Loading...</div>
                        ) : chats.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <User className="text-slate-400" size={20} />
                                </div>
                                <p className="text-slate-400 text-xs">No active discussions yet.</p>
                            </div>
                        ) : (
                            chats.map((chat) => (
                                <button
                                    key={chat.user._id}
                                    onClick={() => setActiveChat(chat)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${activeChat?.user?._id === chat.user._id
                                        ? 'bg-white shadow-md shadow-indigo-50 border border-slate-100'
                                        : 'hover:bg-white/60'
                                        }`}
                                >
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                            {chat.user.profile.firstName[0]}{chat.user.profile.lastName[0]}
                                        </div>
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                    </div>
                                    <div className="flex-1 text-left min-w-0">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <span className="font-bold text-slate-800 text-sm truncate">
                                                {chat.user.profile.firstName} {chat.user.profile.lastName}
                                            </span>
                                            <span className="text-[10px] text-slate-400">
                                                {new Date(chat.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 truncate mr-2">
                                            {chat.lastMessage.sender === user._id ? 'You: ' : ''}{chat.lastMessage.content}
                                        </p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col bg-white">
                    {activeChat ? (
                        <>
                            {/* Chat Header */}
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                                        {activeChat.user.profile.firstName[0]}{activeChat.user.profile.lastName[0]}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800">
                                            {activeChat.user.profile.firstName} {activeChat.user.profile.lastName}
                                        </h3>
                                        <p className="text-[10px] text-green-500 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"><Clock size={20} /></button>
                                    <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"><Search size={20} /></button>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
                                {messages.map((m, idx) => {
                                    const isMe = m.sender === user._id;
                                    return (
                                        <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                            {!isMe && (
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-[10px] font-bold mr-3 mt-auto">
                                                    {activeChat.user.profile.firstName[0]}
                                                </div>
                                            )}
                                            <div className={`max-w-[70%] group relative`}>
                                                <div className={`rounded-2xl px-4 py-2 text-sm shadow-sm transition-all ${isMe
                                                    ? 'bg-indigo-600 text-white rounded-br-none'
                                                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                                                    }`}>
                                                    <p className="leading-relaxed">{m.content}</p>
                                                    {m.attachments && m.attachments.length > 0 && (
                                                        <div className="mt-2 space-y-1">
                                                            {m.attachments.map((file, fIdx) => (
                                                                <a
                                                                    key={fIdx}
                                                                    href={file.url}
                                                                    className={`flex items-center gap-2 p-2 rounded-lg text-xs border transition-colors ${isMe ? 'bg-white/10 border-white/20 hover:bg-white/20' : 'bg-slate-50 border-slate-100 hover:bg-slate-100'
                                                                        }`}
                                                                >
                                                                    <FileText size={14} />
                                                                    <span className="truncate max-w-[150px]">{file.name}</span>
                                                                </a>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <p className={`text-[9px] text-slate-400 mt-1 opacity-100 ${isMe ? 'text-right' : 'text-left'}`}>
                                                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-6 bg-white border-t border-slate-100">
                                {attachments.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {attachments.map((file, i) => (
                                            <div key={i} className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full text-xs text-slate-700">
                                                <FileText size={12} />
                                                <span className="max-w-[120px] truncate">{file.name}</span>
                                                <button onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))} className="hover:text-red-500">
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                                    <label className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 cursor-pointer transition-colors">
                                        <FileText size={20} />
                                        <input type="file" className="hidden" onChange={handleFileUpload} />
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Type your message..."
                                        className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim() && attachments.length === 0}
                                        className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all disabled:opacity-50 disabled:shadow-none"
                                    >
                                        <Send size={20} />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-slate-50/30">
                            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
                                <MessageSquare size={40} />
                            </div>
                            <h3 className="text-2xl font-extrabold text-slate-800 mb-2">Your Collaboration Hub</h3>
                            <p className="text-slate-500 max-w-sm">
                                {user?.role === 'student'
                                    ? "Select a counselor from the sidebar to start discussing your applications and get expert guidance."
                                    : "Pick a student group to provide feedback on their progress and answer their questions."}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CollaborationSpace;
