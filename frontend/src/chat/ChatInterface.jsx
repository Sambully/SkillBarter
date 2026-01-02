import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import { fetchChat, baseURL } from "../api";

const socket = io(baseURL);

export default function ChatInterface({ recipient, onClose }) {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const scrollRef = useRef();

    useEffect(() => {
        if (!user || !recipient) return;

        // Join room (my user ID)
        socket.emit("join_room", user.id);

        // Fetch history
        fetchChat(recipient._id).then(res => setMessages(res.data));

        // Listen for messages
        socket.on("receive_message", (data) => {
            if (
                (data.sender === recipient._id && data.recipient === user.id) ||
                (data.sender === user.id && data.recipient === recipient._id)
            ) {
                setMessages((prev) => [...prev, data]);
                scrollToBottom();
            }
        });

        return () => socket.off("receive_message");
    }, [user, recipient]);

    const sendMessage = () => {
        if (!input.trim()) return;

        const data = {
            sender: user.id,
            recipient: recipient._id,
            content: input,
            timestamp: new Date()
        };

        socket.emit("send_message", data);
        setMessages((prev) => [...prev, data]); // Optimistic update
        setInput("");
        scrollToBottom();
    };

    const scrollToBottom = () => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const createMeet = () => {
        const link = `https://meet.google.com/new`;
        window.open(link, "_blank");

        // Optionally send the link as a message
        const data = {
            sender: user.id,
            recipient: recipient._id,
            content: `Lets meet! ${link}`,
            timestamp: new Date()
        };
        socket.emit("send_message", data);
        setMessages((prev) => [...prev, data]);
    };

    return (
        <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-gray-900 border border-gray-700 rounded-xl shadow-2xl flex flex-col overflow-hidden z-50">
            {/* Header */}
            <div className="bg-gray-800 p-3 flex justify-between items-center border-b border-gray-700">
                <div>
                    <h3 className="text-white font-bold">{recipient.username}</h3>
                    <span className="text-xs text-green-400">Online</span>
                </div>
                <div className="flex gap-2">
                    <button onClick={createMeet} className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded">
                        Meet
                    </button>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-900 scrollbar-thin scrollbar-thumb-gray-700">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                        <p>No messages yet.</p>
                        <p className="text-xs">Say Hi!</p>
                    </div>
                )}
                {messages.map((msg, i) => (
                    <div key={i} className={`flex mb-2 ${msg.sender === user.id ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] p-2 rounded-lg text-sm ${msg.sender === user.id
                            ? "bg-blue-600 text-white rounded-br-none"
                            : "bg-gray-700 text-gray-200 rounded-bl-none"
                            }`}>
                            {msg.content}
                            {msg.content.includes("https://meet.google.com") && (
                                <a href={msg.content.match(/https:\/\/[^\s]+/)[0]} target="_blank" rel="noreferrer" className="block mt-2 text-xs underline text-yellow-300">
                                    Join Meeting
                                </a>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={scrollRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-gray-800 border-t border-gray-700 flex gap-2">
                <input
                    className="flex-1 bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none"
                    placeholder="Type a message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button
                    onClick={sendMessage}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-bold"
                >
                    Send
                </button>
            </div>
        </div>
    );
}
