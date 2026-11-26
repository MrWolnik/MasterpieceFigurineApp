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
  contactEmail: 'dwolnik12310@gmail.com', // test address; the final one is set before launch
  socials: [
    // Empty `url` = the icon is hidden. Paste a link to make it appear.
    // Icon order follows this array. A new network needs one entry and one icon in Layout/icons.
    { id: 'instagram', label: 'Instagram', url: '' },
    { id: 'facebook', label: 'Facebook', url: '' },
    { id: 'tiktok', label: 'TikTok', url: '' },
    { id: 'youtube', label: 'YouTube', url: '' },
  ],
} as const;

export type SocialId = (typeof site.socials)[number]['id'];

export interface SocialLink {
  id: SocialId;
  label: string;
  url: string;
}
