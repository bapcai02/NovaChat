import { apiService } from "@/services/api";

export interface SignedUrlResponse {
  url: string;
  key: string;
}

export const uploadService = {
  async getSignedUrl(
    filename: string,
    contentType: string,
  ): Promise<SignedUrlResponse> {
    const res: any = await apiService.post("/uploads/sign", {
      filename,
      content_type: contentType,
    });
    const data = res?.data?.data ?? res?.data ?? res;
    return { url: data.url, key: data.key };
  },

  async uploadToSignedUrl(
    url: string,
    file: File,
    onProgress?: (percent: number) => void,
  ): Promise<void> {
    // Use XHR to track progress reliably across browsers
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", url);
      xhr.upload.onprogress = (e) => {
        if (!e.lengthComputable) return;
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress?.(percent);
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else reject(new Error(`Upload failed with status ${xhr.status}`));
      };
      xhr.onerror = () => reject(new Error("Network error during upload"));
      xhr.setRequestHeader(
        "Content-Type",
        file.type || "application/octet-stream",
      );
      xhr.send(file);
    });
  },
};
