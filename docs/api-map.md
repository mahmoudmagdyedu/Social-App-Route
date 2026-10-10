# خريطة الوظائف وطلبات الـ API

المصدر: [Postman الأصلي](https://documenter.getpostman.com/view/5709532/2sBXcBnNAq). Base URL: `https://route-posts.routemisr.com`.

كل الطلبات المحمية تستخدم `Authorization: Bearer <token>`. التسجيل والدخول وHealth Check بدون توكن. معرفات المسارات استُبدلت بمعرفات فعلية؛ الفراغات `//` في تصدير Postman ناتجة عن variables بلا قيم.

| #   | الوظيفة                | Method | المسار                                       | مكانها في التطبيق         |
| --- | ---------------------- | ------ | -------------------------------------------- | ------------------------- |
| 1   | Health Check           | GET    | `/`                                          | اختبار الخادم             |
| 2   | Signup                 | POST   | `/users/signup`                              | Auth                      |
| 3   | Signin                 | POST   | `/users/signin`                              | Auth                      |
| 4   | Change Password        | PATCH  | `/users/change-password`                     | Settings                  |
| 5   | Upload Profile Photo   | PUT    | `/users/upload-photo`                        | Settings                  |
| 6   | Get My Profile         | GET    | `/users/profile-data`                        | AuthProvider              |
| 7   | Get Bookmarks          | GET    | `/users/bookmarks`                           | Feed /bookmarks           |
| 8   | Get Follow Suggestions | GET    | `/users/suggestions`                         | Discover / Layout         |
| 9   | Get User Profile       | GET    | `/users/:userId/profile`                     | Profile                   |
| 10  | Follow/Unfollow        | PUT    | `/users/:userId/follow`                      | Profile / UserCard        |
| 11  | Get User Posts         | GET    | `/users/:userId/posts`                       | Profile                   |
| 12  | Get All Posts          | GET    | `/posts`                                     | Feed                      |
| 13  | Get Home Feed          | GET    | `/posts/feed`                                | Feed / المتابَعين / الصور |
| 14  | Create Post            | POST   | `/posts`                                     | Composer                  |
| 15  | Get Single Post        | GET    | `/posts/:postId`                             | PostDetails               |
| 16  | Get Post Likes         | GET    | `/posts/:postId/likes`                       | LikesList                 |
| 17  | Update Post            | PUT    | `/posts/:postId`                             | PostCard                  |
| 18  | Delete Post            | DELETE | `/posts/:postId`                             | PostCard                  |
| 19  | Like/Unlike Post       | PUT    | `/posts/:postId/like`                        | PostCard                  |
| 20  | Bookmark/Unbookmark    | PUT    | `/posts/:postId/bookmark`                    | PostCard                  |
| 21  | Share Post             | POST   | `/posts/:postId/share`                       | PostCard                  |
| 22  | Get Comments           | GET    | `/posts/:postId/comments`                    | Comments                  |
| 23  | Create Comment         | POST   | `/posts/:postId/comments`                    | Comments                  |
| 24  | Get Replies            | GET    | `/posts/:postId/comments/:commentId/replies` | Comments / الردود         |
| 25  | Create Reply           | POST   | `/posts/:postId/comments/:commentId/replies` | Comments / الردود         |
| 26  | Update Comment/Reply   | PUT    | `/posts/:postId/comments/:commentId`         | CommentItem               |
| 27  | Delete Comment/Reply   | DELETE | `/posts/:postId/comments/:commentId`         | CommentItem               |
| 28  | Like/Unlike Comment    | PUT    | `/posts/:postId/comments/:commentId/like`    | CommentItem               |
| 29  | Get Notifications      | GET    | `/notifications`                             | Notifications             |
| 30  | Get Unread Count       | GET    | `/notifications/unread-count`                | Layout / Nav              |
| 31  | Mark One Read          | PATCH  | `/notifications/:notificationId/read`        | Notifications             |
| 32  | Mark All Read          | PATCH  | `/notifications/read-all`                    | Notifications             |

## Payload والصفحات

- Signup: `name`, `username`, `email`, `dateOfBirth`, `gender`, `password`, `rePassword`.
- Signin: `login`, `password`. التوثيق يسمح بـemail أوusername أوlogin؛ التطبيق يستخدمlogin للنوعين.
- Change password: `password`, `newPassword`، والـResponse يرجع JWT جديد.
- Post multipart: `body` و`image` اختياري. Comment/reply multipart: `content` و`image` اختياري. Profile multipart: `photo`.
- Share JSON: `body`. الخادم يمنع empty string ويمنع مشاركة نفس المنشور مرتين (409). التطبيق يدعم مشاركة بدون تعليق بإرسال مسافة، وتم اختبارها فعلياً.
- Feed: `only=following`, `hasImage=true`, `page`, `limit`. التطبيق يستخدم page-based pagination؛ الخادم يدعم cursor أيضاً بحسب التوثيق.
- Lists: `data.posts`, `data.bookmarks`, `data.suggestions`, `data.comments`, `data.replies`, `data.likes`, `data.notifications`، والصفحات داخل `meta.pagination`.
- تغيير الصورة الشخصية ينشئ منشوراً تلقائياً عند الخادم. برنامج الاختبار ينظف المنشور الإضافي أيضاً.
- **سلوك اتثبت بالاختبار في 5 أكتوبر 2026:** `/notifications` بدون `unread` بيرجع الكل. `unread=false` بيرجع عناصر `isRead=false`، و`unread=true` بيرجع المقروءة. عشان كده تبويب «غير مقروءة» يستخدم `unread=false`، وتبويب «الكل» بيحذف الفلتر. الاسم في التوثيق لا يطابق تفسير الخادم الحالي.
- فلتر الصور لكل الناس يستخدم `/posts/feed?only=all&hasImage=true`؛ ترك `only` بيرجع Feed للمتابَعين افتراضياً. تم التحقق من وجود صور في كل عناصر نتيجة `only=all`.

اختيارات الأمان وإظهار الملكية في الواجهة لا تستبدل تحقق الخادم. مفيش calls لحذف حساب، تعديل بيانات شخصية، نسيان كلمة سر، رفع غلاف أوsearch عام لأن العمليات دي مش ضمن الـ32 endpoint المرفقة.
