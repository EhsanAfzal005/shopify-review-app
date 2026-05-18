import { cors } from "../cors";

describe("cors utility", () => {
    function makeResponse(body = "OK", status = 200, statusText = "OK") {
        return new Response(body, { status, statusText });
    }

    test("adds default CORS headers (origin *, methods, headers)", () => {
        const res = cors(new Request("http://localhost"), makeResponse());
        expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
        expect(res.headers.get("Access-Control-Allow-Methods")).toBe(
            "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS"
        );
        expect(res.headers.get("Access-Control-Allow-Headers")).toBe(
            "Content-Type,Authorization"
        );
    });

    test("respects custom origin, methods, headers options", () => {
        const res = cors(new Request("http://localhost"), makeResponse(), {
            origin: "https://mysite.com",
            methods: "GET,POST",
            headers: "X-Custom",
        });
        expect(res.headers.get("Access-Control-Allow-Origin")).toBe("https://mysite.com");
        expect(res.headers.get("Access-Control-Allow-Methods")).toBe("GET,POST");
        expect(res.headers.get("Access-Control-Allow-Headers")).toBe("X-Custom");
    });

    test("sets credentials header when credentials: true", () => {
        const res = cors(new Request("http://localhost"), makeResponse(), {
            credentials: true,
        });
        expect(res.headers.get("Access-Control-Allow-Credentials")).toBe("true");
    });

    test("sets max-age header when provided", () => {
        const res = cors(new Request("http://localhost"), makeResponse(), {
            maxAge: 86400,
        });
        expect(res.headers.get("Access-Control-Max-Age")).toBe("86400");
    });

    test("preserves original response body, status, statusText", async () => {
        const original = makeResponse("Hello World", 201, "Created");
        const res = cors(new Request("http://localhost"), original);
        expect(res.status).toBe(201);
        expect(res.statusText).toBe("Created");
        const body = await res.text();
        expect(body).toBe("Hello World");
    });
});
