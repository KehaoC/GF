export type ElementType = 'image' | 'text';

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
