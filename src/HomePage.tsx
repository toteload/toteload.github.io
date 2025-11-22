import { BasicLayout } from './BasicLayout';
import { Picture } from './components';

export const HomePage: Component = () => {
  return (
    <BasicLayout title="David Bos">
      <Picture
        src="assets/me.png"
        width="275"
        height="231"
        alt="Simple drawing of my face with a big nose"
        style="image-rendering: pixelated; align-self: center; margin: 24px;" />
      <p>
        Hello, my name is David Bos and this is my website! The drawing is an
        artistic rendition of me. The receding hairline is accurate, but my nose
        is not actually that big in real life. It's even bigger.
      </p>
      <p>
        I like video games, visual art, programming, puzzles and everything in
        between. Programming-wise my interests are mainly graphics- and game
        programming, compilers and interpreters, but also programming language
        design. But really I find almost everything game and computer related
        interesting 😄
      </p>
    </BasicLayout>
  );
}

