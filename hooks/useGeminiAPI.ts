import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY as string);

export function useGeminiAPI() {
  const generateResponse = async (prompt: string): Promise<string> => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating response:', error);
      throw error;
    }
  };

  const generateStreamingResponse = async (
    prompt: string,
    onPartialResponse: (text: string) => void
  ): Promise<string> => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContentStream(prompt);
      
      let fullResponse = '';
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullResponse += chunkText;
        onPartialResponse(fullResponse);
      }
      
      return fullResponse;
    } catch (error) {
      console.error('Error generating streaming response:', error);
      throw error;
    }
  };

  const generateChatResponse = async (
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    prompt: string
  ): Promise<string> => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const chat = model.startChat({
        history: messages.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.content }]
        })),
      });

      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating chat response:', error);
      throw error;
    }
  };

  const generateResponseWithVoiceAttachment = async (
    prompt: string,
    voiceAttachmentUrl: string,
    onPartialResponse: (text: string) => void
  ): Promise<string> => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const enhancedPrompt = `Voice message: ${voiceAttachmentUrl}\n${prompt}`;
      const result = await model.generateContentStream(enhancedPrompt);
      
      let fullResponse = '';
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullResponse += chunkText;
        onPartialResponse(fullResponse);
      }
      
      return fullResponse;
    } catch (error) {
      console.error('Error generating response with voice attachment:', error);
      throw error;
    }
  };

  return {
    generateResponse,
    generateStreamingResponse,
    generateChatResponse,
    generateResponseWithVoiceAttachment,
    summarize: async (text: string) => generateResponse(`Summarize the following text: ${text}`),
    translate: async (text: string, targetLanguage: string) => 
      generateResponse(`Translate the following text to ${targetLanguage}: ${text}`),
    write: async (text: string) => 
      generateResponse(`Write a short paragraph about: ${text}`),
    rewrite: async (text: string) => 
      generateResponse(`Rewrite the following text in a different style: ${text}`)
  };
}

