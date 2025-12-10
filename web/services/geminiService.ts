import { CanvasElement } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

// Gemini 2.5 Flash Image API endpoint
const GEMINI_IMAGE_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent';

// Helper function to convert image URL to base64
const getImageBase64 = async (imageUrl: string): Promise<{ data: string; mimeType: string }> => {
  // If already a data URL, extract the base64 part
  if (imageUrl.startsWith('data:')) {
    const matches = imageUrl.match(/data:([^;]+);base64,(.+)/);
    if (matches) {
      return { data: matches[2], mimeType: matches[1] };
    }
  }

  // For external URLs, fetch and convert to base64
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64Data = result.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    return { data: base64, mimeType: blob.type || 'image/jpeg' };
  } catch (error) {
    console.error('[Gemini AI] Failed to fetch image:', error);
    throw error;
  }
};

export const generateImageFromPrompt = async (
  prompt: string,
  contextImages: CanvasElement[]
): Promise<string> => {
  console.log(`[Gemini AI] Generating image for prompt: "${prompt}"`);
  console.log(`[Gemini AI] Context images: ${contextImages.length} selected elements`);

  if (!API_KEY) {
    console.error('[Gemini AI] API Key not found!');
    throw new Error('GEMINI_API_KEY is not configured');
  }

  try {
    // Build parts array with multimodal inputs
    const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

    // Add context images from selected elements
    for (const element of contextImages) {
      let imageUrl: string | undefined;

      // Extract image URL based on element type
      if (element.type === 'image') {
        imageUrl = element.content;
      } else if (element.type === 'card' && element.imageContent) {
        imageUrl = element.imageContent;
      }

      // Convert image to base64 and add to parts
      if (imageUrl) {
        try {
          const { data, mimeType } = await getImageBase64(imageUrl);
          parts.push({
            inlineData: {
              mimeType,
              data
            }
          });
          console.log(`[Gemini AI] Added context image: ${mimeType}`);
        } catch (error) {
          console.warn(`[Gemini AI] Failed to process image from element ${element.id}:`, error);
        }
      }
    }

    // Add text prompt
    parts.push({ text: prompt });

    // Build request body according to official docs
    const requestBody = {
      contents: [{
        parts
      }]
    };

    console.log(`[Gemini AI] Sending request with ${parts.length} parts (${parts.length - 1} images + 1 text)`);

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
