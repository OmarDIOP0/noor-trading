import type { ProjectImage, ServiceDomain, TimelineEntry, TimelineType } from "@/types";

export type { ProjectImage, ServiceDomain, TimelineEntry, TimelineType };

export interface PublicSettings {
    appName: string;
    logoUrl?: string | null;
    mainTitle: string;
    publicUrl: string;
}

export interface PublicProfile {
    fullName: string;
    title: string;
    bio: string;
    photoUrl?: string | null;
    email?: string | null;
    phone?: string | null;
    location?: string | null;
    socialLinks: { id: string; label: string; url: string; icon?: string | null; displayOrder: number }[];
}

export interface PublicService {
    id: string;
    title: string;
    shortDescription: string;
    icon: string;
    domain: ServiceDomain;
    displayOrder: number;
}

export interface PublicProject {
    id: string;
    title: string;
    description: string;
    category: string;
    year?: number | null;
    surface?: string | null;
    client?: string | null;
    coverImageUrl?: string | null;
    displayOrder: number;
    images: ProjectImage[];
}

export interface PublicBundle {
    settings: PublicSettings;
    profile: PublicProfile;
    services: PublicService[];
    timeline: TimelineEntry[];
}
