import { useEffect, useRef, useState } from "react";
import { Activity, FolderGit2, GitPullRequest, LayoutDashboard, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AccountMenu from "../account/AccountMenu.jsx";
import logo from "../../image/LOGO/android-chrome-192.png";
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
  const sidebarTimer = useRef(null);
  const activeLabel = tabs.find(([id]) => id === active)?.[1] || "GITERVIEW";

  useEffect(() => () => clearTimeout(sidebarTimer.current), []);

  const scheduleSidebar = (expanded) => {
    clearTimeout(sidebarTimer.current);
    sidebarTimer.current = setTimeout(
      () => setSidebarOpen(expanded),
      expanded ? 40 : 140,
    );
  };

  const go = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  return (
    <header
      className={styles.header}
      data-expanded={sidebarOpen}
      onPointerEnter={() => scheduleSidebar(true)}
      onPointerLeave={() => scheduleSidebar(false)}
      onFocusCapture={() => scheduleSidebar(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          scheduleSidebar(false);
        }
      }}
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
      <button type="button" className={styles.brand} onClick={() => go("/dashboard")} title="GITERVIEW">
        <img className={styles.brandLogo} src={logo} alt="" aria-hidden="true" />
        <span>GITERVIEW</span>
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
