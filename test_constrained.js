const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
  const start = Date.now();
  console.log("Sending constrained request...");
  try {
    const res = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an expert curriculum designer. Read the raw text and extract a curriculum.
      CRITICAL INSTRUCTION: You MUST limit your output to EXACTLY 3 modules. Each module MUST contain EXACTLY 3 lessons.
      Do not extract the entire syllabus. Only the top 3 most important modules.
      
      Raw Text:
      Build a startup from scratch. Learn marketing, sales, and product design. We cover user research, figma prototyping, and wireframing. Then we do outbound sales, cold email, and CRM management. Finally we do SEO, content marketing, and paid ads.
      `,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
        responseSchema: {
          type: "object",
          properties: {
            course: { type: "object", properties: { title: { type: "string" }, tagline: { type: "string" }, instructorName: { type: "string" }, instructorTitle: { type: "string" } } },
            persona: { type: "object", properties: { tone: { type: "string" }, analogies: { type: "array", items: { type: "string" } } } },
            modules: { type: "array", items: { type: "object", properties: { title: { type: "string" }, lessons: { type: "array", items: { type: "object", properties: { title: { type: "string" }, preview: { type: "string" } } } } } } }
          }
        }
      }
    });
    console.log("Success! Time:", (Date.now() - start)/1000, "s");
    console.log(res.text.substring(0, 500));
  } catch (e) {
    console.error("Error:", e);
  }
}
run();
