import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const avgRating = user?.ratings?.length
    ? (
        user.ratings.reduce((s, r) => s + r.star, 0) /
        user.ratings.length
      ).toFixed(1)
    : "No ratings";

  const teachSkills = user?.skills?.filter(s => s.type === "teach") || [];
  const learnSkills = user?.skills?.filter(s => s.type === "learn") || [];

  const InfoRow = ({ label, value }) => (
    <div className="flex justify-between border-b border-gray-700 pb-3">
      <span className="text-gray-400">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );

  const Stars = ({ level }) => (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <span
          key={i}
          className={i < level ? "text-yellow-400 text-sm" : "text-gray-600 text-sm"}
        >
          ★
        </span>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white flex justify-center pt-20 px-4">
      <div className="bg-gray-800 p-8 rounded-2xl w-full max-w-2xl border border-gray-700 shadow-xl">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">My Profile</h2>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/profile/edit")}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              Edit Profile
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
            >
              Dashboard
            </button>
          </div>
        </div>

        {/* Profile Info */}
        <div className="flex gap-6 mb-8 pb-6 border-b border-gray-700">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-4xl font-bold">
            {user?.username?.[0]?.toUpperCase()}
          </div>

          <div>
            <h3 className="text-2xl font-bold">{user?.username}</h3>
            <p className="text-gray-400">{user?.email}</p>
            <div className="flex gap-3 mt-2">
              <span className="text-yellow-400">⭐ {avgRating}</span>
              <span className="text-yellow-400 font-semibold">
                {user?.credits || 0} Credits
              </span>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-4 mb-6">
          {user?.gender && <InfoRow label="Gender" value={user.gender} />}
          {user?.phone && <InfoRow label="Phone" value={user.phone} />}
          {user?.bio && (
            <div className="border-b border-gray-700 pb-3">
              <span className="text-gray-400 block mb-2">Bio</span>
              <p className="leading-relaxed">{user.bio}</p>
            </div>
          )}
        </div>

        {/* Skills */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <SkillBox title="🎓 I Can Teach" color="text-green-400">
            {teachSkills.length
              ? teachSkills.map((s, i) => (
                  <div key={i} className="bg-gray-800 p-3 rounded-lg">
                    <span className="font-medium">{s.name}</span>
                    <Stars level={s.level} />
                  </div>
                ))
              : <Empty text="No teaching skills added yet" />}
          </SkillBox>

          <SkillBox title="📚 I Want to Learn" color="text-blue-400">
            {learnSkills.length
              ? learnSkills.map((s, i) => (
                  <div key={i} className="bg-gray-800 p-3 rounded-lg flex justify-between">
                    <span className="font-medium">{s.name}</span>
                    <span className="text-xs text-blue-400">Level {s.level}</span>
                  </div>
                ))
              : <Empty text="No learning interests added yet" />}
          </SkillBox>
        </div>

        <button
          onClick={logout}
          className="w-full bg-red-600 hover:bg-red-700 py-3 rounded-lg font-bold"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

/* Helpers */
const SkillBox = ({ title, color, children }) => (
  <div className="bg-gray-700/50 p-5 rounded-xl border border-gray-600">
    <h4 className={`text-lg font-semibold mb-4 ${color}`}>{title}</h4>
    <div className="space-y-3">{children}</div>
  </div>
);

const Empty = ({ text }) => (
  <p className="text-gray-400 text-sm italic">{text}</p>
);



