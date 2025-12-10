import { CanvasElement } from '../types';

// In a real app, this would use the @google/genai SDK as described in the system prompt.
// For this UI implementation, we mock the behavior to demonstrate the UX.

export const generateImageFromPrompt = async (
  prompt: string, 
  contextImages: CanvasElement[]
): Promise<string> => {
  console.log(`[Gemini Mock] Generating image for prompt: "${prompt}" with ${contextImages.length} context images.`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Return a random image URL from picsum to simulate a generated result
  const randomId = Math.floor(Math.random() * 1000);
  return `https://picsum.photos/id/${randomId}/512/512`;
};

export const transformElement = async (
  element: CanvasElement,
  prompt: string
): Promise<string> => {
    console.log(`[Gemini Mock] Transforming element ${element.id} with prompt: "${prompt}"`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    const randomId = Math.floor(Math.random() * 1000);
    return `https://picsum.photos/id/${randomId}/512/512`;
}
