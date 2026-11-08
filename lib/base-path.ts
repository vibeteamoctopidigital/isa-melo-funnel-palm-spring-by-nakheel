export const BASE_PATH = "/palmsprings";

export function withBasePath(path: string): string {
  return path === "/" ? BASE_PATH : `${BASE_PATH}${path}`;
}
