// This file contains type definitions for your environment
// It helps TypeScript understand JSON imports and other non-TypeScript files

declare module '*.json' {
  const value: any;
  export default value;
}

declare module '*.svg' {
  import React from 'react';
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.webp';