import type { ApiResponse } from "../types";

export const API_URL =
  import.meta.env.VITE_API_URL || "https://route-posts.routemisr.com";
export const TOKEN_KEY = "social-app-token";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const translatedErrors: Record<string, string> = {
  "incorrect email or password":
    "بيانات الدخول مش صحيحة. راجع اسم المستخدم وكلمة السر.",
  "post already shared": "أنت شاركت المنشور ده قبل كده. هتلاقيه على صفحتك.",
  "user not found": "المستخدم ده مش موجود.",
  "post not found": "المنشور اتحذف أو مش موجود.",
  "comment not found": "التعليق اتحذف أو مش موجود.",
};
export const errorMessage = (error: unknown) => {
  if (!(error instanceof Error)) return "حصل خطأ غير متوقع. جرّب مرة تانية.";
  return translatedErrors[error.message.toLowerCase()] || error.message;
};

// الـ API هنا بيستخدم Bearer Token، والـ browser بيحدد boundary للـ FormData.
export const request = async <T>(
  path: string,
  options: RequestInit = {},
  authenticated = true
): Promise<ApiResponse<T>> => {
  const headers = new Headers(options.headers);
  const token = localStorage.getItem(TOKEN_KEY);
  if (authenticated && token) headers.set("Authorization", `Bearer ${token}`);
  if (options.body && !(options.body instanceof FormData))
    headers.set("Content-Type", "application/json");

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new ApiError("مش قادرين نوصل للخادم. راجع الإنترنت وجرّب تاني.", 0);
  }
  const result = await response.json().catch(() => null);
  if (!response.ok || result?.success === false) {
    if (response.status === 401 && authenticated)
      window.dispatchEvent(new Event("auth-expired"));
    const details = Array.isArray(result?.errors)
      ? result.errors
          .map((e: string | { message?: string }) =>
            typeof e === "string" ? e : e.message
          )
          .filter(Boolean)
          .join("، ")
      : "";
    throw new ApiError(
      details || result?.message || "الخادم رفض الطلب. جرّب تاني.",
      response.status
    );
  }
  if (!result?.data)
    throw new ApiError("الخادم رجّع بيانات غير متوقعة.", response.status);
  return result;
};

export const mediaForm = (
  key: "body" | "content",
  text: string,
  image?: File
) => {
  const form = new FormData();
  // نفس عقد الخادم بيمنع النص الفارغ حتى في منشور/تعليق بصورة فقط.
  form.set(key, text.trim() || " ");
  if (image) form.set("image", image);
  return form;
};

export const validateImage = (file: File) => {
  if (
    !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)
  )
    throw new Error("اختار صورة JPG أو PNG أو WebP أو GIF.");
  if (file.size > 5 * 1024 * 1024)
    throw new Error("حجم الصورة لازم يكون أقل من 5 ميجابايت.");
};
