import { useNavigate } from "react-router-dom";
import AccountMenu from "../account/AccountMenu.jsx";
import styles from "./DashboardHeader.module.css";

const tabs = [
  ["overview", "종합 현황", "/dashboard"],
  ["holdings", "보유종목", "/holdings"],
  ["transactions", "거래내역", "/transactions"],
  ["watchlist", "관심종목", "/watchlist"],
];

export default function DashboardHeader({ active }) {
  const navigate = useNavigate();

  return (
    <header className={styles.header}>
      <button type="button" className={styles.brand} onClick={() => navigate("/dashboard")}>
        자산 대시보드
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
