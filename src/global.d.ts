declare global {
  export type BaseProps = {};

  export type PropsWithChildren<TProps extends BaseProps = BaseProps> = 
    TProps & { children?: string | string[] };

  export type Component<TProps extends BaseProps = BaseProps> = ((props: TProps) => string);
}

export {}
