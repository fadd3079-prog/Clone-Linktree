import { useState, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import styled from "styled-components";
import Head from "next/head";
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from "recharts";

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

const DONUT_COLORS = ["#2563eb", "#7c3aed", "#ec4899", "#f59e0b", "#10b981", "#64748b"];

export default function AdminDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [stats, setStats] = useState(null);
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("all");

    // Modal state
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
        setTimeout(() => setToastMessage(""), 3000);
    };

    const fetchDashboardData = useCallback(async () => {
        try {
            const [statsRes, linksRes] = await Promise.all([
                fetch("/api/admin/stats"),
                fetch("/api/admin/links")
            ]);

            if (statsRes.ok) {
                const statsJson = await statsRes.json();
                if (statsJson.success) setStats(statsJson.data);
            }

            if (linksRes.ok) {
                const linksJson = await linksRes.json();
                if (linksJson.success) setLinks(linksJson.data);
            }
        } catch (err) {
            console.error("Dashboard fetch error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.replace("/admin/login");
        } else if (status === "authenticated") {
            fetchDashboardData();
        }
    }, [status, router, fetchDashboardData]);

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

            const data = await res.json();
            if (data.success) {
                showToast(isEdit ? "Tautan berhasil diperbarui!" : "Tautan baru berhasil ditambahkan!");
                setModalOpen(false);
                fetchDashboardData();
            } else {
                alert(data.message || "Gagal menyimpan tautan.");
            }
        } catch (err) {
            console.error("Save error:", err);
            alert("Terjadi kesalahan saat menyimpan.");
        } finally {
            setFormLoading(false);
        }
    };

    const handleToggleStatus = async (link) => {
        const newStatus = !link.on;
        // Optimistic UI update
        setLinks(prev => prev.map(item => item._id === link._id ? { ...item, on: newStatus } : item));

        try {
            await fetch("/api/admin/links", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ _id: link._id, on: newStatus })
            });
            showToast(`Status tautan diubah ke ${newStatus ? 'Aktif' : 'Non-aktif'}`);
            fetchDashboardData();
        } catch (err) {
            console.error("Toggle error:", err);
            fetchDashboardData(); // Revert on failure
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
            const data = await res.json();
            if (data.success) {
                showToast("Tautan berhasil dihapus.");
                setDeleteModalOpen(false);
                setLinkToDelete(null);
                fetchDashboardData();
            } else {
                alert(data.message || "Gagal menghapus tautan.");
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
            <CenterContainer>
                <Spinner />
            </CenterContainer>
        );
    }

    const filteredLinks = links.filter(link => {
        const matchesSearch = (link.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (link.url || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === "all" || link.type === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const categoryList = Array.from(new Set(links.map(l => l.type).filter(Boolean)));

    return (
        <>
            <Head>
                <title>Admin Dashboard • Fadd Links</title>
            </Head>

            <DashboardWrapper>
                {/* Toast Notification */}
                {toastMessage && (
                    <ToastNotification>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span>{toastMessage}</span>
                    </ToastNotification>
                )}

                {/* Top Navigation Header */}
                <NavHeader>
                    <HeaderBrand>
                        <NavAvatar src="/avatar.png" alt="Fadd Graphics" />
                        <div>
                            <NavTitle>Fadd Dashboard</NavTitle>
                            <NavSubtitle>Hai, {session?.user?.name || "Admin"} • {session?.user?.brand || "Fadd Graphics"}</NavSubtitle>
                        </div>
                    </HeaderBrand>

                    <NavActions>
                        <ActionButton href="/" target="_blank" rel="noreferrer" title="Lihat Web Publik">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                <polyline points="15 3 21 3 21 9"></polyline>
                                <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                            <span>Lihat Web</span>
                        </ActionButton>

                        <AddBtn onClick={openAddModal}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            <span>Tambah Tautan</span>
                        </AddBtn>

                        <SignOutBtn onClick={() => signOut({ callbackUrl: "/admin/login" })} title="Keluar">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                        </SignOutBtn>
                    </NavActions>
                </NavHeader>

                {/* Top Metrics Cards */}
                <MetricsGrid>
                    <MetricCard>
                        <MetricTopRow>
                            <MetricLabel>Total Klik</MetricLabel>
                            <MetricIconWrapper color="#2563eb">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M15 3h6v6"></path>
                                    <path d="M10 14L21 3"></path>
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                </svg>
                            </MetricIconWrapper>
                        </MetricTopRow>
                        <MetricValue>{stats?.metrics?.totalClicks ?? 0}</MetricValue>
                        <MetricSubtext>Akumulasi pengunjung ke semua tautan</MetricSubtext>
                    </MetricCard>

                    <MetricCard>
                        <MetricTopRow>
                            <MetricLabel>Tautan Aktif</MetricLabel>
                            <MetricIconWrapper color="#10b981">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                                </svg>
                            </MetricIconWrapper>
                        </MetricTopRow>
                        <MetricValue>{stats?.metrics?.activeLinks ?? 0} <small>/ {stats?.metrics?.totalLinks ?? 0}</small></MetricValue>
                        <MetricSubtext>{stats?.metrics?.inactiveLinks ?? 0} tautan dinonaktifkan</MetricSubtext>
                    </MetricCard>

                    <MetricCard>
                        <MetricTopRow>
                            <MetricLabel>Kategori Tautan</MetricLabel>
                            <MetricIconWrapper color="#7c3aed">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                                </svg>
                            </MetricIconWrapper>
                        </MetricTopRow>
                        <MetricValue>{stats?.metrics?.totalCategories ?? 0}</MetricValue>
                        <MetricSubtext>Grup navigasi terstruktur</MetricSubtext>
                    </MetricCard>

                    <MetricCard>
                        <MetricTopRow>
                            <MetricLabel>Tautan Teratas</MetricLabel>
                            <MetricIconWrapper color="#ec4899">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                </svg>
                            </MetricIconWrapper>
                        </MetricTopRow>
                        <MetricValue style={{ fontSize: '18px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {stats?.metrics?.topLink?.title || "-"}
                        </MetricValue>
                        <MetricSubtext>
                            {stats?.metrics?.topLink?.clicks ?? 0} klik ({stats?.metrics?.topLink?.percentage ?? 0}% dari total)
                        </MetricSubtext>
                    </MetricCard>
                </MetricsGrid>

                {/* Advanced Charts Section */}
                <ChartsGrid>
                    {/* Line / Area Chart: Click Trends */}
                    <ChartCard>
                        <ChartHeader>
                            <div>
                                <ChartTitle>Tren Performa Klik</ChartTitle>
                                <ChartSubtitle>Aktivitas interaksi pengunjung dalam 7 hari terakhir</ChartSubtitle>
                            </div>
                        </ChartHeader>
                        <ChartContainer>
                            <ResponsiveContainer width="100%" height={240}>
                                <AreaChart data={stats?.clickTrends || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="clickGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="label" stroke="#86868b" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#86868b" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#18181b',
                                            border: '1px solid #3f3f46',
                                            borderRadius: '8px',
                                            color: '#ffffff',
                                            fontSize: '13px'
                                        }}
                                        formatter={(val) => [`${val} Klik`, 'Interaksi']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="clicks"
                                        stroke="#2563eb"
                                        strokeWidth={2.5}
                                        fillOpacity={1}
                                        fill="url(#clickGradient)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </ChartCard>

                    {/* Donut Chart: Device Breakdown */}
                    <ChartCard>
                        <ChartHeader>
                            <div>
                                <ChartTitle>Distribusi Perangkat Pengunjung</ChartTitle>
                                <ChartSubtitle>Perbandingan Mobile, Desktop, dan Tablet</ChartSubtitle>
                            </div>
                        </ChartHeader>
                        <ChartContainer>
                            <ResponsiveContainer width="100%" height={240}>
                                <PieChart>
                                    <Pie
                                        data={stats?.deviceBreakdown || []}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={85}
                                        paddingAngle={4}
                                        dataKey="value"
                                    >
                                        {(stats?.deviceBreakdown || []).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#18181b',
                                            border: '1px solid #3f3f46',
                                            borderRadius: '8px',
                                            color: '#ffffff',
                                            fontSize: '13px'
                                        }}
                                        formatter={(val, name) => [`${val} Pengunjung`, name]}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        iconType="circle"
                                        formatter={(val) => <span style={{ color: '#86868b', fontSize: '12px' }}>{val}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </ChartCard>
                </ChartsGrid>

                {/* Link Management (CRUD Table) Section */}
                <TableSectionCard>
                    <TableSectionHeader>
                        <div>
                            <SectionHeading>Manajemen Tautan</SectionHeading>
                            <SectionDescription>Kelola data link, urutan prioritas, dan status visibilitas publik</SectionDescription>
                        </div>
                        <FilterBar>
                            <SearchInput
                                type="text"
                                placeholder="Cari judul atau URL..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <CategorySelect
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                            >
                                <option value="all">Semua Kategori</option>
                                {categoryList.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </CategorySelect>
                        </FilterBar>
                    </TableSectionHeader>

                    {filteredLinks.length === 0 ? (
                        <EmptyState>
                            <p>Tidak ada tautan yang sesuai dengan filter.</p>
                        </EmptyState>
                    ) : (
                        <TableResponsiveWrapper>
                            <LinksTable>
                                <thead>
                                    <tr>
                                        <th>Tautan & Ikon</th>
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
                                                <LinkItemCell>
                                                    <IconPreviewWrap className={link.featured ? 'featured' : ''}>
                                                        <img src={link.icon || '/web.svg'} alt="" />
                                                    </IconPreviewWrap>
                                                    <div>
                                                        <LinkItemTitleRow>
                                                            <LinkItemTitle>{link.title}</LinkItemTitle>
                                                            {link.badge && <BadgeTag>{link.badge}</BadgeTag>}
                                                            {link.featured && <FeaturedTag>Hero</FeaturedTag>}
                                                        </LinkItemTitleRow>
                                                        <LinkItemUrl href={link.url} target="_blank" rel="noreferrer">
                                                            {link.url}
                                                        </LinkItemUrl>
                                                    </div>
                                                </LinkItemCell>
                                            </td>
                                            <td>
                                                <CategoryTag>{link.type}</CategoryTag>
                                            </td>
                                            <td>
                                                <ClickBadge>{link.clicks || 0} klik</ClickBadge>
                                            </td>
                                            <td>
                                                <StatusToggleBtn
                                                    onClick={() => handleToggleStatus(link)}
                                                    active={link.on !== false}
                                                    title="Klik untuk ubah status"
                                                >
                                                    <span className="dot"></span>
                                                    <span>{link.on !== false ? 'Aktif' : 'Non-aktif'}</span>
                                                </StatusToggleBtn>
                                            </td>
                                            <td>
                                                <ActionButtonsCell>
                                                    <EditBtn onClick={() => openEditModal(link)} title="Edit Tautan">
                                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                        </svg>
                                                    </EditBtn>
                                                    <DeleteBtn onClick={() => confirmDelete(link)} title="Hapus Tautan">
                                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <polyline points="3 6 5 6 21 6"></polyline>
                                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                        </svg>
                                                    </DeleteBtn>
                                                </ActionButtonsCell>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </LinksTable>
                        </TableResponsiveWrapper>
                    )}
                </TableSectionCard>

                {/* Modal Add / Edit Link */}
                {modalOpen && (
                    <ModalOverlay onClick={() => setModalOpen(false)}>
                        <ModalCard onClick={(e) => e.stopPropagation()}>
                            <ModalHeader>
                                <ModalTitle>{editingLink ? "Edit Tautan" : "Tambah Tautan Baru"}</ModalTitle>
                                <CloseBtn onClick={() => setModalOpen(false)}>✕</CloseBtn>
                            </ModalHeader>

                            <ModalForm onSubmit={handleSaveLink}>
                                <FormRow>
                                    <FormGroup style={{ flex: 2 }}>
                                        <Label>Judul Tautan *</Label>
                                        <Input
                                            type="text"
                                            placeholder="Contoh: Official Website"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            required
                                        />
                                    </FormGroup>

                                    <FormGroup style={{ flex: 1 }}>
                                        <Label>Badge (Opsional)</Label>
                                        <Input
                                            type="text"
                                            placeholder="v1.3.0 / New"
                                            value={formData.badge}
                                            onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                                        />
                                    </FormGroup>
                                </FormRow>

                                <FormGroup>
                                    <Label>URL Tujuan *</Label>
                                    <Input
                                        type="url"
                                        placeholder="https://faddgraphics.my.id"
                                        value={formData.url}
                                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                        required
                                    />
                                </FormGroup>

                                <FormGroup>
                                    <Label>Subtitle / Deskripsi (Opsional)</Label>
                                    <Input
                                        type="text"
                                        placeholder="Keterangan singkat"
                                        value={formData.subtitle}
                                        onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                    />
                                </FormGroup>

                                <FormRow>
                                    <FormGroup style={{ flex: 1 }}>
                                        <Label>Kategori / Grup</Label>
                                        <Select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        >
                                            {DEFAULT_CATEGORIES.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </Select>
                                    </FormGroup>

                                    <FormGroup style={{ flex: 1 }}>
                                        <Label>Pilihan Ikon</Label>
                                        <Select
                                            value={formData.icon}
                                            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                        >
                                            {AVAILABLE_ICONS.map(ic => (
                                                <option key={ic.value} value={ic.value}>{ic.label} ({ic.value})</option>
                                            ))}
                                        </Select>
                                    </FormGroup>
                                </FormRow>

                                <CheckboxRow>
                                    <CheckboxLabel>
                                        <input
                                            type="checkbox"
                                            checked={formData.featured}
                                            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                        />
                                        <span>Jadikan Tautan Unggulan (Hero / Featured Highlight)</span>
                                    </CheckboxLabel>
                                </CheckboxRow>

                                <CheckboxRow>
                                    <CheckboxLabel>
                                        <input
                                            type="checkbox"
                                            checked={formData.on}
                                            onChange={(e) => setFormData({ ...formData, on: e.target.checked })}
                                        />
                                        <span>Status Aktif (Tampilkan ke Publik)</span>
                                    </CheckboxLabel>
                                </CheckboxRow>

                                <ModalFooter>
                                    <CancelBtn type="button" onClick={() => setModalOpen(false)}>
                                        Batal
                                    </CancelBtn>
                                    <SaveBtn type="submit" disabled={formLoading}>
                                        {formLoading ? "Menyimpan..." : "Simpan Tautan"}
                                    </SaveBtn>
                                </ModalFooter>
                            </ModalForm>
                        </ModalCard>
                    </ModalOverlay>
                )}

                {/* Modal Konfirmasi Hapus */}
                {deleteModalOpen && (
                    <ModalOverlay onClick={() => setDeleteModalOpen(false)}>
                        <ConfirmCard onClick={(e) => e.stopPropagation()}>
                            <ConfirmIconWrap>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                    <line x1="12" y1="9" x2="12" y2="13"></line>
                                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                </svg>
                            </ConfirmIconWrap>
                            <ConfirmTitle>Hapus Tautan?</ConfirmTitle>
                            <ConfirmText>
                                Apakah Anda yakin ingin menghapus tautan <strong>&quot;{linkToDelete?.title}&quot;</strong>? Tindakan ini tidak dapat dibatalkan.
                            </ConfirmText>
                            <ConfirmActions>
                                <CancelBtn onClick={() => setDeleteModalOpen(false)}>Batal</CancelBtn>
                                <DeleteConfirmBtn onClick={handleDeleteLink} disabled={formLoading}>
                                    {formLoading ? "Menghapus..." : "Ya, Hapus Tautan"}
                                </DeleteConfirmBtn>
                            </ConfirmActions>
                        </ConfirmCard>
                    </ModalOverlay>
                )}
            </DashboardWrapper>
        </>
    );
}

// Styled Components for Dashboard
const CenterContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Spinner = styled.div`
  width: 38px;
  height: 38px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const DashboardWrapper = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 20px 60px;
  width: 100%;

  @media screen and (max-width: 768px) {
    padding: 20px 14px 40px;
  }
`;

const ToastNotification = styled.div`
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 10px;
  background: #10b981;
  color: #ffffff;
  padding: 12px 18px;
  border-radius: 10px;
  font-size: 13.5px;
  font-weight: 600;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.2s ease;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const NavHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 16px;
`;

const HeaderBrand = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const NavAvatar = styled.img`
  width: 46px;
  height: 46px;
  border-radius: 12px;
  object-fit: cover;
  border: 2px solid ${({ theme }) => theme.bg.cardBorder};
`;

const NavTitle = styled.h1`
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.4px;
  color: ${({ theme }) => theme.text.primary};
  margin: 0;
`;

const NavSubtitle = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.text.secondary};
  margin: 2px 0 0;
`;

const NavActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ActionButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 14px;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 600;
  background: ${({ theme }) => theme.bg.card};
  border: 1px solid ${({ theme }) => theme.bg.cardBorder};
  color: ${({ theme }) => theme.text.primary};
  transition: all 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.bg.cardHover};
    border-color: ${({ theme }) => theme.bg.cardBorderHover};
  }
`;

const AddBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 600;
  background: #2563eb;
  color: #ffffff;
  border: none;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.15s ease;

  &:hover {
    background: #1d4ed8;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const SignOutBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 9px;
  background: ${({ theme }) => theme.bg.card};
  border: 1px solid ${({ theme }) => theme.bg.cardBorder};
  color: #ef4444;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: rgba(239, 68, 68, 0.12);
    border-color: rgba(239, 68, 68, 0.3);
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;

  @media screen and (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media screen and (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const MetricCard = styled.div`
  background: ${({ theme }) => theme.bg.card};
  border: 1px solid ${({ theme }) => theme.bg.cardBorder};
  border-radius: 14px;
  padding: 20px 18px;
  box-shadow: ${({ theme }) => theme.bg.cardShadow};
  display: flex;
  flex-direction: column;
`;

const MetricTopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const MetricLabel = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.text.secondary};
`;

const MetricIconWrapper = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: ${({ color }) => `${color}18`};
  color: ${({ color }) => color};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MetricValue = styled.div`
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.6px;
  color: ${({ theme }) => theme.text.primary};
  margin-bottom: 4px;

  small {
    font-size: 14px;
    font-weight: 500;
    color: ${({ theme }) => theme.text.secondary};
  }
`;

const MetricSubtext = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.text.tertiary};
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  margin-bottom: 28px;

  @media screen and (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: ${({ theme }) => theme.bg.card};
  border: 1px solid ${({ theme }) => theme.bg.cardBorder};
  border-radius: 14px;
  padding: 20px;
  box-shadow: ${({ theme }) => theme.bg.cardShadow};
`;

const ChartHeader = styled.div`
  margin-bottom: 16px;
`;

const ChartTitle = styled.h2`
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.3px;
  color: ${({ theme }) => theme.text.primary};
  margin: 0 0 2px;
`;

const ChartSubtitle = styled.p`
  font-size: 12.5px;
  color: ${({ theme }) => theme.text.secondary};
  margin: 0;
`;

const ChartContainer = styled.div`
  width: 100%;
`;

const TableSectionCard = styled.div`
  background: ${({ theme }) => theme.bg.card};
  border: 1px solid ${({ theme }) => theme.bg.cardBorder};
  border-radius: 16px;
  padding: 24px;
  box-shadow: ${({ theme }) => theme.bg.cardShadow};

  @media screen and (max-width: 768px) {
    padding: 18px 14px;
  }
`;

const TableSectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 14px;
`;

const SectionHeading = styled.h2`
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.4px;
  color: ${({ theme }) => theme.text.primary};
  margin: 0 0 2px;
`;

const SectionDescription = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.text.secondary};
  margin: 0;
`;

const FilterBar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  border: 1px solid ${({ theme }) => theme.bg.cardBorder};
  background: ${({ theme }) => theme.bg.primary};
  color: ${({ theme }) => theme.text.primary};
  outline: none;
  width: 200px;

  &:focus {
    border-color: #2563eb;
  }

  @media screen and (max-width: 480px) {
    width: 100%;
  }
`;

const CategorySelect = styled.select`
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  border: 1px solid ${({ theme }) => theme.bg.cardBorder};
  background: ${({ theme }) => theme.bg.primary};
  color: ${({ theme }) => theme.text.primary};
  outline: none;
  cursor: pointer;

  @media screen and (max-width: 480px) {
    width: 100%;
  }
`;

const TableResponsiveWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const LinksTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 13.5px;

  th {
    padding: 10px 12px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    color: ${({ theme }) => theme.text.tertiary};
    border-bottom: 1px solid ${({ theme }) => theme.bg.cardBorder};
  }

  td {
    padding: 14px 12px;
    border-bottom: 1px solid ${({ theme }) => theme.bg.cardBorder};
    color: ${({ theme }) => theme.text.primary};
    vertical-align: middle;
  }

  tr:last-child td {
    border-bottom: none;
  }
`;

const LinkItemCell = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const IconPreviewWrap = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: ${({ theme }) => theme.bg.primary};
  border: 1px solid ${({ theme }) => theme.bg.cardBorder};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  img {
    width: 18px;
    height: 18px;
    filter: var(--img);
  }

  &.featured {
    background: #2563eb;
    border-color: #2563eb;
    img {
      filter: brightness(0) invert(1);
    }
  }
`;

const LinkItemTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
`;

const LinkItemTitle = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
`;

const BadgeTag = styled.span`
  font-size: 10.5px;
  font-weight: 700;
  padding: 1.5px 6px;
  border-radius: 4px;
  background: rgba(37, 99, 235, 0.15);
  color: #2563eb;
`;

const FeaturedTag = styled.span`
  font-size: 10.5px;
  font-weight: 700;
  padding: 1.5px 6px;
  border-radius: 4px;
  background: #f59e0b;
  color: #ffffff;
`;

const LinkItemUrl = styled.a`
  display: block;
  font-size: 12px;
  color: ${({ theme }) => theme.text.secondary};
  text-decoration: none;
  max-width: 280px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 2px;

  &:hover {
    text-decoration: underline;
    color: #2563eb;
  }
`;

const CategoryTag = styled.span`
  font-size: 11.5px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 6px;
  background: ${({ theme }) => theme.bg.primary};
  border: 1px solid ${({ theme }) => theme.bg.cardBorder};
  color: ${({ theme }) => theme.text.secondary};
  display: inline-block;
  white-space: nowrap;
`;

const ClickBadge = styled.span`
  font-size: 12.5px;
  font-weight: 600;
  color: #2563eb;
`;

const StatusToggleBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 9px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${({ active }) => active ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)'};
  border: 1px solid ${({ active }) => active ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'};
  color: ${({ active }) => active ? '#10b981' : '#ef4444'};
  cursor: pointer;
  transition: all 0.15s ease;

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${({ active }) => active ? '#10b981' : '#ef4444'};
  }

  &:hover {
    opacity: 0.85;
  }
`;

const ActionButtonsCell = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
`;

const EditBtn = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: ${({ theme }) => theme.bg.primary};
  border: 1px solid ${({ theme }) => theme.bg.cardBorder};
  color: ${({ theme }) => theme.text.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: #2563eb;
    color: #2563eb;
  }
`;

const DeleteBtn = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: ${({ theme }) => theme.bg.primary};
  border: 1px solid ${({ theme }) => theme.bg.cardBorder};
  color: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: rgba(239, 68, 68, 0.12);
    border-color: rgba(239, 68, 68, 0.3);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${({ theme }) => theme.text.secondary};
  font-size: 14px;
`;

// Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  padding: 16px;
  animation: fadeIn 0.15s ease;
`;

const ModalCard = styled.div`
  background: ${({ theme }) => theme.bg.card};
  border: 1px solid ${({ theme }) => theme.bg.cardBorder};
  border-radius: 18px;
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 26px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h3`
  font-size: 17px;
  font-weight: 700;
  color: ${({ theme }) => theme.text.primary};
  margin: 0;
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.text.secondary};
  font-size: 16px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;

  &:hover {
    color: ${({ theme }) => theme.text.primary};
  }
`;

const ModalForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const FormRow = styled.div`
  display: flex;
  gap: 12px;

  @media screen and (max-width: 480px) {
    flex-direction: column;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  text-align: left;
`;

const Label = styled.label`
  font-size: 12.5px;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
`;

const Input = styled.input`
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 13.5px;
  border: 1px solid ${({ theme }) => theme.bg.cardBorder};
  background: ${({ theme }) => theme.bg.primary};
  color: ${({ theme }) => theme.text.primary};
  outline: none;

  &:focus {
    border-color: #2563eb;
  }
`;

const Select = styled.select`
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 13px;
  border: 1px solid ${({ theme }) => theme.bg.cardBorder};
  background: ${({ theme }) => theme.bg.primary};
  color: ${({ theme }) => theme.text.primary};
  outline: none;
  cursor: pointer;
`;

const CheckboxRow = styled.div`
  padding: 4px 0;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: ${({ theme }) => theme.text.primary};
  cursor: pointer;

  input {
    width: 16px;
    height: 16px;
    cursor: pointer;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid ${({ theme }) => theme.bg.cardBorder};
`;

const CancelBtn = styled.button`
  padding: 9px 16px;
  border-radius: 8px;
  font-size: 13.5px;
  font-weight: 600;
  background: ${({ theme }) => theme.bg.primary};
  border: 1px solid ${({ theme }) => theme.bg.cardBorder};
  color: ${({ theme }) => theme.text.primary};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.bg.cardHover};
  }
`;

const SaveBtn = styled.button`
  padding: 9px 18px;
  border-radius: 8px;
  font-size: 13.5px;
  font-weight: 600;
  background: #2563eb;
  color: #ffffff;
  border: none;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: #1d4ed8;
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const ConfirmCard = styled.div`
  background: ${({ theme }) => theme.bg.card};
  border: 1px solid ${({ theme }) => theme.bg.cardBorder};
  border-radius: 18px;
  width: 100%;
  max-width: 400px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
`;

const ConfirmIconWrap = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
`;

const ConfirmTitle = styled.h3`
  font-size: 17px;
  font-weight: 700;
  color: ${({ theme }) => theme.text.primary};
  margin: 0 0 8px;
`;

const ConfirmText = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.text.secondary};
  line-height: 18px;
  margin: 0 0 20px;
`;

const ConfirmActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const DeleteConfirmBtn = styled.button`
  padding: 9px 16px;
  border-radius: 8px;
  font-size: 13.5px;
  font-weight: 600;
  background: #ef4444;
  color: #ffffff;
  border: none;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: #dc2626;
  }
`;
