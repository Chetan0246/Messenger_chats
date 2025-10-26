import { GoogleGenAI } from "@google/genai";
import { Message, Sender } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a smart reply suggestion based on the conversation history.
 * @param messageHistory An array of previous messages in the chat.
 * @param currentInput The user's current text in the input box.
 * @returns A string containing the suggested reply.
 */
export async function generateSmartReply(messageHistory: Message[], currentInput: string): Promise<string> {
    const history = messageHistory
        .slice(-5) // Use last 5 messages for context
        .map(msg => `${msg.sender === Sender.USER ? 'Me' : 'Them'}: ${msg.text}`)
        .join('\n');

    const prompt = `
You are a helpful chat assistant providing smart replies.
Based on the following conversation history and the user's current message draft, suggest a concise and natural-sounding completion or reply.
Only return the suggested text, without any prefixes like "Suggestion:".

---
CONVERSATION HISTORY:
${history}
---
USER IS TYPING:
"${currentInput}"
---

SUGGESTED REPLY:`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const text = response.text.trim();
        // Remove potential quotes Gemini might add around the suggestion
        return text.replace(/^"(.*)"$/, '$1');

    } catch (error) {
        console.error("Error generating smart reply with Gemini:", error);
        throw new Error("Failed to communicate with the AI model.");
    }
}


/**
 * Generates a contextual reply from a "contact" based on chat history.
 * @param messageHistory The full message history of the conversation.
 * @param contactName The name of the contact who is replying.
 * @returns A promise that resolves with the generated reply text.
 */
export async function generateContactReply(messageHistory: Message[], contactName: string): Promise<string> {
    const history = messageHistory
        .slice(-6) // Use a slightly longer history for context
        .map(msg => `${msg.sender === Sender.USER ? 'You' : contactName}: ${msg.text}`)
        .join('\n');

    const prompt = `
You are role-playing as a person named ${contactName} in a secure chat application.
Your personality should be friendly and natural. Keep your replies concise, like a real text message.
Do not break character. Do not mention that you are an AI.
Based on the following conversation history, write a plausible reply as ${contactName}.

---
CONVERSATION HISTORY:
${history}
---

REPLY AS ${contactName}:`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                // Stop generation at newlines to keep it concise
                stopSequences: ['\n'],
                temperature: 0.8, // A bit more creative
            },
        });

        return response.text.trim();

    } catch (error) {
        console.error("Error generating contact reply with Gemini:", error);
        // Fallback reply
        return "Sorry, I'm having trouble connecting right now.";
    }
}
