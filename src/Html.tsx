export interface HeadProps {
  title: string;
  description?: string;
}

export const Head: Component<PropsWithChildren<HeadProps>> = ({title, description, children}) => {
  return (
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=yes" />
      {description ? <meta name="description" content={description} /> : undefined}
      <link rel="icon" type="image/png" href="/favicon.png" sizes="16x16" />
      <link rel="stylesheet" href="/style.css" />
      <link rel="preload" href="/assets/NotoSerif-Regular-smol.woff2" as="font" type="font/woff2" crossorigin />
      <link rel="preload" href="/assets/NotoSerif-Bold-smol.woff2" as="font" type="font/woff2" crossorigin />
      <title>{title}</title>
      {children}
    </head>
  );
};

export interface BodyProps {
  className?: string;
}

export const Body: Component<PropsWithChildren<BodyProps>> = ({children, className}) => {
  const isDev = process.env.NODE_ENV === 'development';
  const devScript = `<script>
  const ws = new WebSocket('ws://localhost:3001');
  ws.addEventListener('message', (e) => {
    if (e.data === 'reload') {
      window.location.reload();
    }
  });
  </script>`;

  return (
    <body class={className}>
      {children}
      {isDev ? devScript : undefined}
    </body>
  );
};

export const Html: Component<PropsWithChildren> = ({children}) => {
  return `<!doctype html>` + (
    <html lang="en">
      {children}
    </html>
  );
}

