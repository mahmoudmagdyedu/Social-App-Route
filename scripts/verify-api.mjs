import assert from "node:assert/strict";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { randomBytes } from "node:crypto";

const base = "https://route-posts.routemisr.com";
const results = [];
const accountPath = "qa-account.local.json";
const peerPath = "qa-peer.local.json";
const createAccount = async (
  name = "Social App QA Peer",
  prefix = "socialpeer"
) => {
  const suffix = Date.now().toString(36);
  const account = {
    name,
    username: `${prefix}_${suffix}`,
    email: `${prefix}_${suffix}@example.com`,
    dateOfBirth: "2000-01-01",
    gender: "male",
    password: `Qa!${randomBytes(12).toString("hex")}A`,
  };
  account.rePassword = account.password;
  const response = await fetch(base + "/users/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(account),
  });
  const result = await response.json();
  assert(response.ok, result.message);
  results.push({ name: "Signup", status: response.status, passed: true });
  return { ...account, ...result.data };
};
let account;
try {
  account = JSON.parse(await readFile(accountPath, "utf8"));
} catch {
  account = await createAccount("Social App QA", "socialqa");
  await writeFile(accountPath, JSON.stringify(account, null, 2));
}
let peer;
try {
  peer = JSON.parse(await readFile(peerPath, "utf8"));
} catch {
  peer = await createAccount();
  await writeFile(peerPath, JSON.stringify(peer, null, 2));
}
const call = async (
  name,
  path,
  method = "GET",
  body,
  actor = account,
  authenticated = true
) => {
  const response = await fetch(base + path, {
    method,
    headers: {
      ...(authenticated ? { Authorization: `Bearer ${actor.token}` } : {}),
      ...(body && !(body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
    },
    body:
      body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });
  const result = await response.json();
  results.push({
    name,
    status: response.status,
    passed: response.ok && result.success === true,
  });
  assert(response.ok && result.success, `${name}: ${result.message}`);
  return result;
};
const form = (key, value) => {
  const body = new FormData();
  body.set(key, value);
  return body;
};
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j6dQAAAAASUVORK5CYII=",
  "base64"
);
let postId,
  peerPostId,
  shareId,
  followed = false,
  peerFollowed = false;
let baselineIds;
try {
  const health = await fetch(base + "/");
  assert(health.ok);
  results.push({ name: "Health Check", status: health.status, passed: true });
  const signin = await call(
    "Signin",
    "/users/signin",
    "POST",
    { login: account.username, password: account.password },
    account,
    false
  );
  account.token = signin.data.token;
  await writeFile(accountPath, JSON.stringify(account, null, 2));
  const baseline = await call(
    "QA Baseline Posts",
    `/users/${account.user._id}/posts`
  );
  baselineIds = new Set(baseline.data.posts.map((post) => post._id));
  await call("Get My Profile", "/users/profile-data");
  await call("Get User Profile", `/users/${peer.user._id}/profile`);
  await call("Get Follow Suggestions", "/users/suggestions?limit=2");
  await call("Get All Posts", "/posts?page=1&limit=2");
  const body = form("body", "Social App QA: temporary integration test post");
  body.set("image", new Blob([png], { type: "image/png" }), "qa.png");
  const created = await call("Create Post + Image", "/posts", "POST", body);
  postId = created.data.post._id;
  await call("Get Single Post", `/posts/${postId}`);
  await call("Get User Posts", `/users/${account.user._id}/posts`);
  const updated = await call(
    "Update Post",
    `/posts/${postId}`,
    "PUT",
    form("body", "Social App QA: updated integration post")
  );
  assert.equal(
    updated.data.post.body,
    "Social App QA: updated integration post"
  );
  const liked = await call("Like Post", `/posts/${postId}/like`, "PUT");
  assert.equal(liked.data.liked, true);
  const likes = await call(
    "Get Post Likes",
    `/posts/${postId}/likes?page=1&limit=20`
  );
  assert(likes.data.likes.some((u) => u._id === account.user._id));
  await call("Unlike Post", `/posts/${postId}/like`, "PUT");
  await call("Bookmark Post", `/posts/${postId}/bookmark`, "PUT");
  const bookmarks = await call("Get Bookmarks", "/users/bookmarks");
  assert(bookmarks.data.bookmarks.some((p) => p._id === postId));
  await call("Unbookmark Post", `/posts/${postId}/bookmark`, "PUT");
  const share = await call("Share Post", `/posts/${postId}/share`, "POST", {
    body: "Social App QA: temporary shared post",
  });
  shareId = share.data.post._id;
  const comment = await call(
    "Create Comment",
    `/posts/${postId}/comments`,
    "POST",
    form("content", "Social App QA: temporary comment")
  );
  const commentId = comment.data.comment._id;
  await call("Get Post Comments", `/posts/${postId}/comments?page=1&limit=10`);
  await call(
    "Update Comment",
    `/posts/${postId}/comments/${commentId}`,
    "PUT",
    form("content", "Social App QA: updated comment")
  );
  await call(
    "Like Comment",
    `/posts/${postId}/comments/${commentId}/like`,
    "PUT"
  );
  await call(
    "Unlike Comment",
    `/posts/${postId}/comments/${commentId}/like`,
    "PUT"
  );
  const reply = await call(
    "Create Reply",
    `/posts/${postId}/comments/${commentId}/replies`,
    "POST",
    form("content", "Social App QA: temporary reply")
  );
  await call(
    "Get Replies",
    `/posts/${postId}/comments/${commentId}/replies?page=1&limit=10`
  );
  await call(
    "Update Reply",
    `/posts/${postId}/comments/${reply.data.reply._id}`,
    "PUT",
    form("content", "Social App QA: updated reply")
  );
  await call(
    "Delete Reply",
    `/posts/${postId}/comments/${reply.data.reply._id}`,
    "DELETE"
  );
  await call(
    "Delete Comment",
    `/posts/${postId}/comments/${commentId}`,
    "DELETE"
  );
  const peerSignin = await call(
    "Peer Signin",
    "/users/signin",
    "POST",
    { login: peer.username, password: peer.password },
    peer,
    false
  );
  peer.token = peerSignin.data.token;
  await call("Follow User", `/users/${peer.user._id}/follow`, "PUT");
  followed = true;
  const peerPost = await call(
    "Peer Create Post",
    "/posts",
    "POST",
    form("body", "Social App QA: following feed fixture"),
    peer
  );
  peerPostId = peerPost.data.post._id;
  const feed = await call(
    "Get Following Feed",
    "/posts/feed?only=following&limit=10"
  );
  assert(feed.data.posts.some((p) => p._id === peerPostId));
  await call("Unfollow User", `/users/${peer.user._id}/follow`, "PUT");
  followed = false;
  await call(
    "Peer Follow Main",
    `/users/${account.user._id}/follow`,
    "PUT",
    undefined,
    peer
  );
  peerFollowed = true;
  await call("Peer Like Main", `/posts/${postId}/like`, "PUT", undefined, peer);
  const notifications = await call(
    "Get Notifications",
    "/notifications?unread=false&page=1&limit=10"
  );
  const count = await call("Get Unread Count", "/notifications/unread-count");
  assert(count.data.unreadCount > 0);
  await mkdir("docs", { recursive: true });
  await writeFile(
    "docs/notification-shape.json",
    JSON.stringify(notifications.data.notifications.slice(0, 2), null, 2)
  );
  await call(
    "Mark Notification Read",
    `/notifications/${notifications.data.notifications[0]._id}/read`,
    "PATCH"
  );
  await call("Mark All Read", "/notifications/read-all", "PATCH");
  const photo = new FormData();
  photo.set("photo", new Blob([png], { type: "image/png" }), "qa.png");
  await call("Upload Profile Photo", "/users/upload-photo", "PUT", photo);
  const temporaryPassword = `Qa!${randomBytes(12).toString("hex")}A`;
  const changed = await call(
    "Change Password",
    "/users/change-password",
    "PATCH",
    { password: account.password, newPassword: temporaryPassword }
  );
  account.token = changed.data.token;
  await writeFile(
    accountPath,
    JSON.stringify(
      {
        ...account,
        password: temporaryPassword,
        rePassword: temporaryPassword,
      },
      null,
      2
    )
  );
  const restored = await call(
    "Restore QA Password",
    "/users/change-password",
    "PATCH",
    { password: temporaryPassword, newPassword: account.password }
  );
  account.token = restored.data.token;
  await writeFile(accountPath, JSON.stringify(account, null, 2));
} finally {
  if (peerFollowed)
    await call(
      "Cleanup Peer Follow",
      `/users/${account.user._id}/follow`,
      "PUT",
      undefined,
      peer
    );
  if (followed)
    await call("Cleanup Main Follow", `/users/${peer.user._id}/follow`, "PUT");
  if (shareId) await call("Cleanup Share", `/posts/${shareId}`, "DELETE");
  if (peerPostId)
    await call(
      "Cleanup Peer Post",
      `/posts/${peerPostId}`,
      "DELETE",
      undefined,
      peer
    );
  if (postId) await call("Delete Post", `/posts/${postId}`, "DELETE");
  // Uploading a profile photo also creates a post on this API.
  if (baselineIds) {
    const current = await call(
      "Cleanup Snapshot",
      `/users/${account.user._id}/posts`
    );
    for (const post of current.data.posts) {
      if (!baselineIds.has(post._id))
        await call(
          "Cleanup Auto-created Photo Post",
          `/posts/${post._id}`,
          "DELETE"
        );
    }
  }
  await mkdir("docs", { recursive: true });
  await writeFile(
    "docs/api-verification.json",
    JSON.stringify(
      { testedAt: new Date().toISOString(), baseUrl: base, results },
      null,
      2
    )
  );
  console.log(
    JSON.stringify(
      {
        passed: results.filter((r) => r.passed).length,
        total: results.length,
        failures: results.filter((r) => !r.passed),
      },
      null,
      2
    )
  );
}
