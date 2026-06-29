import { useState } from "react";
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
    PieChart, Pie, Cell, Legend,
} from "recharts";
import {
    LayoutDashboard, Building2, HardHat, Eye, CalendarClock, QrCode, ArrowUpRight, BarChart3, Trophy,
} from "lucide-react";
import { useAnalyticsStats } from "@/hooks/useAnalytics";
import { StatCard } from "@/components/shared/StatCard";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { AdminPageHeader } from "@/components/admin/ui";
import { formatNumber, timeAgo } from "@/lib/utils";
import type { StatsRange } from "@/types";

const CHART = ["#EA5B0C", "#2563EB", "#475569", "#F5A623", "#0E9F6E", "#9333EA"];
const INK_SOFT = "rgba(20,32,43,0.55)";

const RANGES: { value: StatsRange; label: string }[] = [
    { value: "7d", label: "7 jours" },
    { value: "30d", label: "30 jours" },
    { value: "all", label: "Tout" },
];

function ChartTooltip({ active, payload, label, suffix = "visites" }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="admin-card px-3 py-2" style={{ boxShadow: "0 8px 24px rgba(20,32,43,0.18)" }}>
            <p style={{ fontSize: 11, color: INK_SOFT }}>{label ?? payload[0].name}</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: "var(--orange)" }}>
                {formatNumber(payload[0].value)} {suffix}
            </p>
        </div>
    );
}

function Panel({ title, icon: Icon, children, action }: { title: string; icon: any; children: React.ReactNode; action?: React.ReactNode }) {
    return (
        <div className="admin-card p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="flex items-center gap-2" style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>
                    <Icon size={17} style={{ color: "var(--ink-faint)" }} /> {title}
                </h3>
                {action}
            </div>
            {children}
        </div>
    );
}

export default function Dashboard() {
    const [range, setRange] = useState<StatsRange>("30d");
    const { data, isLoading } = useAnalyticsStats(range);

    if (isLoading && !data) return <LoadingSkeleton variant="page" />;

    const timeline = data?.timeline.map((t) => ({ date: t.date.slice(5), visits: t.visits })) ?? [];
    const sources = data?.visitsBySource.map((s) => ({
        name: s.source === "QrCode" ? "QR code" : s.source === "Direct" ? "Lien direct" : s.source,
        value: s.count,
    })) ?? [];
    const categories = data?.projectsByCategory.map((c) => ({ name: c.category, value: c.count })) ?? [];
    const top = data?.topConsulted ?? [];

    return (
        <div className="p-6 lg:p-8 space-y-6 max-w-[1600px]">
            <AdminPageHeader
                title="Tableau de bord"
                subtitle="Vue d'ensemble de votre portfolio et de sa fréquentation"
                icon={LayoutDashboard}
                actions={
                    <div className="flex items-center gap-1 admin-card" style={{ padding: 4 }}>
                        {RANGES.map((r) => (
                            <button
                                key={r.value}
                                onClick={() => setRange(r.value)}
                                className="px-3 py-1.5 rounded-lg transition-colors"
                                style={{
                                    fontSize: 13, fontWeight: 700,
                                    background: range === r.value ? "var(--orange)" : "transparent",
                                    color: range === r.value ? "#fff" : "var(--ink-soft)",
                                }}
                            >
                                {r.label}
                            </button>
                        ))}
                    </div>
                }
            />

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard label="Réalisations" value={formatNumber(data?.totalProjects ?? 0)} icon={Building2} color="orange" accent="#EA5B0C" />
                <StatCard label="Services actifs" value={formatNumber(data?.activeServices ?? 0)} icon={HardHat} color="steel" accent="#2563EB" />
                <StatCard label="Visites totales" value={formatNumber(data?.totalVisits ?? 0)} icon={Eye} color="slate" accent="#475569" hint={`sur la période ${RANGES.find(r => r.value === range)?.label.toLowerCase()}`} />
                <StatCard label="Visites (7 j)" value={formatNumber(data?.visitsLast7Days ?? 0)} icon={CalendarClock} color="green" accent="#0E9F6E" />
            </div>

            {/* Fréquentation + sources */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <div className="xl:col-span-2">
                    <Panel title="Fréquentation dans le temps" icon={BarChart3}>
                        {timeline.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <AreaChart data={timeline} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="visitsGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#EA5B0C" stopOpacity={0.32} />
                                            <stop offset="100%" stopColor="#EA5B0C" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(20,32,43,0.07)" vertical={false} />
                                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: INK_SOFT }} axisLine={false} tickLine={false} minTickGap={24} />
                                    <YAxis tick={{ fontSize: 11, fill: INK_SOFT }} axisLine={false} tickLine={false} width={40} allowDecimals={false} />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Area type="monotone" dataKey="visits" stroke="#EA5B0C" strokeWidth={2.5} fill="url(#visitsGrad)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ height: 250 }} className="flex items-center justify-center">
                                <p style={{ fontSize: 14, color: INK_SOFT }}>Pas encore de données de visite.</p>
                            </div>
                        )}
                    </Panel>
                </div>

                <Panel title="Visites par source" icon={QrCode}>
                    {sources.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={sources} dataKey="value" nameKey="name" cx="50%" cy="45%" innerRadius={48} outerRadius={78} paddingAngle={3}>
                                    {sources.map((_, i) => <Cell key={i} fill={CHART[i % CHART.length]} stroke="none" />)}
                                </Pie>
                                <Tooltip content={<ChartTooltip />} />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ height: 250 }} className="flex items-center justify-center">
                            <p style={{ fontSize: 14, color: INK_SOFT }}>Aucune visite enregistrée.</p>
                        </div>
                    )}
                </Panel>
            </div>

            {/* Catégories + Top 5 */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <Panel title="Réalisations par catégorie" icon={Building2}>
                    {categories.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={categories} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={82} paddingAngle={2}>
                                    {categories.map((_, i) => <Cell key={i} fill={CHART[i % CHART.length]} stroke="none" />)}
                                </Pie>
                                <Tooltip content={<ChartTooltip suffix="réalisations" />} />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <EmptyState icon={Building2} title="Aucune réalisation" description="Ajoutez vos premières réalisations pour voir leur répartition." />
                    )}
                </Panel>

                <Panel title="Top 5 des plus consultés" icon={Trophy} action={
                    <span className="admin-badge admin-badge-muted"><Eye size={12} /> consultations</span>
                }>
                    {top.length > 0 ? (
                        <ul className="space-y-3">
                            {top.map((item, i) => (
                                <li key={`${item.type}-${item.id}-${i}`} className="flex items-center gap-3">
                                    <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{
                                        background: i === 0 ? "rgba(234,91,12,0.16)" : "rgba(20,32,43,0.05)",
                                        color: i === 0 ? "var(--orange)" : "var(--ink-soft)", fontSize: 12, fontWeight: 800,
                                    }}>{i + 1}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="truncate" style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{item.label}</p>
                                        <p style={{ fontSize: 12, color: INK_SOFT }}>{item.type === "Project" ? "Réalisation" : "Service"}</p>
                                    </div>
                                    <span className="flex items-center gap-1" style={{ fontSize: 13.5, fontWeight: 700, color: "var(--orange)" }}>
                                        {formatNumber(item.visits)} <ArrowUpRight size={14} />
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <EmptyState icon={Trophy} title="Pas encore de classement" description="Le top apparaîtra dès que la vitrine recevra des visites ciblées." />
                    )}
                </Panel>
            </div>

            {/* Dernière mise à jour */}
            <div className="admin-card p-4 flex items-center gap-3">
                <CalendarClock size={18} style={{ color: "var(--ink-faint)" }} />
                <p style={{ fontSize: 13.5, color: "var(--ink-soft)" }}>
                    Dernière mise à jour du contenu : <strong style={{ color: "var(--ink)" }}>{timeAgo(data?.lastContentUpdateUtc)}</strong>
                </p>
            </div>
        </div>
    );
}
