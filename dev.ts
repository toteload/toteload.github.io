import { watch } from 'node:fs';
import path from 'node:path';

function extToContentType(ext: string): string {
  switch (ext) {
    case '.woff2': return 'application/font-woff2';
    case '.png': return 'image/png';
    default: throw new Error(`Unrecognized file extension ${ext}`);
  }
}

function serveFile(filename: string) {}

const server = Bun.serve({
  port: 3000,

  routes: {
    '/assets/*': async (req) => {
      const filename = new URL(req.url).pathname;
      const contentType = extToContentType(path.extname(filename));
      return new Response(
        await Bun.file(path.join('.', filename)).bytes(),
        {headers: {'Content-Type': contentType}}
      );
    },
    '/': () => {
      // TODO Insert the port of the server into the page here
      const { HomePage } = require('src/HomePage');
      const html = HomePage();
      return new Response(
        html,
        {headers: {'Content-Type': 'text/html; charset=utf-8'}}
      );
    },
    '/posts': () => {
      // TODO Insert the port of the server into the page here
      const { PostsPage } = require('src/PostsPage');
      const html = PostsPage({postsPath: 'src/posts'});
      return new Response(
        html,
        {headers: {'Content-Type': 'text/html; charset=utf-8'}}
      );
    },
    '/posts/*': (req) => {
      const { Post } = require('src/Post');
      const urlPath = new URL(req.url).pathname;
      const filename = path.join('src', urlPath + '.tsx');
      try {
        const { meta, Content } = require(Bun.pathToFileURL(filename).href);
        const html = Post({meta, Content});
        return new Response(
          html,
          {headers: {'Content-Type': 'text/html; charset=utf-8'}}
        );
      } catch (e) {
        console.error(e);
        return new Response('', {status: 404});
      }
    },
    '/style.css': async () => {
      return new Response(
        await Bun.file('style.css').text(),
        {headers: {'Content-Type': 'text/css'}}
      );
    }
  },
});

const websocketServer = Bun.serve({
  port: 3001,

  fetch(req, server) {
    // TODO fix typecheck error. annoyingly enough this is copied from docs.
    return server.upgrade(req);
  },

  websocket: {
    open(ws) { ws.subscribe('dev-client'); },
    close(ws) { },
    message(ws, msg) { },
  },
});

let i = 0;

const fileWatcher = watch(
  'src',
  {persistent: false, recursive: true},
  (event: 'rename' | 'change', filename) => {
    i += 1;

    console.log(`[watch][${i}] ${event} in ${filename}`);
    if (!filename) {
      return;
    }

    // Be dumb and just delete all the cache :)
    const keys = Object.keys(require.cache);
    for (const key of keys) {
      delete require.cache[key];
    }  

    websocketServer.publish('dev-client', 'reload');
  }
);

const watchers = [fileWatcher];
watchers.push(watch('style.css', (event, filename) => {
  i += 1;

  console.log(`[watch][${i}] ${event} in ${filename}`);
  if (!filename) {
    return;
  }
  
  websocketServer.publish('dev-client', 'reload');
}));

console.log(`Server running at ${server.url}`);

process.on('SIGINT', () => {
  console.log('Shutting down...');
  for (const w of watchers) {
    w.close();
  }
  server.stop(true);
  process.exit(0);
});
