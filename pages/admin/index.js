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
                showToast(isEdit ? "Tautan diperbarui" : "Tautan ditambahkan");
                setModalOpen(false);
                fetchDashboardData();
            } else {
                alert(data.message || "Gagal menyimpan.");
            }
        } catch (err) {
            console.error("Save error:", err);
            alert("Terjadi kesalahan.");
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
            showToast(`Status: ${newStatus ? 'Aktif' : 'Non-aktif'}`);
            fetchDashboardData();
        } catch (err) {
            console.error("Toggle error:", err);
            fetchDashboardData();
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
                showToast("Tautan dihapus");
                setDeleteModalOpen(false);
                setLinkToDelete(null);
                fetchDashboardData();
            } else {
                alert(data.message || "Gagal menghapus.");
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
                <title>Admin Dashboard</title>
            </Head>

            <DashboardWrapper>
                {/* Toast Notification */}
                {toastMessage && (
                    <ToastNotification>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span>{toastMessage}</span>
                    </ToastNotification>
                )}

                {/* Top Navigation Header */}
                <NavHeader>
                    <HeaderBrand>
                        <NavAvatar src="/avatar.png" alt="Avatar" />
                        <div>
                            <NavTitle>Dashboard</NavTitle>
                            <NavSubtitle>{session?.user?.name || "Admin"}</NavSubtitle>
                        </div>
                    </HeaderBrand>

                    <NavActions>
                        <ActionButton href="/" target="_blank" rel="noreferrer" title="Lihat Web">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                <polyline points="15 3 21 3 21 9"></polyline>
                                <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                            <span>Web</span>
                        </ActionButton>

                        <AddBtn onClick={openAddModal}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            <span>Tambah Tautan</span>
                        </AddBtn>

                        <SignOutBtn onClick={() => signOut({ callbackUrl: "/admin/login" })} title="Keluar">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                        </SignOutBtn>
                    </NavActions>
                </NavHeader>

                {/* Metrics Cards */}
                <MetricsGrid>
                    <MetricCard>
                        <MetricTopRow>
                            <MetricLabel>Total Klik</MetricLabel>
                            <MetricIconWrapper color="#2563eb">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M15 3h6v6"></path>
                                    <path d="M10 14L21 3"></path>
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                </svg>
                            </MetricIconWrapper>
                        </MetricTopRow>
                        <MetricValue>{stats?.metrics?.totalClicks ?? 0}</MetricValue>
                    </MetricCard>

                    <MetricCard>
                        <MetricTopRow>
                            <MetricLabel>Tautan Aktif</MetricLabel>
                            <MetricIconWrapper color="#10b981">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                                </svg>
                            </MetricIconWrapper>
                        </MetricTopRow>
                        <MetricValue>{stats?.metrics?.activeLinks ?? 0} <small>/ {stats?.metrics?.totalLinks ?? 0}</small></MetricValue>
                    </MetricCard>

                    <MetricCard>
                        <MetricTopRow>
                            <MetricLabel>Kategori</MetricLabel>
                            <MetricIconWrapper color="#7c3aed">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                                </svg>
                            </MetricIconWrapper>
                        </MetricTopRow>
                        <MetricValue>{stats?.metrics?.totalCategories ?? 0}</MetricValue>
                    </MetricCard>

                    <MetricCard>
                        <MetricTopRow>
                            <MetricLabel>Tautan Teratas</MetricLabel>
                            <MetricIconWrapper color="#ec4899">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                </svg>
                            </MetricIconWrapper>
                        </MetricTopRow>
                        <MetricValue style={{ fontSize: '17px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {stats?.metrics?.topLink?.title || "-"}
                        </MetricValue>
                        <MetricSubtext>
                            {stats?.metrics?.topLink?.clicks ?? 0} klik
                        </MetricSubtext>
                    </MetricCard>
                </MetricsGrid>

                {/* Charts Section */}
                <ChartsGrid>
                    <ChartCard>
                        <ChartHeader>
                            <ChartTitle>Tren Klik (7 Hari)</ChartTitle>
                        </ChartHeader>
                        <ChartContainer>
                            <ResponsiveContainer width="100%" height={230}>
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
                                            fontSize: '12px'
                                        }}
                                        formatter={(val) => [`${val} Klik`, 'Klik']}
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

                    <ChartCard>
                        <ChartHeader>
                            <ChartTitle>Perangkat</ChartTitle>
                        </ChartHeader>
                        <ChartContainer>
                            <ResponsiveContainer width="100%" height={230}>
                                <PieChart>
                                    <Pie
                                        data={stats?.deviceBreakdown || []}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={80}
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
                                            fontSize: '12px'
                                        }}
                                        formatter={(val, name) => [`${val}`, name]}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={32}
                                        iconType="circle"
                                        formatter={(val) => <span style={{ color: '#86868b', fontSize: '12px' }}>{val}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </ChartCard>
                </ChartsGrid>

                {/* Link Management Table */}
                <TableSectionCard>
                    <TableSectionHeader>
                        <SectionHeading>Daftar Tautan</SectionHeading>
                        <FilterBar>
                            <SearchInput
                                type="text"
                                placeholder="Cari..."
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
                            <p>Tidak ada tautan ditemukan.</p>
                        </EmptyState>
                    ) : (
                        <TableResponsiveWrapper>
                            <LinksTable>
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
                                                <ClickBadge>{link.clicks || 0}</ClickBadge>
                                            </td>
                                            <td>
                                                <StatusToggleBtn
                                                    onClick={() => handleToggleStatus(link)}
                                                    active={link.on !== false}
                                                    title="Ubah status"
                                                >
                                                    <span className="dot"></span>
                                                    <span>{link.on !== false ? 'Aktif' : 'Off'}</span>
                                                </StatusToggleBtn>
                                            </td>
                                            <td>
                                                <ActionButtonsCell>
                                                    <EditBtn onClick={() => openEditModal(link)} title="Edit">
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                        </svg>
                                                    </EditBtn>
                                                    <DeleteBtn onClick={() => confirmDelete(link)} title="Hapus">
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                                <ModalTitle>{editingLink ? "Edit Tautan" : "Tambah Tautan"}</ModalTitle>
                                <CloseBtn onClick={() => setModalOpen(false)}>✕</CloseBtn>
                            </ModalHeader>

                            <ModalForm onSubmit={handleSaveLink}>
                                <FormRow>
                                    <FormGroup style={{ flex: 2 }}>
                                        <Label>Judul *</Label>
                                        <Input
                                            type="text"
                                            placeholder="Judul tautan"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            required
                                        />
                                    </FormGroup>

                                    <FormGroup style={{ flex: 1 }}>
                                        <Label>Badge</Label>
                                        <Input
                                            type="text"
                                            placeholder="v1.3.0"
                                            value={formData.badge}
                                            onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                                        />
                                    </FormGroup>
                                </FormRow>

                                <FormGroup>
                                    <Label>URL *</Label>
                                    <Input
                                        type="url"
                                        placeholder="https://..."
                                        value={formData.url}
                                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                        required
                                    />
                                </FormGroup>

                                <FormGroup>
                                    <Label>Subtitle</Label>
                                    <Input
                                        type="text"
                                        placeholder="Keterangan singkat"
                                        value={formData.subtitle}
                                        onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                    />
                                </FormGroup>

                                <FormRow>
                                    <FormGroup style={{ flex: 1 }}>
                                        <Label>Kategori</Label>
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
                                        <Label>Ikon</Label>
                                        <Select
                                            value={formData.icon}
                                            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                        >
                                            {AVAILABLE_ICONS.map(ic => (
                                                <option key={ic.value} value={ic.value}>{ic.label}</option>
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
                                        <span>Hero / Unggulan</span>
                                    </CheckboxLabel>
                                </CheckboxRow>

                                <CheckboxRow>
                                    <CheckboxLabel>
                                        <input
                                            type="checkbox"
                                            checked={formData.on}
                                            onChange={(e) => setFormData({ ...formData, on: e.target.checked })}
                                        />
                                        <span>Aktif</span>
                                    </CheckboxLabel>
                                </CheckboxRow>

                                <ModalFooter>
                                    <CancelBtn type="button" onClick={() => setModalOpen(false)}>
                                        Batal
                                    </CancelBtn>
                                    <SaveBtn type="submit" disabled={formLoading}>
                                        {formLoading ? "Menyimpan..." : "Simpan"}
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
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                    <line x1="12" y1="9" x2="12" y2="13"></line>
                                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                </svg>
                            </ConfirmIconWrap>
                            <ConfirmTitle>Hapus Tautan?</ConfirmTitle>
                            <ConfirmText>
                                Hapus <strong>&quot;{linkToDelete?.title}&quot;</strong>?
                            </ConfirmText>
                            <ConfirmActions>
                                <CancelBtn onClick={() => setDeleteModalOpen(false)}>Batal</CancelBtn>
                                <DeleteConfirmBtn onClick={handleDeleteLink} disabled={formLoading}>
                                    {formLoading ? "Menghapus..." : "Hapus"}
                                </DeleteConfirmBtn>
                            </ConfirmActions>
                        </ConfirmCard>
                    </ModalOverlay>
                )}
            </DashboardWrapper>
        </>
    );
}

// Styled Components
const CenterContainer = styled.div`
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

const DashboardWrapper = styled.div`
  max-width: 1040px;
  margin: 0 auto;
  padding: 28px 18px 48px;
  width: 100%;

  @media screen and (max-width: 768px) {
    padding: 16px 12px 32px;
  }
`;

const ToastNotification = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #10b981;
  color: #ffffff;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
`;

const NavHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 14px;
`;

const HeaderBrand = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const NavAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  object-fit: cover;
  border: 1px solid ${({ theme }) => theme.bg.cardBorder};
`;

const NavTitle = styled.h1`
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.3px;
  color: ${({ theme }) => theme.text.primary};
  margin: 0;
`;

const NavSubtitle = styled.p`
  font-size: 12.5px;
  color: ${({ theme }) => theme.text.secondary};
  margin: 0;
`;

const NavActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ActionButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 600;
  background: ${({ theme }) => theme.bg.card};
  border: 1px solid ${({ theme }) => theme.bg.cardBorder};
  color: ${({ theme }) => theme.text.primary};
  transition: all 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.bg.cardHover};
  }
`;

const AddBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 12.5px;
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

const SignOutBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: ${({ theme }) => theme.bg.card};
  border: 1px solid ${({ theme }) => theme.bg.cardBorder};
  color: #ef4444;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: rgba(239, 68, 68, 0.12);
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;

  @media screen and (max-width: 860px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media screen and (max-width: 440px) {
    grid-template-columns: 1fr;
  }
`;

const MetricCard = styled.div`
  background: ${({ theme }) => theme.bg.card};
  border: 1px solid ${({ theme }) => theme.bg.cardBorder};
  border-radius: 12px;
  padding: 16px 14px;
  box-shadow: ${({ theme }) => theme.bg.cardShadow};
  display: flex;
  flex-direction: column;
`;

const MetricTopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
`;

const MetricLabel = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.text.secondary};
`;

const MetricIconWrapper = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: ${({ color }) => `${color}15`};
  color: ${({ color }) => color};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MetricValue = styled.div`
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: ${({ theme }) => theme.text.primary};

  small {
    font-size: 13px;
    font-weight: 500;
    color: ${({ theme }) => theme.text.secondary};
  }
`;

const MetricSubtext = styled.span`
  font-size: 11.5px;
  color: ${({ theme }) => theme.text.tertiary};
  margin-top: 2px;
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 12px;
  margin-bottom: 22px;

  @media screen and (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: ${({ theme }) => theme.bg.card};
  border: 1px solid ${({ theme }) => theme.bg.cardBorder};
  border-radius: 12px;
  padding: 16px;
  box-shadow: ${({ theme }) => theme.bg.cardShadow};
`;

const ChartHeader = styled.div`
  margin-bottom: 12px;
`;

const ChartTitle = styled.h2`
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.2px;
  color: ${({ theme }) => theme.text.primary};
  margin: 0;
`;

const ChartContainer = styled.div`
  width: 100%;
`;

const TableSectionCard = styled.div`
  background: ${({ theme }) => theme.bg.card};
  border: 1px solid ${({ theme }) => theme.bg.cardBorder};
  border-radius: 14px;
  padding: 18px;
  box-shadow: ${({ theme }) => theme.bg.cardShadow};

  @media screen and (max-width: 768px) {
    padding: 14px 10px;
  }
`;

const TableSectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 10px;
`;

const SectionHeading = styled.h2`
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.3px;
  color: ${({ theme }) => theme.text.primary};
  margin: 0;
`;

const FilterBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12.5px;
  border: 1px solid ${({ theme }) => theme.bg.cardBorder};
  background: ${({ theme }) => theme.bg.primary};
  color: ${({ theme }) => theme.text.primary};
  outline: none;
  width: 170px;

  &:focus {
    border-color: #2563eb;
  }

  @media screen and (max-width: 480px) {
    width: 100%;
  }
`;

const CategorySelect = styled.select`
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12.5px;
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
  font-size: 13px;

  th {
    padding: 8px 10px;
    font-size: 11.5px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    color: ${({ theme }) => theme.text.tertiary};
    border-bottom: 1px solid ${({ theme }) => theme.bg.cardBorder};
  }

  td {
    padding: 11px 10px;
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
  gap: 10px;
`;

const IconPreviewWrap = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: ${({ theme }) => theme.bg.primary};
  border: 1px solid ${({ theme }) => theme.bg.cardBorder};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  img {
    width: 16px;
    height: 16px;
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
  font-size: 10px;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 4px;
  background: rgba(37, 99, 235, 0.15);
  color: #2563eb;
`;

const FeaturedTag = styled.span`
  font-size: 10px;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 4px;
  background: #f59e0b;
  color: #ffffff;
`;

const LinkItemUrl = styled.a`
  display: block;
  font-size: 11.5px;
  color: ${({ theme }) => theme.text.secondary};
  text-decoration: none;
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 1px;

  &:hover {
    text-decoration: underline;
    color: #2563eb;
  }
`;

const CategoryTag = styled.span`
  font-size: 11px;
  font-weight: 500;
  padding: 3px 6px;
  border-radius: 5px;
  background: ${({ theme }) => theme.bg.primary};
  border: 1px solid ${({ theme }) => theme.bg.cardBorder};
  color: ${({ theme }) => theme.text.secondary};
  display: inline-block;
  white-space: nowrap;
`;

const ClickBadge = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #2563eb;
`;

const StatusToggleBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  border-radius: 16px;
  font-size: 11.5px;
  font-weight: 600;
  background: ${({ active }) => active ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)'};
  border: 1px solid ${({ active }) => active ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'};
  color: ${({ active }) => active ? '#10b981' : '#ef4444'};
  cursor: pointer;
  transition: opacity 0.15s ease;

  .dot {
    width: 5px;
    height: 5px;
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
  gap: 5px;
`;

const EditBtn = styled.button`
  width: 28px;
  height: 28px;
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
  width: 28px;
  height: 28px;
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
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 32px 16px;
  color: ${({ theme }) => theme.text.secondary};
  font-size: 13px;
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
`;

const ModalCard = styled.div`
  background: ${({ theme }) => theme.bg.card};
  border: 1px solid ${({ theme }) => theme.bg.cardBorder};
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 22px;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const ModalTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.text.primary};
  margin: 0;
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.text.secondary};
  font-size: 15px;
  cursor: pointer;
  padding: 2px 6px;

  &:hover {
    color: ${({ theme }) => theme.text.primary};
  }
`;

const ModalForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FormRow = styled.div`
  display: flex;
  gap: 10px;

  @media screen and (max-width: 480px) {
    flex-direction: column;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
`;

const Input = styled.input`
  padding: 9px 11px;
  border-radius: 7px;
  font-size: 13px;
  border: 1px solid ${({ theme }) => theme.bg.cardBorder};
  background: ${({ theme }) => theme.bg.primary};
  color: ${({ theme }) => theme.text.primary};
  outline: none;

  &:focus {
    border-color: #2563eb;
  }
`;

const Select = styled.select`
  padding: 9px 11px;
  border-radius: 7px;
  font-size: 12.5px;
  border: 1px solid ${({ theme }) => theme.bg.cardBorder};
  background: ${({ theme }) => theme.bg.primary};
  color: ${({ theme }) => theme.text.primary};
  outline: none;
  cursor: pointer;
`;

const CheckboxRow = styled.div`
  padding: 2px 0;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12.5px;
  color: ${({ theme }) => theme.text.primary};
  cursor: pointer;

  input {
    width: 15px;
    height: 15px;
    cursor: pointer;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid ${({ theme }) => theme.bg.cardBorder};
`;

const CancelBtn = styled.button`
  padding: 8px 14px;
  border-radius: 7px;
  font-size: 13px;
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
  padding: 8px 16px;
  border-radius: 7px;
  font-size: 13px;
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
  border-radius: 16px;
  width: 100%;
  max-width: 360px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.3);
`;

const ConfirmIconWrap = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 10px;
`;

const ConfirmTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.text.primary};
  margin: 0 0 6px;
`;

const ConfirmText = styled.p`
  font-size: 12.5px;
  color: ${({ theme }) => theme.text.secondary};
  line-height: 17px;
  margin: 0 0 16px;
`;

const ConfirmActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const DeleteConfirmBtn = styled.button`
  padding: 8px 14px;
  border-radius: 7px;
  font-size: 13px;
  font-weight: 600;
  background: #ef4444;
  color: #ffffff;
  border: none;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: #dc2626;
  }
`;
