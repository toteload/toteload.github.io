import { serveDir } from "jsr:@std/http/file-server";

const OUTPUT_DIR = "./docs";
const WATCH_PATHS = ["./src", "./assets"];
const PORT = 8000;

const encoder = new TextEncoder();

/**
 * Stable for the life of this process (unlike buildId, which advances on every
 * rebuild). Shown in the startup banner and logged by each browser client, so a
 * mismatch makes it obvious a tab is still talking to an old, un-restarted server.
 */
const SERVER_ID = new Date().toLocaleTimeString();

/** Bumped after every successful build; browsers reload when it advances. */
let buildId = 0;

/** Open SSE connections. Each entry pushes the current build id to a browser. */
const clients = new Set<(id: number) => void>();

// --- Building ---------------------------------------------------------------

/**
 * Rebuild by shelling out rather than importing build(): a fresh subprocess
 * gets a fresh module graph, so edits to Post.tsx / posts / etc. are picked up.
 * An imported build() would keep running against Deno's cached modules.
 */
async function runBuild(): Promise<boolean> {
  const started = performance.now();
  const { success } = await new Deno.Command("deno", {
    args: ["run", "-RWE", "./src/build.tsx"],
    stdout: "inherit",
    stderr: "inherit",
  }).output();

  if (success) {
    buildId = Date.now();
    console.log(`%cBuilt in ${Math.round(performance.now() - started)}ms`, "color: green");
  } else {
    console.error("%cBuild failed — keeping previous output", "color: red");
  }
  return success;
}

let building = false;
let pending = false;

/** Run a build, coalescing overlapping requests into a single trailing run. */
async function triggerBuild() {
  if (building) {
    pending = true;
    return;
  }
  building = true;
  do {
    pending = false;
    if (await runBuild()) {
      for (const send of clients) send(buildId);
    }
  } while (pending);
  building = false;
}

// --- Watching ---------------------------------------------------------------

async function watch() {
  const watcher = Deno.watchFs(WATCH_PATHS);
  let timer: number | undefined;
  for await (const event of watcher) {
    if (event.kind === "access") continue; // reads don't warrant a rebuild
    clearTimeout(timer);
    timer = setTimeout(() => {
      console.log("Change detected, rebuilding…");
      triggerBuild();
    }, 80);
  }
}

// --- Client injection -------------------------------------------------------

/**
 * Injected into every HTML page. Opens an SSE connection (which reconnects on
 * its own) and, when the build id advances, swaps the DOM in place instead of
 * navigating — so the connection is never torn down and a bad moment can't
 * strand the page. The id comparison also catches builds missed while
 * disconnected and survives a dev-server restart.
 */
const CLIENT = `
(() => {
  if (window.__devClient) return;
  window.__devClient = true;

  let id = __BUILD_ID__;
  let busy = false;

  console.info("[dev] connected — server __SERVER_ID__, build " + id);

  async function softReload() {
    if (busy) return;
    busy = true;
    try {
      const res = await fetch(location.href, { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const doc = new DOMParser().parseFromString(await res.text(), "text/html");

      // Swap content only. The live stylesheets stay applied throughout, so the
      // page height never collapses and the scroll position is preserved.
      const x = scrollX, y = scrollY;
      document.body.replaceWith(document.importNode(doc.body, true));
      document.title = doc.title;
      scrollTo(x, y);

      // Hot-reload CSS separately: load the fresh (cache-busted) sheet first,
      // then remove the stale one — so styles are never momentarily absent,
      // which is what collapsed the layout and reset the scroll before.
      await Promise.all(
        [...document.querySelectorAll('link[rel="stylesheet"]')].map((old) =>
          new Promise((resolve) => {
            const href = (old.getAttribute("href") || "").split("?")[0];
            const fresh = old.cloneNode();
            fresh.setAttribute("href", href + "?v=" + Date.now());
            fresh.addEventListener("load", () => { old.remove(); resolve(); }, { once: true });
            fresh.addEventListener("error", () => { fresh.remove(); resolve(); }, { once: true });
            old.after(fresh);
          })
        )
      );
      console.info("[dev] updated");
    } catch (err) {
      console.warn("[dev] in-place update failed, doing a full reload", err);
      location.reload();
    } finally {
      busy = false;
    }
  }

  const es = new EventSource("/__dev");
  es.onmessage = (e) => {
    const next = Number(e.data);
    if (next > id) { id = next; softReload(); }
  };
  // No onerror handling needed: EventSource reconnects automatically, and the
  // id check on the next message recovers anything missed while it was down.
})();
`;

function devScript(): string {
  const body = CLIENT
    .replace("__BUILD_ID__", String(buildId))
    .replace("__SERVER_ID__", SERVER_ID);
  return `<script>${body}</script>`;
}

// --- Serving ----------------------------------------------------------------

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);

  if (url.pathname === "/__dev") {
    let send: (id: number) => void;
    const stream = new ReadableStream({
      start(controller) {
        send = (id) => {
          try {
            controller.enqueue(encoder.encode(`data: ${id}\n\n`));
          } catch {
            clients.delete(send); // controller already closed
          }
        };
        send(buildId); // current state on connect / reconnect
        clients.add(send);
      },
      cancel() {
        clients.delete(send);
      },
    });
    return new Response(stream, {
      headers: {
        "content-type": "text/event-stream",
        "cache-control": "no-cache",
        "connection": "keep-alive",
      },
    });
  }

  const res = await serveDir(req, { fsRoot: OUTPUT_DIR, quiet: true });
  if (!(res.headers.get("content-type") ?? "").includes("text/html")) {
    return res;
  }

  const html = (await res.text()).replace(/<\/body>/i, `${devScript()}</body>`);
  const headers = new Headers(res.headers);
  headers.delete("content-length");
  headers.set("cache-control", "no-store");
  return new Response(html, { status: res.status, headers });
}

// --- Main -------------------------------------------------------------------

await triggerBuild();
watch();
// Startup banner: makes it obvious a *fresh* process is running. Because the
// reload client is injected inline, edits to dev.ts only take effect after a
// full restart — if this timestamp is stale, you're still on the old server.
console.log(
  `%c dev server up  %c http://localhost:${PORT}  server ${SERVER_ID} (build ${buildId}) `,
  "background: #1e293b; color: #7dd3fc; font-weight: bold",
  "background: #1e293b; color: #cbd5e1",
);
Deno.serve({ port: PORT }, handler);
