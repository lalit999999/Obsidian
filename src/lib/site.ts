import type { Icon } from "@phosphor-icons/react";
import { GithubLogo, LinkedinLogo, XLogo } from "@phosphor-icons/react";

export interface SocialLink {
  label: string;
  href: string;
  icon: Icon;
}

export const SITE = {
  name: "Obsidian",
  description:
    "Build knowledge-base projects from your notes and chat with AI over your documents.",
  SOCIAL_LINKS: [
    {
      label: "GitHub",
      href: "https://github.com/lalit999999",
      icon: GithubLogo,
    },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/lalitgurjar",
      icon: LinkedinLogo,
    },
    {
      label: "X",
      href: "https://x.com/lalit7363",
      icon: XLogo,
    },
  ] satisfies SocialLink[],
} as const;
