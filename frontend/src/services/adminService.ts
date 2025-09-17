import { apiService } from "./api";

export interface User {
  id: number;
  name: string;
  email: string;
  username?: string;
  avatar?: string;
  role: "admin" | "moderator" | "user" | "guest";
  status: "active" | "inactive" | "suspended" | "banned";
  is_online: boolean;
  last_seen_at?: string;
  created_at: string;
  email_verified_at?: string;
  is_verified: boolean;
  is_premium: boolean;
  phone?: string;
  bio?: string;
}

export interface AdminStats {
  total_users: number;
  online_users: number;
  admins: number;
  suspended: number;
  verified_users: number;
  premium_users: number;
}

export interface UsersResponse {
  data: User[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  username?: string;
  role: "admin" | "moderator" | "user" | "guest";
  status?: "active" | "inactive" | "suspended" | "banned";
  phone?: string;
  bio?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  username?: string;
  role?: "super_admin" | "admin" | "moderator" | "user" | "guest";
  status?: "active" | "inactive" | "suspended" | "banned";
  is_verified?: boolean;
  is_premium?: boolean;
  phone?: string;
  bio?: string;
}

class AdminService {
  async getUsers(
    params: {
      page?: number;
      limit?: number;
      search?: string;
      role?: string;
      status?: string;
    } = {},
  ): Promise<UsersResponse> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.search) queryParams.append("search", params.search);
    if (params.role && params.role !== "all")
      queryParams.append("role", params.role);
    if (params.status && params.status !== "all")
      queryParams.append("status", params.status);

    const url = `/admin/users${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    return apiService.get(url);
  }

  async getStats(): Promise<AdminStats> {
    return apiService.get("/admin/stats");
  }

  async getUser(id: number): Promise<User> {
    return apiService.get(`/admin/users/${id}`);
  }

  async createUser(data: CreateUserRequest): Promise<User> {
    return apiService.post("/admin/users", data);
  }

  async updateUser(id: number, data: UpdateUserRequest): Promise<User> {
    return apiService.put(`/admin/users/${id}`, data);
  }

  async deleteUser(id: number): Promise<void> {
    return apiService.delete(`/admin/users/${id}`);
  }

  async banUser(id: number, reason?: string): Promise<User> {
    return apiService.post(`/admin/users/${id}/ban`, { action: "ban", reason });
  }

  async unbanUser(id: number): Promise<User> {
    return apiService.post(`/admin/users/${id}/ban`, { action: "unban" });
  }

  async getReports(
    params: {
      period?: string;
      start_date?: string;
      end_date?: string;
    } = {},
  ): Promise<any> {
    const queryParams = new URLSearchParams();

    if (params.period) queryParams.append("period", params.period);
    if (params.start_date) queryParams.append("start_date", params.start_date);
    if (params.end_date) queryParams.append("end_date", params.end_date);

    const url = `/admin/reports${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    return apiService.get(url);
  }
}

export const adminService = new AdminService();
