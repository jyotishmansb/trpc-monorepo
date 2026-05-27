"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { trpc } from "~/trpc/client";
import { toast } from "sonner";
import {
  Plus, Trash2, GripVertical, Eye, Globe, EyeOff, Save, Loader2,
  Settings, ChevronUp, ChevronDown, ArrowLeft, ExternalLink, Copy
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import Link from "next/link";
import { cn } from "~/lib/utils";

type FieldType = "text" | "textarea" | "email" | "number" | "phone" | "url" | "select" | "multiselect" | "checkbox" | "radio" | "rating" | "date" | "time" | "statement";

interface Field {
  id?: string;
  type: FieldType;
  label: string;
  placeholder?: string | null;
  helpText?: string | null;
  required: boolean;
  order: number;
  options?: { label: string; value: string }[] | null;
  validations?: { minLength?: number; maxLength?: number; min?: number; max?: number } | null;
  ratingConfig?: { maxRating: number; icon: "star" | "heart" | "thumb" } | null;
}

const FIELD_TYPES: { value: FieldType; label: string; emoji: string }[] = [
  { value: "text", label: "Short Text", emoji: "📝" },
  { value: "textarea", label: "Long Text", emoji: "📄" },
  { value: "email", label: "Email", emoji: "📧" },
  { value: "number", label: "Number", emoji: "🔢" },
  { value: "phone", label: "Phone", emoji: "📱" },
  { value: "url", label: "Website URL", emoji: "🔗" },
  { value: "select", label: "Dropdown", emoji: "📋" },
  { value: "multiselect", label: "Multi-select", emoji: "☑️" },
  { value: "radio", label: "Single Choice", emoji: "🔘" },
  { value: "checkbox", label: "Checkbox", emoji: "✅" },
  { value: "rating", label: "Rating", emoji: "⭐" },
  { value: "date", label: "Date", emoji: "📅" },
  { value: "statement", label: "Statement", emoji: "💬" },
];

function FieldCard({
  field,
  index,
  isSelected,
  onSelect,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  field: Field;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const typeInfo = FIELD_TYPES.find((t) => t.value === field.type);
  return (
    <div
      onClick={onSelect}
      className={cn(
        "flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200",
        isSelected
          ? "border-primary bg-primary/5 shadow-sm"
          : "bg-card hover:border-primary/30 hover:shadow-sm"
      )}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm">{typeInfo?.emoji}</span>
          <span className="text-sm font-medium truncate">{field.label}</span>
          {field.required && <span className="text-red-500 text-xs">*</span>}
        </div>
        <span className="text-xs text-muted-foreground">{typeInfo?.label}</span>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
          disabled={isFirst}
        >
          <ChevronUp className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
          disabled={isLast}
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

function FieldEditor({ field, onChange }: { field: Field; onChange: (f: Field) => void }) {
  const needsOptions = ["select", "multiselect", "radio"].includes(field.type);
  const optionsList = field.options ?? [];

  const addOption = () => {
    const opt = { label: `Option ${optionsList.length + 1}`, value: `option_${optionsList.length + 1}` };
    onChange({ ...field, options: [...optionsList, opt] });
  };

  const updateOption = (i: number, label: string) => {
    const updated = optionsList.map((o, idx) =>
      idx === i ? { label, value: label.toLowerCase().replace(/\s+/g, "_") } : o
    );
    onChange({ ...field, options: updated });
  };

  const removeOption = (i: number) => {
    onChange({ ...field, options: optionsList.filter((_, idx) => idx !== i) });
  };

  return (
    <div className="space-y-5 p-4">
      <div>
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Field Type</Label>
        <Select value={field.type} onValueChange={(v) => onChange({ ...field, type: v as FieldType })}>
          <SelectTrigger className="mt-1.5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FIELD_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.emoji} {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Question / Label</Label>
        <Input
          className="mt-1.5"
          value={field.label}
          onChange={(e) => onChange({ ...field, label: e.target.value })}
          placeholder="e.g. What is your name?"
        />
      </div>

      {field.type !== "statement" && field.type !== "checkbox" && field.type !== "rating" && (
        <div>
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Placeholder</Label>
          <Input
            className="mt-1.5"
            value={field.placeholder ?? ""}
            onChange={(e) => onChange({ ...field, placeholder: e.target.value })}
            placeholder="e.g. Enter your answer..."
          />
        </div>
      )}

      <div>
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Help Text</Label>
        <Input
          className="mt-1.5"
          value={field.helpText ?? ""}
          onChange={(e) => onChange({ ...field, helpText: e.target.value || null })}
          placeholder="Optional description"
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Required</p>
          <p className="text-xs text-muted-foreground">Respondents must answer this field</p>
        </div>
        <Switch
          checked={field.required}
          onCheckedChange={(v) => onChange({ ...field, required: v })}
        />
      </div>

      {field.type === "rating" && (
        <div>
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Max Rating</Label>
          <Select
            value={String(field.ratingConfig?.maxRating ?? 5)}
            onValueChange={(v) => onChange({ ...field, ratingConfig: { ...field.ratingConfig, maxRating: Number(v), icon: field.ratingConfig?.icon ?? "star" } })}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[3, 5, 7, 10].map((n) => (
                <SelectItem key={n} value={String(n)}>{n} stars</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {needsOptions && (
        <div>
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Options</Label>
          <div className="mt-1.5 space-y-2">
            {optionsList.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={opt.label}
                  onChange={(e) => updateOption(i, e.target.value)}
                  className="h-8 text-sm"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
                  onClick={() => removeOption(i)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full text-xs gap-1" onClick={addOption}>
              <Plus className="h-3 w-3" /> Add option
            </Button>
          </div>
        </div>
      )}

      {(field.type === "text" || field.type === "textarea") && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Min length</Label>
            <Input
              type="number"
              className="mt-1 h-8 text-sm"
              value={field.validations?.minLength ?? ""}
              onChange={(e) => onChange({ ...field, validations: { ...field.validations, minLength: e.target.value ? Number(e.target.value) : undefined } })}
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Max length</Label>
            <Input
              type="number"
              className="mt-1 h-8 text-sm"
              value={field.validations?.maxLength ?? ""}
              onChange={(e) => onChange({ ...field, validations: { ...field.validations, maxLength: e.target.value ? Number(e.target.value) : undefined } })}
            />
          </div>
        </div>
      )}

      {field.type === "number" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Min value</Label>
            <Input
              type="number"
              className="mt-1 h-8 text-sm"
              value={field.validations?.min ?? ""}
              onChange={(e) => onChange({ ...field, validations: { ...field.validations, min: e.target.value ? Number(e.target.value) : undefined } })}
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Max value</Label>
            <Input
              type="number"
              className="mt-1 h-8 text-sm"
              value={field.validations?.max ?? ""}
              onChange={(e) => onChange({ ...field, validations: { ...field.validations, max: e.target.value ? Number(e.target.value) : undefined } })}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function FormBuilderPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: formData, isLoading } = trpc.forms.getById.useQuery({ id });
  const upsertFieldsMutation = trpc.fields.upsertFields.useMutation({
    onSuccess: () => toast.success("Fields saved ✓"),
    onError: () => toast.error("Failed to save fields"),
  });
  const publishMutation = trpc.forms.publish.useMutation({
    onSuccess: (data) => toast.success(`Form published! Share: /f/${data.slug}`),
    onError: () => toast.error("Failed to publish"),
  });
  const unpublishMutation = trpc.forms.unpublish.useMutation({
    onSuccess: () => toast.success("Form unpublished"),
    onError: () => toast.error("Failed to unpublish"),
  });

  const [fields, setFields] = useState<Field[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (formData?.fields) {
      setFields(formData.fields.map((f) => ({
        id: f.id,
        type: f.type as FieldType,
        label: f.label,
        placeholder: f.placeholder,
        helpText: f.helpText,
        required: f.required,
        order: f.order,
        options: f.options as { label: string; value: string }[] | null,
        validations: f.validations as Field["validations"],
        ratingConfig: f.ratingConfig as Field["ratingConfig"],
      })));
    }
  }, [formData]);

  const addField = (type: FieldType) => {
    const newField: Field = {
      type,
      label: FIELD_TYPES.find((t) => t.value === type)?.label ?? "Question",
      required: false,
      order: fields.length,
      options: ["select", "multiselect", "radio"].includes(type)
        ? [{ label: "Option 1", value: "option_1" }, { label: "Option 2", value: "option_2" }]
        : null,
      ratingConfig: type === "rating" ? { maxRating: 5, icon: "star" } : null,
    };
    const newFields = [...fields, newField];
    setFields(newFields);
    setSelectedIdx(newFields.length - 1);
    setHasChanges(true);
  };

  const updateField = (idx: number, field: Field) => {
    const updated = [...fields];
    updated[idx] = field;
    setFields(updated);
    setHasChanges(true);
  };

  const deleteField = (idx: number) => {
    const updated = fields.filter((_, i) => i !== idx);
    setFields(updated.map((f, i) => ({ ...f, order: i })));
    setSelectedIdx(null);
    setHasChanges(true);
  };

  const moveField = (idx: number, dir: "up" | "down") => {
    const newIdx = dir === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= fields.length) return;
    const updated = [...fields];
    [updated[idx], updated[newIdx]] = [updated[newIdx]!, updated[idx]!];
    setFields(updated.map((f, i) => ({ ...f, order: i })));
    setSelectedIdx(newIdx);
    setHasChanges(true);
  };

  const saveFields = () => {
    upsertFieldsMutation.mutate({
      formId: id,
      fields: fields.map((f, i) => ({ ...f, order: i })),
    });
    setHasChanges(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!formData) return <div className="p-8 text-muted-foreground">Form not found.</div>;

  return (
    <div className="h-screen flex flex-col">
      {/* Top bar */}
      <div className="border-b bg-card px-6 py-3 flex items-center gap-4 shrink-0">
        <Link href="/dashboard/forms">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </Link>
        <Separator orientation="vertical" className="h-5" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{formData.title}</p>
          <div className="flex items-center gap-2">
            <Badge
              variant={formData.status === "published" ? "default" : "secondary"}
              className={`text-xs ${formData.status === "published" ? "bg-green-500/10 text-green-600 border-green-200" : ""}`}
            >
              {formData.status}
            </Badge>
            <span className="text-xs text-muted-foreground">{fields.length} fields</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {hasChanges && (
            <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">Unsaved changes</Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={saveFields}
            disabled={upsertFieldsMutation.isPending || !hasChanges}
            className="gap-1.5"
          >
            {upsertFieldsMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save
          </Button>
          <Link href={`/dashboard/forms/${id}/settings`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Settings className="h-3.5 w-3.5" /> Settings
            </Button>
          </Link>
          {formData.status === "draft" ? (
            <Button
              size="sm"
              className="gradient-brand text-white border-0 gap-1.5"
              onClick={() => publishMutation.mutate({ id })}
              disabled={publishMutation.isPending}
            >
              <Globe className="h-3.5 w-3.5" /> Publish
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <a href={`/f/${formData.slug}`} target="_blank">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <ExternalLink className="h-3.5 w-3.5" /> View live
                </Button>
              </a>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-orange-600 border-orange-200 hover:bg-orange-50"
                onClick={() => unpublishMutation.mutate({ id })}
              >
                <EyeOff className="h-3.5 w-3.5" /> Unpublish
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Field list */}
        <div className="w-72 border-r flex flex-col bg-sidebar shrink-0 overflow-hidden">
          <div className="p-4 border-b">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Fields ({fields.length})</p>
            <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
              {FIELD_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => addField(t.value)}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs hover:bg-accent hover:text-accent-foreground transition-colors text-left"
                >
                  <span>{t.emoji}</span>
                  <span className="truncate">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {fields.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground">
                <p className="text-2xl mb-2">➕</p>
                Click a field type above to add it
              </div>
            ) : (
              fields.map((field, idx) => (
                <FieldCard
                  key={idx}
                  field={field}
                  index={idx}
                  isSelected={selectedIdx === idx}
                  onSelect={() => setSelectedIdx(idx)}
                  onDelete={() => deleteField(idx)}
                  onMoveUp={() => moveField(idx, "up")}
                  onMoveDown={() => moveField(idx, "down")}
                  isFirst={idx === 0}
                  isLast={idx === fields.length - 1}
                />
              ))
            )}
          </div>
        </div>

        {/* Center: Form preview */}
        <div className="flex-1 overflow-y-auto bg-muted/20 p-8">
          <div className="max-w-xl mx-auto">
            <div className="rounded-2xl border bg-card shadow-lg overflow-hidden">
              <div className="h-1.5 gradient-brand" />
              <div className="p-8">
                <h2 className="font-display text-2xl font-bold mb-1">{formData.title}</h2>
                {formData.description && (
                  <p className="text-muted-foreground text-sm mb-6">{formData.description}</p>
                )}
                {fields.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    <p className="text-3xl mb-3">🏗️</p>
                    <p className="text-sm">Add fields to see your form preview</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {fields.map((field, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedIdx(idx)}
                        className={cn(
                          "p-3 rounded-lg border-2 cursor-pointer transition-all",
                          selectedIdx === idx ? "border-primary/50 bg-primary/3" : "border-transparent hover:border-muted"
                        )}
                      >
                        <label className="text-sm font-medium block mb-1">
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {field.helpText && (
                          <p className="text-xs text-muted-foreground mb-2">{field.helpText}</p>
                        )}
                        {field.type === "statement" ? (
                          <p className="text-sm text-muted-foreground italic">{field.label}</p>
                        ) : field.type === "textarea" ? (
                          <div className="w-full border rounded-lg h-20 bg-muted/30 pointer-events-none" />
                        ) : field.type === "rating" ? (
                          <div className="flex gap-1">
                            {Array.from({ length: field.ratingConfig?.maxRating ?? 5 }).map((_, i) => (
                              <span key={i} className="text-xl text-muted-foreground">⭐</span>
                            ))}
                          </div>
                        ) : (field.type === "select" || field.type === "radio" || field.type === "multiselect") && field.options ? (
                          <div className="space-y-1.5">
                            {field.options.slice(0, 3).map((opt, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <div className="w-3.5 h-3.5 rounded-full border border-muted-foreground/40" />
                                {opt.label}
                              </div>
                            ))}
                            {field.options.length > 3 && (
                              <p className="text-xs text-muted-foreground">+{field.options.length - 3} more</p>
                            )}
                          </div>
                        ) : field.type === "checkbox" ? (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="w-3.5 h-3.5 rounded border border-muted-foreground/40" />
                            {field.label}
                          </div>
                        ) : (
                          <div
                            className="w-full border rounded-lg h-9 bg-muted/30 pointer-events-none"
                          />
                        )}
                      </div>
                    ))}
                    <Button className="w-full gradient-brand text-white border-0 pointer-events-none">
                      Submit
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Field editor */}
        <div className="w-80 border-l bg-card overflow-y-auto shrink-0">
          {selectedIdx !== null && fields[selectedIdx] ? (
            <>
              <div className="p-4 border-b flex items-center justify-between">
                <p className="text-sm font-semibold">Edit Field</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground"
                  onClick={() => setSelectedIdx(null)}
                >
                  ✕
                </Button>
              </div>
              <FieldEditor
                field={fields[selectedIdx]!}
                onChange={(f) => updateField(selectedIdx, f)}
              />
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-center p-8">
              <div>
                <p className="text-3xl mb-3">👈</p>
                <p className="text-sm text-muted-foreground">Select a field to edit its properties</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
