const https = require('https');
const path = require('path');
const fs = require('fs');

// Simple .env parser since we can't use external libs
const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const apiKeyMatch = envContent.match(/VITE_OPENROUTER_API_KEY=(.*)/);
const API_KEY = apiKeyMatch ? apiKeyMatch[1].trim() : null;

function request(url, options = {}, body = null) {
    return new Promise((resolve, reject) => {
        const req = https.request(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(data) });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function run() {
    console.log("Checking OpenRouter API...");
    console.log("Key Found:", API_KEY ? "Yes" : "No");

    try {
        console.log("\n1. Fetching available free models...");
        const modelsRes = await request('https://openrouter.ai/api/v1/models');
        const freeModels = (modelsRes.data.data || [])
            .filter(m => m.id.includes(':free'))
            .map(m => m.id);

        console.log("Available Free Models:");
        freeModels.forEach(m => console.log(` - ${m}`));

        if (freeModels.length > 0) {
            const testModel = freeModels[0];
            console.log(`\n2. Testing chat with: ${testModel}`);
            
            const chatRes = await request('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }, {
                model: testModel,
                messages: [{ role: 'user', content: 'Hi' }]
            });

            console.log("Status:", chatRes.status);
            console.log("Response:", JSON.stringify(chatRes.data, null, 2));
        }
    } catch (err) {
        console.error("Script Error:", err);
    }
}

run();
