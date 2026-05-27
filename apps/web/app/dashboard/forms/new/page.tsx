"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "~/trpc/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function NewFormPage() {
  const router = useRouter();
  const createMutation = trpc.forms.create.useMutation({
    onSuccess(data) {
      router.push(`/dashboard/forms/${data.id}`);
    },
    onError() {
      toast.error("Failed to create form");
      router.push("/dashboard/forms");
    },
  });

  useEffect(() => {
    createMutation.mutate({ title: "Untitled Form" });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
        <p className="text-muted-foreground">Creating your form...</p>
      </div>
    </div>
  );
}
