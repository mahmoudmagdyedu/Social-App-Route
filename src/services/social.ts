import { mediaForm, request } from "./api";
import type {
  ApiResponse,
  AuthData,
  Collection,
  Comment,
  Notification,
  Post,
  SignupValues,
  User,
} from "../types";

const collection = <T>(
  response: ApiResponse<unknown>,
  items: T[]
): Collection<T> => ({ items, pagination: response.meta?.pagination });
const json = (data: unknown) => JSON.stringify(data);
const id = (value: string) => encodeURIComponent(value);

export const authService = {
  signup: ({
    name,
    username,
    email,
    dateOfBirth,
    gender,
    password,
    rePassword,
  }: SignupValues) =>
    request<AuthData>(
      "/users/signup",
      {
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
      },
      false
    ),
  signin: (login: string, password: string) =>
    request<AuthData>(
      "/users/signin",
      { method: "POST", body: json({ login, password }) },
      false
    ),
  me: (signal?: AbortSignal) =>
    request<{ user: User }>("/users/profile-data", { signal }),
  changePassword: (password: string, newPassword: string) =>
    request<AuthData>("/users/change-password", {
      method: "PATCH",
      body: json({ password, newPassword }),
    }),
  uploadPhoto: (photo: File) => {
    const body = new FormData();
    body.set("photo", photo);
    return request<{ user?: User; photo?: string }>("/users/upload-photo", {
      method: "PUT",
      body,
    });
  },
};

export const userService = {
  profile: (userId: string, signal?: AbortSignal) =>
    request<{ user: User; isFollowing: boolean }>(
      `/users/${id(userId)}/profile`,
      { signal }
    ),
  follow: (userId: string) =>
    request<{
      following?: boolean;
      isFollowing?: boolean;
      followersCount?: number;
    }>(`/users/${id(userId)}/follow`, { method: "PUT" }),
  suggestions: async (page = 1, signal?: AbortSignal) => {
    const result = await request<{ suggestions: User[] }>(
      `/users/suggestions?page=${page}&limit=12`,
      { signal }
    );
    return collection(result, result.data.suggestions);
  },
};

export const postService = {
  list: async (
    page = 1,
    signal?: AbortSignal,
    following = false,
    hasImage = false
  ) => {
    const path = following
      ? "/posts/feed?only=following&"
      : hasImage
        ? "/posts/feed?only=all&"
        : "/posts?";
    const result = await request<{ posts: Post[] }>(
      `${path}page=${page}&limit=10${hasImage ? "&hasImage=true" : ""}`,
      { signal }
    );
    return collection(result, result.data.posts);
  },
  userPosts: async (userId: string, page = 1, signal?: AbortSignal) => {
    const result = await request<{ posts: Post[] }>(
      `/users/${id(userId)}/posts?page=${page}&limit=10`,
      { signal }
    );
    return collection(result, result.data.posts);
  },
  bookmarks: async (page = 1, signal?: AbortSignal) => {
    const result = await request<{ bookmarks: Post[] }>(
      `/users/bookmarks?page=${page}&limit=10`,
      { signal }
    );
    return collection(result, result.data.bookmarks);
  },
  one: (postId: string, signal?: AbortSignal) =>
    request<{ post: Post }>(`/posts/${id(postId)}`, { signal }),
  create: (text: string, image?: File) =>
    request<{ post: Post }>("/posts", {
      method: "POST",
      body: mediaForm("body", text, image),
    }),
  update: (postId: string, text: string, image?: File) =>
    request<{ post: Post }>(`/posts/${id(postId)}`, {
      method: "PUT",
      body: mediaForm("body", text, image),
    }),
  remove: (postId: string) =>
    request<Record<string, unknown>>(`/posts/${id(postId)}`, {
      method: "DELETE",
    }),
  like: (postId: string) =>
    request<{ liked: boolean; likesCount: number; post: Post }>(
      `/posts/${id(postId)}/like`,
      { method: "PUT" }
    ),
  bookmark: (postId: string) =>
    request<{ bookmarked: boolean }>(`/posts/${id(postId)}/bookmark`, {
      method: "PUT",
    }),
  share: (postId: string, body: string) =>
    request<{ post: Post }>(`/posts/${id(postId)}/share`, {
      method: "POST",
      // الخادم بيرفض empty string؛ مسافة تسمح بمشاركة من غير تعليق.
      body: json({ body: body.trim() || " " }),
    }),
  likes: async (postId: string, page = 1, signal?: AbortSignal) => {
    const result = await request<{ likes: User[] }>(
      `/posts/${id(postId)}/likes?page=${page}&limit=20`,
      { signal }
    );
    return collection(result, result.data.likes);
  },
};

const commentsPath = (postId: string, commentId?: string) =>
  `/posts/${id(postId)}/comments${commentId ? `/${id(commentId)}` : ""}`;
export const commentService = {
  list: async (
    postId: string,
    page = 1,
    signal?: AbortSignal,
    parentId?: string
  ) => {
    const path = commentsPath(postId, parentId) + (parentId ? "/replies" : "");
    const result = await request<{ comments?: Comment[]; replies?: Comment[] }>(
      `${path}?page=${page}&limit=10`,
      { signal }
    );
    return collection(
      result,
      result.data.comments || result.data.replies || []
    );
  },
  create: (postId: string, content: string, image?: File, parentId?: string) =>
    request<{ comment?: Comment; reply?: Comment }>(
      commentsPath(postId, parentId) + (parentId ? "/replies" : ""),
      { method: "POST", body: mediaForm("content", content, image) }
    ),
  update: (postId: string, commentId: string, content: string, image?: File) =>
    request<{ comment: Comment }>(commentsPath(postId, commentId), {
      method: "PUT",
      body: mediaForm("content", content, image),
    }),
  remove: (postId: string, commentId: string) =>
    request<Record<string, unknown>>(commentsPath(postId, commentId), {
      method: "DELETE",
    }),
  like: (postId: string, commentId: string) =>
    request<{ liked: boolean; likesCount: number; comment: Comment }>(
      commentsPath(postId, commentId) + "/like",
      { method: "PUT" }
    ),
};

export const notificationService = {
  list: async (page = 1, signal?: AbortSignal, unread = false) => {
    const result = await request<{ notifications: Notification[] }>(
      // الخادم الحالي يفسّر unread كقيمة isRead: false يرجّع غير المقروء.
      // بدون الفلتر يرجّع كل الإشعارات، وده اتأكدنا منه بطلبات فعلية.
      `/notifications?page=${page}&limit=15${unread ? "&unread=false" : ""}`,
      { signal }
    );
    return collection(result, result.data.notifications);
  },
  count: (signal?: AbortSignal) =>
    request<{ unreadCount: number }>("/notifications/unread-count", { signal }),
  read: (notificationId: string) =>
    request<Record<string, unknown>>(
      `/notifications/${id(notificationId)}/read`,
      { method: "PATCH" }
    ),
  readAll: () =>
    request<Record<string, unknown>>("/notifications/read-all", {
      method: "PATCH",
    }),
};
