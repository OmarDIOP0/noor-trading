import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";

export function AdminLayout() {
    return (
        <div className="admin-scope admin-bg min-h-screen flex">
            <AdminSidebar />
            <div className="flex-1 min-w-0 flex flex-col">
                <AdminTopbar />
                <main className="flex-1 min-w-0">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
