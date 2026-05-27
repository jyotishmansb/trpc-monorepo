"use client";

import Link from "next/link";
import { Loader2, BookTemplate, ArrowRight, Hash } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { trpc } from "~/trpc/client";

export default function TemplatesPage() {
  const { data: templates, isLoading } = trpc.explore.listTemplates.useQuery();

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b glass sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-display font-bold text-xl">
            <div className="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center text-white text-sm">☕</div>
            ChaiForm
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/explore" className="text-sm text-muted-foreground hover:text-foreground">Explore</Link>
            <Link href="/register"><Button size="sm" className="gradient-brand text-white border-0">Use Template</Button></Link>
          </div>
        </div>
      </nav>

      <section className="pt-16 pb-10 px-4 text-center bg-gradient-to-b from-violet-50/50 dark:from-violet-950/20 to-transparent">
        <div className="flex items-center justify-center gap-2 mb-4">
          <BookTemplate className="h-5 w-5 text-primary" />
          <Badge className="bg-accent text-accent-foreground">Ready to use</Badge>
        </div>
        <h1 className="font-display text-4xl font-bold mb-3">Form templates</h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Start from a proven template. Click to preview, then duplicate to your dashboard.
        </p>
      </section>

      <section className="pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {templates?.map((template) => {
                const bg = template.theme?.backgroundColor ?? "#f8f9fa";
                const text = template.theme?.textColor ?? "#111827";
                const accent = template.theme?.primaryColor ?? "#6366f1";

                return (
                  <div key={template.id} className="rounded-2xl border overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 bg-card">
                    <div className="h-20 flex items-center px-6" style={{ backgroundColor: bg }}>
                      <div>
                        <p className="font-display font-bold text-sm" style={{ color: text }}>{template.title}</p>
                        {template.theme && (
                          <p className="text-xs opacity-60 mt-0.5" style={{ color: text }}>{template.theme.name} theme</p>
                        )}
                      </div>
                    </div>
                    <div className="p-5">
                      {template.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{template.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Hash className="h-3 w-3" />
                          {template.fieldCount} fields
                          {template.theme && (
                            <>
                              <span>·</span>
                              <Badge variant="secondary" className="text-xs">{template.theme.category}</Badge>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Link href={`/f/${template.slug}`}>
                            <Button variant="outline" size="sm">Preview</Button>
                          </Link>
                          <Link href="/register">
                            <Button size="sm" className="gradient-brand text-white border-0">
                              Use <ArrowRight className="ml-1 h-3 w-3" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {templates?.length === 0 && (
                <div className="col-span-2 text-center py-24">
                  <p className="text-5xl mb-4">📋</p>
                  <p className="text-muted-foreground">No templates yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
