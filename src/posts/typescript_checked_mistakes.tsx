import { Link, CodeBlock } from '../components';
import { esc } from '../utils';

export const meta = {
  title: 'Sneaking a string past the typechecker',
  published: { day: 1, month: 3, year: 2026, },
  blurb: 'A curious bit of Typescript code that passes typechecking, but creates unexpected data.',
} as const;

export const Content: Component = () => {
  return (
    <>
    <p>
    Below is a bit of Typescript code that adds a string to an array of numbers,
    and it does this without resulting in a type checking error!
    The fact that this was possible surprised me and was made possible by 
    ✨<Link href="https://en.wikipedia.org/wiki/Type_variance#">type variance</Link>✨.
    </p>
      <CodeBlock lang="typescript" code={`
function nothing_wrong_here(x: (number | string)[]) {
  x.push("peanut butter");
}

const xs: number[] = [];
nothing_wrong_here(xs);
console.log(\`My favorite number is $\{xs[0]}\`);`} />
    <p>
    In Typescript, a <code>number</code> is a subtype of <code>(number|string)</code> and <code>number[]</code> is a subtype of <code>(number|string)[]</code>, because 
    arrays are <em>covariant</em>.
    If <code>A</code> is a subtype of <code>B</code> and a type <code>{esc('T<A>')}</code>
    is a subtype of <code>{esc('T<B>')}</code> then <code>T</code> is covariant.
    Basically, the subtyping relation carries over to the wrapping type.
    </p>
    <p>
    I don't think I have ever been bitten by this curiosity so this is probably not a big
    problem in practice, but this is definitely a footgun in my book.
    </p>
    <p>
    Apparently <Link href="https://en.wikipedia.org/wiki/Type_variance#Covariant_arrays_in_Java_and_C#">arrays are also covariant in Java and C#</Link>, but to make sure no values of the wrong type
    are stored in the array each value is checked at runtime to be the correct type.
    </p>
    </>
  );
};
