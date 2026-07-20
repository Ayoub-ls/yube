export interface PendingImage {
  id: string;
  previewUrl: string;
  uploadedUrl?: string;
  uploading: boolean;
  error?: boolean;
  // Only used by themes with color-variant image switching (see
  // THEMES_WITH_COLOR_VARIANTS in Wizard.tsx) — e.g. "بوردو" labels this
  // image as the bordeaux color option. Ignored by every other theme.
  colorLabel?: string;
}

export interface SocialProofItem {
  id: string;
  type: 'image' | 'audio' | 'video';
  url?: string;
  previewUrl?: string;
  caption: string;
  uploading: boolean;
  error?: boolean;
}

export interface ReviewItem {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
}

export interface WizardData {
  niche: string;
  templateId: string;
  productName: string;
  price: string;
  originalPrice: string;
  description: string;
  images: PendingImage[];
  colorTheme: string;
  socialProof: SocialProofItem[];
  reviews: ReviewItem[];
  whatsapp: string;
  // Theme-specific extras — currently only used by templates that opt in
  // (see THEMES_WITH_CUSTOM_HERO in Wizard.tsx). Stored in landing_pages
  // .page_config, which existed in the schema but was unused before this.
  headline: string;
  subheadline: string;
  sizes: string[];
}

// Sensible starting point for themes with a size selector — editable,
// not fixed. Kept in one place so the wizard step and each theme's
// fallback rendering can't drift apart from each other.
export const DEFAULT_SIZES = ['6', '8', '10', '12', '14', '16'];

// Per-template quick-add suggestions shown in CustomHeroStep (clothing
// sizes read oddly as a shoe-size suggestion and vice versa, so each
// theme gets its own reasonable starting suggestions instead of one
// generic list).
export const SIZE_SUGGESTIONS: Record<string, string[]> = {
  premium: ['7', '8', '9', '10', '11', '12', '13'],
  chelqa: ['6', '8', '10', '12', '14', '16'],
  pairdz: ['2', '4', '6', '8', '10', '12', '14', '16'],
  rita: ['36', '37', '38', '39', '40', '41'],
  gadget: ['S', 'M', 'L', 'XL'],
};

export const initialWizardData: WizardData = {
  niche: '',
  templateId: '',
  productName: '',
  price: '',
  originalPrice: '',
  description: '',
  images: [],
  colorTheme: 'green',
  socialProof: [],
  reviews: [],
  whatsapp: '',
  headline: '',
  subheadline: '',
  sizes: [],
};

import { THEME_COLORS } from '../../lib/themeColors';

// Kept under the original name (COLOR_THEMES) and shape (.hex) so the
// existing wizard step components don't all need touching — this is
// just a thin re-export of the single shared color source now.
export const COLOR_THEMES = THEME_COLORS.map((c) => ({ id: c.id, label: c.label, hex: c.primary }));
