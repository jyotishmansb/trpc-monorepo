"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { trpc } from "~/trpc/client";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2, Globe, Lock, Eye, Trash2, ExternalLink, Copy } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { Separator } from "~/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "~/components/ui/alert-dialog";
import Link from "next/link";
import { toast as sonnerToast } from "sonner";

export default function FormSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: formData, isLoading, refetch } = trpc.forms.getById.useQuery({ id });
  const { data: themes } = trpc.themes.list.useQuery();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [themeId, setThemeId] = useState<string>("");
  const [visibility, setVisibility] = useState<"public" | "unlisted">("public");
  const [isTemplate, setIsTemplate] = useState(false);

  useEffect(() => {
    if (formData) {
      setTitle(formData.title);
      setDescription(formData.description ?? "");
      setSubmitMessage(formData.submitMessage ?? "");
      setThemeId(formData.themeId ?? "");
      setVisibility(formData.visibility);
      setIsTemplate(formData.isTemplate ?? false);
    }
  }, [formData]);

  const updateMutation = trpc.forms.update.useMutation({
    onSuccess: () => { toast.success("Settings saved ✓"); refetch(); },
    onError: () => toast.error("Failed to save settings"),
  });

  const deleteMutation = trpc.forms.delete.useMutation({
    onSuccess: () => { toast.success("Form deleted"); router.push("/dashboard/forms"); },
    onError: () => toast.error("Failed to delete"),
  });

  const handleSave = () => {
    updateMutation.mutate({
      id,
      title: title || undefined,
      description: description || null,
      submitMessage: submitMessage || undefined,
      themeId: themeId || null,
      visibility,
      isTemplate,
    });
  };

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/f/${formData?.slug}`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href={`/dashboard/forms/${id}`}>
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ArrowLeft className="h-4 w-4" /> Back to builder
          </Button>
        </Link>
        <h1 className="font-display text-2xl font-bold">Form Settings</h1>
      </div>

      <div className="space-y-8">
        {/* Basic info */}
        <section>
          <h2 className="font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <Label>Form Title</Label>
              <Input className="mt-1.5" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                className="mt-1.5 resize-none"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional — shown below the form title"
              />
            </div>
            <div>
              <Label>Success Message</Label>
              <Input
                className="mt-1.5"
                value={submitMessage}
                onChange={(e) => setSubmitMessage(e.target.value)}
                placeholder="Thank you for your response! 🎉"
              />
            </div>
          </div>
        </section>

        <Separator />

        {/* Theme */}
        <section>
          <h2 className="font-semibold mb-4">Theme</h2>
          <Select value={themeId} onValueChange={setThemeId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a theme..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No theme (default)</SelectItem>
              {themes?.map((theme) => (
                <SelectItem key={theme.id} value={theme.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: theme.primaryColor }}
                    />
                    {theme.name} — {theme.category}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {themeId && themes && (
            <div
              className="mt-3 rounded-xl p-4 flex items-center gap-3"
              style={{
                backgroundColor: themes.find((t) => t.id === themeId)?.backgroundColor ?? "#f8f9fa",
                color: themes.find((t) => t.id === themeId)?.textColor ?? "#111827",
              }}
            >
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: themes.find((t) => t.id === themeId)?.primaryColor }}
              />
              <span className="text-sm font-medium">
                {themes.find((t) => t.id === themeId)?.name} preview
              </span>
            </div>
          )}
        </section>

        <Separator />

        {/* Visibility */}
        <section>
          <h2 className="font-semibold mb-4">Visibility</h2>
          <div className="space-y-3">
            {[
              {
                value: "public" as const,
                icon: Globe,
                label: "Public",
                desc: "Appears in /explore and /templates. Anyone can find and fill it.",
              },
              {
                value: "unlisted" as const,
                icon: Lock,
                label: "Unlisted",
                desc: "Not shown in explore. Only people with the direct link can access it.",
              },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setVisibility(option.value)}
                className={`w-full flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
                  visibility === option.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <option.icon className={`h-5 w-5 mt-0.5 ${visibility === option.value ? "text-primary" : "text-muted-foreground"}`} />
                <div>
                  <p className="font-medium text-sm">{option.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{option.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        <Separator />

        {/* Share link */}
        {formData?.status === "published" && (
          <section>
            <h2 className="font-semibold mb-4">Share Link</h2>
            <div className="flex items-center gap-2">
              <Input value={shareUrl} readOnly className="text-sm font-mono" />
              <Button
                variant="outline"
                size="icon"
                onClick={() => { navigator.clipboard.writeText(shareUrl); toast.success("Link copied!"); }}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <a href={shareUrl} target="_blank">
                <Button variant="outline" size="icon">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </section>
        )}

        {formData?.status === "published" && <Separator />}

        {/* Template toggle */}
        <section>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">Mark as Template</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Public templates appear in /templates so others can use them as a starting point.
              </p>
            </div>
            <Switch checked={isTemplate} onCheckedChange={setIsTemplate} />
          </div>
        </section>

        <Separator />

        {/* Save */}
        <Button
          className="gradient-brand text-white border-0 gap-2"
          onClick={handleSave}
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Settings
        </Button>

        {/* Danger zone */}
        <div className="rounded-xl border border-destructive/30 p-5">
          <h3 className="font-semibold text-destructive mb-1 text-sm">Danger Zone</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Permanently delete this form and all its responses. This cannot be undone.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="gap-2">
                <Trash2 className="h-3.5 w-3.5" /> Delete Form
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete "{formData?.title}"?</AlertDialogTitle>
                <AlertDialogDescription>
                  All fields, responses, and analytics data will be permanently removed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground"
                  onClick={() => deleteMutation.mutate({ id })}
                >
                  Yes, delete forever
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
