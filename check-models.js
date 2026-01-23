// check-models.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function listMyModels() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("❌ No API Key found in .env.local");
    return;
  }

  console.log(`🔑 Checking models for API Key: ${apiKey.substring(0, 10)}...`);
  
  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    // This connects directly to Google to see what you "own"
    const modelResponse = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 
    // We intentionally don't run a prompt yet, we just want to list.
    
    // Actually, let's use the explicit list method if available, 
    // or just try a basic prompt on a "safe" model to see if it connects.
    console.log("📡 Connecting to Google AI Servers...");
    
    // There isn't a simple "listModels" in the Node SDK client easily exposed,
    // so we will try the 3 most likely "Universal" models for 2026.
    const candidates = [
      "gemini-1.5-flash",
      "gemini-1.5-flash-latest",
      "gemini-1.5-pro",
      "gemini-pro",
      "gemini-1.0-pro"
    ];

    for (const modelName of candidates) {
      process.stdout.write(`👉 Testing access to '${modelName}'... `);
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Test.");
        const response = await result.response;
        console.log("✅ SUCCESS! Available.");
      } catch (error) {
        if (error.message.includes("404")) {
          console.log("❌ Not Found (404)");
        } else {
          console.log(`⚠️ Error: ${error.message.split('[')[0]}`);
        }
      }
    }

  } catch (error) {
    console.error("\n🔥 FATAL ERROR: Your API Key itself might be invalid or has no services enabled.");
    console.error(error.message);
  }
}

listMyModels();