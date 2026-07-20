import 'server-only';
import { GoogleGenAI } from '@google/genai';

export interface GeneratedHeroCopy {
  headline: string;
  subheadline: string;
}

/**
 * Generates a marketing headline + subheadline in Arabic for a landing
 * page hero section, based on the store's niche and product info.
 * Returns null on any failure (missing API key, network error, bad
 * response) — callers should fall back to each template's own default
 * copy rather than block page creation on this.
 */
export async function generateHeroCopy(params: {
  nicheLabel: string;
  productName: string;
  description?: string;
}): Promise<GeneratedHeroCopy | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not set — cannot generate hero copy.');
    return null;
  }

  const { nicheLabel, productName, description } = params;

  const prompt = `أنت كاتب محتوى تسويقي محترف متخصص في صفحات البيع بنظام الدفع عند الاستلام في الجزائر.

المنتج: ${productName}
المجال: ${nicheLabel}
${description ? `وصف المنتج: ${description}` : ''}

اكتب عنواناً رئيسياً جذاباً وعنواناً فرعياً لصفحة بيع هذا المنتج، باللغة العربية الفصحى البسيطة (يمكن استخدام كلمات دارجة مفهومة).

الشروط:
- العنوان الرئيسي: من 4 إلى 8 كلمات، مؤثر وقصير، بدون علامات ترقيم زائدة
- العنوان الفرعي: جملة واحدة من 12 إلى 20 كلمة، تشرح فائدة المنتج للزبون
- لا تستخدم كلمة "أفضل" أو مبالغات غير قابلة للإثبات
- لا تضع علامات اقتباس حول النصوص

أجب فقط بصيغة JSON التالية، بدون أي نص إضافي:
{"headline": "...", "subheadline": "..."}`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (!text) return null;

    const parsed = JSON.parse(text);
    if (typeof parsed.headline !== 'string' || typeof parsed.subheadline !== 'string') {
      return null;
    }

    return {
      headline: parsed.headline.trim().slice(0, 80),
      subheadline: parsed.subheadline.trim().slice(0, 160),
    };
  } catch (err) {
    console.error('Gemini hero copy generation failed:', err);
    return null;
  }
}
