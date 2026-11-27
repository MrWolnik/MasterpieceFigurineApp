/// <reference types="vite/client" />

/** Year of the build (vite.config.ts `define`), shown in the footer's copyright. */
declare const __BUILD_YEAR__: number;

interface ImportMetaEnv {
  readonly VITE_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
