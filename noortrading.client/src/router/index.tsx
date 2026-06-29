import { createBrowserRouter, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AdminGuard } from "./AdminGuard";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { SiteLayout } from "@/site/SiteLayout";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";

// ── Site public ──────────────────────────────────────────────────────────────
const SitePage = lazy(() => import("@/site/SitePage"));
const ProjectDetailPage = lazy(() => import("@/site/ProjectDetailPage"));

const Login = lazy(() => import("@/pages/auth/Login"));
const Dashboard = lazy(() => import("@/pages/admin/Dashboard"));
const Profil = lazy(() => import("@/pages/admin/Profil"));
const Services = lazy(() => import("@/pages/admin/Services"));
const Projets = lazy(() => import("@/pages/admin/Projets"));
const Parcours = lazy(() => import("@/pages/admin/Parcours"));
const Parametres = lazy(() => import("@/pages/admin/Parametres"));

function Page({ children }: { children: React.ReactNode }) {
    return <Suspense fallback={<LoadingSkeleton variant="page" />}>{children}</Suspense>;
}

export const router = createBrowserRouter([
    { path: "/admin/login", element: <Page><Login /></Page> },
    {
        path: "/admin",
        element: <AdminGuard />,
        children: [
            {
                element: <AdminLayout />,
                children: [
                    { index: true, element: <Page><Dashboard /></Page> },
                    { path: "profil", element: <Page><Profil /></Page> },
                    { path: "services", element: <Page><Services /></Page> },
                    { path: "projets", element: <Page><Projets /></Page> },
                    { path: "parcours", element: <Page><Parcours /></Page> },
                    { path: "parametres", element: <Page><Parametres /></Page> },
                ],
            },
        ],
    },
    // ── Site public ──────────────────────────────────────────────────────────
    {
        path: "/",
        element: <SiteLayout />,
        children: [
            { index: true, element: <Page><SitePage /></Page> },
            { path: "projets/:id", element: <Page><ProjectDetailPage /></Page> },
        ],
    },
    { path: "*", element: <Navigate to="/" replace /> },
]);
