import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Phone, Hash, BookOpen, GraduationCap, Grip, Save, X, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function EditProfile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general"); // general | skills

  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    phone: user?.phone || "",
    gender: user?.gender || "",
    bio: user?.bio || "",
  });

  const [skills, setSkills] = useState(user?.skills || []);
  const [newSkill, setNewSkill] = useState({ name: "", level: 1, type: "teach" });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const addSkill = () => {
    if (!newSkill.name.trim()) return;
    setSkills([...skills, { ...newSkill, name: newSkill.name.trim() }]);
    setNewSkill({ name: "", level: 1, type: "teach" });
  };

  const removeSkill = (index) =>
    setSkills(skills.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUser({ ...formData, skills });
      navigate("/profile");
    } catch (error) {
      alert("Failed to update profile");
    }
    setLoading(false);
  };

  const teachSkills = skills.filter(s => s.type === "teach");
  const learnSkills = skills.filter(s => s.type === "learn");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#0a0a0a] border border-gray-800 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
      >
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-[#111] border-r border-gray-800 p-6 flex flex-col">
          <div className="mb-8 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold shadow-lg shadow-blue-900/20 mb-3">
              {formData.username?.[0]?.toUpperCase()}
            </div>
            <h2 className="text-white font-bold text-lg truncate">{formData.username}</h2>
            <p className="text-gray-500 text-xs">Edit your profile</p>
          </div>

          <div className="space-y-2 flex-1">
            <TabButton
              active={activeTab === "general"}
              onClick={() => setActiveTab("general")}
              icon={User}
              label="General Info"
            />
            <TabButton
              active={activeTab === "skills"}
              onClick={() => setActiveTab("skills")}
              icon={BookOpen}
              label="Skills & Bio"
            />
          </div>

          <div className="mt-auto pt-6 border-t border-gray-800 space-y-3">
            <button
              onClick={handleSubmit}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={18} /> Save Changes
                </>
              )}
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-medium transition flex items-center justify-center gap-2"
            >
              <X size={18} /> Cancel
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-black/50 p-6 md:p-8 overflow-y-auto custom-scrollbar">
          <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            {activeTab === "general" ? "General Information" : "Manage Skills"}
          </h1>

          <AnimatePresence mode="wait">
            {activeTab === "general" ? (
              <motion.div
                key="general"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 max-w-lg"
              >
                <InputGroup icon={User} label="Username" name="username" value={formData.username} onChange={handleChange} />
                <InputGroup icon={Mail} label="Email" name="email" type="email" value={formData.email} onChange={handleChange} disabled />

                <div className="grid grid-cols-2 gap-4">
                  <InputGroup icon={Phone} label="Phone" name="phone" value={formData.phone} onChange={handleChange} />

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                      <Hash size={14} className="text-blue-500" /> Gender
                    </label>
                    <div className="relative">
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full bg-[#1a1a1a] border border-gray-800 text-white rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition appearance-none"
                      >
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                        ▼
                      </div>
                    </div>
                  </div>
                </div>

              </motion.div>
            ) : (
              <motion.div
                key="skills"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {/* Bio Section */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Bio</label>
                  <textarea
                    name="bio"
                    rows="3"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us about yourself..."
                    className="w-full bg-[#1a1a1a] border border-gray-800 text-white rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition resize-none"
                  />
                </div>

                {/* Add Skill */}
                <div className="p-5 bg-gradient-to-br from-blue-900/10 to-purple-900/10 border border-blue-500/20 rounded-2xl">
                  <h3 className="text-sm font-bold text-blue-400 mb-4 flex items-center gap-2">
                    <Plus size={16} /> Add New Skill
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    <input
                      className="md:col-span-5 bg-[#1a1a1a] border border-gray-700 text-white rounded-xl px-4 py-2.5 focus:border-blue-500 outline-none"
                      placeholder="e.g. React, Guitar, Spanish"
                      value={newSkill.name}
                      onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                      onKeyDown={(e) => e.key === "Enter" && addSkill()}
                    />
                    <select
                      className="md:col-span-4 bg-[#1a1a1a] border border-gray-700 text-white rounded-xl px-4 py-2.5 focus:border-blue-500 outline-none"
                      value={newSkill.type}
                      onChange={(e) => setNewSkill({ ...newSkill, type: e.target.value })}
                    >
                      <option value="teach">🎓 I can Teach</option>
                      <option value="learn">📚 I want to Learn</option>
                    </select>
                    <div className="md:col-span-2 relative">
                      <input
                        type="number"
                        min="1" max="5"
                        className="w-full bg-[#1a1a1a] border border-gray-700 text-white rounded-xl px-4 py-2.5 focus:border-blue-500 outline-none pl-8"
                        value={newSkill.level}
                        onChange={(e) => setNewSkill({ ...newSkill, level: Number(e.target.value) })}
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">Lv</span>
                    </div>
                    <button
                      onClick={addSkill}
                      className="md:col-span-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl flex items-center justify-center transition"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>

                {/* Skill Lists */}
                <div className="grid md:grid-cols-2 gap-6">
                  <SkillList
                    title="Skills I Can Teach"
                    skills={teachSkills}
                    icon={GraduationCap}
                    color="text-green-400"
                    bg="bg-green-500/10 border-green-500/20"
                    badge="bg-green-500/20 text-green-300"
                    onRemove={(idx) => {
                      // Find correct index in main array
                      const realIdx = skills.findIndex(s => s === teachSkills[idx]);
                      removeSkill(realIdx);
                    }}
                  />
                  <SkillList
                    title="Skills I Want to Learn"
                    skills={learnSkills}
                    icon={BookOpen}
                    color="text-orange-400"
                    bg="bg-orange-500/10 border-orange-500/20"
                    badge="bg-orange-500/20 text-orange-300"
                    onRemove={(idx) => {
                      const realIdx = skills.findIndex(s => s === learnSkills[idx]);
                      removeSkill(realIdx);
                    }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

/* --- Components --- */

const TabButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${active ? "bg-blue-600/10 text-blue-400 border border-blue-500/20" : "text-gray-400 hover:bg-gray-800 hover:text-white"
      }`}
  >
    <Icon size={18} />
    <span className="font-medium text-sm">{label}</span>
  </button>
);

const InputGroup = ({ icon: Icon, label, disabled, ...props }) => (
  <div className="space-y-2">
    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
      <Icon size={14} className="text-blue-500" /> {label}
    </label>
    <input
      {...props}
      disabled={disabled}
      className={`w-full bg-[#1a1a1a] border border-gray-800 text-white rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    />
  </div>
);

const SkillList = ({ title, skills, icon: Icon, color, bg, badge, onRemove }) => (
  <div className={`p-4 rounded-2xl border ${bg}`}>
    <h4 className={`font-bold ${color} mb-3 flex items-center gap-2`}>
      <Icon size={16} /> {title} <span className="text-xs opacity-60">({skills.length})</span>
    </h4>
    <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
      {skills.length > 0 ? (
        skills.map((s, i) => (
          <div key={i} className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-white/5 hover:border-white/10 transition group">
            <div className="flex items-center gap-3">
              <span className="font-medium text-gray-200">{s.name}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${badge}`}>Lv {s.level}</span>
            </div>
            <button onClick={() => onRemove(i)} className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition">
              <Trash2 size={14} />
            </button>
          </div>
        ))
      ) : (
        <div className="text-center py-6 text-gray-600 text-sm italic">
          No skills added yet.
        </div>
      )}
    </div>
  </div>
);
