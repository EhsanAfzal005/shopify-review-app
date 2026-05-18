export function cors(request, response, options = {}) {
  const headers = new Headers(response.headers);

  headers.set("Access-Control-Allow-Origin", options.origin || "*");
  headers.set(
    "Access-Control-Allow-Methods",
    options.methods || "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS"
  );
  headers.set(
    "Access-Control-Allow-Headers",
    options.headers || "Content-Type,Authorization"
  );

  if (options.credentials) {
    headers.set("Access-Control-Allow-Credentials", "true");
  }

  // Handle options that might be passed
  if (options.maxAge) {
    headers.set("Access-Control-Max-Age", options.maxAge.toString());
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
