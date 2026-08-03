/** Curated Unsplash food photography (all URLs verified live). */
export function unsplash(id: string, w = 800): string {
  return `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;
}
