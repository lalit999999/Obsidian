// Kept out of site.ts deliberately: SITE.SOCIAL_LINKS embeds @phosphor-icons/react
// component references, and that package calls React.createContext at module
// top level. Any Server Component that imports from the same file — even for
// an unrelated plain-string export — pulls that import in too and crashes
// Next's static "collect configuration" pass, which runs in an environment
// without createContext. site.ts is only ever imported by client components
// today, so this has never surfaced before now.
export const SUPPORT = {
  issuesUrl: "https://github.com/lalit999999/Obsidian/issues",
  repoUrl: "https://github.com/lalit999999/Obsidian",
  // Fill in a real support inbox; the contact card stays hidden while empty.
  email: "",
} as const;
