import {
  ResourceDoc,
  UserDoc,
  ServerStatus,
  UploadResourcePayload,
  AiAskPayload,
  AiAskResponse,
  AdminStats,
} from '../types.js';

// Base URL points to Node.js backend. In development with Vite proxy or Express,
// relative '/api' or 'http://localhost:3000/api' can be used.
export const API_BASE_URL = ((import.meta as any).env?.VITE_API_BASE_URL as string) || '/api';
export const DEFAULT_ADMIN_KEY = 'academia-admin-secret-2026';

export interface FilterParams {
  branch?: string;
  semester?: string | number;
  subjectCode?: string;
  category?: string;
  sort?: string;
  search?: string;
  courseType?: string;
  year?: string | number;
}

/**
 * Fetch filtered academic resources and PYQs
 */
export async function getResources(filters: FilterParams = {}): Promise<ResourceDoc[]> {
  const query = new URLSearchParams();
  if (filters.branch && filters.branch !== 'all') query.append('branch', filters.branch);
  if (filters.semester) query.append('semester', String(filters.semester));
  if (filters.subjectCode) query.append('subjectCode', filters.subjectCode.trim());
  if (filters.category) query.append('category', filters.category);
  if (filters.sort) query.append('sort', filters.sort);
  if (filters.search) query.append('search', filters.search);
  if (filters.courseType) query.append('courseType', filters.courseType);
  if (filters.year) query.append('year', String(filters.year));

  const url = `${API_BASE_URL}/resources?${query.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || `Failed to fetch resources (HTTP ${response.status})`);
  }

  const result = await response.json();
  return result.data || [];
}

/**
 * Resolves the URL for viewing or downloading a resource file.
 * Points to the backend endpoint (/api/resources/:id/view or /download)
 * or to the direct static/external fileUrl.
 */
export function getResourceFileUrl(
  resource: ResourceDoc | null | undefined,
  action: 'view' | 'download' = 'view'
): string {
  if (!resource) return '#';

  // If resource has an ID, the dedicated backend endpoint is the most robust gateway
  if (resource._id) {
    return `${API_BASE_URL}/resources/${resource._id}/${action}`;
  }

  // Fallback to fileUrl
  if (resource.fileUrl) {
    if (resource.fileUrl.startsWith('/')) {
      return resource.fileUrl;
    }
    return resource.fileUrl;
  }

  return '#';
}

/**
 * Upload a new Resource / PYQ (supports JSON payload or multipart FormData with real-time progress callback)
 */
export async function createResource(
  payload: UploadResourcePayload | FormData,
  onProgress?: (progressPercent: number) => void
): Promise<ResourceDoc> {
  const url = `${API_BASE_URL}/resources`;
  const isFormData = typeof FormData !== 'undefined' && payload instanceof FormData;

  // Use XMLHttpRequest when uploading files to accurately track upload progress
  if (isFormData && onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.min(99, Math.round((event.loaded / event.total) * 100));
          onProgress(percent);
        }
      };

      xhr.onload = () => {
        try {
          const result = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300 && result.success) {
            onProgress(100);
            resolve(result.data);
          } else {
            reject(new Error(result.message || `Upload failed with status ${xhr.status}`));
          }
        } catch {
          reject(new Error(`Server returned unexpected response (${xhr.status})`));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error occurred while uploading file. Please check your connection.'));
      };

      xhr.send(payload);
    });
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: isFormData ? {} : { 'Content-Type': 'application/json' },
    body: isFormData ? payload : JSON.stringify(payload),
  });

  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to upload resource');
  }

  return result.data;
}

/**
 * Atomically upvote an academic resource
 */
export async function upvoteResource(id: string): Promise<ResourceDoc> {
  const url = `${API_BASE_URL}/resources/${id}/upvote`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to upvote resource');
  }

  return result.data;
}

/**
 * Fetch student and faculty user profiles
 */
export async function getUsers(): Promise<UserDoc[]> {
  const url = `${API_BASE_URL}/users`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch user profiles');
  }
  const result = await response.json();
  return result.data || [];
}

/**
 * Fetch backend and database health status
 */
export async function getServerStatus(): Promise<ServerStatus> {
  const url = `${API_BASE_URL}/status`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch server status');
  }
  return await response.json();
}

/**
 * Send study questions or PYQ concept queries to Gemini AI
 */
export async function askGeminiStudyHelper(payload: AiAskPayload): Promise<AiAskResponse> {
  const url = `${API_BASE_URL}/ai/ask`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to get answer from AI Assistant');
  }

  return result;
}

/**
 * Fetch Administrative Platform Metrics
 */
export async function getAdminStats(adminKey: string = DEFAULT_ADMIN_KEY): Promise<AdminStats> {
  const url = `${API_BASE_URL}/admin/stats`;
  const response = await fetch(url, {
    headers: {
      'x-admin-key': adminKey,
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Failed to fetch admin stats (HTTP ${response.status})`);
  }

  const result = await response.json();
  return result.data;
}

/**
 * Fetch all resources for admin moderation table
 */
export async function getAdminResources(
  params?: { category?: string; semester?: string | number; branch?: string; q?: string },
  adminKey: string = DEFAULT_ADMIN_KEY
): Promise<ResourceDoc[]> {
  const queryParams = new URLSearchParams();
  if (params?.category) queryParams.append('category', params.category);
  if (params?.semester) queryParams.append('semester', String(params.semester));
  if (params?.branch && params.branch !== 'all') queryParams.append('branch', params.branch);
  if (params?.q) queryParams.append('q', params.q);

  const qs = queryParams.toString();
  const url = `${API_BASE_URL}/admin/resources${qs ? `?${qs}` : ''}`;

  const response = await fetch(url, {
    headers: {
      'x-admin-key': adminKey,
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Failed to fetch admin resources (HTTP ${response.status})`);
  }

  const result = await response.json();
  return result.data || [];
}

/**
 * Delete a resource by ID from the administrative panel
 */
export async function deleteAdminResource(
  id: string,
  adminKey: string = DEFAULT_ADMIN_KEY
): Promise<{ success: boolean; message: string; deletedId: string; deletedTitle?: string }> {
  const url = `${API_BASE_URL}/admin/resources/${id}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'x-admin-key': adminKey,
    },
  });

  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.message || `Failed to delete resource ${id}`);
  }

  return result;
}

/**
 * Reset and restore demonstration repository seeds
 */
export async function resetAdminSeeds(
  adminKey: string = DEFAULT_ADMIN_KEY
): Promise<{ success: boolean; message: string; count: number }> {
  const url = `${API_BASE_URL}/admin/reset-seeds`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'x-admin-key': adminKey,
    },
  });

  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to restore default seeds');
  }

  return result;
}

/**
 * Verify administrative credentials against the server
 */
export async function verifyAdminKey(
  adminKey: string
): Promise<{ success: boolean; message: string; role?: string }> {
  const url = `${API_BASE_URL}/admin/verify`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'x-admin-key': adminKey,
    },
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Invalid Admin Secret Key. Access denied.');
  }

  return result;
}

