"use client";

import { useParams } from "next/navigation";
import { trpc } from "~/trpc/client";
import { Loader2, BarChart3, Users, Clock, TrendingUp, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from "recharts";
import Link from "next/link";
import { Button } from "~/components/ui/button";

const COLORS = ["#6366f1", "#8b5cf6", "#a855f7", "#ec4899", "#f59e0b", "#14b8a6", "#3b82f6", "#10b981"];

export default function FormAnalyticsPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: stats, isLoading: statsLoading } = trpc.analytics.getFormStats.useQuery({ formId: id });
  const { data: fieldStats, isLoading: fieldLoading } = trpc.analytics.getFieldStats.useQuery({ formId: id });
  const { data: formData } = trpc.forms.getById.useQuery({ id });

  if (statsLoading || fieldLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const formatSeconds = (s: number | null) => {
    if (!s) return "—";
    if (s < 60) return `${Math.round(s)}s`;
    return `${Math.round(s / 60)}m ${Math.round(s % 60)}s`;
  };

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <Link href={`/dashboard/forms/${id}`}>
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ArrowLeft className="h-4 w-4" /> Back to builder
          </Button>
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground text-sm">{formData?.title}</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Responses", value: stats?.totalResponses ?? 0, icon: Users, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30" },
          { label: "Last 7 days", value: stats?.responsesLast7Days ?? 0, icon: TrendingUp, color: "text-green-500", bg: "bg-green-50 dark:bg-green-950/30" },
          { label: "Last 30 days", value: stats?.responsesLast30Days ?? 0, icon: BarChart3, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/30" },
          { label: "Avg Completion", value: formatSeconds(stats?.avgCompletionSeconds ?? null), icon: Clock, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/30" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center shrink-0`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="font-display text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Response trend chart */}
      {stats && stats.dailyData.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-base">Response Trend (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={stats.dailyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) => {
                    const d = new Date(v);
                    return `${d.getMonth() + 1}/${d.getDate()}`;
                  }}
                  interval={4}
                />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip
                  labelFormatter={(v) => new Date(v).toLocaleDateString()}
                  formatter={(v) => [v, "Responses"]}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "#6366f1" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Per-field stats */}
      {fieldStats && fieldStats.length > 0 && (
        <div>
          <h2 className="font-display text-xl font-semibold mb-4">Field Breakdown</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {fieldStats
              .filter((f) => f.totalAnswers > 0 && Object.keys(f.answerDistribution).length > 0)
              .map((field) => {
                const data = Object.entries(field.answerDistribution)
                  .map(([name, value]) => ({ name: name.slice(0, 15), value }))
                  .sort((a, b) => b.value - a.value)
                  .slice(0, 8);

                return (
                  <Card key={field.fieldId}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium line-clamp-1">
                        {field.fieldLabel}
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          ({field.totalAnswers} answers
                          {field.avgValue !== null && ` · avg: ${field.avgValue.toFixed(1)}`})
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(field.fieldType === "select" || field.fieldType === "radio" || field.fieldType === "multiselect") ? (
                        <ResponsiveContainer width="100%" height={150}>
                          <BarChart data={data} layout="vertical">
                            <XAxis type="number" tick={{ fontSize: 10 }} />
                            <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} />
                            <Tooltip />
                            <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]}>
                              {data.map((_, i) => (
                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : field.fieldType === "rating" ? (
                        <ResponsiveContainer width="100%" height={150}>
                          <BarChart data={data}>
                            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]}>
                              {data.map((_, i) => (
                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="space-y-1.5">
                          {data.slice(0, 5).map(({ name, value }) => (
                            <div key={name} className="flex items-center gap-2 text-xs">
                              <div className="flex-1 truncate text-muted-foreground">{name}</div>
                              <div className="shrink-0 font-medium">{value}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
