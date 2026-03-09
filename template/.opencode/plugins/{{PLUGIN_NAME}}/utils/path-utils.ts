export function joinPath(...parts: string[]) {
  return parts
    .filter(Boolean)
    .join("/")
    .replace(/\/{2,}/g, "/");
}

export function dirname(pathname: string) {
  const index = pathname.lastIndexOf("/");
  if (index > 0) return pathname.slice(0, index);
  if (index === 0) return "/";
  return ".";
}

export function getHomeDirectory() {
  return Bun.env.HOME || Bun.env.USERPROFILE || "";
}
