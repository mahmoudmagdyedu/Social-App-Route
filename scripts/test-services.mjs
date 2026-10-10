import assert from "node:assert/strict";
import { createServer } from "vite";

// Load the actual application service through Vite, with isolated browser mocks.
const server = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "error",
});
const originalFetch = globalThis.fetch;
const storage = new Map();
globalThis.localStorage = {
  getItem: (key) => storage.get(key) || null,
  setItem: (key, value) => storage.set(key, value),
  removeItem: (key) => storage.delete(key),
};
globalThis.window = new EventTarget();
const results = [];
const test = async (name, run) => {
  await run();
  results.push(name);
};
try {
  const { request, mediaForm, validateImage, TOKEN_KEY, ApiError } =
    await server.ssrLoadModule("/src/services/api.ts");
  const { authService, postService, commentService, notificationService } =
    await server.ssrLoadModule("/src/services/social.ts");
  const ok = (data) =>
    new Response(JSON.stringify({ success: true, message: "success", data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  storage.set(TOKEN_KEY, "synthetic-test-token");
  await test("Authenticated requests attach the Bearer token", async () => {
    globalThis.fetch = async (url, options) => {
      assert.equal(
        new Headers(options.headers).get("Authorization"),
        "Bearer synthetic-test-token"
      );
      assert(url.endsWith("/users/profile-data"));
      return ok({ user: { _id: "test" } });
    };
    await authService.me();
  });
  await test("Signin omits existing token and sends documented login JSON", async () => {
    globalThis.fetch = async (url, options) => {
      assert.equal(new Headers(options.headers).get("Authorization"), null);
      assert.equal(options.method, "POST");
      assert.deepEqual(JSON.parse(options.body), {
        login: "test_user",
        password: "Password!1",
      });
      return ok({ token: "new", user: {} });
    };
    await authService.signin("test_user", "Password!1");
  });
  await test("Multipart does not manually set a broken boundary", async () => {
    globalThis.fetch = async (url, options) => {
      assert(options.body instanceof FormData);
      assert.equal(new Headers(options.headers).get("Content-Type"), null);
      assert.equal(options.body.get("body"), "hello");
      return ok({ post: {} });
    };
    await postService.create(" hello ");
  });
  await test("Image filtering uses documented feed endpoint", async () => {
    globalThis.fetch = async (url) => {
      assert(url.includes("/posts/feed?"));
      assert(url.includes("only=all"));
      assert(url.includes("hasImage=true"));
      return ok({ posts: [] });
    };
    await postService.list(1, undefined, false, true);
  });
  await test("Replies use nested IDs and content FormData", async () => {
    globalThis.fetch = async (url, options) => {
      assert(url.endsWith("/posts/post/comments/parent/replies"));
      assert.equal(options.body.get("content"), "reply");
      return ok({ reply: {} });
    };
    await commentService.create("post", "reply", undefined, "parent");
  });
  await test("401 invalidates session for protected requests", async () => {
    let expired = false;
    window.addEventListener(
      "auth-expired",
      () => {
        expired = true;
      },
      { once: true }
    );
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ success: false, message: "expired" }), {
        status: 401,
      });
    await assert.rejects(
      request("/posts"),
      (e) => e instanceof ApiError && e.status === 401
    );
    assert(expired);
  });
  await test("Invalid signin does not invalidate an unrelated session", async () => {
    let expired = false;
    const listener = () => {
      expired = true;
    };
    window.addEventListener("auth-expired", listener);
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({ success: false, message: "bad credentials" }),
        { status: 401 }
      );
    await assert.rejects(authService.signin("wrong", "wrong"));
    assert.equal(expired, false);
    window.removeEventListener("auth-expired", listener);
  });
  await test("AbortError is preserved for Effect cleanup", async () => {
    globalThis.fetch = async () => {
      throw new DOMException("aborted", "AbortError");
    };
    await assert.rejects(request("/posts"), (e) => e.name === "AbortError");
  });
  await test("Network errors produce a useful retry message", async () => {
    globalThis.fetch = async () => {
      throw new TypeError("fetch failed");
    };
    await assert.rejects(
      request("/posts"),
      (e) =>
        e instanceof ApiError &&
        e.status === 0 &&
        e.message.includes("الإنترنت")
    );
  });
  await test("Invalid non-JSON response is rejected", async () => {
    globalThis.fetch = async () =>
      new Response("<html>proxy error</html>", { status: 502 });
    await assert.rejects(request("/posts"), (e) => e.status === 502);
  });
  await test("Image checks reject non-images and large files", async () => {
    assert.throws(() =>
      validateImage(new File(["x"], "bad.txt", { type: "text/plain" }))
    );
    assert.throws(() =>
      validateImage(
        new File([new Uint8Array(6 * 1024 * 1024)], "large.png", {
          type: "image/png",
        })
      )
    );
    validateImage(new File(["x"], "valid.png", { type: "image/png" }));
  });
  await test("Media payload trims text and preserves image bytes", async () => {
    const file = new File(["abc"], "image.png", { type: "image/png" });
    const body = mediaForm("content", "  hello  ", file);
    assert.equal(body.get("content"), "hello");
    assert.equal(await body.get("image").text(), "abc");
  });
  await test("Optional share and image-only media obey the nonempty API contract", async () => {
    globalThis.fetch = async (url, options) => {
      assert.equal(JSON.parse(options.body).body, " ");
      return ok({ post: {} });
    };
    await postService.share("post", "");
    assert.equal(mediaForm("content", "").get("content"), " ");
  });
  await test("All and unread notifications match the observed server filter semantics", async () => {
    let calls = 0;
    globalThis.fetch = async (url) => {
      const parsed = new URL(url);
      assert.equal(
        parsed.searchParams.get("unread"),
        calls++ === 0 ? null : "false"
      );
      return ok({ notifications: [] });
    };
    await notificationService.list(1, undefined, false);
    await notificationService.list(1, undefined, true);
  });
  console.log(`${results.length}/${results.length} service checks passed`);
  for (const result of results) console.log(`✓ ${result}`);
} finally {
  globalThis.fetch = originalFetch;
  await server.close();
}
