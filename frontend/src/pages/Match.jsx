const startSession = async () => {
    const res = await axios.post("http://localhost:5000/sessions/start", {
        learnerId: currentUserId,
        teacherId: selectedUserId
    });

    window.open(res.data.meetLink, "_blank");
};