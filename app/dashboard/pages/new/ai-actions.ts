'use server';

import { generateHeroCopy } from '../../../../lib/gemini';
import { NICHES } from '../../../../components/builder/templateCatalog';

export interface GenerateHeroCopyResult {
  headline?: string;
  subheadline?: string;
  error?: string;
}

export async function generateHeroCopyAction(
  nicheId: string,
  productName: string,
  description: string
): Promise<GenerateHeroCopyResult> {
  if (!productName.trim()) {
    return { error: 'يرجى إدخال اسم المنتج أولاً (الخطوة 3)' };
  }

  const nicheLabel = NICHES.find((n) => n.id === nicheId)?.label || 'عام';

  const result = await generateHeroCopy({
    nicheLabel,
    productName,
    description: description || undefined,
  });

  if (!result) {
    return { error: 'تعذر توليد النص حالياً، يمكنك المحاولة مرة أخرى أو المتابعة بدون عنوان مخصص' };
  }

  return result;
}
