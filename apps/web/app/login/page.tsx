"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { trpc } from "~/trpc/client";
import { useAuth } from "~/providers/auth";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess(data) {
      login(data.token, data.user);
      toast.success("Welcome back! 👋");
      router.push("/dashboard");
    },
    onError(err) {
      toast.error(err.message ?? "Login failed");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  const handleDemo = () => {
    setEmail("demo@chaiForm.dev");
    setPassword("demo1234");
    loginMutation.mutate({ email: "demo@chaiForm.dev", password: "demo1234" });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-brand items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative text-white text-center px-12">
          <div className="text-6xl mb-6">☕</div>
          <h2 className="font-display text-4xl font-bold mb-4">Welcome back to ChaiForm</h2>
          <p className="text-white/80 text-lg">Your forms, your analytics, your story.</p>
          <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
            {["6 field types", "8 themes", "Real-time analytics", "Public API"].map((f) => (
              <div key={f} className="flex items-center gap-2 text-white/70">
                <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-2 font-display font-bold text-xl mb-8">
            <div className="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center text-white text-sm">☕</div>
            ChaiForm
          </Link>

          <h1 className="font-display text-3xl font-bold mb-2">Sign in</h1>
          <p className="text-muted-foreground mb-8">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary hover:underline font-medium">Create one</Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1.5 h-11"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 gradient-brand text-white border-0"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>Sign in <ArrowRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs text-muted-foreground">
              <span className="bg-background px-3">or try the demo</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full h-11"
            onClick={handleDemo}
            disabled={loginMutation.isPending}
          >
            🔑 Login with demo account
          </Button>

          <p className="text-center text-xs text-muted-foreground mt-3">
            demo@chaiForm.dev / demo1234
          </p>
        </div>
      </div>
    </div>
  );
}
