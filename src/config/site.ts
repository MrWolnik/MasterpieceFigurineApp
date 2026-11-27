/**
 * Site-wide settings Julia may want to change: one line and a commit, no component edits.
 * Moves to `src/content/settings.json` in Etap 6 so the CMS can edit it.
 */
export const site = {
  artistName: 'Julia',
  brand: 'MasterpieceFigurineJ',
  /** Photo of Julia on the home page; replace the placeholder with a real, dark-toned photo. */
  portrait: '/julia.svg',
  url: import.meta.env.VITE_SITE_URL ?? 'https://masterpiecefigurinej.netlify.app',
  contactEmail: 'example@example.com', // placeholder; Julia's address is set before launch
  socials: [
    // Empty `url` = the icon is hidden. Paste a link to make it appear.
    // Icon order follows this array. A new network needs one entry and one icon in Layout/icons.
    // For now the links lead to each network's home page; swap in Julia's profiles before launch.
    { id: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/' },
    { id: 'facebook', label: 'Facebook', url: 'https://www.facebook.com/' },
    { id: 'tiktok', label: 'TikTok', url: 'https://www.tiktok.com/' },
    { id: 'youtube', label: 'YouTube', url: 'https://www.youtube.com/' },
  ],
} as const;

export type SocialId = (typeof site.socials)[number]['id'];

export interface SocialLink {
  id: SocialId;
  label: string;
  url: string;
}
