import { useState, useEffect, useCallback } from "react";
import { useSession, signOut, getSession } from "next-auth/react";
import { useRouter } from "next/router";
import styled from "styled-components";
import Head from "next/head";
import {
    BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, CartesianGrid
} from "recharts";
import { getDashboardAggregations } from "../api/admin/stats";

const OS_COLORS = ["#2563eb", "#38bdf8", "#6366f1", "#a855f7", "#ec4899", "#94a3b8"];
const BROWSER_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#64748b"];
const DEVICE_COLORS = {
    Mobile: "#2563eb",
    Desktop: "#10b981",
    Tablet: "#f59e0b"
};

const AVAILABLE_ICONS = [
    { label: "Website", value: "/web.svg" },
    { label: "WhatsApp", value: "/whatsapp.svg" },
    { label: "Email", value: "/mail.svg" },
    { label: "Download", value: "/download.svg" },
    { label: "Instagram", value: "/insta.svg" },
    { label: "TikTok", value: "/tiktok.svg" },
    { label: "YouTube", value: "/youtube.svg" },
    { label: "LinkedIn", value: "/linkedin.svg" },
    { label: "GitHub", value: "/github.svg" },
    { label: "Threads", value: "/threads.svg" },
    { label: "Support/Heart", value: "/heart.svg" }
];

const DEFAULT_CATEGORIES = [
    "social",
    "Core Services & Portfolio",
    "Direct Inquiries & Contact",
    "Featured Product & Release",
    "Creative Channels & Media",
    "Professional Credentials & Tech",
    "Community & Support"
];

export default function EnterpriseDashboard({ initialData }) {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [data, setData] = useState(initialData || null);
    const [links, setLinks] = useState(initialData?.links || []);
    const [loading, setLoading] = useState(!initialData);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("all");

    // Modals
    const [modalOpen, setModalOpen] = useState(false);
    const [editingLink, setEditingLink] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [linkToDelete, setLinkToDelete] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    // Form inputs
    const [formData, setFormData] = useState({
        title: "",
        subtitle: "",
        badge: "",
        url: "",
        type: "Core Services & Portfolio",
        icon: "/web.svg",
        featured: false,
        on: true,
        order: 1
    });

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(""), 2800);
    };

    const fetchLatestData = useCallback(async () => {
        try {
            const [statsRes, linksRes] = await Promise.all([
                fetch("/api/admin/stats"),
                fetch("/api/admin/links")
            ]);

            if (statsRes.ok) {
                const statsJson = await statsRes.json();
                if (statsJson.success) setData(statsJson.data);
            }

            if (linksRes.ok) {
                const linksJson = await linksRes.json();
                if (linksJson.success) setLinks(linksJson.data);
            }
        } catch (err) {
            console.error("Dashboard refresh error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.replace("/admin/login");
        } else if (status === "authenticated" && !initialData) {
            fetchLatestData();
        }
    }, [status, router, initialData, fetchLatestData]);

    const openAddModal = () => {
        setEditingLink(null);
        setFormData({
            title: "",
            subtitle: "",
            badge: "",
            url: "",
            type: "Core Services & Portfolio",
            icon: "/web.svg",
            featured: false,
            on: true,
            order: links.length + 1
        });
        setModalOpen(true);
    };

    const openEditModal = (link) => {
        setEditingLink(link);
        setFormData({
            _id: link._id,
            title: link.title || "",
            subtitle: link.subtitle || "",
            badge: link.badge || "",
            url: link.url || "",
            type: link.type || "Core Services & Portfolio",
            icon: link.icon || "/web.svg",
            featured: Boolean(link.featured),
            on: link.on !== false,
            order: link.order || 1
        });
        setModalOpen(true);
    };

    const handleSaveLink = async (e) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            const isEdit = Boolean(editingLink);
            const endpoint = "/api/admin/links";
            const method = isEdit ? "PUT" : "POST";

            const res = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const resData = await res.json();
            if (resData.success) {
                showToast(isEdit ? "Tautan diperbarui" : "Tautan ditambahkan");
                setModalOpen(false);
                fetchLatestData();
            } else {
                alert(resData.message || "Gagal menyimpan.");
            }
        } catch (err) {
            console.error("Save error:", err);
            alert("Terjadi kesalahan sistem.");
        } finally {
            setFormLoading(false);
        }
    };

    const handleToggleStatus = async (link) => {
        const newStatus = !link.on;
        setLinks(prev => prev.map(item => item._id === link._id ? { ...item, on: newStatus } : item));

        try {
            await fetch("/api/admin/links", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ _id: link._id, on: newStatus })
            });
            showToast(`Status: ${newStatus ? 'Aktif' : 'Off'}`);
            fetchLatestData();
        } catch (err) {
            console.error("Toggle error:", err);
            fetchLatestData();
        }
    };

    const confirmDelete = (link) => {
        setLinkToDelete(link);
        setDeleteModalOpen(true);
    };

    const handleDeleteLink = async () => {
        if (!linkToDelete) return;
        setFormLoading(true);

        try {
            const res = await fetch(`/api/admin/links?id=${linkToDelete._id}`, {
                method: "DELETE"
            });
            const resData = await res.json();
            if (resData.success) {
                showToast("Tautan dihapus");
                setDeleteModalOpen(false);
                setLinkToDelete(null);
                fetchLatestData();
            } else {
                alert(resData.message || "Gagal menghapus.");
            }
        } catch (err) {
            console.error("Delete error:", err);
            alert("Gagal menghapus tautan.");
        } finally {
            setFormLoading(false);
        }
    };

    if (status === "loading" || loading) {
        return (
            <CenterLoading>
                <Spinner />
            </CenterLoading>
        );
    }

    const filteredLinks = links.filter(link => {
        const matchesSearch = (link.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (link.url || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === "all" || link.type === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const categoryList = Array.from(new Set(links.map(l => l.type).filter(Boolean)));

    // Gauge Semi-Circle Data
    const gaugeValue = data?.kpi?.dailyTargetPercentage || 78;
    const gaugeData = [
        { name: "Achieved", value: gaugeValue, color: "#2563eb" },
        { name: "Remaining", value: Math.max(0, 100 - gaugeValue), color: "#e2e8f0" }
    ];

    return (
        <>
            <Head>
                <title>Analytics Dashboard • Enterprise Admin</title>
            </Head>

            <EnterpriseContainer>
                {/* Toast Notification */}
                {toastMessage && (
                    <ToastBox>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span>{toastMessage}</span>
                    </ToastBox>
                )}

                {/* Top Header */}
                <AppHeader>
                    <BrandFlex>
                        <BrandAvatar src="/avatar.png" alt="Avatar" />
                        <div>
                            <HeaderTitle>Enterprise Analytics</HeaderTitle>
                            <HeaderSubTitle>{session?.user?.name || "Admin"} • Fadd Graphics</HeaderSubTitle>
                        </div>
                    </BrandFlex>

                    <HeaderActions>
                        <OutlineBtn href="/" target="_blank" rel="noreferrer" title="Lihat Web">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                <polyline points="15 3 21 3 21 9"></polyline>
                                <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                            <span>Web</span>
                        </OutlineBtn>

                        <PrimaryBtn onClick={openAddModal}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            <span>Tambah Tautan</span>
                        </PrimaryBtn>

                        <SignOutIconButton onClick={() => signOut({ callbackUrl: "/admin/login" })} title="Keluar">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                        </SignOutIconButton>
                    </HeaderActions>
                </AppHeader>

                {/* ROW 1: 3 KPI Scorecards + 1 Semi-Circle Gauge */}
                <Row1Grid>
                    {/* KPI 1: Total Clicks */}
                    <KpiCard>
                        <KpiTop>
                            <KpiLabel>Total Clicks</KpiLabel>
                            <KpiBadge className="green">+14.2%</KpiBadge>
                        </KpiTop>
                        <KpiValue>{data?.kpi?.totalClicks?.toLocaleString() ?? 0}</KpiValue>
                        <KpiFooterText>Akumulasi klik seluruh tautan</KpiFooterText>
                    </KpiCard>

                    {/* KPI 2: Total Links */}
                    <KpiCard>
                        <KpiTop>
                            <KpiLabel>Active Links</KpiLabel>
                            <KpiBadge className="blue">100% On</KpiBadge>
                        </KpiTop>
                        <KpiValue>{data?.kpi?.activeLinks ?? 0} <small>/ {data?.kpi?.totalLinks ?? 0}</small></KpiValue>
                        <KpiFooterText>Tautan aktif publik</KpiFooterText>
                    </KpiCard>

                    {/* KPI 3: Unique Visitors */}
                    <KpiCard>
                        <KpiTop>
                            <KpiLabel>Unique Visitors</KpiLabel>
                            <KpiBadge className="purple">+8.5%</KpiBadge>
                        </KpiTop>
                        <KpiValue>{data?.kpi?.uniqueVisitors?.toLocaleString() ?? 0}</KpiValue>
                        <KpiFooterText>Pengunjung unik terdeteksi</KpiFooterText>
                    </KpiCard>

                    {/* Gauge Card: Daily Target / CTR Ratio */}
                    <KpiCard style={{ position: 'relative', overflow: 'hidden' }}>
                        <KpiTop>
                            <KpiLabel>Daily Target</KpiLabel>
                            <KpiBadge className="blue">{data?.kpi?.todayClicks ?? 0} Hari ini</KpiBadge>
                        </KpiTop>
                        <GaugeWrap>
                            <ResponsiveContainer width="100%" height={105}>
                                <PieChart>
                                    <Pie
                                        data={gaugeData}
                                        cx="50%"
                                        cy="100%"
                                        startAngle={180}
                                        endAngle={0}
                                        innerRadius={46}
                                        outerRadius={68}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {gaugeData.map((entry, idx) => (
                                            <Cell key={`cell-${idx}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <GaugeCenterValue>{gaugeValue}%</GaugeCenterValue>
                        </GaugeWrap>
                    </KpiCard>
                </Row1Grid>

                {/* ROW 2 & 3: Donut 1 (OS), Donut 2 (Browsers), Vertical Bar (Daily Active Clicks) */}
                <Row2Grid>
                    {/* Donut 1: Operating Systems */}
                    <EnterpriseCard>
                        <CardHeader>
                            <CardTitle>User Operating Systems</CardTitle>
                        </CardHeader>
                        <ResponsiveContainer width="100%" height={210}>
                            <PieChart>
                                <Pie
                                    data={data?.osBreakdown || []}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={48}
                                    outerRadius={72}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {(data?.osBreakdown || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={OS_COLORS[index % OS_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
                                    formatter={(val, name) => [`${val} Klik`, name]}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={32}
                                    iconType="circle"
                                    formatter={(val) => <span style={{ color: '#64748b', fontSize: '11px' }}>{val}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </EnterpriseCard>

                    {/* Donut 2: Browsers */}
                    <EnterpriseCard>
                        <CardHeader>
                            <CardTitle>User Browsers</CardTitle>
                        </CardHeader>
                        <ResponsiveContainer width="100%" height={210}>
                            <PieChart>
                                <Pie
                                    data={data?.browserBreakdown || []}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={48}
                                    outerRadius={72}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {(data?.browserBreakdown || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={BROWSER_COLORS[index % BROWSER_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
                                    formatter={(val, name) => [`${val} Klik`, name]}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={32}
                                    iconType="circle"
                                    formatter={(val) => <span style={{ color: '#64748b', fontSize: '11px' }}>{val}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </EnterpriseCard>

                    {/* Vertical Bar: Daily Active Clicks (14 Days) */}
                    <EnterpriseCard>
                        <CardHeader>
                            <CardTitle>Daily Active Clicks (14 Hari)</CardTitle>
                        </CardHeader>
                        <ResponsiveContainer width="100%" height={210}>
                            <BarChart data={data?.dailyTrends || []} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
                                    formatter={(val) => [`${val} Klik`, 'Total']}
                                />
                                <Bar dataKey="clicks" fill="#2563eb" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </EnterpriseCard>
                </Row2Grid>

                {/* ROW 4 & 5: Horizontal Bar (Top 10 Links) + Stacked Bar (Day of Week by Device) */}
                <Row4Grid>
                    {/* Horizontal Bar: Top 10 Links Clicked */}
                    <EnterpriseCard>
                        <CardHeader>
                            <CardTitle>Top 10 Links Clicked</CardTitle>
                        </CardHeader>
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart
                                layout="vertical"
                                data={data?.top10Links || []}
                                margin={{ top: 5, right: 20, left: 10, bottom: 0 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis
                                    type="category"
                                    dataKey="title"
                                    stroke="#475569"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    width={120}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
                                    formatter={(val) => [`${val} Klik`, 'Total']}
                                />
                                <Bar dataKey="clicks" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </EnterpriseCard>

                    {/* Stacked Bar: Clicks per Day of the Week */}
                    <EnterpriseCard>
                        <CardHeader>
                            <CardTitle>Clicks per Day of Week (Device Stack)</CardTitle>
                        </CardHeader>
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={data?.dayOfWeekData || []} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={28}
                                    iconType="circle"
                                    formatter={(val) => <span style={{ color: '#64748b', fontSize: '11px' }}>{val}</span>}
                                />
                                <Bar dataKey="Mobile" stackId="a" fill={DEVICE_COLORS.Mobile} radius={[0, 0, 0, 0]} />
                                <Bar dataKey="Desktop" stackId="a" fill={DEVICE_COLORS.Desktop} radius={[0, 0, 0, 0]} />
                                <Bar dataKey="Tablet" stackId="a" fill={DEVICE_COLORS.Tablet} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </EnterpriseCard>
                </Row4Grid>

                {/* ROW 6: Recent Click Logs Table */}
                <EnterpriseCard style={{ marginBottom: '18px' }}>
                    <CardHeader>
                        <CardTitle>Recent Click Logs</CardTitle>
                    </CardHeader>
                    <TableScrollWrap>
                        <CleanTable>
                            <thead>
                                <tr>
                                    <th>Waktu</th>
                                    <th>Tautan</th>
                                    <th>OS</th>
                                    <th>Browser</th>
                                    <th>Device</th>
                                    <th>IP Visitor</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(data?.recentLogs || []).map((log, i) => (
                                    <tr key={log.id || i}>
                                        <td style={{ color: '#64748b', whiteSpace: 'nowrap' }}>{log.date} • {log.time}</td>
                                        <td style={{ fontWeight: '600' }}>{log.title}</td>
                                        <td><TagBadge>{log.os}</TagBadge></td>
                                        <td><TagBadge>{log.browser}</TagBadge></td>
                                        <td><TagBadge>{log.device}</TagBadge></td>
                                        <td style={{ color: '#94a3b8', fontFamily: 'monospace' }}>{log.ip}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </CleanTable>
                    </TableScrollWrap>
                </EnterpriseCard>

                {/* ROW 7: Full Link Management (CRUD Table) */}
                <EnterpriseCard>
                    <TableHeaderRow>
                        <CardTitle>Manajemen Tautan</CardTitle>
                        <FilterGroup>
                            <SearchBox
                                type="text"
                                placeholder="Cari judul..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <SelectBox
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                            >
                                <option value="all">Semua Kategori</option>
                                {categoryList.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </SelectBox>
                        </FilterGroup>
                    </TableHeaderRow>

                    {filteredLinks.length === 0 ? (
                        <EmptyBox>Tidak ada tautan ditemukan.</EmptyBox>
                    ) : (
                        <TableScrollWrap>
                            <CleanTable>
                                <thead>
                                    <tr>
                                        <th>Tautan</th>
                                        <th>Kategori</th>
                                        <th>Klik</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: 'right' }}>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLinks.map((link) => (
                                        <tr key={link._id}>
                                            <td>
                                                <LinkRowItem>
                                                    <IconBox className={link.featured ? 'hero' : ''}>
                                                        <img src={link.icon || '/web.svg'} alt="" />
                                                    </IconBox>
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <span style={{ fontWeight: '600' }}>{link.title}</span>
                                                            {link.badge && <HeroBadge>{link.badge}</HeroBadge>}
                                                            {link.featured && <HeroTag>Hero</HeroTag>}
                                                        </div>
                                                        <LinkUrl href={link.url} target="_blank" rel="noreferrer">
                                                            {link.url}
                                                        </LinkUrl>
                                                    </div>
                                                </LinkRowItem>
                                            </td>
                                            <td><CategoryPill>{link.type}</CategoryPill></td>
                                            <td style={{ fontWeight: '600', color: '#2563eb' }}>{link.clicks || 0}</td>
                                            <td>
                                                <ToggleStatusBtn
                                                    onClick={() => handleToggleStatus(link)}
                                                    active={link.on !== false}
                                                >
                                                    <span className="dot"></span>
                                                    <span>{link.on !== false ? 'Aktif' : 'Off'}</span>
                                                </ToggleStatusBtn>
                                            </td>
                                            <td>
                                                <ActionFlex>
                                                    <IconActionBtn onClick={() => openEditModal(link)} title="Edit">
                                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                        </svg>
                                                    </IconActionBtn>
                                                    <IconActionBtn className="del" onClick={() => confirmDelete(link)} title="Hapus">
                                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <polyline points="3 6 5 6 21 6"></polyline>
                                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                        </svg>
                                                    </IconActionBtn>
                                                </ActionFlex>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </CleanTable>
                        </TableScrollWrap>
                    )}
                </EnterpriseCard>

                {/* Modal Add / Edit Link */}
                {modalOpen && (
                    <ModalBackdrop onClick={() => setModalOpen(false)}>
                        <ModalPanel onClick={(e) => e.stopPropagation()}>
                            <ModalTop>
                                <ModalHeading>{editingLink ? "Edit Tautan" : "Tambah Tautan"}</ModalHeading>
                                <CloseIconButton onClick={() => setModalOpen(false)}>✕</CloseIconButton>
                            </ModalTop>

                            <FormElement onSubmit={handleSaveLink}>
                                <FormRowFlex>
                                    <FieldWrap style={{ flex: 2 }}>
                                        <FieldLabel>Judul *</FieldLabel>
                                        <FormInput
                                            type="text"
                                            placeholder="Judul tautan"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            required
                                        />
                                    </FieldWrap>

                                    <FieldWrap style={{ flex: 1 }}>
                                        <FieldLabel>Badge</FieldLabel>
                                        <FormInput
                                            type="text"
                                            placeholder="v1.3.0"
                                            value={formData.badge}
                                            onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                                        />
                                    </FieldWrap>
                                </FormRowFlex>

                                <FieldWrap>
                                    <FieldLabel>URL *</FieldLabel>
                                    <FormInput
                                        type="url"
                                        placeholder="https://..."
                                        value={formData.url}
                                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                        required
                                    />
                                </FieldWrap>

                                <FieldWrap>
                                    <FieldLabel>Subtitle</FieldLabel>
                                    <FormInput
                                        type="text"
                                        placeholder="Keterangan singkat"
                                        value={formData.subtitle}
                                        onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                    />
                                </FieldWrap>

                                <FormRowFlex>
                                    <FieldWrap style={{ flex: 1 }}>
                                        <FieldLabel>Kategori</FieldLabel>
                                        <FormSelect
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        >
                                            {DEFAULT_CATEGORIES.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </FormSelect>
                                    </FieldWrap>

                                    <FieldWrap style={{ flex: 1 }}>
                                        <FieldLabel>Ikon</FieldLabel>
                                        <FormSelect
                                            value={formData.icon}
                                            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                        >
                                            {AVAILABLE_ICONS.map(ic => (
                                                <option key={ic.value} value={ic.value}>{ic.label}</option>
                                            ))}
                                        </FormSelect>
                                    </FieldWrap>
                                </FormRowFlex>

                                <CheckLabel>
                                    <input
                                        type="checkbox"
                                        checked={formData.featured}
                                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                    />
                                    <span>Hero / Unggulan</span>
                                </CheckLabel>

                                <CheckLabel>
                                    <input
                                        type="checkbox"
                                        checked={formData.on}
                                        onChange={(e) => setFormData({ ...formData, on: e.target.checked })}
                                    />
                                    <span>Aktif</span>
                                </CheckLabel>

                                <ModalBottom>
                                    <OutlineBtn type="button" onClick={() => setModalOpen(false)}>Batal</OutlineBtn>
                                    <PrimaryBtn type="submit" disabled={formLoading}>
                                        {formLoading ? "Menyimpan..." : "Simpan"}
                                    </PrimaryBtn>
                                </ModalBottom>
                            </FormElement>
                        </ModalPanel>
                    </ModalBackdrop>
                )}

                {/* Modal Konfirmasi Hapus */}
                {deleteModalOpen && (
                    <ModalBackdrop onClick={() => setDeleteModalOpen(false)}>
                        <ModalPanel style={{ maxWidth: '360px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                            <ModalHeading>Hapus Tautan?</ModalHeading>
                            <p style={{ fontSize: '13px', color: '#64748b', margin: '8px 0 16px' }}>
                                Hapus <strong>&quot;{linkToDelete?.title}&quot;</strong>?
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                <OutlineBtn onClick={() => setDeleteModalOpen(false)}>Batal</OutlineBtn>
                                <DangerBtn onClick={handleDeleteLink} disabled={formLoading}>
                                    {formLoading ? "Menghapus..." : "Hapus"}
                                </DangerBtn>
                            </div>
                        </ModalPanel>
                    </ModalBackdrop>
                )}
            </EnterpriseContainer>
        </>
    );
}

// ServerSideProps for instant SSR hydration
export async function getServerSideProps(context) {
    const session = await getSession(context);
    if (!session) {
        return {
            redirect: {
                destination: "/admin/login",
                permanent: false
            }
        };
    }

    try {
        const initialData = await getDashboardAggregations();
        // Convert dates/ObjectIds to JSON safe primitives
        const serialized = JSON.parse(JSON.stringify(initialData));
        return {
            props: {
                initialData: serialized
            }
        };
    } catch (e) {
        console.error("SSR Stats error:", e);
        return {
            props: {
                initialData: null
            }
        };
    }
}

// Styled Components (Enterprise White Cards & Subtle Borders)
const CenterLoading = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Spinner = styled.div`
  width: 32px;
  height: 32px;
  border: 2.5px solid rgba(0, 0, 0, 0.1);
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const EnterpriseContainer = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 24px 18px 48px;
  width: 100%;

  @media screen and (max-width: 768px) {
    padding: 16px 12px 32px;
  }
`;

const ToastBox = styled.div`
  position: fixed;
  top: 18px;
  right: 18px;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #10b981;
  color: #ffffff;
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 12.5px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
`;

const AppHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
`;

const BrandFlex = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const BrandAvatar = styled.img`
  width: 38px;
  height: 38px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid ${({ theme }) => theme.bg.cardBorder};
`;

const HeaderTitle = styled.h1`
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.3px;
  color: ${({ theme }) => theme.text.primary};
  margin: 0;
`;

const HeaderSubTitle = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.text.secondary};
  margin: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const OutlineBtn = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 11px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  background: ${({ theme }) => theme.bg.card};
  border: 1px solid ${({ theme }) => theme.bg.cardBorder};
  color: ${({ theme }) => theme.text.primary};
  cursor: pointer;
  text-decoration: none;
  transition: all 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.bg.cardHover};
  }
`;

const PrimaryBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 13px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  background: #2563eb;
  color: #ffffff;
  border: none;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: #1d4ed8;
  }
`;

const DangerBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 13px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  background: #ef4444;
  color: #ffffff;
  border: none;
  cursor: pointer;

  &:hover {
    background: #dc2626;
  }
`;

const SignOutIconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: ${({ theme }) => theme.bg.card};
  border: 1px solid ${({ theme }) => theme.bg.cardBorder};
  color: #ef4444;
  cursor: pointer;

  &:hover {
    background: rgba(239, 68, 68, 0.1);
  }
`;

// Row 1 Grid: 3 KPI + 1 Semi-Circle Gauge
const Row1Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 16px;

  @media screen and (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media screen and (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const KpiCard = styled.div`
  background: ${({ theme }) => theme.bg.card};
  border: 1px solid ${({ theme }) => theme.bg.cardBorder};
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
`;

const KpiTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const KpiLabel = styled.span`
  font-size: 12.5px;
  font-weight: 600;
  color: ${({ theme }) => theme.text.secondary};
`;

const KpiBadge = styled.span`
  font-size: 11px;
  font-weight: 700;
  padding: 1.5px 6px;
  border-radius: 4px;

  &.green {
    background: rgba(16, 185, 129, 0.12);
    color: #10b981;
  }
  &.blue {
    background: rgba(37, 99, 235, 0.12);
    color: #2563eb;
  }
  &.purple {
    background: rgba(124, 58, 237, 0.12);
    color: #7c3aed;
  }
`;

const KpiValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: ${({ theme }) => theme.text.primary};

  small {
    font-size: 13px;
    font-weight: 500;
    color: ${({ theme }) => theme.text.secondary};
  }
`;

const KpiFooterText = styled.span`
  font-size: 11.5px;
  color: ${({ theme }) => theme.text.tertiary};
  margin-top: 4px;
`;

const GaugeWrap = styled.div`
  position: relative;
  width: 100%;
  height: 80px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
`;

const GaugeCenterValue = styled.div`
  position: absolute;
  bottom: 0;
  font-size: 18px;
  font-weight: 700;
  color: #2563eb;
`;

// Row 2 & 3: Donut 1, Donut 2, Vertical Bar (14 Days)
const Row2Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1.3fr;
  gap: 14px;
  margin-bottom: 16px;

  @media screen and (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

// Row 4 & 5: Horizontal Bar + Stacked Bar
const Row4Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 16px;

  @media screen and (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const EnterpriseCard = styled.div`
  background: ${({ theme }) => theme.bg.card};
  border: 1px solid ${({ theme }) => theme.bg.cardBorder};
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
`;

const CardHeader = styled.div`
  margin-bottom: 12px;
`;

const CardTitle = styled.h2`
  font-size: 13.5px;
  font-weight: 700;
  letter-spacing: -0.2px;
  color: ${({ theme }) => theme.text.primary};
  margin: 0;
`;

const TableHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  flex-wrap: wrap;
  gap: 10px;
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const SearchBox = styled.input`
  padding: 5px 9px;
  border-radius: 6px;
  font-size: 12px;
  border: 1px solid ${({ theme }) => theme.bg.cardBorder};
  background: ${({ theme }) => theme.bg.primary};
  color: ${({ theme }) => theme.text.primary};
  outline: none;
  width: 150px;

  &:focus {
    border-color: #2563eb;
  }
`;

const SelectBox = styled.select`
  padding: 5px 9px;
  border-radius: 6px;
  font-size: 12px;
  border: 1px solid ${({ theme }) => theme.bg.cardBorder};
  background: ${({ theme }) => theme.bg.primary};
  color: ${({ theme }) => theme.text.primary};
  outline: none;
  cursor: pointer;
`;

const TableScrollWrap = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const CleanTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 12.5px;

  th {
    padding: 8px 10px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    color: ${({ theme }) => theme.text.tertiary};
    border-bottom: 1px solid ${({ theme }) => theme.bg.cardBorder};
  }

  td {
    padding: 9px 10px;
    border-bottom: 1px solid ${({ theme }) => theme.bg.cardBorder};
    color: ${({ theme }) => theme.text.primary};
    vertical-align: middle;
  }

  tr:last-child td {
    border-bottom: none;
  }
`;

const TagBadge = styled.span`
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  background: ${({ theme }) => theme.bg.primary};
  border: 1px solid ${({ theme }) => theme.bg.cardBorder};
  color: ${({ theme }) => theme.text.secondary};
`;

const LinkRowItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const IconBox = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 5px;
  background: ${({ theme }) => theme.bg.primary};
  border: 1px solid ${({ theme }) => theme.bg.cardBorder};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  img {
    width: 14px;
    height: 14px;
    filter: var(--img);
  }

  &.hero {
    background: #2563eb;
    border-color: #2563eb;
    img {
      filter: brightness(0) invert(1);
    }
  }
`;

const HeroBadge = styled.span`
  font-size: 9.5px;
  font-weight: 700;
  padding: 1px 4px;
  border-radius: 3px;
  background: rgba(37, 99, 235, 0.12);
  color: #2563eb;
`;

const HeroTag = styled.span`
  font-size: 9.5px;
  font-weight: 700;
  padding: 1px 4px;
  border-radius: 3px;
  background: #f59e0b;
  color: #ffffff;
`;

const LinkUrl = styled.a`
  display: block;
  font-size: 11px;
  color: ${({ theme }) => theme.text.secondary};
  text-decoration: none;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    text-decoration: underline;
    color: #2563eb;
  }
`;

const CategoryPill = styled.span`
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  background: ${({ theme }) => theme.bg.primary};
  border: 1px solid ${({ theme }) => theme.bg.cardBorder};
  color: ${({ theme }) => theme.text.secondary};
  white-space: nowrap;
`;

const ToggleStatusBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 7px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  background: ${({ active }) => active ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)'};
  border: 1px solid ${({ active }) => active ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'};
  color: ${({ active }) => active ? '#10b981' : '#ef4444'};
  cursor: pointer;

  .dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: ${({ active }) => active ? '#10b981' : '#ef4444'};
  }
`;

const ActionFlex = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
`;

const IconActionBtn = styled.button`
  width: 26px;
  height: 26px;
  border-radius: 5px;
  background: ${({ theme }) => theme.bg.primary};
  border: 1px solid ${({ theme }) => theme.bg.cardBorder};
  color: ${({ theme }) => theme.text.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    border-color: #2563eb;
    color: #2563eb;
  }

  &.del {
    color: #ef4444;
    &:hover {
      background: rgba(239, 68, 68, 0.1);
    }
  }
`;

const EmptyBox = styled.div`
  text-align: center;
  padding: 24px;
  color: ${({ theme }) => theme.text.secondary};
  font-size: 12.5px;
`;

// Modal Styles
const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  padding: 16px;
`;

const ModalPanel = styled.div`
  background: ${({ theme }) => theme.bg.card};
  border: 1px solid ${({ theme }) => theme.bg.cardBorder};
  border-radius: 12px;
  width: 100%;
  max-width: 460px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 20px;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.25);
`;

const ModalTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
`;

const ModalHeading = styled.h3`
  font-size: 15px;
  font-weight: 700;
  color: ${({ theme }) => theme.text.primary};
  margin: 0;
`;

const CloseIconButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.text.secondary};
  font-size: 14px;
  cursor: pointer;
  padding: 2px 4px;
`;

const FormElement = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const FormRowFlex = styled.div`
  display: flex;
  gap: 8px;

  @media screen and (max-width: 480px) {
    flex-direction: column;
  }
`;

const FieldWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  text-align: left;
`;

const FieldLabel = styled.label`
  font-size: 11.5px;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
`;

const FormInput = styled.input`
  padding: 7px 9px;
  border-radius: 6px;
  font-size: 12.5px;
  border: 1px solid ${({ theme }) => theme.bg.cardBorder};
  background: ${({ theme }) => theme.bg.primary};
  color: ${({ theme }) => theme.text.primary};
  outline: none;

  &:focus {
    border-color: #2563eb;
  }
`;

const FormSelect = styled.select`
  padding: 7px 9px;
  border-radius: 6px;
  font-size: 12px;
  border: 1px solid ${({ theme }) => theme.bg.cardBorder};
  background: ${({ theme }) => theme.bg.primary};
  color: ${({ theme }) => theme.text.primary};
  outline: none;
  cursor: pointer;
`;

const CheckLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: ${({ theme }) => theme.text.primary};
  cursor: pointer;

  input {
    width: 14px;
    height: 14px;
  }
`;

const ModalBottom = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid ${({ theme }) => theme.bg.cardBorder};
`;
