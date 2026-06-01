import { NavLink } from "react-router";
import styles from "./navbar.module.css";

export function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        Trade Accountant
      </div>

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
          to="/dashboard/add-trade"
          className={styles.link}
        >
          Add Trade
        </NavLink>
      </div>
    </nav>
  );
}