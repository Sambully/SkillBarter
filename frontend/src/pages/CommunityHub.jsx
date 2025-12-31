import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { MessageSquare, ThumbsUp, Send, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = "http://localhost:5000/community";

export default function CommunityHub() {
    const { user } = useAuth();
    const [questions, setQuestions] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newQuestion, setNewQuestion] = useState("");
    const [answeringTo, setAnsweringTo] = useState(null); // Question ID being answered
    const [answerContent, setAnswerContent] = useState("");
    const [expandedComments, setExpandedComments] = useState({}); // { [questionId]: boolean }
    const [replyingTo, setReplyingTo] = useState(null); // Answer ID being replied to
    const [replyContent, setReplyContent] = useState("");

    const fetchQuestions = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/all`);
            setQuestions(data);
        } catch (error) {
            console.error("Failed to fetch questions", error);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, []);

    const handlePostQuestion = async () => {
        if (!newQuestion.trim()) return;
        try {
            await axios.post(`${API_URL}/create`, { userId: user.id, content: newQuestion });
            setNewQuestion("");
            setShowAddModal(false);
            fetchQuestions();
        } catch (error) {
            console.error("Failed to post question", error);
        }
    };

    const handlePostAnswer = async (questionId) => {
        if (!answerContent.trim()) return;
        try {
            await axios.post(`${API_URL}/answer/${questionId}`, { userId: user.id, content: answerContent });
            setAnswerContent("");
            setAnsweringTo(null);
            fetchQuestions();
            // Automatically expand comments to show the new answer
            setExpandedComments(prev => ({ ...prev, [questionId]: true }));
        } catch (error) {
            console.error("Failed to post answer", error);
        }
    };

    const handleUpvote = async (answerId) => {
        try {
            await axios.post(`${API_URL}/upvote/${answerId}`, { userId: user.id });
            fetchQuestions(); // Refresh to show new upvote count
        } catch (error) {
            console.error("Failed to upvote", error);
            if (error.response?.status === 400) {
                alert("You already upvoted this!");
            }
        }
    };

    const handleReply = async (answerId) => {
        if (!replyContent.trim()) return;
        try {
            await axios.post(`${API_URL}/reply/${answerId}`, { userId: user.id, content: replyContent });
            setReplyContent("");
            setReplyingTo(null);
            fetchQuestions();
        } catch (error) {
            console.error("Failed to reply", error);
        }
    };

    const toggleComments = (questionId) => {
        setExpandedComments(prev => ({
            ...prev,
            [questionId]: !prev[questionId]
        }));
    };

    return (
        <div className="w-full min-h-screen bg-black text-white p-6 md:p-12 md:pl-32">
            <div className="max-w-4xl mx-auto relative">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                            Community Hub
                        </h1>
                        <p className="text-gray-400 mt-2">Ask doubts, share knowledge, earn credits.</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-bold flex items-center gap-2 transition-all"
                    >
                        <Plus size={20} /> Add Your Doubt
                    </button>
                </div>

                <div className="space-y-6">
                    {questions.map((q) => (
                        <div key={q._id} className="bg-gray-900 border border-white/10 p-6 rounded-2xl">
                            <div className="flex gap-4 mb-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-sm">
                                    {q.author?.username?.[0]?.toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{q.author?.username}</h3>
                                    <p className="text-gray-400 text-xs">
                                        {new Date(q.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <p className="text-gray-200 text-lg mb-6">{q.content}</p>

                            <div className="flex gap-4 border-t border-white/10 pt-4">
                                <button
                                    onClick={() => setAnsweringTo(answeringTo === q._id ? null : q._id)}
                                    className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium"
                                >
                                    <MessageSquare size={18} /> Answer Now
                                </button>
                                <button
                                    onClick={() => toggleComments(q._id)}
                                    className="flex items-center gap-2 text-gray-400 hover:text-white transition"
                                >
                                    Comments ({q.answers?.length || 0})
                                </button>
                            </div>

                            {/* Answer Input */}
                            <AnimatePresence>
                                {answeringTo === q._id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="mt-4 overflow-hidden"
                                    >
                                        <div className="flex gap-2">
                                            <textarea
                                                className="w-full bg-black/50 border border-white/10 p-3 rounded-xl focus:outline-none focus:border-blue-500 text-sm"
                                                placeholder="Write your answer..."
                                                value={answerContent}
                                                onChange={(e) => setAnswerContent(e.target.value)}
                                            />
                                            <button
                                                onClick={() => handlePostAnswer(q._id)}
                                                className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-xl transition self-end"
                                            >
                                                <Send size={18} />
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Answers List */}
                            <AnimatePresence>
                                {expandedComments[q._id] && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="mt-6 space-y-4 pl-4 border-l-2 border-white/5 overflow-hidden"
                                    >
                                        {q.answers.map((ans) => (
                                            <div key={ans._id} className="bg-white/5 p-4 rounded-xl">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-sm text-blue-300">{ans.author?.username}</span>
                                                        <span className="text-xs text-gray-500">{new Date(ans.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                <p className="text-gray-300 text-sm mb-3">{ans.content}</p>

                                                <div className="flex items-center gap-4">
                                                    <button
                                                        onClick={() => handleUpvote(ans._id)}
                                                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-green-400 transition"
                                                    >
                                                        <ThumbsUp size={14} className={ans.upvotedBy?.includes(user?.id) ? "text-green-500 fill-green-500" : ""} />
                                                        {ans.upvotedBy?.length || 0} Upvotes
                                                    </button>
                                                    <button
                                                        onClick={() => setReplyingTo(replyingTo === ans._id ? null : ans._id)}
                                                        className="text-xs text-gray-400 hover:text-blue-400 transition"
                                                    >
                                                        Reply
                                                    </button>
                                                </div>

                                                {/* Reply Input */}
                                                {replyingTo === ans._id && (
                                                    <div className="mt-3 flex gap-2">
                                                        <input
                                                            className="w-full bg-black/30 border border-white/10 p-2 rounded-lg focus:outline-none focus:border-blue-500 text-xs"
                                                            placeholder="Reply to this answer..."
                                                            value={replyContent}
                                                            onChange={(e) => setReplyContent(e.target.value)}
                                                        />
                                                        <button
                                                            onClick={() => handleReply(ans._id)}
                                                            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition"
                                                        >
                                                            <Send size={14} />
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Nested Replies */}
                                                {ans.replies?.length > 0 && (
                                                    <div className="mt-3 space-y-2 pl-3 border-l border-white/10">
                                                        {ans.replies.map((rep, idx) => (
                                                            <div key={idx} className="text-xs text-gray-400">
                                                                <span className="text-purple-300 font-semibold mr-2">{rep.author?.username}:</span>
                                                                {rep.content}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {q.answers.length === 0 && (
                                            <p className="text-center text-gray-500 text-sm py-2">No answers yet. Be the first!</p>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                    {questions.length === 0 && (
                        <div className="text-center text-gray-500 mt-20">
                            <h3 className="text-xl font-bold mb-2">No doubts asked yet.</h3>
                            <p>Be the first to start a discussion!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Question Modal */}
            <AnimatePresence>
                {showAddModal && (
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
                            className="bg-gray-900 border border-white/10 p-6 rounded-3xl w-full max-w-lg shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-white">Ask the Community</h2>
                                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                                    <X size={24} />
                                </button>
                            </div>
                            <textarea
                                className="w-full h-40 bg-black/50 border border-white/10 p-4 rounded-xl focus:outline-none focus:border-blue-500 text-white mb-6 resize-none"
                                placeholder="What's on your mind? Describe your doubt clearly..."
                                value={newQuestion}
                                onChange={(e) => setNewQuestion(e.target.value)}
                            />
                            <button
                                onClick={handlePostQuestion}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white p-4 rounded-xl font-bold transition-all"
                            >
                                Post Question
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
