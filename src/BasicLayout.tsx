import { Body, Head, Html } from "./Html.tsx";
import { Icon } from "./components/index.tsx";

interface Props {
  title: string;
  description?: string;
  useMainAsContainer?: boolean;
}

export const BasicLayout: Component<PropsWithChildren<Props>> = (
  { title, description, useMainAsContainer = false, children },
) => {
  return (
    <Html>
      <Head title={title} description={description} />
      <Body className="basic-layout-body">
        <nav class="nav-top">
          <a href="/">About me</a>
          <a href="/posts">Posts</a>
        </nav>
        <main class={useMainAsContainer ? "basic-container" : ""}>
          {children}
        </main>
        <footer>
          <div class="footer-waves"></div>
          <div class="footer-body">
            <ul class="footer-content">
              <li>
                <a href="https://www.github.com/toteload">
                  <Icon name="github" />Github
                </a>
              </li>
              <li>
                <a href="mailto:me@davidbos.me">
                  <Icon name="mail" />E-mail address
                </a>
              </li>
            </ul>
          </div>
        </footer>
      </Body>
    </Html>
  );
};
