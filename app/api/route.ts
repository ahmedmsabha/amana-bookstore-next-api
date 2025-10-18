import { NextResponse } from "next/server";
import { getDemoApiKey } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    const accept = req.headers.get("accept") ?? "";
    const base = new URL(req.url);
    const origin = `${base.protocol}//${base.host}`;

    const configuredKeysRaw = (process.env.API_KEYS ?? process.env.API_KEY ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    const showKeys = (process.env.SHOW_API_KEYS ?? "false").toLowerCase() === "true";
    const maskKey = (k: string) => (k.length <= 6 ? "***" : `${k.slice(0, 3)}***${k.slice(-2)}`);
    const demoKey = getDemoApiKey();
    const visibleKeys = showKeys ? [demoKey, ...configuredKeysRaw] : [maskKey(demoKey), ...configuredKeysRaw.map(maskKey)];

    // If JSON explicitly requested, return a machine-readable descriptor
    if (accept.includes("application/json")) {
        return NextResponse.json({
            name: "Amana Bookstore API",
            version: "1.0",
            baseUrl: `${origin}/api`,
            authentication: {
                type: "apiKey",
                headers: ["x-api-key"],
                bearer: true,
                env: ["API_KEYS", "API_KEY"],
                acceptedKeys: visibleKeys,
                showKeys,
                demoKey,
            },
            endpoints: {
                books: {
                    list: { method: "GET", path: "/api/books" },
                    getById: { method: "GET", path: "/api/books/{id}" },
                    publishedBetween: {
                        method: "GET",
                        path: "/api/books/published",
                        query: { start: "YYYY-MM-DD", end: "YYYY-MM-DD" },
                    },
                    topRated: { method: "GET", path: "/api/books/top-rated", query: { limit: "number?" } },
                    featured: { method: "GET", path: "/api/books/featured" },
                    create: { method: "POST", path: "/api/books", auth: true },
                    reviewsByBook: { method: "GET", path: "/api/books/{id}/reviews" },
                },
                reviews: {
                    create: { method: "POST", path: "/api/reviews", auth: true },
                },
            },
        });
    }

    const html = `<!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Amana Bookstore API</title>
      <style>
        :root { color-scheme: light dark; }
        body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"; margin: 2rem; line-height: 1.55; }
        code, pre { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
        a { color: #0a7; text-decoration: none; }
        a:hover { text-decoration: underline; }
        h1 { margin-bottom: 0.25rem; }
        .muted { opacity: 0.7; }
        .grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
        .card { border: 1px solid rgba(127,127,127,.3); border-radius: 12px; padding: 1rem; }
        .method { font-weight: 700; padding: .15rem .5rem; border-radius: 6px; margin-right: .5rem; }
        .GET { background: rgba(16,185,129,.15); color: #10b981; }
        .POST { background: rgba(59,130,246,.15); color: #3b82f6; }
        ul { margin: .5rem 0 .5rem 1.25rem; }
        pre { background: rgba(127,127,127,.12); padding: .75rem; border-radius: 8px; overflow-x: auto; }
      </style>
    </head>
    <body>
      <header>
        <h1>Amana Bookstore API</h1>
        <div class="muted">Base URL: <code>${origin}/api</code></div>
        <p>Explore available endpoints below. For POST routes, include an API key via <code>x-api-key</code> or <code>Authorization: Bearer &lt;token&gt;</code>. Configure allowed keys using <code>API_KEYS</code> (comma-separated) or <code>API_KEY</code> env vars.</p>
        <p>Accepted API keys: <code>${visibleKeys.length ? visibleKeys.join(", ") : "(none configured)"}</code>${showKeys ? "" : " <span class=\"muted\">(keys masked; set SHOW_API_KEYS=true to reveal)</span>"}</p>
        <p><strong>Demo key (non-production):</strong> <code>${demoKey}</code></p>
      </header>

      <section class="grid">
        <div class="card">
          <h3><span class="method GET">GET</span>All books</h3>
          <a href="${origin}/api/books">/api/books</a>
        </div>

        <div class="card">
          <h3><span class="method GET">GET</span>Book by ID</h3>
          <a href="${origin}/api/books/1">/api/books/{id}</a>
        </div>

        <div class="card">
          <h3><span class="method GET">GET</span>Published between</h3>
          <a href="${origin}/api/books/published?start=2022-01-01&end=2023-12-31">/api/books/published?start=YYYY-MM-DD&end=YYYY-MM-DD</a>
        </div>

        <div class="card">
          <h3><span class="method GET">GET</span>Top rated</h3>
          <a href="${origin}/api/books/top-rated?limit=10">/api/books/top-rated?limit=10</a>
        </div>

        <div class="card">
          <h3><span class="method GET">GET</span>Featured</h3>
          <a href="${origin}/api/books/featured">/api/books/featured</a>
        </div>

        <div class="card">
          <h3><span class="method GET">GET</span>Reviews for a book</h3>
          <a href="${origin}/api/books/1/reviews">/api/books/{id}/reviews</a>
        </div>

        <div class="card">
          <h3><span class="method POST">POST</span>Create book</h3>
          <code>POST /api/books</code>
          <p class="muted">Headers: <code>x-api-key: &lt;key&gt;</code> or <code>Authorization: Bearer &lt;token&gt;</code></p>
        </div>

        <div class="card">
          <h3><span class="method POST">POST</span>Create review</h3>
          <code>POST /api/reviews</code>
          <p class="muted">Headers: <code>x-api-key: &lt;key&gt;</code> or <code>Authorization: Bearer &lt;token&gt;</code></p>
        </div>
      </section>

  <section>
    <h2>Copy & paste: request bodies</h2>
    <h3>New Book</h3>
    <pre>{
  "title": "Example Book Title",
  "author": "Example Author",
  "description": "Short description of the example book.",
  "price": 19.99,
  "image": "/images/example.jpg",
  "isbn": "978-1111111111",
  "genre": ["Category"],
  "tags": ["tag1", "tag2"],
  "datePublished": "2024-07-15",
  "pages": 200,
  "language": "English",
  "publisher": "Publisher Inc.",
  "inStock": true,
  "featured": false
}</pre>
    <h3>New Review</h3>
    <pre>{
  "bookId": "1",
  "author": "Reviewer Name",
  "rating": 5,
  "title": "Great book!",
  "comment": "Loved reading this book."
}</pre>
  </section>

  <section>
    <h2>cURL examples</h2>
    <pre>curl -s ${origin}/api/books | jq .</pre>
    <pre>curl -s "${origin}/api/books/published?start=2022-01-01&end=2023-12-31" | jq .</pre>
    <h3>POST book (x-api-key header)</h3>
    <pre>curl -s -X POST ${origin}/api/books \
  -H 'content-type: application/json' \
  -H 'x-api-key: ${demoKey}' \
  -d '{"title":"Example Book Title","author":"Example Author","description":"Short description of the example book.","price":19.99,"image":"/images/example.jpg","isbn":"978-1111111111","genre":["Category"],"tags":["tag1","tag2"],"datePublished":"2024-07-15","pages":200,"language":"English","publisher":"Publisher Inc.","inStock":true,"featured":false}' | jq .</pre>
    <h3>POST book (Bearer token)</h3>
    <pre>curl -s -X POST ${origin}/api/books \
  -H 'content-type: application/json' \
  -H 'Authorization: Bearer ${demoKey}' \
  -d '{"title":"Example Book Title","author":"Example Author","description":"Short description of the example book.","price":19.99,"image":"/images/example.jpg","isbn":"978-1111111111","genre":["Category"],"tags":["tag1","tag2"],"datePublished":"2024-07-15","pages":200,"language":"English","publisher":"Publisher Inc.","inStock":true,"featured":false}' | jq .</pre>
    <h3>POST book (query param)</h3>
    <pre>curl -s -X POST "${origin}/api/books?api_key=${demoKey}" \
  -H 'content-type: application/json' \
  -d '{"title":"Example Book Title","author":"Example Author","description":"Short description of the example book.","price":19.99,"image":"/images/example.jpg","isbn":"978-1111111111","genre":["Category"],"tags":["tag1","tag2"],"datePublished":"2024-07-15","pages":200,"language":"English","publisher":"Publisher Inc.","inStock":true,"featured":false}' | jq .</pre>

    <h3>POST review (x-api-key header)</h3>
    <pre>curl -s -X POST ${origin}/api/reviews \
  -H 'content-type: application/json' \
  -H 'x-api-key: ${demoKey}' \
  -d '{"bookId":"1","author":"Reviewer Name","rating":5,"title":"Great book!","comment":"Loved reading this book."}' | jq .</pre>
  </section>

      <footer class="muted">Tip: Send <code>Accept: application/json</code> to receive this page as JSON.</footer>
    </body>
  </html>`;

    return new NextResponse(html, {
        status: 200,
        headers: { "content-type": "text/html; charset=utf-8" },
    });
}
