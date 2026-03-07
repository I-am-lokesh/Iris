
import OpenAI from 'openai';

const sessionConfig = JSON.stringify({
    session: {
        type: "realtime",
        model: "gpt-realtime",
        audio: {
            output: {
                voice: "marin",
            },
        },
    },
});
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function GET(req : Request) {
    try {
        const response = await fetch(
            "https://api.openai.com/v1/realtime/client_secrets",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: sessionConfig,
            }
        );

        const data = await response.json();
        return new Response(JSON.stringify(data), { status: 200 });
    } catch (error) {
        console.error("Token generation error:", error);
        return new Response(JSON.stringify({ error: "Failed to generate token" }), { status: 500 });
    }
}