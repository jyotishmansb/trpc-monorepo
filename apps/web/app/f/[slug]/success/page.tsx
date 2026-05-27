"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { CheckCircle2 } from "lucide-react";

function SuccessContent() {
  const params = useSearchParams();
  const title = params.get("title") ?? "the form";
  const msg = params.get("msg") ?? "Thank you for your response! 🎉";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-indigo-50 dark:from-violet-950/30 dark:via-background dark:to-indigo-950/20 px-4">
      <div className="text-center max-w-md mx-auto">
        <div className="w-20 h-20 gradient-brand rounded-full flex items-center justify-center mx-auto mb-6 animate-glow">
          <CheckCircle2 className="h-10 w-10 text-white" />
        </div>
        <h1 className="font-display text-3xl font-bold mb-3">Response submitted!</h1>
        <p className="text-muted-foreground text-lg mb-2">{msg}</p>
        <p className="text-sm text-muted-foreground mb-8">Your response to "{title}" has been recorded.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/explore">
            <Button variant="outline">Browse other forms</Button>
          </Link>
          <Link href="/">
            <Button className="gradient-brand text-white border-0">
              Build your own form ☕
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 gradient-brand rounded-full animate-pulse" /></div>}>
      <SuccessContent />
    </Suspense>
  );
}
