const https = require('https');
const path = require('path');
const fs = require('fs');

const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const apiKeyMatch = envContent.match(/VITE_HF_API_KEY=(hf_.*)/);
const API_KEY = apiKeyMatch ? apiKeyMatch[1].trim() : null;

function testModel(modelId) {
    return new Promise((resolve) => {
        const body = JSON.stringify({ inputs: "Hi", parameters: { max_new_tokens: 10 } });
        const req = https.request(`https://api-inference.huggingface.co/models/${modelId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve({ id: modelId, status: res.statusCode, available: res.statusCode === 200 && !parsed.error, data: parsed });
                } catch (e) {
                    resolve({ id: modelId, status: res.statusCode, available: false });
                }
            });
        });
        req.on('error', () => resolve({ id: modelId, available: false }));
        req.write(body);
        req.end();
    });
}

async function run() {
    console.log("Deep testing Hugging Face Inference Endpoints...");
    const models = [
        "mistralai/Mistral-7B-Instruct-v0.1",
        "tiiuae/falcon-7b-instruct",
        "facebook/bart-large-cnn",
        "google/flan-t5-xxl",
        "bigscience/bloom-560m"
    ];

    for (const m of models) {
        const res = await testModel(m);
        console.log(` - ${m}: ${res.available ? "✅ ACTIVE" : "❌ OFFLINE (" + res.status + ")"}`);
        if (res.available) {
            console.log(`\nFound active model: ${m}`);
            process.exit(0);
        }
    }
}

run();
