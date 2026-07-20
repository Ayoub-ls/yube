'use client';

import { useState } from 'react';
import { X, Plus, Sparkles, Loader2, RotateCcw } from 'lucide-react';
import { SIZE_SUGGESTIONS } from '../types';
import { generateHeroCopyAction } from '../../../app/dashboard/pages/new/ai-actions';
import type { WizardData } from '../types';

export function CustomHeroStep({ data, update }: { data: WizardData; update: (patch: Partial<WizardData>) => void }) {
  const [newSize, setNewSize] = useState('');
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | undefined>();
  const hasGenerated = !!(data.headline || data.subheadline);
  const suggestions = (SIZE_SUGGESTIONS[data.templateId] || []).filter((s) => !data.sizes.includes(s));

  const addSize = () => {
    const trimmed = newSize.trim();
    if (!trimmed) return;
    if (data.sizes.includes(trimmed)) {
      setNewSize('');
      return;
    }
    if (data.sizes.length >= 15) return; // sanity cap
    update({ sizes: [...data.sizes, trimmed] });
    setNewSize('');
  };

  const removeSize = (size: string) => {
    update({ sizes: data.sizes.filter((s) => s !== size) });
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setGenError(undefined);
    try {
      const result = await generateHeroCopyAction(data.niche, data.productName, data.description);
      if (result.error) {
        setGenError(result.error);
      } else {
        update({ headline: result.headline || '', subheadline: result.subheadline || '' });
      }
    } catch (err) {
      console.error(err);
      setGenError('حدث خطأ غير متوقع، حاول مرة أخرى');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6 py-2">
      <div>
        <h2 className="text-lg font-black text-slate-900 text-center">العنوان الرئيسي والمقاسات</h2>
        <p className="text-[11px] text-slate-400 text-center mt-1">
          خاص بهذا القالب — يظهر في أعلى الصفحة وفي استمارة الطلب
        </p>
      </div>

      <div className="space-y-3">
        {!hasGenerated ? (
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white text-sm font-bold py-3.5 rounded-2xl transition"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري توليد النص...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>توليد العنوان بالذكاء الاصطناعي</span>
              </>
            )}
          </button>
        ) : (
          <>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">العنوان الرئيسي</label>
              <input
                value={data.headline}
                onChange={(e) => update({ headline: e.target.value.slice(0, 80) })}
                maxLength={80}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">العنوان الفرعي</label>
              <textarea
                value={data.subheadline}
                onChange={(e) => update({ subheadline: e.target.value.slice(0, 160) })}
                maxLength={160}
                rows={2}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400 resize-none"
              />
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center justify-center gap-1.5 w-full text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 disabled:opacity-60 py-2.5 rounded-xl transition"
            >
              {generating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RotateCcw className="w-3.5 h-3.5" />
              )}
              <span>{generating ? 'جاري إعادة التوليد...' : 'إعادة التوليد بالذكاء الاصطناعي'}</span>
            </button>
            <p className="text-[10px] text-slate-400 text-center">
              يمكنك تعديل النص أعلاه يدوياً كما تريد
            </p>
          </>
        )}

        {genError && (
          <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 text-center">
            ⚠️ {genError}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700">المقاسات المتوفرة</label>
        <div className="flex flex-wrap gap-2">
          {data.sizes.map((size) => (
            <span
              key={size}
              className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold pl-2 pr-3 py-1.5 rounded-full"
            >
              {size}
              <button
                type="button"
                onClick={() => removeSize(size)}
                className="hover:text-red-500 transition"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {data.sizes.length === 0 && (
            <span className="text-[11px] text-slate-400">لا توجد مقاسات — سيتم إخفاء اختيار المقاس في الصفحة</span>
          )}
        </div>

        {suggestions.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <p className="text-[10px] text-slate-400">اقتراحات سريعة:</p>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => update({ sizes: [...data.sizes, size] })}
                  className="text-[11px] font-bold text-slate-500 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-700 px-2.5 py-1 rounded-full transition"
                >
                  + {size}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <input
            value={newSize}
            onChange={(e) => setNewSize(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addSize();
              }
            }}
            placeholder="أضف مقاس (مثال: S أو 38 أو 10 سنوات)"
            className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400"
          />
          <button
            type="button"
            onClick={addSize}
            className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold px-4 rounded-xl transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة</span>
          </button>
        </div>
        <p className="text-[10px] text-slate-400">
          احذفي كل المقاسات إذا كان منتجك لا يحتاج اختيار مقاس
        </p>
      </div>
    </div>
  );
}
