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

// ============================================================
// 后端 API 响应类型
// ============================================================

/**
 * 后端返回的项目对象（直接来自 FastAPI）
 */
export interface BackendProject {
  id: number;
  title: string;
  thumbnail: string | null;
  is_example: boolean;
  elements: any[];
  owner_id: number;
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
}

/**
 * 后端返回的用户对象
 */
export interface BackendUser {
  id: number;
  username: string;
  email: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * 登录/注册响应
 */
export interface TokenResponse {
  access_token: string;
  token_type: string;
}

/**
 * 项目创建/更新请求参数
 */
export interface ProjectCreateRequest {
  title?: string;
  thumbnail?: string;
  elements?: CanvasElement[];
  is_example?: boolean;
}

export interface ProjectUpdateRequest {
  title?: string;
  thumbnail?: string;
  elements?: CanvasElement[];
}
