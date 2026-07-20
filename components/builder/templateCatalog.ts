import { Layout, Award, Heart, Shirt, Gem, Headphones, LucideIcon } from 'lucide-react';

export interface NicheDef {
  id: string;
  label: string;
  emoji: string;
}

// The 5 requested niches, plus a "general" escape hatch so a store owner
// whose product doesn't fit any specific category (or who just wants to
// see everything) isn't stuck with zero options.
export const NICHES: NicheDef[] = [
  { id: 'kids', label: 'أطفال', emoji: '🧸' },
  { id: 'gadget', label: 'إلكترونيات وأدوات', emoji: '🎧' },
  { id: 'men', label: 'رجال', emoji: '👔' },
  { id: 'women', label: 'نساء', emoji: '👗' },
  { id: 'footwear', label: 'أحذية', emoji: '👟' },
  { id: 'general', label: 'عام / أخرى', emoji: '🛍️' },
];

export interface TemplateDef {
  id: string;
  name: string;
  icon: LucideIcon;
  image: string;
  // Which niches this template shows up under in step 2. Templates with
  // no dedicated design (simple/premium) are tagged for every niche so
  // every niche always has at least a couple of usable options — e.g.
  // "men" has no dedicated theme yet, so only those two show up there.
  niches: string[];
}

export const TEMPLATES: TemplateDef[] = [
  { id: 'simple', name: 'صفحة بسيطة', icon: Layout, image: '../../../simple_preview.png', niches: ['kids', 'gadget', 'men', 'women', 'footwear', 'general'] },
  { id: 'premium', name: 'صفحة متميزة', icon: Award, image: '../../../premium_preview.png', niches: ['kids', 'gadget', 'men', 'women', 'footwear', 'general'] },
  { id: 'chelqa', name: 'أزياء وموضة', icon: Heart, image: '../../../chelqa_preview.png', niches: ['kids', 'women'] },
  { id: 'pairdz', name: 'ملابس أطفال', icon: Shirt, image: '../../../pairdz_preview.png', niches: ['kids'] },
  { id: 'rita', name: 'فخامة وأناقة', icon: Gem, image: '../../../rita_preview.png', niches: ['women', 'footwear'] },
  { id: 'gadget', name: 'أجهزة ذكية وسماعات', icon: Headphones, image: '../../../gadget_preview.png', niches: ['gadget'] },
];

export function getTemplatesForNiche(nicheId: string): TemplateDef[] {
  return TEMPLATES.filter((t) => t.niches.includes(nicheId));
}
