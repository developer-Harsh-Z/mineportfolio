const https = require('https');

const API_KEY = "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";
const MODEL = "meta/llama-3.2-3b-instruct"; // Using a chat model instead of embedding model for the test

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
    console.log("Checking NVIDIA NIM API...");
    try {
        const chatRes = await request('https://integrate.api.nvidia.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        }, {
            model: MODEL,
            messages: [{ role: 'user', content: 'Hi' }],
            max_tokens: 50
        });

        console.log("Status:", chatRes.status);
        console.log("Response:", JSON.stringify(chatRes.data, null, 2));
    } catch (err) {
        console.error("Script Error:", err);
    }
}

run();
