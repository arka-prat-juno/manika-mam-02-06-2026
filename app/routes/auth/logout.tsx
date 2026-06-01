// app/routes/auth/logout.tsx

import {
    redirect 
} from "react-router";

export async function loader() {
    // later:
    // clear jwt cookie

    return redirect("/login");
}

export default function LogoutPage() {
    return null;
}
