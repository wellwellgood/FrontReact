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

  return (
    <header className={styles.header}>
      <button type="button" className={styles.brand} onClick={() => navigate("/dashboard")}>
        DEV DASHBOARD
      </button>
      <nav className={styles.tabs} aria-label="주요 메뉴">
        {tabs.map(([id, label, path]) => (
          <button
            type="button"
            key={id}
            className={active === id ? styles.active : ""}
            aria-current={active === id ? "page" : undefined}
            onClick={() => navigate(path)}
          >
            {label}
          </button>
        ))}
      </nav>
      <AccountMenu />
    </header>
  );
}
