// app/routes/dashboard/layout.tsx

import {
    Outlet 
} from "react-router";

export default function DashboardLayout() {
    return (
        <div>
            <h1>Dashboard</h1>

            <Outlet />
        </div>
    );
}
