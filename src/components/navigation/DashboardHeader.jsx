import { useState } from "react";
import { Activity, Code2, FolderGit2, GitPullRequest, LayoutDashboard, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AccountMenu from "../account/AccountMenu.jsx";
import styles from "./DashboardHeader.module.css";

const tabs = [
  ["overview", "종합 현황", "/dashboard", LayoutDashboard],
  ["projects", "프로젝트", "/projects", FolderGit2],
  ["issues", "이슈 · PR", "/issues", GitPullRequest],
  ["activity", "활동", "/activity", Activity],
];
export default function DashboardHeader({ active }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const activeLabel = tabs.find(([id]) => id === active)?.[1] || "DEV DASHBOARD";

  const go = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  return (
    <header
      className={styles.header}
      onMouseEnter={() => setSidebarOpen(true)}
      onMouseLeave={() => setSidebarOpen(false)}
    >
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
      <button type="button" className={styles.brand} onClick={() => go("/dashboard")} title="DEV DASHBOARD">
        <Code2 aria-hidden="true" />
        <span>DEV DASHBOARD</span>
      </button>
      <strong className={styles.mobileTitle}>{activeLabel}</strong>
      <nav
        id="dashboard-navigation"
        className={`${styles.tabs} ${menuOpen ? styles.menuOpen : ""}`}
        aria-label="주요 메뉴"
      >
        {tabs.map(([id, label, path, Icon]) => (
          <button
            type="button"
            key={id}
            className={active === id ? styles.active : ""}
            aria-current={active === id ? "page" : undefined}
            aria-label={label}
            title={label}
            onClick={() => go(path)}
          >
            <Icon aria-hidden="true" />
            <span className={styles.tabLabel}>{label}</span>
          </button>
        ))}
      </nav>
      <AccountMenu side expanded={sidebarOpen} />
    </header>
  );
}
