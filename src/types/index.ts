export interface User {
  _id: string;
  name: string;
  username?: string;
  email?: string;
  photo?: string;
  cover?: string;
  dateOfBirth?: string;
  gender?: "male" | "female";
  createdAt?: string;
  followers?: string[];
  following?: string[];
  followersCount?: number;
  followingCount?: number;
  bookmarksCount?: number;
}

export interface Post {
  _id: string;
  body: string;
  image?: string;
  user: User;
  createdAt: string;
  likes?: (string | User)[];
  likesCount?: number;
  commentsCount?: number;
  sharesCount?: number;
  bookmarked?: boolean;
  sharedPost?: Post | null;
  isShare?: boolean;
}

export interface Comment {
  _id: string;
  content: string;
  image?: string;
  commentCreator: User;
  createdAt: string;
  likes?: (string | User)[];
  likesCount?: number;
  repliesCount?: number;
  parentComment?: string | null;
}

export interface Notification {
  _id: string;
  type: string;
  actor?: User;
  recipient?: string | User;
  entityId?: string;
  entityType?: string;
  post?: Post | string;
  isRead: boolean;
  createdAt: string;
  entity?: {
    _id?: string;
    post?: string | Post;
    body?: string;
    content?: string;
  };
}

export interface Pagination {
  currentPage: number;
  numberOfPages: number;
  limit: number;
  total: number;
  nextPage?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: { pagination?: Pagination };
}

export interface Collection<T> {
  items: T[];
  pagination?: Pagination;
}

export interface AuthData {
  token: string;
  user: User;
}
export interface SignupValues {
  name: string;
  username: string;
  email: string;
  dateOfBirth: string;
  gender: "male" | "female";
  password: string;
  rePassword: string;
}
