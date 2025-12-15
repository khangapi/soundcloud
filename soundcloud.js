export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Chấp nhận: /scl-api hoặc /scl-api/*
    if (
      url.pathname !== "/scl-api" &&
      !url.pathname.startsWith("/scl-api/")
    ) {
      return new Response("Not Found", { status: 404 });
    }

    // Cắt /scl-api hoặc /scl-api/
    let scPath = url.pathname.replace(/^\/scl-api\/?/, "");
    scPath = "/" + scPath; // đảm bảo luôn có /

    const targetUrl =
      "https://api-v2.soundcloud.com" + scPath + url.search;

    const headers = new Headers(request.headers);

    // Fake header giống web SoundCloud
    headers.set("Host", "api-v2.soundcloud.com");
    headers.set("Origin", "https://soundcloud.com");
    headers.set("Referer", "https://soundcloud.com/");
    headers.set(
      "User-Agent",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
    );

    // Xoá header Cloudflare dư thừa
    [
      "cf-connecting-ip",
      "cf-ipcountry",
      "cf-ray",
      "cf-visitor",
      "x-forwarded-for",
    ].forEach(h => headers.delete(h));

    const resp = await fetch(targetUrl, {
      method: request.method,
      headers,
      body:
        request.method === "GET" || request.method === "HEAD"
          ? null
          : await request.arrayBuffer(),
    });

    const resHeaders = new Headers(resp.headers);
    resHeaders.set("Access-Control-Allow-Origin", "*");
    resHeaders.set("Access-Control-Allow-Headers", "*");
    resHeaders.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");

    return new Response(resp.body, {
      status: resp.status,
      headers: resHeaders,
    });
  },
};
