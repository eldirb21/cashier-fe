export const toSlug = (str: string) => str.toLowerCase().replace(/\s+/g, "-");
export const fromSlug = (slug: string) =>
  slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
