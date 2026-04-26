import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const API_KEY = process.env.VITE_OPENROUTER_API_KEY;

async function checkModels() {
    console.log("Checking OpenRouter Models...");
    console.log("API Key found:", API_KEY ? "Yes" : "No");

    try {
        const response = await fetch("https://openrouter.ai/api/v1/models");
        const data = await response.json();
        
        const freeModels = data.data
            .filter(m => m.id.includes(':free'))
            .map(m => m.id);

        console.log("\n--- AVAILABLE FREE MODELS ---");
        freeModels.forEach(m => console.log(m));
        
        console.log("\n--- TESTING CHAT WITH TOP MODEL ---");
        const testModel = freeModels[0] || "google/gemma-3-4b-it:free";
        console.log(`Testing with: ${testModel}`);

        const chatResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: testModel,
                messages: [{ role: "user", content: "Hi" }]
            })
        });

        const chatData = await chatResponse.json();
        console.log("\nChat Response Status:", chatResponse.status);
        console.log("Chat Response Data:", JSON.stringify(chatData, null, 2));

    } catch (err) {
        console.error("Error checking models:", err);
    }
}

checkModels();
