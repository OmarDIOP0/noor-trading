import { Outlet } from "react-router-dom";
import "./styles/public.css";

/** Conteneur du site public — scope `.site` (tokens Direction B isolés de l'admin). */
export function SiteLayout() {
    return (
        <div className="site">
            <Outlet />
        </div>
    );
}
