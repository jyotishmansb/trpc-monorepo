"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import { trpc } from "~/trpc/client";
import { Loader2, ArrowRight, ArrowLeft, ChevronDown, Star, Heart, ThumbsUp, AlertCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "~/lib/utils";

type Answer = string | string[] | number | boolean;

interface Field {
  id: string;
  type: string;
  label: string;
  placeholder?: string | null;
  helpText?: string | null;
  required: boolean;
  options?: { label: string; value: string }[] | null;
  validations?: { minLength?: number; maxLength?: number; min?: number; max?: number } | null;
  ratingConfig?: { maxRating: number; icon: "star" | "heart" | "thumb" } | null;
}

function RatingInput({
  config,
  value,
  onChange,
  accentColor,
}: {
  config: { maxRating: number; icon: "star" | "heart" | "thumb" };
  value: number | null;
  onChange: (v: number) => void;
  accentColor: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const icons = { star: "⭐", heart: "❤️", thumb: "👍" };
  const icon = icons[config.icon];

  return (
    <div className="flex gap-3 mt-2">
      {Array.from({ length: config.maxRating }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(null)}
          className={cn(
            "text-3xl transition-all duration-100 hover:scale-125",
            (hover ?? value ?? 0) >= n ? "opacity-100" : "opacity-20"
          )}
        >
          {icon}
        </button>
      ))}
    </div>
  );
}

function FieldInput({
  field,
  value,
  onChange,
  theme,
  autoFocus,
}: {
  field: Field;
  value: Answer | undefined;
  onChange: (v: Answer) => void;
  theme: { primaryColor: string; textColor: string; cardColor: string; accentColor: string; borderRadius: string } | null;
  autoFocus: boolean;
}) {
  const accent = theme?.primaryColor ?? "#6366f1";
  const inputStyle = {
    borderBottomColor: accent,
    color: theme?.textColor,
  };

  if (field.type === "statement") {
    return null;
  }

  if (field.type === "textarea") {
    return (
      <Textarea
        autoFocus={autoFocus}
        placeholder={field.placeholder ?? "Type your answer..."}
        value={String(value ?? "")}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent border-0 border-b-2 rounded-none resize-none text-xl pb-2 px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        style={inputStyle}
        rows={3}
      />
    );
  }

  if (field.type === "rating") {
    const cfg = field.ratingConfig ?? { maxRating: 5, icon: "star" as const };
    return (
      <RatingInput
        config={cfg}
        value={value as number | null}
        onChange={onChange}
        accentColor={accent}
      />
    );
  }

  if (field.type === "select" || field.type === "radio") {
    const selected = value as string | undefined;
    return (
      <div className="mt-4 space-y-3">
        {(field.options ?? []).map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "w-full flex items-center gap-3 px-5 py-4 rounded-xl border-2 text-left text-lg transition-all duration-150 hover:scale-[1.01]",
              selected === opt.value ? "border-current bg-white/10" : "border-white/20 hover:border-white/40"
            )}
            style={{ color: theme?.textColor, borderColor: selected === opt.value ? accent : undefined }}
          >
            <span className="w-6 h-6 rounded border-2 flex items-center justify-center shrink-0 text-xs font-bold"
              style={{ borderColor: selected === opt.value ? accent : "currentColor", backgroundColor: selected === opt.value ? accent : "transparent", color: selected === opt.value ? "white" : "inherit" }}>
              {String.fromCharCode(65 + (field.options ?? []).indexOf(opt))}
            </span>
            {opt.label}
          </button>
        ))}
      </div>
    );
  }

  if (field.type === "multiselect") {
    const selected = (value as string[] | undefined) ?? [];
    const toggle = (v: string) => {
      const newSelected = selected.includes(v)
        ? selected.filter((s) => s !== v)
        : [...selected, v];
      onChange(newSelected);
    };
    return (
      <div className="mt-4 space-y-3">
        {(field.options ?? []).map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            className={cn(
              "w-full flex items-center gap-3 px-5 py-4 rounded-xl border-2 text-left text-lg transition-all duration-150 hover:scale-[1.01]"
            )}
            style={{ borderColor: selected.includes(opt.value) ? accent : "rgba(255,255,255,0.2)", color: theme?.textColor }}
          >
            <span className="w-6 h-6 rounded border-2 flex items-center justify-center shrink-0"
              style={{ borderColor: selected.includes(opt.value) ? accent : "currentColor", backgroundColor: selected.includes(opt.value) ? accent : "transparent" }}>
              {selected.includes(opt.value) && <span className="text-white text-xs">✓</span>}
            </span>
            {opt.label}
          </button>
        ))}
      </div>
    );
  }

  if (field.type === "checkbox") {
    const checked = value as boolean | undefined;
    return (
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className="flex items-center gap-4 mt-4 text-xl"
        style={{ color: theme?.textColor }}
      >
        <div
          className="w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all"
          style={{ borderColor: accent, backgroundColor: checked ? accent : "transparent" }}
        >
          {checked && <span className="text-white text-sm">✓</span>}
        </div>
        <span className="opacity-80">Yes, I agree</span>
      </button>
    );
  }

  if (field.type === "date") {
    return (
      <Input
        type="date"
        autoFocus={autoFocus}
        value={String(value ?? "")}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent border-0 border-b-2 rounded-none text-xl pb-2 px-0 focus-visible:ring-0 focus-visible:ring-offset-0 max-w-sm"
        style={inputStyle}
      />
    );
  }

  // Default: text-like inputs
  return (
    <Input
      autoFocus={autoFocus}
      type={field.type === "email" ? "email" : field.type === "number" ? "number" : field.type === "url" ? "url" : field.type === "phone" ? "tel" : "text"}
      placeholder={field.placeholder ?? "Type your answer..."}
      value={String(value ?? "")}
      onChange={(e) => onChange(field.type === "number" ? Number(e.target.value) : e.target.value)}
      className="w-full bg-transparent border-0 border-b-2 rounded-none text-2xl pb-2 px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
      style={inputStyle}
    />
  );
}

export default function PublicFormPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const { data: formData, isLoading, error } = trpc.forms.getBySlug.useQuery({ slug });
  const submitMutation = trpc.responses.submit.useMutation({
    onSuccess: () => {
      router.push(`/f/${slug}/success?title=${encodeURIComponent(formData?.title ?? "")}&msg=${encodeURIComponent(formData?.submitMessage ?? "")}`);
    },
    onError: (err) => {
      toast.error(err.message ?? "Failed to submit. Please try again.");
    },
  });

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [validationError, setValidationError] = useState<string | null>(null);
  const [startTime] = useState(Date.now());

  const theme = formData?.theme ?? null;
  const fields = formData?.fields ?? [];

  // Filter out statement-only fields for navigation
  const fillableFields = fields.filter((f) => f.type !== "statement");
  const allFields = fields; // includes statements
  const currentField = allFields[currentIdx];
  const progress = fields.length > 0 ? ((currentIdx + 1) / fields.length) * 100 : 0;

  const validate = (field: Field, value: Answer | undefined): string | null => {
    if (field.type === "statement") return null;
    if (field.required) {
      if (!value && value !== 0 && value !== false) return `This field is required`;
      if (typeof value === "string" && !value.trim()) return "This field is required";
      if (Array.isArray(value) && value.length === 0) return "Please select at least one option";
    }
    if (field.validations && typeof value === "string") {
      if (field.validations.minLength && value.length < field.validations.minLength)
        return `Minimum ${field.validations.minLength} characters`;
      if (field.validations.maxLength && value.length > field.validations.maxLength)
        return `Maximum ${field.validations.maxLength} characters`;
    }
    return null;
  };

  const next = () => {
    if (!currentField) return;
    const err = validate(currentField, answers[currentField.label]);
    if (err) { setValidationError(err); return; }
    setValidationError(null);
    if (currentIdx < fields.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      handleSubmit();
    }
  };

  const prev = () => {
    setValidationError(null);
    setCurrentIdx(Math.max(0, currentIdx - 1));
  };

  const handleSubmit = () => {
    const completionTime = Math.round((Date.now() - startTime) / 1000);
    submitMutation.mutate({
      formSlug: slug,
      answers,
      completionTimeSeconds: completionTime,
    });
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey && currentField?.type !== "textarea") {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [currentIdx, answers, currentField]);

  // Styling from theme
  const bgStyle = theme
    ? { background: theme.gradientConfig ? `linear-gradient(135deg, ${theme.backgroundColor}, ${(theme.gradientConfig as any).to ?? theme.backgroundColor})` : theme.backgroundColor }
    : { background: "linear-gradient(135deg, #f0f4ff, #faf5ff)" };

  const textStyle = { color: theme?.textColor ?? "#111827" };
  const accent = theme?.primaryColor ?? "#6366f1";
  const fontFamily = theme?.fontFamily === "Space Grotesk" ? "'Space Grotesk', sans-serif"
    : theme?.fontFamily === "JetBrains Mono" ? "'JetBrains Mono', monospace"
    : theme?.fontFamily === "Playfair Display" ? "'Playfair Display', serif"
    : "inherit";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: accent }} />
      </div>
    );
  }

  if (error || !formData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto p-8">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold mb-2">Form not found</h1>
          <p className="text-muted-foreground mb-6">
            This form may not exist, may be unpublished, or the link may be incorrect.
          </p>
          <a href="/">
            <Button>Go to homepage</Button>
          </a>
        </div>
      </div>
    );
  }

  const isLastField = currentIdx === fields.length - 1;

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden transition-all duration-700" style={{ ...bgStyle, fontFamily }}>
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="h-0.5 bg-white/20">
          <div
            className="h-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%`, backgroundColor: accent }}
          />
        </div>
      </div>

      {/* Form header (fixed) */}
      <div className="fixed top-1 left-0 right-0 z-40 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {currentIdx > 0 && (
            <button
              onClick={prev}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              style={textStyle}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <span className="text-sm opacity-60 font-medium" style={textStyle}>
            {currentIdx + 1} / {fields.length}
          </span>
        </div>
        <p className="text-sm font-semibold opacity-80" style={textStyle}>{formData.title}</p>
        <div className="w-16" /> {/* spacer */}
      </div>

      {/* Main field area */}
      <div className="flex-1 flex items-center justify-center px-6 pt-16 pb-20">
        <div className="w-full max-w-2xl">
          {currentField && (
            <div key={currentIdx} className="animate-in fade-in slide-in-from-bottom-4 duration-400">
              <div className="mb-2 text-xs font-mono opacity-40" style={textStyle}>
                {currentIdx + 1} →
              </div>

              {/* Label */}
              <h2 className="text-2xl md:text-3xl font-bold mb-1 leading-tight" style={textStyle}>
                {currentField.label}
                {currentField.required && (
                  <span style={{ color: accent }} className="ml-1">*</span>
                )}
              </h2>

              {/* Help text */}
              {currentField.helpText && (
                <p className="text-sm opacity-60 mb-6" style={textStyle}>{currentField.helpText}</p>
              )}

              {/* Field input */}
              <FieldInput
                field={currentField}
                value={answers[currentField.label]}
                onChange={(v) => {
                  setAnswers({ ...answers, [currentField.label]: v });
                  setValidationError(null);
                }}
                theme={theme as any}
                autoFocus={true}
              />

              {/* Validation error */}
              {validationError && (
                <p className="mt-3 text-sm text-red-400 flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {validationError}
                </p>
              )}

              {/* CTA */}
              <div className="mt-8 flex items-center gap-4">
                <button
                  onClick={next}
                  disabled={submitMutation.isPending}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-base transition-all duration-200 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  style={{ backgroundColor: accent }}
                >
                  {submitMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isLastField ? (
                    <>Submit <ArrowRight className="h-4 w-4" /></>
                  ) : (
                    <>Next <ArrowRight className="h-4 w-4" /></>
                  )}
                </button>
                {currentField.type !== "rating" && currentField.type !== "select" && currentField.type !== "radio" && currentField.type !== "multiselect" && (
                  <span className="text-xs opacity-50" style={textStyle}>
                    press <kbd className="font-mono bg-white/10 px-1.5 py-0.5 rounded">Enter ↵</kbd>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 py-3 px-6 flex items-center justify-center">
        <a href="/" className="text-xs opacity-30 hover:opacity-60 transition-opacity" style={textStyle}>
          Powered by ChaiForm ☕
        </a>
      </div>
    </div>
  );
}
