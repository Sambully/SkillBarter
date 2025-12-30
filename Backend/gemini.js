import axios from "axios";

export async function embed(text) {
    const res = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent",
        { content: { parts: [{ text }] } },
        { params: { key: process.env.GEMINI_KEY } }
    );
    return res.data.embedding.values;
}
