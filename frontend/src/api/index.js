import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000" });

API.interceptors.request.use((req) => {
    if (localStorage.getItem("token")) {
        req.headers.Authorization = `Bearer ${localStorage.getItem("token")}`;
    }
    return req;
});

export const signIn = (formData) => API.post("/auth/signin", formData);
export const signUp = (formData) => API.post("/auth/signup", formData);
export const fetchMatches = (query) => API.post("/match", { query });
export const fetchGraph = () => API.get("/graph");
export const fetchChat = (userId) => API.get(`/chat/${userId}`);
export const fetchUser = (userId) => API.get(`/user/${userId}`); // Need this API potentially

export default API;
