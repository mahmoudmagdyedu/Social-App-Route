import type { ApiResponse, AuthData, Collection, Comment, Notification, Post, SignupValues, User, } from "../types";

export const API_URL = "https://route-posts.routemisr.com";
export const TOKEN_KEY = "social-app-token";

function collection<T>(response: ApiResponse<unknown>, items: T[]): Collection<T> {
    return ({ items, pagination: response.meta?.pagination });
}
function json(data: unknown) {
    return JSON.stringify(data);
}
function id(value: string) {
    return encodeURIComponent(value);
}
export function signUp({ name, username, email, dateOfBirth, gender, password, rePassword, }: SignupValues) {
    return request<AuthData>("/users/signup", {
        method: "POST",
        body: json({
            name,
            username,
            email,
            dateOfBirth,
            gender,
            password,
            rePassword,
        }),
    }, false);
}
export function signIn(login: string, password: string) {
    return request<AuthData>("/users/signin", { method: "POST", body: json({ login, password }) }, false);
}
export function getLoggedUser(signal?: AbortSignal) {
    return request<{
        user: User;
    }>("/users/profile-data", { signal });
}
export function changePassword(password: string, newPassword: string) {
    return request<AuthData>("/users/change-password", {
        method: "PATCH",
        body: json({ password, newPassword }),
    });
}
export function uploadProfilePhoto(photo: File) {
    const body = new FormData();
    body.set("photo", photo);
    return request<{
        user?: User;
        photo?: string;
    }>("/users/upload-photo", {
        method: "PUT",
        body,
    });
}
export function getUserProfile(userId: string, signal?: AbortSignal) {
    return request<{
        user: User;
        isFollowing: boolean;
    }>(`/users/${id(userId)}/profile`, { signal });
}
export function followUser(userId: string) {
    return request<{
        following?: boolean;
        isFollowing?: boolean;
        followersCount?: number;
    }>(`/users/${id(userId)}/follow`, { method: "PUT" });
}
export async function getSuggestedUsers(page = 1, signal?: AbortSignal) {
    const result = await request<{
        suggestions: User[];
    }>(`/users/suggestions?page=${page}&limit=12`, { signal });
    return collection(result, result.data.suggestions);
}
export async function getPosts(page = 1, signal?: AbortSignal, following = false, hasImage = false) {
    const path = following
        ? "/posts/feed?only=following&"
        : hasImage
            ? "/posts/feed?only=all&"
            : "/posts?";
    const result = await request<{
        posts: Post[];
    }>(`${path}page=${page}&limit=10${hasImage ? "&hasImage=true" : ""}`, { signal });
    return collection(result, result.data.posts);
}
export async function getUserPosts(userId: string, page = 1, signal?: AbortSignal) {
    const result = await request<{
        posts: Post[];
    }>(`/users/${id(userId)}/posts?page=${page}&limit=10`, { signal });
    return collection(result, result.data.posts);
}
export async function getBookmarks(page = 1, signal?: AbortSignal) {
    const result = await request<{
        bookmarks: Post[];
    }>(`/users/bookmarks?page=${page}&limit=10`, { signal });
    return collection(result, result.data.bookmarks);
}
export function getPost(postId: string, signal?: AbortSignal) {
    return request<{
        post: Post;
    }>(`/posts/${id(postId)}`, { signal });
}
export function createPost(text: string, image?: File) {
    return request<{
        post: Post;
    }>("/posts", {
        method: "POST",
        body: mediaForm("body", text, image),
    });
}
export function updatePost(postId: string, text: string, image?: File) {
    return request<{
        post: Post;
    }>(`/posts/${id(postId)}`, {
        method: "PUT",
        body: mediaForm("body", text, image),
    });
}
export function deletePost(postId: string) {
    return request<Record<string, unknown>>(`/posts/${id(postId)}`, {
        method: "DELETE",
    });
}
export function likePost(postId: string) {
    return request<{
        liked: boolean;
        likesCount: number;
        post: Post;
    }>(`/posts/${id(postId)}/like`, { method: "PUT" });
}
export function bookmarkPost(postId: string) {
    return request<{
        bookmarked: boolean;
    }>(`/posts/${id(postId)}/bookmark`, {
        method: "PUT",
    });
}
export function sharePost(postId: string, body: string) {
    return request<{
        post: Post;
    }>(`/posts/${id(postId)}/share`, {
        method: "POST",
        body: json({ body: body.trim() || " " }),
    });
}
export async function getPostLikes(postId: string, page = 1, signal?: AbortSignal) {
    const result = await request<{
        likes: User[];
    }>(`/posts/${id(postId)}/likes?page=${page}&limit=20`, { signal });
    return collection(result, result.data.likes);
}
function commentsPath(postId: string, commentId?: string) {
    return `/posts/${id(postId)}/comments${commentId ? `/${id(commentId)}` : ""}`;
}
export async function getComments(postId: string, page = 1, signal?: AbortSignal, parentId?: string) {
    const path = commentsPath(postId, parentId) + (parentId ? "/replies" : "");
    const result = await request<{
        comments?: Comment[];
        replies?: Comment[];
    }>(`${path}?page=${page}&limit=10`, { signal });
    return collection(result, result.data.comments || result.data.replies || []);
}
export function createComment(postId: string, content: string, image?: File, parentId?: string) {
    return request<{
        comment?: Comment;
        reply?: Comment;
    }>(commentsPath(postId, parentId) + (parentId ? "/replies" : ""), { method: "POST", body: mediaForm("content", content, image) });
}
export function updateComment(postId: string, commentId: string, content: string, image?: File) {
    return request<{
        comment: Comment;
    }>(commentsPath(postId, commentId), {
        method: "PUT",
        body: mediaForm("content", content, image),
    });
}
export function deleteComment(postId: string, commentId: string) {
    return request<Record<string, unknown>>(commentsPath(postId, commentId), {
        method: "DELETE",
    });
}
export function likeComment(postId: string, commentId: string) {
    return request<{
        liked: boolean;
        likesCount: number;
        comment: Comment;
    }>(commentsPath(postId, commentId) + "/like", { method: "PUT" });
}
export async function getNotifications(page = 1, signal?: AbortSignal, unread = false) {
    const result = await request<{
        notifications: Notification[];
    }>(
    `/notifications?page=${page}&limit=15${unread ? "&unread=false" : ""}`, { signal });
    return collection(result, result.data.notifications);
}
export function getUnreadCount(signal?: AbortSignal) {
    return request<{
        unreadCount: number;
    }>("/notifications/unread-count", { signal });
}
export function readNotification(notificationId: string) {
    return request<Record<string, unknown>>(`/notifications/${id(notificationId)}/read`, { method: "PATCH" });
}
export function readAllNotifications() {
    return request<Record<string, unknown>>("/notifications/read-all", {
        method: "PATCH",
    });
}
export class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
        super(message);
        this.name = "ApiError";
        this.status = status;
    }
}
const translatedErrors: Record<string, string> = {
    "incorrect email or password": "بيانات الدخول مش صحيحة. راجع اسم المستخدم وكلمة السر.",
    "post already shared": "أنت شاركت المنشور ده قبل كده. هتلاقيه على صفحتك.",
    "user not found": "المستخدم ده مش موجود.",
    "post not found": "المنشور اتحذف أو مش موجود.",
    "comment not found": "التعليق اتحذف أو مش موجود.",
};
export function errorMessage(error: unknown) {
    if (!(error instanceof Error))
        return "حصل خطأ غير متوقع. جرّب مرة تانية.";
    return translatedErrors[error.message.toLowerCase()] || error.message;
}
export async function request<T>(path: string, options: RequestInit = {}, authenticated = true): Promise<ApiResponse<T>> {
    const headers = new Headers(options.headers);
    const token = localStorage.getItem(TOKEN_KEY);
    if (authenticated && token)
        headers.set("Authorization", `Bearer ${token}`);
    if (options.body && !(options.body instanceof FormData))
        headers.set("Content-Type", "application/json");
    let response: Response;
    try {
        response = await fetch(`${API_URL}${path}`, { ...options, headers });
    }
    catch (error) {
        if (error instanceof Error && error.name === "AbortError")
            throw error;
        throw new ApiError("مش قادرين نوصل للخادم. راجع الإنترنت وجرّب تاني.", 0);
    }
    const result = await response.json().catch(() => null);
    if (!response.ok || result?.success === false) {
        if (response.status === 401 && authenticated)
            window.dispatchEvent(new Event("auth-expired"));
        const details = Array.isArray(result?.errors)
            ? result.errors
                .map((e: string | {
                message?: string;
            }) => typeof e === "string" ? e : e.message)
                .filter(Boolean)
                .join("، ")
            : "";
        throw new ApiError(details || result?.message || "الخادم رفض الطلب. جرّب تاني.", response.status);
    }
    if (!result?.data)
        throw new ApiError("الخادم رجّع بيانات غير متوقعة.", response.status);
    return result;
}
export function mediaForm(key: "body" | "content", text: string, image?: File) {
    const form = new FormData();

    form.set(key, text.trim() || " ");
    if (image)
        form.set("image", image);
    return form;
}
export function validateImage(file: File) {
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type))
        throw new Error("اختار صورة JPG أو PNG أو WebP أو GIF.");
    if (file.size > 5 * 1024 * 1024)
        throw new Error("حجم الصورة لازم يكون أقل من 5 ميجابايت.");
}
