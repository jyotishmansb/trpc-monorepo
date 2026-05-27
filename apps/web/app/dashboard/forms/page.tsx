"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, MoreHorizontal, Globe, Lock, Trash2, Copy, ExternalLink, BarChart3, Eye, Loader2, EyeOff, Settings, Edit } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "~/components/ui/alert-dialog";
import { trpc } from "~/trpc/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function FormsListPage() {
  const router = useRouter();
  const { data: forms, isLoading, refetch } = trpc.forms.list.useQuery();
  const createMutation = trpc.forms.create.useMutation({
    onSuccess(data) {
      router.push(`/dashboard/forms/${data.id}`);
    },
    onError: () => toast.error("Failed to create form"),
  });
  const deleteMutation = trpc.forms.delete.useMutation({
    onSuccess: () => { toast.success("Form deleted"); refetch(); },
    onError: () => toast.error("Failed to delete form"),
  });
  const duplicateMutation = trpc.forms.duplicate.useMutation({
    onSuccess: (data) => { toast.success("Form duplicated!"); router.push(`/dashboard/forms/${data.id}`); },
    onError: () => toast.error("Duplication failed"),
  });
  const publishMutation = trpc.forms.publish.useMutation({ onSuccess: () => { refetch(); toast.success("Form published!"); } });
  const unpublishMutation = trpc.forms.unpublish.useMutation({ onSuccess: () => { refetch(); toast.success("Form unpublished"); } });

  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold">My Forms</h1>
          <p className="text-muted-foreground mt-1">{forms?.length ?? 0} form{forms?.length !== 1 ? "s" : ""} total</p>
        </div>
        <Button
          className="gradient-brand text-white border-0 gap-2"
          onClick={() => createMutation.mutate({ title: "Untitled Form" })}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          New Form
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : forms && forms.length > 0 ? (
        <div className="space-y-3">
          {forms.map((form) => (
            <div key={form.id} className="rounded-xl border bg-card p-5 flex items-center gap-4 hover:shadow-sm transition-all">
              {/* Color indicator */}
              <div
                className="w-2 h-12 rounded-full shrink-0"
                style={{ backgroundColor: form.theme?.primaryColor ?? "#6366f1" }}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-sm truncate">{form.title}</h3>
                  <Badge
                    variant={form.status === "published" ? "default" : "secondary"}
                    className={`text-xs ${form.status === "published" ? "bg-green-500/10 text-green-600 border-green-200" : ""}`}
                  >
                    {form.status}
                  </Badge>
                  {form.visibility === "unlisted" && (
                    <Badge variant="outline" className="text-xs gap-1">
                      <Lock className="h-2.5 w-2.5" /> unlisted
                    </Badge>
                  )}
                </div>
                {form.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1">{form.description}</p>
                )}
                <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                  <span>{form.responseCount} responses</span>
                  {form.theme && <span>· {form.theme.name}</span>}
                  {form.updatedAt && <span>· updated {formatDistanceToNow(new Date(form.updatedAt))} ago</span>}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link href={`/dashboard/forms/${form.id}/analytics`}>
                  <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                    <BarChart3 className="h-3.5 w-3.5" /> Analytics
                  </Button>
                </Link>
                {form.status === "published" && (
                  <a href={`/f/${form.slug}`} target="_blank">
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                      <ExternalLink className="h-3.5 w-3.5" /> Preview
                    </Button>
                  </a>
                )}
                <Link href={`/dashboard/forms/${form.id}`}>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                    <Edit className="h-3.5 w-3.5" /> Edit
                  </Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {form.status === "draft" ? (
                      <DropdownMenuItem onClick={() => publishMutation.mutate({ id: form.id })}>
                        <Globe className="mr-2 h-4 w-4" /> Publish
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => unpublishMutation.mutate({ id: form.id })}>
                        <EyeOff className="mr-2 h-4 w-4" /> Unpublish
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => duplicateMutation.mutate({ id: form.id })}>
                      <Copy className="mr-2 h-4 w-4" /> Duplicate
                    </DropdownMenuItem>
                    <Link href={`/dashboard/forms/${form.id}/settings`}>
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" /> Settings
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => setDeleteId(form.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 rounded-2xl border border-dashed bg-muted/20">
          <p className="text-5xl mb-4">📝</p>
          <h3 className="font-display text-xl font-semibold mb-2">No forms yet</h3>
          <p className="text-muted-foreground mb-6">Create your first form and start collecting responses.</p>
          <Button
            className="gradient-brand text-white border-0"
            onClick={() => createMutation.mutate({ title: "Untitled Form" })}
          >
            <Plus className="mr-2 h-4 w-4" /> Create your first form
          </Button>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this form?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the form and all its responses. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { if (deleteId) { deleteMutation.mutate({ id: deleteId }); setDeleteId(null); } }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
