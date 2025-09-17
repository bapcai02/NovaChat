import { apiService } from "@/services/api";

export const userSettingsService = {
  async getProfile() {
    const res: any = await apiService.get("/user/profile");
    return res?.data?.data ?? res?.data ?? res;
  },
  async updateProfile(payload: any) {
    // payload can be FormData for file upload or plain object
    let body: any = payload;
    const headers: any = {};
    if (!(payload instanceof FormData)) {
      body = JSON.stringify(payload);
      headers["Content-Type"] = "application/json";
    }
    const res: any = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/user/profile`,
      {
        method: "PUT",
        headers: {
          Accept: "application/json",
          ...(typeof window !== "undefined" &&
          localStorage.getItem("auth_token")
            ? { Authorization: `Bearer ${localStorage.getItem("auth_token")}` }
            : {}),
          ...headers,
        },
        body,
      },
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return data?.data ?? data;
  },
  async changePassword(payload: {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
  }) {
    const res: any = await apiService.post("/user/change-password", payload);
    return res?.data;
  },
  async updatePreferences(payload: { language: "EN" | "VI" }) {
    const res: any = await apiService.put("/user/preferences", payload);
    return res?.data;
  },
  async getSessions() {
    const res: any = await apiService.get("/user/sessions");
    return res?.data?.data ?? [];
  },
  async deleteSession(id: number) {
    const res: any = await apiService.delete(`/user/sessions/${id}`);
    return res?.data;
  },
};
