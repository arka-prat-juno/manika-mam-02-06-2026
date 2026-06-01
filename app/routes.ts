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
            route("add-trade", "./routes/dashboard/add-trade.tsx")
        ])
    ]),

    route("login", "./routes/auth/login.tsx"),
    route("logout", "./routes/auth/logout.tsx")
] satisfies RouteConfig;
