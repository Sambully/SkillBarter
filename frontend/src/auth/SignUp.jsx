import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signUp } from "../api";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, ArrowLeft, Check, Sparkles } from "lucide-react";

// Components
const InputField = ({ label, value, onChange, type = "text", placeholder }) => (
    <div className="mb-4">
        <label className="block text-gray-400 text-sm mb-2 ml-1">{label}</label>
        <input
            className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all font-medium"
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
        />
    </div>
);

const StepIndicator = ({ currentStep, totalSteps }) => (
    <div className="flex gap-2 mb-8 justify-center">
        {[...Array(totalSteps)].map((_, i) => (
            <motion.div
                key={i}
                initial={false}
                animate={{
                    backgroundColor: i + 1 <= currentStep ? "#3b82f6" : "#374151",
                    width: i + 1 === currentStep ? 24 : 8
                }}
                className="h-2 rounded-full"
            />
        ))}
    </div>
);

const Chip = ({ label, onDelete }) => (
    <span className="flex items-center gap-2 bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm border border-blue-500/30">
        {label}
        <button onClick={onDelete} className="hover:text-white">×</button>
    </span>
);

export default function SignUp() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [teachInput, setTeachInput] = useState("");
    const [learnInput, setLearnInput] = useState("");
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        bio: "",
        skills: []
    });

    const handleAddSkill = (type, e) => {
        const inputVal = type === 'teach' ? teachInput : learnInput;
        const setInput = type === 'teach' ? setTeachInput : setLearnInput;

        if (e.key === 'Enter' && inputVal.trim()) {
            e.preventDefault();
            setFormData(prev => ({
                ...prev,
                skills: [...prev.skills, { name: inputVal.trim(), type, level: 1 }]
            }));
            setInput("");
        }
    };

    // ... inside the return render ...
    // Update the inputs to use teachInput and learnInput respectively

    // Teach Input
    // <input value={teachInput} onChange={(e) => setTeachInput(e.target.value)} ... />

    // Learn Input
    // <input value={learnInput} onChange={(e) => setLearnInput(e.target.value)} ... />

    const removeSkill = (index) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const { data } = await signUp(formData);
            localStorage.setItem("token", data.token);
            navigate("/dashboard"); // Changed to dashboard based on new routing
        } catch (error) {
            console.error(error);
            alert("Signup failed! " + (error.response?.data?.message || ""));
        }
        setLoading(false);
    };

    const variants = {
        enter: (direction) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (direction) => ({ x: direction > 0 ? -50 : 50, opacity: 0 })
    };

    return (
        <div className="w-full min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[128px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-[128px]" />

            <div className="w-full max-w-lg bg-gray-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative z-10">
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Create Account
                    </h2>
                    <p className="text-gray-400 text-sm mt-2">Join the knowledge exchange</p>
                </div>

                <StepIndicator currentStep={step} totalSteps={3} />

                <AnimatePresence mode="wait" custom={1}>
                    {step === 1 && (
                        <motion.div key="step1" variants={variants} initial="enter" animate="center" exit="exit" custom={1} className="flex flex-col">
                            <InputField
                                label="Username"
                                placeholder="e.g. CodeMaster99"
                                value={formData.username}
                                onChange={e => setFormData({ ...formData, username: e.target.value })}
                            />
                            <InputField
                                label="Email"
                                type="email"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                            <InputField
                                label="Password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                            />
                            <button
                                onClick={() => setStep(2)}
                                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all w-full"
                            >
                                Continue <ArrowRight size={20} />
                            </button>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div key="step2" variants={variants} initial="enter" animate="center" exit="exit" custom={1} className="flex flex-col">
                            <h3 className="text-lg font-semibold text-white mb-4">Your Skills</h3>

                            <div className="mb-6">
                                <label className="block text-gray-400 text-sm mb-2">What can you Teach?</label>
                                <input
                                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-green-500"
                                    placeholder="Type & Enter (e.g. React, Physics)"
                                    value={teachInput}
                                    onChange={(e) => setTeachInput(e.target.value)}
                                    onKeyDown={(e) => handleAddSkill('teach', e)}
                                />
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {formData.skills.filter(s => s.type === 'teach').map((s, i) => (
                                        <Chip key={i} label={s.name} onDelete={() => removeSkill(formData.skills.indexOf(s))} />
                                    ))}
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-gray-400 text-sm mb-2">What do you want to Learn?</label>
                                <input
                                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500"
                                    placeholder="Type & Enter (e.g. Calculus, Pottery)"
                                    value={learnInput}
                                    onChange={(e) => setLearnInput(e.target.value)}
                                    onKeyDown={(e) => handleAddSkill('learn', e)}
                                />
                                <div className="flex flex-wrap gap-2 mt-3"> {/* Removed block, flex wrap handles it */}
                                    {formData.skills.filter(s => s.type === 'learn').map((s, i) => (
                                        <span key={i} className="flex items-center gap-2 bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm border border-purple-500/30">
                                            {s.name}
                                            <button onClick={() => removeSkill(formData.skills.indexOf(s))} className="hover:text-white">×</button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4 mt-4">
                                <button onClick={() => setStep(1)} className="p-4 rounded-xl text-gray-400 hover:text-white bg-white/5 hover:bg-white/10">
                                    <ArrowLeft size={20} />
                                </button>
                                <button onClick={() => setStep(3)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all">
                                    Almost Done <ArrowRight size={20} />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div key="step3" variants={variants} initial="enter" animate="center" exit="exit" custom={1} className="flex flex-col">
                            <div className="mb-6">
                                <label className="block text-gray-400 text-sm mb-2 ml-1">Bio (Optional)</label>
                                <textarea
                                    className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all font-medium h-32 resize-none"
                                    placeholder="Tell us a bit about yourself..."
                                    value={formData.bio}
                                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                />
                            </div>

                            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-4 rounded-xl border border-blue-500/20 mb-6 flex items-start gap-3">
                                <Sparkles className="text-yellow-400 shrink-0 mt-1" size={20} />
                                <p className="text-sm text-gray-300">
                                    Our AI will use your skills and bio to find your perfect knowledge match instantly.
                                </p>
                            </div>

                            <div className="flex gap-4 mt-4">
                                <button onClick={() => setStep(2)} className="p-4 rounded-xl text-gray-400 hover:text-white bg-white/5 hover:bg-white/10">
                                    <ArrowLeft size={20} />
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                                >
                                    {loading ? "Creating..." : "Launch Dashboard"} <Check size={20} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mt-8 text-center border-t border-white/10 pt-6">
                    <p className="text-gray-400">
                        Already have an account? <Link to="/signin" className="text-blue-400 hover:text-blue-300 font-medium ml-1">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
