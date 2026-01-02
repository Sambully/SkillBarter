import API from "../api";

const startSession = async () => {
    const res = await API.post("/sessions/start", {
        learnerId: currentUserId,
        teacherId: selectedUserId
    });

    window.open(res.data.meetLink, "_blank");
};