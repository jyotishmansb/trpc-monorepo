"use client";

import Link from "next/link";
import { Plus, ArrowRight, BarChart3, FileText, Users } from "lucide-react";
import { Button } from "~/components/ui/button";
import { trpc } from "~/trpc/client";
import { useAuth } from "~/providers/auth";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: forms, isLoading } = trpc.forms.list.useQuery();

  const totalForms = forms?.length ?? 0;
  const publishedForms = forms?.filter((f) => f.status === "published").length ?? 0;
  const totalResponses = forms?.reduce((sum, f) => sum + f.responseCount, 0) ?? 0;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold">
            Good day, {user?.fullName.split(" ")[0]} 👋
          </h1>
          <p className="text-muted-foreground mt-1">Here's what's happening with your forms.</p>
        </div>
        <Link href="/dashboard/forms/new">
          <Button className="gradient-brand text-white border-0 gap-2">
            <Plus className="h-4 w-4" /> New Form
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {[
          { label: "Total Forms", value: totalForms, icon: FileText, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30" },
          { label: "Published", value: publishedForms, icon: BarChart3, color: "text-green-500", bg: "bg-green-50 dark:bg-green-950/30" },
          { label: "Total Responses", value: totalResponses, icon: Users, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/30" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border bg-card p-6 flex items-center gap-4">
            <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">{isLoading ? "—" : stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent forms */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold">Recent forms</h2>
          <Link href="/dashboard/forms" className="text-sm text-primary hover:underline flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : forms && forms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {forms.slice(0, 6).map((form) => (
              <Link href={`/dashboard/forms/${form.id}`} key={form.id}>
                <div className="rounded-xl border bg-card p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      form.status === "published"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {form.status}
                    </span>
                    <span className="text-xs text-muted-foreground">{form.visibility}</span>
                  </div>
                  <h3 className="font-semibold text-sm mb-1 line-clamp-1">{form.title}</h3>
                  {form.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{form.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {form.responseCount} responses
                    {form.theme && (
                      <>
                        <span>·</span>
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: form.theme.primaryColor }}
                        />
                        <span>{form.theme.name}</span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 rounded-2xl border border-dashed bg-muted/20">
            <p className="text-5xl mb-4">📝</p>
            <h3 className="font-display text-xl font-semibold mb-2">No forms yet</h3>
            <p className="text-muted-foreground mb-6">Create your first form to start collecting responses.</p>
            <Link href="/dashboard/forms/new">
              <Button className="gradient-brand text-white border-0">
                <Plus className="mr-2 h-4 w-4" /> Create your first form
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
