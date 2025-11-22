import { esc } from '../utils';

export interface CodeBlockProps {
  code: string;
  lang?: string;
}

export const CodeBlock: Component<CodeBlockProps> = ({code, lang}) => {
  return (<code class="code-block"><pre>{esc(code)}</pre></code>);
};
