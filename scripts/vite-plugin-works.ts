import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Plugin } from 'vite';
import { parseWorks } from '../src/lib/parseWorks.ts';

const MODULE_ID = 'virtual:works';
const RESOLVED_ID = `\0${MODULE_ID}`;

/** Reads and validates every `<dir>/*.json`, keyed by its site path for readable errors. */
export function loadWorks(dir: string, sitePath = '/src/content/works') {
  const files = Object.fromEntries(
    readdirSync(dir)
      .filter((name) => name.endsWith('.json'))
      .map((name) => {
        const path = `${sitePath}/${name}`;
        try {
          return [path, JSON.parse(readFileSync(join(dir, name), 'utf8')) as unknown];
        } catch (error) {
          throw new Error(`Invalid work file ${path}: ${(error as Error).message}`, {
            cause: error,
          });
        }
      }),
  );
  return parseWorks(files);
}

/**
 * `import works from 'virtual:works'`: the works from `src/content/works`, validated with zod
 * here, in Node, at dev/build/test time. The browser gets plain, already sorted data and never
 * loads zod for it; an invalid file fails the build (and so a CMS edit, in Etap 6) instead of
 * breaking the live site.
 */
export function worksPlugin(root: string): Plugin {
  const dir = join(root, 'src/content/works');

  return {
    name: 'masterpiece:works',
    resolveId(id) {
      return id === MODULE_ID ? RESOLVED_ID : undefined;
    },
    load(id) {
      if (id !== RESOLVED_ID) return undefined;
      return `export default ${JSON.stringify(loadWorks(dir))};`;
    },
    // Dev server: any change in the content folder (also a new file) reloads the data.
    configureServer(server) {
      server.watcher.add(dir);
      const reload = (file: string) => {
        if (!file.startsWith(dir) || !file.endsWith('.json')) return;
        for (const environment of Object.values(server.environments)) {
          const module = environment.moduleGraph.getModuleById(RESOLVED_ID);
          if (module) environment.moduleGraph.invalidateModule(module);
        }
        server.ws.send({ type: 'full-reload' });
      };
      server.watcher.on('add', reload);
      server.watcher.on('change', reload);
      server.watcher.on('unlink', reload);
    },
  };
}
