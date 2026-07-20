'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createLandingPage } from '../../actions';
import { trackEvent } from '../../../../lib/analytics';
import { ProgressBar } from '../../../../components/builder/ProgressBar';
import { StepWrapper } from '../../../../components/builder/StepWrapper';
import { NicheStep } from '../../../../components/builder/steps/NicheStep';
import { TemplateStep } from '../../../../components/builder/steps/TemplateStep';
import { ProductNameStep } from '../../../../components/builder/steps/ProductNameStep';
import { PriceStep } from '../../../../components/builder/steps/PriceStep';
import { DescriptionStep } from '../../../../components/builder/steps/DescriptionStep';
import { PhotosStep } from '../../../../components/builder/steps/PhotosStep';
import { ColorThemeStep } from '../../../../components/builder/steps/ColorThemeStep';
import { CustomHeroStep } from '../../../../components/builder/steps/CustomHeroStep';
import { SocialProofStep } from '../../../../components/builder/steps/SocialProofStep';
import { ReviewsStep } from '../../../../components/builder/steps/ReviewsStep';
import { WhatsAppStep } from '../../../../components/builder/steps/WhatsAppStep';
import { PreviewStep } from '../../../../components/builder/steps/PreviewStep';
import { initialWizardData } from '../../../../components/builder/types';
import type { WizardData, PendingImage, SocialProofItem } from '../../../../components/builder/types';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';

// Templates that use the headline/subheadline/sizes step. Add a
// template_id here when a new theme wants that step to appear for it.
const THEMES_WITH_CUSTOM_HERO = ['premium', 'chelqa', 'pairdz', 'rita', 'gadget'];

// Templates with color-variant image switching (a color name assigned
// to a specific uploaded photo, which swaps the hero image when
// selected). Adds a small color-label input to the Photos step.
const THEMES_WITH_COLOR_VARIANTS = ['premium', 'rita', 'gadget'];

type StepId =
  | 'niche' | 'template' | 'productName' | 'price' | 'description' | 'photos'
  | 'colorTheme' | 'customHero' | 'socialProof' | 'reviews' | 'whatsapp' | 'preview';

interface StepDef {
  id: StepId;
  name: string;
}

// Computed fresh from the current template choice on every render, so
// the step list — and its length — self-corrects immediately if someone
// goes back to step 0 and switches to a template that doesn't need the
// custom-hero step, without any stale-index bugs.
function getStepList(templateId: string): StepDef[] {
  const steps: StepDef[] = [
    { id: 'niche', name: 'المجال' },
    { id: 'template', name: 'القالب' },
    { id: 'productName', name: 'اسم المنتج' },
    { id: 'price', name: 'السعر' },
    { id: 'description', name: 'الوصف' },
    { id: 'photos', name: 'الصور' },
    { id: 'colorTheme', name: 'اللون' },
  ];
  if (THEMES_WITH_CUSTOM_HERO.includes(templateId)) {
    steps.push({ id: 'customHero', name: 'العنوان والمقاسات' });
  }
  steps.push(
    { id: 'socialProof', name: 'أدلة الثقة' },
    { id: 'reviews', name: 'التقييمات' },
    { id: 'whatsapp', name: 'واتساب' },
    { id: 'preview', name: 'المعاينة' },
  );
  return steps;
}

export function NewLandingPageWizard({ clientId }: { clientId?: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<WizardData>(initialWizardData);
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  const stepList = getStepList(data.templateId);
  const totalSteps = stepList.length;
  // Guard against a stale index if the list just shrank (e.g. switching
  // away from a template that had the extra step) — clamp rather than
  // let `step` point past the end of the new, shorter array.
  const currentStepIndex = Math.min(step, totalSteps - 1);
  const currentStepId = stepList[currentStepIndex].id;

  useEffect(() => {
    trackEvent('builder_started', {});
    // Fire once, on mount. templateId isn't known yet at this point —
    // niche and template are now chosen in the first two steps rather
    // than defaulted — so there's nothing meaningful to attach here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = (patch: Partial<WizardData>) => setData((prev) => ({ ...prev, ...patch }));

  const updateImages = (updater: (imgs: PendingImage[]) => PendingImage[]) =>
    setData((prev) => ({ ...prev, images: updater(prev.images) }));

  const updateSocialProof = (updater: (items: SocialProofItem[]) => SocialProofItem[]) =>
    setData((prev) => ({ ...prev, socialProof: updater(prev.socialProof) }));

  const canGoNext = (): boolean => {
    switch (currentStepId) {
      case 'niche': return !!data.niche;
      case 'template': return !!data.templateId;
      case 'productName': return data.productName.trim().length > 0;
      case 'price': return parseInt(data.price, 10) > 0;
      default: return true;
    }
  };

  const goNext = () => {
    if (currentStepIndex < totalSteps - 1 && canGoNext()) {
      trackEvent('builder_step_completed', { step_number: currentStepIndex + 1, step_name: stepList[currentStepIndex].name });
      setStep(currentStepIndex + 1);
    }
  };
  const goBack = () => {
    if (currentStepIndex > 0) setStep(currentStepIndex - 1);
  };

  const hasUploadingMedia =
    data.images.some((i) => i.uploading) || data.socialProof.some((i) => i.uploading);

  const handleSubmit = () => {
    setError(undefined);

    const formData = new FormData();
    formData.set('template_id', data.templateId);
    formData.set('product_name', data.productName);
    formData.set('price', data.price);
    formData.set('original_price', data.originalPrice);
    formData.set('description', data.description);
    formData.set('whatsapp', data.whatsapp);
    formData.set('color_theme', data.colorTheme);
    formData.set(
      'product_images',
      JSON.stringify(data.images.filter((i) => !i.uploading && i.uploadedUrl).map((i) => i.uploadedUrl))
    );
    formData.set(
      'reviews',
      JSON.stringify(data.reviews.map((r) => ({ name: r.name, location: r.location, rating: r.rating, text: r.text })))
    );
    formData.set(
      'social_proof',
      JSON.stringify(
        data.socialProof
          .filter((s) => !s.uploading && s.url)
          .map((s) => ({ type: s.type, url: s.url, caption: s.caption }))
      )
    );
    // Only sent (and only meaningful) for templates that show the
    // custom-hero step — see THEMES_WITH_CUSTOM_HERO above. Stored in
    // page_config, which is otherwise unused today.
    const colorVariants = data.images
      .filter((i) => !i.uploading && i.uploadedUrl && i.colorLabel?.trim())
      .map((i) => ({ name: i.colorLabel!.trim(), url: i.uploadedUrl }));

    formData.set(
      'page_config',
      JSON.stringify({
        headline: data.headline || undefined,
        subheadline: data.subheadline || undefined,
        sizes: data.sizes.length > 0 ? data.sizes : undefined,
        colors: colorVariants.length > 0 ? colorVariants : undefined,
      })
    );

    startTransition(async () => {
      // Fired here, before the call: on success createLandingPage
      // redirects server-side, which means control never returns to
      // this function afterward — there's no "after success" point to
      // fire from, same situation as the login/signup redirects.
      trackEvent('page_submitted', {
        template_id: data.templateId,
        product_name: data.productName,
        niche: data.niche,
      });

      const result = await createLandingPage(null, formData);
      // Reaching this line at all means it returned an error instead of
      // redirecting (redirect() throws internally on success).
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  const renderStep = () => {
    switch (currentStepId) {
      case 'niche': return <NicheStep data={data} update={update} />;
      case 'template': return <TemplateStep data={data} update={update} />;
      case 'productName': return <ProductNameStep data={data} update={update} />;
      case 'price': return <PriceStep data={data} update={update} />;
      case 'description': return <DescriptionStep data={data} update={update} />;
      case 'photos': return (
        <PhotosStep
          data={data}
          update={update}
          updateImages={updateImages}
          showColorLabels={THEMES_WITH_COLOR_VARIANTS.includes(data.templateId)}
        />
      );
      case 'colorTheme': return <ColorThemeStep data={data} update={update} />;
      case 'customHero': return <CustomHeroStep data={data} update={update} />;
      case 'socialProof': return <SocialProofStep data={data} updateSocialProof={updateSocialProof} clientId={clientId || ''} />;
      case 'reviews': return <ReviewsStep data={data} update={update} />;
      case 'whatsapp': return <WhatsAppStep data={data} update={update} />;
      case 'preview': return <PreviewStep data={data} />;
      default: return null;
    }
  };

  const isLastStep = currentStepIndex === totalSteps - 1;

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-black text-slate-900">إنشاء صفحة بيع جديدة</h1>
        <p className="text-xs text-slate-400 mt-1">{stepList[currentStepIndex].name}</p>
      </div>

      <ProgressBar current={currentStepIndex} total={totalSteps} />

      <div className="bg-white border border-slate-100 rounded-3xl p-6 min-h-[360px] flex flex-col">
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-bold px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <div className="flex-1">
          <StepWrapper stepKey={currentStepId}>{renderStep()}</StepWrapper>
        </div>

        <div className="flex items-center gap-3 pt-6 mt-2 border-t border-slate-50">
          {currentStepIndex > 0 && (
            <button
              type="button"
              onClick={goBack}
              disabled={pending}
              className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl transition disabled:opacity-50"
            >
              <ArrowRight className="w-4 h-4" />
              <span>رجوع</span>
            </button>
          )}

          <div className="flex-1" />

          {isLastStep ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={pending || hasUploadingMedia}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-slate-950 font-black text-sm px-6 py-3 rounded-xl transition"
            >
              {pending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري النشر...</span>
                </>
              ) : hasUploadingMedia ? (
                <span>جاري رفع الملفات...</span>
              ) : (
                <span>نشر الصفحة الآن</span>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              disabled={!canGoNext()}
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl transition"
            >
              <span>التالي</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
