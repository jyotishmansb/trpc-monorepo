import Link from "next/link";
import { ArrowRight, Zap, Shield, BarChart3, Palette, Globe, Lock, Star, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast Builder",
    description: "Drag-and-drop field editor with live preview. Create professional forms in under 2 minutes.",
    color: "text-yellow-500",
    bg: "bg-yellow-50 dark:bg-yellow-950/30",
  },
  {
    icon: Palette,
    title: "8 Stunning Themes",
    description: "From cyberpunk Neon Noir to soft Anime Sakura — every form tells a story.",
    color: "text-pink-500",
    bg: "bg-pink-50 dark:bg-pink-950/30",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description: "Response trends, completion rates, field-by-field breakdowns — all in one dashboard.",
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    icon: Globe,
    title: "Public & Unlisted Forms",
    description: "Publish forms to the explore gallery or keep them private with a direct link.",
    color: "text-green-500",
    bg: "bg-green-50 dark:bg-green-950/30",
  },
  {
    icon: Shield,
    title: "Rate-Limited & Secure",
    description: "Built-in spam protection, IP-based rate limiting, and validation on every response.",
    color: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-950/30",
  },
  {
    icon: Lock,
    title: "No Login for Respondents",
    description: "Share a link — anyone can fill and submit without creating an account.",
    color: "text-orange-500",
    bg: "bg-orange-50 dark:bg-orange-950/30",
  },
];

const themes = [
  { name: "Neon Noir", category: "Gaming", bg: "#0a0a1a", text: "#00f5ff", accent: "#7c3aed", desc: "Cyberpunk dark" },
  { name: "Anime Sakura", category: "Anime", bg: "#fff0f7", text: "#831843", accent: "#ec4899", desc: "Japanese aesthetic" },
  { name: "Matrix Terminal", category: "Developer", bg: "#000000", text: "#00ff41", accent: "#39ff14", desc: "Hacker green" },
  { name: "Sunset Cinema", category: "Movies", bg: "#1c1410", text: "#fef3c7", accent: "#f59e0b", desc: "Warm cinematic" },
  { name: "Startup Blue", category: "SaaS", bg: "#f8faff", text: "#1e3a5f", accent: "#3b82f6", desc: "Clean corporate" },
  { name: "Festival Neon", category: "Events", bg: "#09090b", text: "#fafafa", accent: "#a855f7", desc: "Party vibes" },
];

const stats = [
  { value: "6+", label: "Field Types" },
  { value: "8", label: "Unique Themes" },
  { value: "∞", label: "Responses" },
  { value: "100%", label: "Type-Safe API" },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for getting started",
    features: ["3 forms", "100 responses/month", "Basic analytics", "2 themes"],
    cta: "Get Started",
    href: "/register",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$12",
    period: "/mo",
    description: "For serious creators",
    features: ["Unlimited forms", "Unlimited responses", "Advanced analytics", "All 8 themes", "Email notifications", "CSV export", "API access"],
    cta: "Start Free Trial",
    href: "/register",
    highlight: true,
  },
  {
    name: "Team",
    price: "$39",
    period: "/mo",
    description: "For growing teams",
    features: ["Everything in Pro", "5 team members", "Custom themes", "Priority support", "SSO", "Audit logs"],
    cta: "Contact Sales",
    href: "/register",
    highlight: false,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 glass border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 font-display font-bold text-xl">
              <div className="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center text-white text-sm">☕</div>
              ChaiForm
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/explore" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Explore</Link>
              <Link href="/templates" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Templates</Link>
              <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
              <Link href="http://localhost:3001/docs" target="_blank" className="text-sm text-muted-foreground hover:text-foreground transition-colors">API Docs</Link>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="gradient-brand text-white border-0 hover:opacity-90">
                  Get Started <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-24 pb-20 px-4">
        {/* Background blobs */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-violet-200/40 dark:bg-violet-900/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-200/40 dark:bg-indigo-900/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        </div>

        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6 bg-accent text-accent-foreground border-primary/20 px-4 py-1.5">
            <Sparkles className="mr-1 h-3 w-3" /> Now with 8 unique themes
          </Badge>

          <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Forms that feel{" "}
            <span className="gradient-brand-text">alive</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Build stunning, themed forms in minutes. Share with anyone — no account needed to respond.
            Collect insights with real-time analytics.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="gradient-brand text-white border-0 hover:opacity-90 px-8 h-12 text-base animate-glow">
                Build your first form <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/explore">
              <Button size="lg" variant="outline" className="px-8 h-12 text-base">
                Explore forms
              </Button>
            </Link>
          </div>

          {/* Demo credentials hint */}
          <p className="mt-6 text-sm text-muted-foreground">
            🔑 Demo: <code className="bg-muted px-1.5 py-0.5 rounded text-xs">demo@chaiForm.dev</code> / <code className="bg-muted px-1.5 py-0.5 rounded text-xs">demo1234</code>
          </p>
        </div>

        {/* Hero mock form card */}
        <div className="max-w-2xl mx-auto mt-16 animate-float" style={{ animationDelay: "1s" }}>
          <div className="rounded-2xl border bg-card shadow-2xl overflow-hidden">
            <div className="h-1.5 gradient-brand" />
            <div className="p-8">
              <div className="mb-6">
                <p className="text-xs text-muted-foreground mb-1 font-mono">1 / 4</p>
                <div className="w-1/4 h-1 bg-primary/20 rounded-full overflow-hidden">
                  <div className="h-full w-full bg-primary rounded-full" style={{ width: "25%" }} />
                </div>
              </div>
              <h2 className="font-display text-2xl font-bold mb-2">What's your name? 👋</h2>
              <p className="text-muted-foreground text-sm mb-6">We'd love to know who you are</p>
              <div className="relative">
                <input
                  className="w-full border-b-2 border-primary/30 focus:border-primary bg-transparent pb-3 text-lg outline-none transition-colors placeholder:text-muted-foreground/40"
                  placeholder="Your full name..."
                  readOnly
                />
              </div>
              <div className="mt-8 flex items-center gap-3">
                <Button className="gradient-brand text-white border-0">
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground">Press Enter ↵</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y bg-muted/30">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-4xl font-bold gradient-brand-text">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold mb-4">Everything you need to build great forms</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A complete toolkit for creators — from drag-and-drop building to real-time analytics.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="chai-card p-6">
                <div className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-4`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="font-display font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Themes showcase */}
      <section className="py-24 px-4 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold mb-4">8 themes, infinite personalities</h2>
            <p className="text-muted-foreground text-lg">Every form is a canvas. Pick a theme that matches your vibe.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {themes.map((theme) => (
              <div
                key={theme.name}
                className="relative rounded-2xl overflow-hidden border shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                style={{ backgroundColor: theme.bg }}
              >
                <div className="p-6 h-40 flex flex-col justify-between">
                  <div>
                    <Badge style={{ backgroundColor: theme.accent + "33", color: theme.accent, borderColor: theme.accent + "44" }} className="text-xs mb-2">
                      {theme.category}
                    </Badge>
                    <h3 className="font-display font-bold text-base" style={{ color: theme.text }}>{theme.name}</h3>
                    <p className="text-xs mt-1 opacity-70" style={{ color: theme.text }}>{theme.desc}</p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-1.5 rounded-full opacity-30" style={{ backgroundColor: theme.text }} />
                    <div className="h-1.5 rounded-full opacity-20 w-3/4" style={{ backgroundColor: theme.text }} />
                  </div>
                </div>
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: theme.accent }}
                />
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/explore">
              <Button variant="outline" size="lg">
                Browse all public forms <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="gradient-brand rounded-3xl p-12 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-4 right-4 w-32 h-32 bg-white rounded-full blur-2xl" />
              <div className="absolute bottom-4 left-4 w-24 h-24 bg-white rounded-full blur-2xl" />
            </div>
            <div className="relative">
              <h2 className="font-display text-4xl font-bold mb-4">Ready to brew your first form?</h2>
              <p className="text-white/80 mb-8 text-lg">Join thousands of creators building beautiful forms with ChaiForm.</p>
              <Link href="/register">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 px-8 h-12 text-base font-semibold">
                  Start for free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Link href="/" className="flex items-center gap-2 font-display font-bold text-lg mb-3">
                <div className="w-7 h-7 gradient-brand rounded-md flex items-center justify-center text-white text-xs">☕</div>
                ChaiForm
              </Link>
              <p className="text-sm text-muted-foreground">Build beautiful forms. Collect meaningful responses.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Product</h4>
              <div className="space-y-2">
                {[["Explore", "/explore"], ["Templates", "/templates"], ["Pricing", "/pricing"]].map(([label, href]) => (
                  <Link key={label} href={href} className="block text-sm text-muted-foreground hover:text-foreground transition-colors">{label}</Link>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Developers</h4>
              <div className="space-y-2">
                <a href="http://localhost:3001/docs" target="_blank" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">API Docs</a>
                <a href="http://localhost:3001/openapi.json" target="_blank" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">OpenAPI Spec</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Account</h4>
              <div className="space-y-2">
                {[["Login", "/login"], ["Register", "/register"], ["Dashboard", "/dashboard"]].map(([label, href]) => (
                  <Link key={label} href={href} className="block text-sm text-muted-foreground hover:text-foreground transition-colors">{label}</Link>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">© 2025 ChaiForm. Built with Turborepo, tRPC, Drizzle & ☕</p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span>Star us on GitHub</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
