/**
 * Sub-path the site is served under (https://find.isamelorealestate.com/palmsprings).
 * next.config.ts uses it as basePath, which prefixes routes, _next assets and app icons automatically.
 * Plain <img>/<a> URLs and fetch calls are not rewritten by Next, so they go through withBasePath.
 */
export const BASE_PATH = "/palmsprings";

/** Prefixes a root-relative path (e.g. /images/hero.jpg) with BASE_PATH; / maps to the base path itself. */
export function withBasePath(path: string): string {
  return path === "/" ? BASE_PATH : `${BASE_PATH}${path}`;
}
