"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { trpc } from "~/trpc/client";
import { Loader2, ArrowLeft, Trash2, ChevronLeft, ChevronRight, Eye, Mail } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export default function FormResponsesPage() {
  const params = useParams();
  const id = params.id as string;
  const [page, setPage] = useState(1);
  const [viewResponse, setViewResponse] = useState<string | null>(null);

  const { data, isLoading, refetch } = trpc.responses.list.useQuery({ formId: id, page, limit: 20 });
  const { data: formData } = trpc.forms.getById.useQuery({ id });
  const { data: singleResponse } = trpc.responses.getById.useQuery(
    { responseId: viewResponse!, formId: id },
    { enabled: !!viewResponse }
  );

  const deleteMutation = trpc.responses.delete.useMutation({
    onSuccess: () => { toast.success("Response deleted"); refetch(); },
    onError: () => toast.error("Failed to delete"),
  });

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <Link href={`/dashboard/forms/${id}`}>
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold">Responses</h1>
          <p className="text-muted-foreground text-sm">
            {data?.total ?? 0} total · {formData?.title}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : data?.responses.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-dashed">
          <p className="text-4xl mb-4">📭</p>
          <p className="font-semibold mb-2">No responses yet</p>
          <p className="text-muted-foreground text-sm">Share your form link to start collecting responses.</p>
          {formData?.status === "published" && (
            <div className="mt-4 flex justify-center">
              <a href={`/f/${formData.slug}`} target="_blank">
                <Button variant="outline" size="sm">Preview form</Button>
              </a>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-b">
                <tr>
                  <th className="text-left p-4 font-medium text-muted-foreground">Respondent</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Submitted</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Completion</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data?.responses.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-4">
                      {r.respondentEmail ? (
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium">{r.respondentName ?? r.respondentEmail}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Anonymous</span>
                      )}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {r.submittedAt ? formatDistanceToNow(new Date(r.submittedAt)) + " ago" : "—"}
                    </td>
                    <td className="p-4">
                      {r.completionTimeSeconds ? (
                        <Badge variant="secondary" className="text-xs">
                          {r.completionTimeSeconds < 60
                            ? `${r.completionTimeSeconds}s`
                            : `${Math.round(r.completionTimeSeconds / 60)}m`}
                        </Badge>
                      ) : "—"}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5 text-xs"
                          onClick={() => setViewResponse(r.id)}
                        >
                          <Eye className="h-3.5 w-3.5" /> View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5 text-xs text-destructive hover:text-destructive"
                          onClick={() => deleteMutation.mutate({ responseId: r.id, formId: id })}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, data.total)} of {data.total}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">{page} / {data.totalPages}</span>
                <Button variant="outline" size="sm" disabled={page === data.totalPages} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Response detail dialog */}
      <Dialog open={!!viewResponse} onOpenChange={() => setViewResponse(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Response Detail</DialogTitle>
          </DialogHeader>
          {singleResponse && (
            <div className="space-y-4">
              {singleResponse.respondentEmail && (
                <div className="rounded-lg bg-muted/40 p-3 text-sm">
                  <span className="text-muted-foreground">From: </span>
                  <span className="font-medium">{singleResponse.respondentEmail}</span>
                </div>
              )}
              <div className="space-y-3">
                {Object.entries(singleResponse.answers).map(([key, value]) => (
                  <div key={key} className="rounded-lg border p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">{key}</p>
                    <p className="text-sm font-medium">{String(value)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
