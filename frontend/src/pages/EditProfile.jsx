import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function EditProfile({ onCancel }) {
  const { user, updateUser } = useAuth();

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
    try {
      await updateUser({ ...formData, skills });
      onCancel();
    } catch {
      alert("Failed to update profile");
    }
  };

  const teachSkills = skills.filter(s => s.type === "teach");
  const learnSkills = skills.filter(s => s.type === "learn");

  return (
    <Page>
      <Header title="Edit Profile" onCancel={onCancel} />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Avatar name={formData.username} />

        <TwoCol>
          <Input label="Username *" name="username" value={formData.username} onChange={handleChange} required />
          <Input label="Email *" name="email" type="email" value={formData.email} onChange={handleChange} required />
        </TwoCol>

        <TwoCol>
          <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
          <Select label="Gender" name="gender" value={formData.gender} onChange={handleChange} />
        </TwoCol>

        <Textarea label="Bio" name="bio" value={formData.bio} onChange={handleChange} />

        {/* Skills */}
        <SkillManager
          newSkill={newSkill}
          setNewSkill={setNewSkill}
          addSkill={addSkill}
          teachSkills={teachSkills}
          learnSkills={learnSkills}
          removeSkill={removeSkill}
        />

        <Actions onCancel={onCancel} />
      </form>
    </Page>
  );
}

/* ---------------- Reusable Components ---------------- */

const Page = ({ children }) => (
  <div className="min-h-screen bg-gray-900 text-white flex justify-center pt-20 px-4">
    <div className="bg-gray-800 p-8 rounded-2xl w-full max-w-2xl border border-gray-700 shadow-xl">
      {children}
    </div>
  </div>
);

const Header = ({ title, onCancel }) => (
  <div className="flex justify-between items-center mb-6">
    <h2 className="text-3xl font-bold">{title}</h2>
    <button onClick={onCancel} className="text-gray-400 hover:text-gray-300">
      ✕ Cancel
    </button>
  </div>
);

const Avatar = ({ name }) => (
  <div className="flex flex-col items-center mb-6">
    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-4xl font-bold">
      {name?.[0]?.toUpperCase()}
    </div>
    <p className="text-gray-400 text-sm mt-2">Avatar based on username</p>
  </div>
);

const Input = ({ label, ...props }) => (
  <div>
    <label className="block text-gray-400 mb-2 text-sm">{label}</label>
    <input
      {...props}
      className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white"
    />
  </div>
);

const Select = ({ label, ...props }) => (
  <div>
    <label className="block text-gray-400 mb-2 text-sm">{label}</label>
    <select
      {...props}
      className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white"
    >
      <option value="">Select Gender</option>
      <option value="male">Male</option>
      <option value="female">Female</option>
      <option value="other">Other</option>
    </select>
  </div>
);

const Textarea = ({ label, ...props }) => (
  <div>
    <label className="block text-gray-400 mb-2 text-sm">{label}</label>
    <textarea
      {...props}
      rows="4"
      className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white resize-none"
    />
  </div>
);

const TwoCol = ({ children }) => (
  <div className="grid md:grid-cols-2 gap-4">{children}</div>
);

const SkillManager = ({ newSkill, setNewSkill, addSkill, teachSkills, learnSkills, removeSkill }) => (
  <div className="bg-gray-700/50 p-5 rounded-xl border border-gray-600">
    <h4 className="text-lg font-semibold mb-4">Manage Skills</h4>

    <div className="grid grid-cols-12 gap-3 mb-4">
      <input
        className="col-span-5 bg-gray-700 p-2 rounded"
        placeholder="Skill name"
        value={newSkill.name}
        onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
      />
      <select
        className="col-span-4 bg-gray-700 p-2 rounded"
        value={newSkill.type}
        onChange={(e) => setNewSkill({ ...newSkill, type: e.target.value })}
      >
        <option value="teach">Can Teach</option>
        <option value="learn">Want to Learn</option>
      </select>
      <input
        className="col-span-2 bg-gray-700 p-2 rounded"
        type="number"
        min="1"
        max="5"
        value={newSkill.level}
        onChange={(e) => setNewSkill({ ...newSkill, level: +e.target.value })}
      />
      <button type="button" onClick={addSkill} className="col-span-1 bg-green-600 rounded">+</button>
    </div>

    <SkillList title="🎓 Can Teach" skills={teachSkills} removeSkill={removeSkill} />
    <SkillList title="📚 Want to Learn" skills={learnSkills} removeSkill={removeSkill} />
  </div>
);

const SkillList = ({ title, skills, removeSkill }) => (
  <div className="mt-4">
    <p className="font-semibold mb-2">{title} ({skills.length})</p>
    {skills.length ? skills.map((s, i) => (
      <div key={i} className="flex justify-between bg-gray-700 p-2 rounded mb-2">
        <span>{s.name} (Lv {s.level})</span>
        <button onClick={() => removeSkill(i)} className="text-red-400">✕</button>
      </div>
    )) : <p className="text-gray-500 text-sm italic">No skills added</p>}
  </div>
);

const Actions = ({ onCancel }) => (
  <div className="flex gap-3 pt-4">
    <button type="submit" className="flex-1 bg-blue-600 py-3 rounded-lg font-bold">
      Save Changes
    </button>
    <button type="button" onClick={onCancel} className="flex-1 bg-gray-600 py-3 rounded-lg font-bold">
      Cancel
    </button>
  </div>
);
