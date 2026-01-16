const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');

// Try Gemini first, fallback to Groq if Gemini fails
async function generateWithGemini(message) {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY not configured');
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent(message);
    const response = await result.response;
    return response.text();
}

async function generateWithGroq(message) {
    if (!process.env.GROQ_API_KEY) {
        throw new Error('GROQ_API_KEY not configured');
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const chatCompletion = await groq.chat.completions.create({
        messages: [
            {
                role: "system",
                content: "You are FrameBot, a friendly and helpful creative assistant for FrameFlow - a social media platform for sharing photos and videos. Be conversational, helpful, and concise."
            },
            {
                role: "user",
                content: message
            }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        max_tokens: 1024
    });

    return chatCompletion.choices[0]?.message?.content || "I couldn't generate a response.";
}

router.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        console.log("------- AI CHAT REQUEST -------");
        console.log("Input Message:", message);

        let reply;
        let usedProvider = '';

        // Try Gemini first
        try {
            console.log("Trying Gemini...");
            reply = await generateWithGemini(message);
            usedProvider = 'gemini';
            console.log("Gemini response received");
        } catch (geminiError) {
            console.log("Gemini failed:", geminiError.message);

            // Fallback to Groq
            try {
                console.log("Falling back to Groq...");
                reply = await generateWithGroq(message);
                usedProvider = 'groq';
                console.log("Groq response received");
            } catch (groqError) {
                console.error("Groq also failed:", groqError.message);
                throw new Error("Both AI providers failed");
            }
        }

        console.log(`Response from ${usedProvider}:`, reply.substring(0, 50) + "...");

        res.json({
            success: true,
            reply: reply,
            provider: usedProvider
        });

    } catch (error) {
        console.error('AI_ERROR Details:', error);

        let errorMessage = "Failed to generate response";
        if (error.message?.includes("API key not valid")) {
            errorMessage = "Invalid API Key";
        } else if (error.message?.includes("User location is not supported")) {
            errorMessage = "AI service is not available in your region";
        } else if (error.message?.includes("Both AI providers failed")) {
            errorMessage = "All AI services are currently unavailable. Please try again later.";
        }

        res.status(500).json({
            success: false,
            message: errorMessage,
            error: error.message
        });
    }
});

module.exports = router;
