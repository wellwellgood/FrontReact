import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AccountMenu from "../account/AccountMenu.jsx";
import styles from "./DashboardHeader.module.css";

const tabs = [
  ["overview", "종합 현황", "/dashboard"],
  ["projects", "프로젝트", "/projects"],
  ["issues", "이슈 · PR", "/issues"],
  ["activity", "활동", "/activity"],
];

export default function DashboardHeader({ active }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const activeLabel = tabs.find(([id]) => id === active)?.[1] || "DEV DASHBOARD";

  const go = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  return (
    <header className={styles.header}>
      <button
        type="button"
        className={styles.menuToggle}
        aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
        aria-expanded={menuOpen}
        aria-controls="dashboard-navigation"
        onClick={() => setMenuOpen((value) => !value)}
      >
        {menuOpen ? <X /> : <Menu />}
      </button>
      <button type="button" className={styles.brand} onClick={() => go("/dashboard")}>
        DEV DASHBOARD
      </button>
      <strong className={styles.mobileTitle}>{activeLabel}</strong>
      <nav
        id="dashboard-navigation"
        className={`${styles.tabs} ${menuOpen ? styles.menuOpen : ""}`}
        aria-label="주요 메뉴"
      >
        {tabs.map(([id, label, path]) => (
          <button
            type="button"
            key={id}
            className={active === id ? styles.active : ""}
            aria-current={active === id ? "page" : undefined}
            onClick={() => go(path)}
          >
            {label}
          </button>
        ))}
      </nav>
      <AccountMenu side />
    </header>
  );
}
