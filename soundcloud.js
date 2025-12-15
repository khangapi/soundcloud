export default {
  async fetch(request) {
    const url = new URL(request.url);

    // OPTIONS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(request),
      });
    }

    if (
      url.pathname !== "/scl-api" &&
      !url.pathname.startsWith("/scl-api/")
    ) {
      return new Response("Not Found", { status: 404 });
    }

    let scPath = url.pathname.replace(/^\/scl-api\/?/, "");
    scPath = "/" + scPath;

    const target =
      "https://api-v2.soundcloud.com" + scPath + url.search;

    const headers = new Headers(request.headers);
    headers.set("Host", "api-v2.soundcloud.com");
    headers.set("Origin", "https://soundcloud.com");
    headers.set("Referer", "https://soundcloud.com/");
    headers.set(
      "User-Agent",
      "Mozilla/5.0 Chrome/120 Safari/537.36"
    );

    [
      "cf-connecting-ip",
      "cf-ipcountry",
      "cf-ray",
      "cf-visitor",
      "x-forwarded-for"
    ].forEach(h => headers.delete(h));

    const resp = await fetch(target, {
      method: request.method,
      headers,
      body:
        request.method === "GET" || request.method === "HEAD"
          ? null
          : await request.arrayBuffer(),
    });

    const resHeaders = new Headers(resp.headers);
    applyCors(resHeaders, request);

    return new Response(resp.body, {
      status: resp.status,
      headers: resHeaders,
    });
  }
};

function corsHeaders(req) {
  const origin = req.headers.get("Origin") || "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Max-Age": "86400",
  };
}

function applyCors(headers, req) {
  const origin = req.headers.get("Origin") || "*";
  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Access-Control-Allow-Credentials", "true");
}
