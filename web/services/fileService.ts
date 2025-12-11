/**
 * 文件上传服务
 * 处理图片上传到后端文件服务器
 */

const API_BASE_URL = 'http://localhost:8000/api/v1';

/**
 * 获取完整的文件 URL
 * 将相对路径转换为完整的后端 URL
 */
export function getFullFileUrl(url: string): string {
  if (!url) return '';

  // 已经是完整 URL 或 data URL
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }

  // 相对路径，添加后端基础 URL
  if (url.startsWith('/api/v1/')) {
    return `http://localhost:8000${url}`;
  }

  return url;
}

/**
 * 上传文件到服务器
 * @param file 要上传的文件
 * @returns 文件访问 URL
 */
export async function uploadFile(file: File): Promise<string> {
  const token = localStorage.getItem('access_token');

  if (!token) {
    throw new Error('请先登录');
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/files/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || '文件上传失败');
  }

  const data = await response.json();
  return getFullFileUrl(data.url);
}

/**
 * 上传 Base64 图片到服务器
 * @param base64 Base64 编码的图片（可以是 data URL 格式或纯 base64）
 * @param filename 可选的文件名
 * @returns 文件访问 URL
 */
export async function uploadBase64(base64: string, filename?: string): Promise<string> {
  const token = localStorage.getItem('access_token');

  if (!token) {
    throw new Error('请先登录');
  }

  const response = await fetch(`${API_BASE_URL}/files/upload-base64`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      base64,
      filename,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || '文件上传失败');
  }

  const data = await response.json();
  return getFullFileUrl(data.url);
}

/**
 * 删除服务器上的文件
 * @param filename 文件名
 */
export async function deleteFile(filename: string): Promise<void> {
  const token = localStorage.getItem('access_token');

  if (!token) {
    throw new Error('请先登录');
  }

  const response = await fetch(`${API_BASE_URL}/files/${filename}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || '文件删除失败');
  }
}
