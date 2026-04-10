declare global {
  namespace JSX {
    // deno-lint-ignore no-explicit-any
    type IntrinsicElements = Record<string, any>;
  }
}

export {};
