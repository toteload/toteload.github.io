import { Link, Math } from '../components';

export const meta = {
  title: 'A better typing accuracy format',
  published: { day: 15, month: 10, year: 2025, },
  blurb: 'Usually (typing) accuracy is given as a percentage, but the inverse is more useful.',
} as const;

export const Content: Component = () => {
  return (
    <>
      <p>
I was playing the demo of <Link href="https://store.steampowered.com/app/4021860/Final_Sentence_Demo/">Final Sentence</Link>, which is a last man standing typing game.
The game shows you some of your statistics like WPM (words per minute) and your accuracy.
Accuracy tells you what percentage of your keystrokes was correct.
This got me thinking about accuracy and made me realize that it is not always a very useful metric in its usual form.
      </p>
      <p>
When it comes to typing accuracy it is more useful to display accuracy as how many keystrokes somebody types correctly before making a mistake.
So, <em>1 error per N keystrokes</em>.
      </p>
      <p>
Below I have listed a few accuracy values and their equivalents in this alternative format, so you can get a feeling for it.
      </p>
<ul>
<li>50% accuracy is 1 error per 2 keystrokes.</li>
<li>75% accuracy is 1 error per 4 keystrokes.</li>
<li>90% accuracy is 1 error per 10 keystrokes.</li>
<li>95% accuracy is 1 error per 20 keystrokes.</li>
<li>99% accuracy is 1 error per 100 keystrokes.</li>
</ul>
<p>
The differences in the accuracies presented do not intuitively reflect the differences in performance; improving by 2 keystrokes can mean a big 25% accuracy improvement, but improving by 80 keystrokes can also mean a measly 4% accuracy improvement.
At least half (and I am being generous here) of the available range is useless; nobody is going to be hitting more incorrect keys than correct keys.
On top of that, the better you become, the harder it is to track your improvements since they translate into increasingly smaller percentage differences.
</p>
<p>
The reason for this behavior is that accuracy is the <em>inverse</em> of what you actually want.
Let <Math>S</Math> be the total number of keystrokes (both correct and incorrect) and <Math>E</Math> the number of incorrect keystrokes.
Accuracy is is then <Math>1 - E/S</Math>, and the <Math>N</Math> of our format is <Math>S/E</Math>: basically the inverse.
</p>
<p>
Another situtation where an inverse is more useful is the usage of frame rate or FPS (frames per second) for tracking video game performance.
If you are tasked with optimizing a game you want to track the <em>frame time</em>, not frame rate.
Similar to the typing accuracy where improving by 1 keystroke does not always result in the same accuracy percentage improvement, shaving 1ms of your frame time does not always result in the same frame rate improvement.
As an example, we start with a frame time of 100 ms = 10 FPS.
We manage to shave of 40 ms, giving us a frame time of 60 ms = 16.7 FPS; a difference of 6.7 FPS.
But, if we started with a frame time of 50 ms = 20 FPS and we shave off the same 40 ms we get 10 ms = 100 FPS; a difference of 80 FPS.
A seemingly much greater improvement, even though the changes were the same.
</p>
    </>
  );
};

