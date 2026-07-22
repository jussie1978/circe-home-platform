const WebSocket = require('ws');

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("No API key");
  process.exit(1);
}

const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${apiKey}`;

const ws = new WebSocket(url);

ws.on('open', () => {
  console.log('Connected!');
  
  const setupMsg = {
    setup: {
      model: "models/gemini-2.0-flash-exp",
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: "Puck"
            }
          }
        }
      },
      systemInstruction: {
        parts: [{text: "Hello"}]
      }
    }
  };
  
  console.log("Sending setup:", JSON.stringify(setupMsg));
  ws.send(JSON.stringify(setupMsg));
});

ws.on('message', (data) => {
  console.log("Received:", data.toString());
});

ws.on('close', (code, reason) => {
  console.log("Closed:", code, reason.toString());
});

ws.on('error', (err) => {
  console.log("Error:", err);
});
