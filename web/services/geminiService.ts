import { CanvasElement } from '../types';
import { ContentSegment } from '../components/MixedInput';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

// Gemini Image Generation API endpoint
const GEMINI_IMAGE_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent';

type Part = { text: string } | { inlineData: { mimeType: string; data: string } };

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
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
  return { data: base64, mimeType: blob.type || 'image/jpeg' };
};

// Extract image from response
const extractImageFromResponse = (data: any): string | null => {
  if (data.candidates?.[0]?.content?.parts) {
    for (const part of data.candidates[0].content.parts) {
      if (part.inlineData?.data) {
        const mimeType = part.inlineData.mimeType || 'image/png';
        return `data:${mimeType};base64,${part.inlineData.data}`;
      }
    }
  }
  return null;
};

// Generate fallback placeholder image
const generateFallbackImage = async (seed: string): Promise<string> => {
  console.log('[Gemini AI] Using fallback placeholder image');
  await new Promise(resolve => setTimeout(resolve, 1000));
  const safeSeed = seed.toLowerCase().replace(/\s+/g, '-').substring(0, 50) || `img-${Date.now()}`;
  return `https://picsum.photos/seed/${safeSeed}/512/512`;
};

/**
 * 从混合内容片段生成图片
 * 格式: [prompt文本, 图片1, 图片2, ...]
 */
export const generateImageFromSegments = async (
  segments: ContentSegment[]
): Promise<string> => {
  console.log(`[Gemini AI] Generating image from ${segments.length} segments`);

  if (!API_KEY) {
    console.error('[Gemini AI] API Key not found!');
    throw new Error('GEMINI_API_KEY is not configured');
  }

  try {
    const parts: Part[] = [];

    // 1. 先收集所有文本，合并为一个 prompt（放在最前面）
    const textParts: string[] = [];
    for (const segment of segments) {
      if (segment.type === 'text' && segment.content.trim()) {
        textParts.push(segment.content);
      } else if (segment.type === 'ref-text' && segment.content) {
        textParts.push(`[参考: ${segment.content}]`);
      }
    }

    // 添加合并后的文本 prompt
    if (textParts.length > 0) {
      parts.push({ text: textParts.join(' ') });
    } else {
      // 如果没有文本，添加默认 prompt
      parts.push({ text: '请根据这些参考图片生成一张新图片' });
    }

    // 2. 然后添加所有图片
    for (const segment of segments) {
      if (segment.type === 'image' && segment.content) {
        try {
          const { data, mimeType } = await getImageBase64(segment.content);
          parts.push({ inlineData: { mimeType, data } });
          console.log(`[Gemini AI] Added image: ${mimeType}`);
        } catch (error) {
          console.warn(`[Gemini AI] Failed to process image:`, error);
        }
      }
    }

    console.log(`[Gemini AI] Request: 1 text prompt + ${parts.length - 1} images`);

    // Build request body with generationConfig
    const requestBody = {
      contents: [{ parts }],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE']
      }
    };

    // Call Gemini API
    const response = await fetch(`${GEMINI_IMAGE_API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[Gemini AI] API error:', errorData);
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('[Gemini AI] Response received');

    const imageUrl = extractImageFromResponse(data);
    if (imageUrl) {
      console.log('[Gemini AI] ✓ Image generated successfully');
      return imageUrl;
    }

    throw new Error('No image data in response');

  } catch (error) {
    console.error('[Gemini AI] Image generation failed:', error);
    const textContent = segments
      .filter(s => s.type === 'text' || s.type === 'ref-text')
      .map(s => s.content)
      .join(' ');
    return generateFallbackImage(textContent);
  }
};

/**
 * 从 prompt 和 CanvasElement 数组生成图片（兼容旧接口）
 */
export const generateImageFromPrompt = async (
  prompt: string,
  contextImages: CanvasElement[]
): Promise<string> => {
  // 转换为 segments 格式
  const segments: ContentSegment[] = [];

  // 添加文本
  if (prompt.trim()) {
    segments.push({ type: 'text', content: prompt });
  }

  // 添加图片
  for (const element of contextImages) {
    let imageUrl: string | undefined;
    if (element.type === 'image') {
      imageUrl = element.content;
    } else if (element.type === 'card' && element.imageContent) {
      imageUrl = element.imageContent;
    }
    if (imageUrl) {
      segments.push({ type: 'image', content: imageUrl });
    }
  }

  return generateImageFromSegments(segments);
};

/**
 * 变换元素（基于原图生成新图）
 */
export const transformElement = async (
  element: CanvasElement,
  prompt: string
): Promise<string> => {
  return generateImageFromPrompt(prompt, [element]);
};
