/**
 * API 客户端服务
 * 封装所有与后端的 HTTP 通信
 */

import type {
  Project,
  BackendProject,
  BackendUser,
  TokenResponse,
  ProjectCreateRequest,
  ProjectUpdateRequest,
} from '../types';
import { formatDateTime } from '../utils/date';

// API 基础地址
const API_BASE_URL = 'http://localhost:8000/api/v1';

/**
 * 自定义错误类
 */
class APIError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * 统一的 HTTP 请求函数
 * 自动添加 JWT token，处理错误响应
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  // 获取 token
  const token = localStorage.getItem('access_token');

  // 合并默认 headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // 添加认证头
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // 处理 401 未授权 - 清除 token 并跳转登录页
    if (response.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('userData');
      window.location.href = '/#/login';
      throw new APIError('请先登录', 401);
    }

    // 处理 403 禁止访问
    if (response.status === 403) {
      throw new APIError('无权访问此资源', 403);
    }

    // 处理 404 未找到
    if (response.status === 404) {
      throw new APIError('资源不存在', 404);
    }

    // 处理其他错误状态码
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.detail || `请求失败 (${response.status})`;
      throw new APIError(errorMessage, response.status);
    }

    // 204 No Content 不返回 JSON
    if (response.status === 204) {
      return null as T;
    }

    // 解析并返回 JSON
    return response.json();
  } catch (error) {
    // 网络错误
    if (error instanceof TypeError) {
      throw new APIError('网络连接失败，请检查后端服务是否运行');
    }
    // 重新抛出已知错误
    throw error;
  }
}

/**
 * 将后端项目对象转换为前端格式
 */
function mapProjectFromBackend(bp: BackendProject): Project {
  return {
    id: bp.id.toString(),
    title: bp.title,
    thumbnail: bp.thumbnail || '',
    isExample: bp.is_example,
    updatedAt: formatDateTime(bp.updated_at),
    elements: bp.elements || [],
  };
}

// ============================================================
// 认证 API
// ============================================================

export const authAPI = {
  /**
   * 用户登录
   */
  async login(username: string, password: string): Promise<TokenResponse> {
    return request<TokenResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  /**
   * 用户注册
   */
  async register(
    username: string,
    email: string,
    password: string
  ): Promise<TokenResponse> {
    return request<TokenResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  },
};

// ============================================================
// 用户 API
// ============================================================

export const usersAPI = {
  /**
   * 获取当前登录用户信息
   */
  async getCurrentUser(): Promise<BackendUser> {
    return request<BackendUser>('/users/me');
  },

  /**
   * 更新当前用户信息
   */
  async updateCurrentUser(data: {
    email?: string;
    password?: string;
  }): Promise<BackendUser> {
    return request<BackendUser>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// ============================================================
// 项目 API
// ============================================================

export const projectsAPI = {
  /**
   * 获取当前用户的所有项目
   */
  async list(): Promise<Project[]> {
    const backendProjects = await request<BackendProject[]>('/projects/');
    return backendProjects.map(mapProjectFromBackend);
  },

  /**
   * 获取示例项目列表（公开访问）
   */
  async listExamples(): Promise<Project[]> {
    const backendProjects = await request<BackendProject[]>('/projects/examples');
    return backendProjects.map(mapProjectFromBackend);
  },

  /**
   * 根据 ID 获取项目详情
   */
  async get(id: number | string): Promise<Project> {
    const projectId = typeof id === 'string' ? parseInt(id, 10) : id;
    const backendProject = await request<BackendProject>(`/projects/${projectId}`);
    return mapProjectFromBackend(backendProject);
  },

  /**
   * 创建新项目
   */
  async create(data: ProjectCreateRequest): Promise<Project> {
    const backendProject = await request<BackendProject>('/projects/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return mapProjectFromBackend(backendProject);
  },

  /**
   * 更新项目
   */
  async update(id: number | string, data: ProjectUpdateRequest): Promise<Project> {
    const projectId = typeof id === 'string' ? parseInt(id, 10) : id;
    const backendProject = await request<BackendProject>(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return mapProjectFromBackend(backendProject);
  },

  /**
   * 删除项目
   */
  async delete(id: number | string): Promise<void> {
    const projectId = typeof id === 'string' ? parseInt(id, 10) : id;
    await request<void>(`/projects/${projectId}`, {
      method: 'DELETE',
    });
  },
};
