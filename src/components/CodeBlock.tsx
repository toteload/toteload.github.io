import { esc } from "../utils.tsx";

export interface CodeBlockProps {
  code: string;
  lang?: string;
}

export const CodeBlock: Component<CodeBlockProps> = ({ code, _lang }) => {
  return (
    <code class="code-block">
      <pre>{esc(code)}</pre>
    </code>
  );
};
