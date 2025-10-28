import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_API_KEY,
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FB_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FB_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FB_APP_ID,
  measurementId: import.meta.env.VITE_FB_MEASUREMENT_ID,
};

// Initialize Firebase AI
const app = initializeApp(firebaseConfig);
const ai = getAI(app, { backend: new GoogleAIBackend() });

// Helper to create a model instance
const model = getGenerativeModel(ai, { model: "gemini-2.5-flash" });

/**
 * Generate an AI farming reply (for chat or Q&A with farmers)
 */
export const generateFarmingReply = async (
  prompt: string
): Promise<string | null> => {
  try {
    const result = await model.generateContent({
      contents: [
        {
          role: "model",
          parts: [
            {
              text: `
                Markdown only as reply.
              `,
            },
          ],
        },
        {
          role: "model",
          parts: [
            {
              text: `
                You are an AI farming assistant helping small and local farmers make better agricultural decisions.
                Give clear, friendly, and practical advice about sustainable farming, crop planning, and resource use.
              `,
            },
          ],
        },
        { role: "user", parts: [{ text: prompt }] },
      ],
    });

    return result.response.text();
  } catch (error) {
    console.error("Error generating farming reply:", error);
    return null;
  }
};

/**
 * Generate a short AI-powered summary of a farmer’s progress or profile
 */
export const generateFarmerSummary = async (
  prompt: string
): Promise<string | null> => {
  try {
    const result = await model.generateContent({
      contents: [
        {
          role: "model",
          parts: [
            {
              text: `
                Markdown only as reply.
              `,
            },
          ],
        },
        {
          role: "model",
          parts: [
            {
              text: `
                You are an AI summarizer for VeFarmers. Summarize farmer profiles or activity logs into short, clear updates.
                Keep summaries positive, factual, and useful for pledgers reviewing farmer progress.
              `,
            },
          ],
        },
        { role: "user", parts: [{ text: prompt }] },
      ],
    });

    return result.response.text();
  } catch (error) {
    console.error("Error generating farmer summary:", error);
    return null;
  }
};
