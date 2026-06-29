// ── Enveloppe API (miroir de NoorTrading.Server/Common/ApiResponse) ──────────
export interface ApiResponse<T> {
    success: boolean;
    message?: string | null;
    data?: T;
    errors?: string[] | null;
}

export interface Paged<T> {
    items: T[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}

// ── Auth ─────────────────────────────────────────────────────────────────────
export interface AdminUser {
    id: string;
    email: string;
    fullName: string;
}
export interface AuthResult {
    accessToken: string;
    refreshToken: string;
    user: AdminUser;
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

// ── Profil ───────────────────────────────────────────────────────────────────
export interface SocialLink {
    id: string;
    label: string;
    url: string;
    icon?: string | null;
    displayOrder: number;
}
export interface SocialLinkInput {
    label: string;
    url: string;
    icon?: string | null;
    displayOrder: number;
}
export interface Profile {
    fullName: string;
    title: string;
    bio: string;
    photoUrl?: string | null;
    email?: string | null;
    phone?: string | null;
    location?: string | null;
    updatedAtUtc: string;
    socialLinks: SocialLink[];
}
export interface UpdateProfileRequest {
    fullName: string;
    title: string;
    bio: string;
    email?: string | null;
    phone?: string | null;
    location?: string | null;
    socialLinks: SocialLinkInput[];
}

// ── Services ─────────────────────────────────────────────────────────────────
export type ServiceDomain = "GenieCivil" | "Decoration" | "Both";

export interface Service {
    id: string;
    title: string;
    shortDescription: string;
    icon: string;
    domain: ServiceDomain;
    displayOrder: number;
    isActive: boolean;
    updatedAtUtc: string;
}
export interface ServiceInput {
    title: string;
    shortDescription: string;
    icon: string;
    domain: ServiceDomain;
    displayOrder: number;
    isActive: boolean;
}

// ── Timeline / Parcours ──────────────────────────────────────────────────────
export type TimelineType = "Experience" | "Education" | "Certification" | "Achievement";

export interface TimelineEntry {
    id: string;
    type: TimelineType;
    title: string;
    organization?: string | null;
    location?: string | null;
    period: string;
    startYear?: number | null;
    isCurrent: boolean;
    description?: string | null;
    displayOrder: number;
}
export interface TimelineEntryInput {
    type: TimelineType;
    title: string;
    organization?: string | null;
    location?: string | null;
    period: string;
    startYear?: number | null;
    isCurrent: boolean;
    description?: string | null;
    displayOrder: number;
}

// ── Réalisations ─────────────────────────────────────────────────────────────
export type ProjectStatus = "Draft" | "Published";
export type ImagePhase = "Avant" | "Apres";

export interface ProjectImage {
    id: string;
    url: string;
    sortOrder: number;
    isCover: boolean;
    phase: ImagePhase;
}
export interface Project {
    id: string;
    title: string;
    description: string;
    category: string;
    year?: number | null;
    surface?: string | null;
    client?: string | null;
    status: ProjectStatus;
    displayOrder: number;
    coverImageUrl?: string | null;
    updatedAtUtc: string;
    images: ProjectImage[];
}
export interface ProjectInput {
    title: string;
    description: string;
    category: string;
    year?: number | null;
    surface?: string | null;
    client?: string | null;
    status: ProjectStatus;
    displayOrder: number;
}
export interface ProjectsFilter {
    category?: string;
    status?: ProjectStatus;
    page?: number;
    pageSize?: number;
}

// ── Paramètres ───────────────────────────────────────────────────────────────
export interface AppSettings {
    appName: string;
    logoUrl?: string | null;
    mainTitle: string;
    adminEmail?: string | null;
    publicUrl: string;
    updatedAtUtc: string;
}
export interface UpdateSettingsRequest {
    appName: string;
    mainTitle: string;
    adminEmail?: string | null;
    publicUrl: string;
}
export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

// ── Analytics ────────────────────────────────────────────────────────────────
export interface TimePoint { date: string; visits: number; }
export interface CategorySlice { category: string; count: number; }
export interface SourceSlice { source: string; count: number; }
export interface TopItem { id?: string | null; label: string; type: string; visits: number; }

export interface AnalyticsStats {
    totalVisits: number;
    visitsLast7Days: number;
    totalProjects: number;
    activeServices: number;
    lastContentUpdateUtc?: string | null;
    timeline: TimePoint[];
    projectsByCategory: CategorySlice[];
    visitsBySource: SourceSlice[];
    topConsulted: TopItem[];
}
export type StatsRange = "7d" | "30d" | "all";
