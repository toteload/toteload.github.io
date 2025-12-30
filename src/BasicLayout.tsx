import { NavigationBar } from './components';
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
        <main>
          {children}
        </main>
        <ContactInformation />
      </Body>
    </Html>
  );
}

const ContactInformation: Component = () => {
  return (
    <ul class="contact-information">
      <li><a href="https://www.github.com/toteload">Github</a></li>
      <li><a href="mailto:me@davidbos.me">email address</a></li>
    </ul>
  );
}
