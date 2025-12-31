import axios from "axios";

export async function embed(text) {
    try {
        const res = await axios.post(
            "https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent",
            { content: { parts: [{ text }] } },
            { params: { key: process.env.GEMINI_KEY?.trim() } }
        );
        return res.data.embedding.values;
    } catch (error) {
        console.error("Embedding API Error:", error.response?.data || error.message);
        return [];
    }
}

export async function generateBio(skills) {
    try {
        const teaches = skills.filter(s => s.type === 'teach').map(s => s.name).join(", ");
        const learns = skills.filter(s => s.type === 'learn').map(s => s.name).join(", ");

        const prompt = `Generate a short, engaging professional bio (max 50 words) for a user who can teach: ${teaches} and wants to learn: ${learns}. The bio should be friendly and encourage knowledge exchange.`;

        const res = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_KEY?.trim()}`,
            {
                contents: [{
                    parts: [{ text: prompt }]
                }]
            }
        );

        const bio = res.data.candidates[0].content.parts[0].text;
        console.log("Generated Bio:", bio);
        return bio;
    } catch (error) {
        if (error.response) {
            console.error("Bio generation API Error:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("Bio generation failed (no response):", error.message);
        }
        return "";
    }
}
