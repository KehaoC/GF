import { CanvasElement } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

// Gemini 2.5 Flash Image API endpoint
const GEMINI_IMAGE_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent';

export const generateImageFromPrompt = async (
  prompt: string,
  contextImages: CanvasElement[]
): Promise<string> => {
  console.log(`[Gemini AI] Generating image for prompt: "${prompt}"`);

  if (!API_KEY) {
    console.error('[Gemini AI] API Key not found!');
    throw new Error('GEMINI_API_KEY is not configured');
  }

  try {
    // Build request body according to official docs
    const requestBody = {
      contents: [{
        parts: [
          { text: prompt }
        ]
      }]
    };

    // Call Gemini API
    const response = await fetch(`${GEMINI_IMAGE_API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[Gemini AI] API error:', errorData);
      throw new Error(`API request failed: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log('[Gemini AI] Response received:', data);

    // Extract the generated image from response
    // According to docs: candidates[0].content.parts[].inlineData.data
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      for (const part of data.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          const base64Image = part.inlineData.data;
          const mimeType = part.inlineData.mimeType || 'image/png';
          console.log('[Gemini AI] ✓ Image generated successfully');
          return `data:${mimeType};base64,${base64Image}`;
        }
      }
    }

    throw new Error('No image data in response');

  } catch (error) {
    console.error('[Gemini AI] Image generation failed:', error);

    // Fallback to placeholder for development/testing
    console.log('[Gemini AI] Using fallback placeholder image');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate a themed placeholder based on prompt keywords
    const seed = prompt.toLowerCase().replace(/\s+/g, '-').substring(0, 50);
    return `https://picsum.photos/seed/${seed}/512/512`;
  }
};

export const transformElement = async (
  element: CanvasElement,
  prompt: string
): Promise<string> => {
  console.log(`[Gemini AI] Transforming element with prompt: "${prompt}"`);

  // Use the same generation function
  // For image-to-image, we would need to include the image in the request
  return generateImageFromPrompt(prompt, [element]);
};
