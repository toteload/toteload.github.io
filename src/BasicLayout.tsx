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
        <main>
          {children}
        </main>
      </Body>
    </Html>
  );
}
