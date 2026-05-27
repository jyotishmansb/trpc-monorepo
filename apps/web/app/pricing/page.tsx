import Link from "next/link";
import { CheckCircle2, ArrowRight, Zap } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "",
    description: "Perfect for getting started and personal projects",
    features: ["3 active forms", "100 responses/month", "Basic analytics", "2 themes", "Community support"],
    missing: ["Email notifications", "CSV export", "API access", "Custom themes"],
    cta: "Start for Free",
    href: "/register",
    highlight: false,
    badge: null,
  },
  {
    name: "Pro",
    price: "$12",
    period: "/month",
    description: "Everything you need for serious form creators",
    features: [
      "Unlimited forms",
      "Unlimited responses",
      "Advanced analytics & charts",
      "All 8 premium themes",
      "Email notifications",
      "CSV response export",
      "Full API access",
      "Priority support",
    ],
    missing: [],
    cta: "Start 14-day Trial",
    href: "/register",
    highlight: true,
    badge: "Most Popular",
  },
  {
    name: "Team",
    price: "$39",
    period: "/month",
    description: "Built for teams that build together",
    features: [
      "Everything in Pro",
      "5 team seats included",
      "Shared form templates",
      "Custom domain forms",
      "SSO & SAML",
      "Audit activity logs",
      "SLA guarantee",
      "Dedicated account manager",
    ],
    missing: [],
    cta: "Contact Sales",
    href: "/register",
    highlight: false,
    badge: null,
  },
];

const faqs = [
  {
    q: "Do respondents need an account?",
    a: "No! Anyone with the form link can fill and submit — no account required for respondents.",
  },
  {
    q: "What's the difference between Public and Unlisted forms?",
    a: "Public forms appear in the /explore gallery and template pages. Unlisted forms are published but hidden from public listings — only accessible via direct link.",
  },
  {
    q: "Is there a free tier?",
    a: "Yes! The free plan gives you 3 forms and 100 responses/month forever — no credit card needed.",
  },
  {
    q: "Can I use the API?",
    a: "Absolutely. We provide a full REST API generated from OpenAPI specs, accessible at /docs. Pro and above get full API access.",
  },
  {
    q: "What field types are supported?",
    a: "Text, textarea, email, number, URL, phone, select, multiselect, radio, checkbox, rating, date, time, and statement fields.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-display font-bold text-xl">
            <div className="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center text-white text-sm">☕</div>
            ChaiForm
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
            <Link href="/register"><Button size="sm" className="gradient-brand text-white border-0">Get Started</Button></Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-20 pb-12 px-4 text-center">
        <Badge className="mb-4 bg-accent text-accent-foreground">
          <Zap className="mr-1 h-3 w-3" /> Simple, transparent pricing
        </Badge>
        <h1 className="font-display text-5xl font-bold mb-4">
          Pricing that <span className="gradient-brand-text">scales with you</span>
        </h1>
        <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
          Start free. Upgrade when you're ready. No surprises, no hidden fees.
        </p>
      </section>

      {/* Plans */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-8 flex flex-col ${plan.highlight ? "border-primary shadow-xl shadow-primary/10 bg-primary/5" : "bg-card shadow-sm"}`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="gradient-brand text-white border-0 px-3 py-1">{plan.badge}</Badge>
                </div>
              )}

              <div className="mb-6">
                <h2 className="font-display text-xl font-bold mb-1">{plan.name}</h2>
                <div className="flex items-end gap-1 mb-2">
                  <span className="font-display text-4xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground mb-1">{plan.period}</span>}
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
                {plan.missing.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground line-through">
                    <div className="w-4 h-4 mt-0.5 shrink-0 rounded-full border border-muted-foreground/30" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href={plan.href}>
                <Button
                  className={`w-full ${plan.highlight ? "gradient-brand text-white border-0 hover:opacity-90" : ""}`}
                  variant={plan.highlight ? "default" : "outline"}
                >
                  {plan.cta} {plan.highlight && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-muted/20">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-center mb-12">Frequently asked questions</h2>
          <div className="space-y-6">
            {faqs.map((faq) => (
              <div key={faq.q} className="rounded-xl border bg-card p-6">
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 px-4 text-center">
        <h2 className="font-display text-3xl font-bold mb-4">Still have questions?</h2>
        <p className="text-muted-foreground mb-6">Start with the free plan — no commitment required.</p>
        <Link href="/register">
          <Button size="lg" className="gradient-brand text-white border-0 px-8">
            Get started for free <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </section>
    </div>
  );
}
