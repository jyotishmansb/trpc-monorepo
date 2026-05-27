"use client";

import Link from "next/link";
import { Search, Globe, Loader2, BarChart3 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { trpc } from "~/trpc/client";
import { useState } from "react";

function FormCard({ form }: {
  form: {
    id: string;
    title: string;
    description: string | null;
    slug: string;
    responseCount: number;
    theme: { name: string; slug: string; primaryColor: string; backgroundColor: string; textColor: string; category: string } | null;
    creator: { fullName: string; profileImageUrl: string | null };
  };
}) {
  const bg = form.theme?.backgroundColor ?? "#f8f9fa";
  const text = form.theme?.textColor ?? "#111827";
  const accent = form.theme?.primaryColor ?? "#6366f1";

  return (
    <Link href={`/f/${form.slug}`}>
      <div className="rounded-2xl border overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group cursor-pointer">
        {/* Theme preview header */}
        <div className="h-28 relative flex items-center justify-center p-4" style={{ backgroundColor: bg }}>
          <div className="text-center">
            <p className="font-display font-bold text-sm line-clamp-2" style={{ color: text }}>{form.title}</p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: accent }} />
        </div>

        {/* Card body */}
        <div className="p-4 bg-card">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm line-clamp-1">{form.title}</h3>
              {form.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{form.description}</p>
              )}
            </div>
            {form.theme && (
              <Badge variant="secondary" className="text-xs shrink-0">{form.theme.category}</Badge>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Avatar className="h-5 w-5">
                <AvatarImage src={form.creator.profileImageUrl ?? ""} />
                <AvatarFallback className="text-xs">{form.creator.fullName[0]}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">{form.creator.fullName}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <BarChart3 className="h-3 w-3" />
              {form.responseCount} responses
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function ExplorePage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = trpc.explore.listPublicForms.useQuery({ page, limit: 12 });

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b glass sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-display font-bold text-xl">
            <div className="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center text-white text-sm">☕</div>
            ChaiForm
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/templates" className="text-sm text-muted-foreground hover:text-foreground">Templates</Link>
            <Link href="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
            <Link href="/register"><Button size="sm" className="gradient-brand text-white border-0">Get Started</Button></Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-16 pb-10 px-4 text-center bg-gradient-to-b from-accent/30 to-transparent">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Globe className="h-5 w-5 text-primary" />
          <Badge className="bg-accent text-accent-foreground">Public Forms</Badge>
        </div>
        <h1 className="font-display text-4xl font-bold mb-3">Explore public forms</h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
          Browse, fill, and get inspired by forms created by the ChaiForm community.
        </p>
      </section>

      {/* Grid */}
      <section className="pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {data?.forms.map((form) => (
                  <FormCard key={form.id} form={form} />
                ))}
              </div>

              {data && data.totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-12">
                  <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {data.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={page === data.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}

              {data?.forms.length === 0 && (
                <div className="text-center py-24">
                  <p className="text-5xl mb-4">🌱</p>
                  <p className="text-muted-foreground">No public forms yet. Be the first to publish one!</p>
                  <Link href="/register" className="mt-4 inline-block">
                    <Button className="gradient-brand text-white border-0 mt-4">Create a form</Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
