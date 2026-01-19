import { NavigationBar, Link } from './components';
import { Head, Body, Html } from './Html';

interface Props {
  title: string;
  description?: string;
  navImage?: NavigationBarProps['image'];
}

export const BasicLayout: Component<PropsWithChildren<Props>> = ({title, description, navImage = 'home', children}) => {
  return (
    <Html>
      <Head title={title} description={description} />
      <Body className="basic-main">
        <NavigationBar image={navImage} />
        <div>
          <main>
            {children}
          </main>
        </div>
        <footer>
          <ContactInformation />
        </footer>
      </Body>
    </Html>
  );
}

const ContactInformation: Component = () => {
  return (
    <ul class="contact-information">
      <li><Link href="https://www.github.com/toteload">Github</Link></li>
      <li><Link href="mailto:me@davidbos.me">email address</Link></li>
    </ul>
  );
}
