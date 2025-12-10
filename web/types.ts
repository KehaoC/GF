export type ElementType = 'image' | 'text' | 'card';

export type CardType = 'hook' | 'inspiration' | 'template' | 'product' | 'constraint';

export interface CanvasElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string; // URL for image, text content for text
  rotation?: number;
  selected?: boolean;
  // Card-specific fields
  cardType?: CardType;
  imageContent?: string;
  textContent?: string;
}

export interface Project {
  id: string;
  title: string;
  thumbnail: string;
  updatedAt: string;
  isExample?: boolean;
  elements: CanvasElement[];
}

export interface Viewport {
  x: number;
  y: number;
  scale: number;
}

export type Tool = 'select' | 'hand' | 'text';
