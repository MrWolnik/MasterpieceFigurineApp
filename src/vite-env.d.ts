/// <reference types="vite/client" />

/** Year of the build (vite.config.ts `define`), shown in the footer's copyright. */
declare const __BUILD_YEAR__: number;

/** The validated works from src/content/works (scripts/vite-plugin-works.ts). */
declare module 'virtual:works' {
  const works: import('./lib/works.schema').Work[];
  export default works;
}

interface ImportMetaEnv {
  readonly VITE_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
