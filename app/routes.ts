import {
    type RouteConfig,
    route,
    index,
    layout
} from "@react-router/dev/routes";

export default [
    layout("./layouts/app-layout.tsx", [
        index("./routes/home.tsx"),

        route("dashboard", "./routes/dashboard/layout.tsx", [
            route("trades", "./routes/dashboard/trades.tsx"),
            route("mtm", "./routes/dashboard/mtm.tsx"),
            route("add-trade", "./routes/dashboard/add-trade.tsx"),
            route("manage-users", "./routes/dashboard/manage-users.tsx")
        ])
    ]),

    route("login", "./routes/auth/login.tsx"),
    route("logout", "./routes/auth/logout.tsx"),
    route("sign-up", "./routes/auth/sign-up.tsx")
] satisfies RouteConfig;
