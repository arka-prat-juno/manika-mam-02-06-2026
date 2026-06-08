import {
    NavLink 
} from "react-router";
import styles from "./navbar.module.css";

export function Navbar() {
    return (
        <nav className={styles.navbar}>
            {/* Logo removed */}
            <div className={styles.links}>
                <NavLink
                    to="/dashboard/trades"
                    className={styles.link}
                >
                    My Trades
                </NavLink>

                <NavLink
                    to="/dashboard/mtm"
                    className={styles.link}
                >
                    MTM
                </NavLink>
                <NavLink
                    to="/dashboard/calendar-pnl"
                    className={styles.link}
                >
                    Calendar PNL
                </NavLink>

                <NavLink
                    to="/dashboard/add-trade"
                    className={styles.link}
                >
                    Add Trade
                </NavLink>
                {/* manage-users */}
                <NavLink
                    to="/dashboard/manage-users"
                    className={styles.link}
                >
                    Manage Users
                </NavLink>
                <NavLink
                    to="/logout"
                    className={styles.link}
                >
                    Logout
                </NavLink>
            </div>
        </nav>
    );
}
