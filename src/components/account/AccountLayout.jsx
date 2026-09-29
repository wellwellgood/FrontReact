import { BellRing, Settings, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "../navigation/DashboardHeader.jsx";
import styles from "./AccountPages.module.css";

const pages = [
  ["profile", "프로필", UserRound, "/account/profile"],
  ["settings", "계정 설정", Settings, "/settings"],
  ["notifications", "알림 설정", BellRing, "/account/notifications"],
];

export default function AccountLayout({ active, children }) {
  const navigate = useNavigate();
  return (
    <div className={styles.page}>
      <DashboardHeader />
      <main className={styles.main}>
        <aside className={styles.sidebar}>
          <h1>계정 관리</h1>
          <nav aria-label="계정 관리 메뉴">
            {pages.map(([id, label, Icon, path]) => <button key={id} className={active === id ? styles.activeSide : ""} aria-current={active === id ? "page" : undefined} onClick={() => navigate(path)}><Icon size={21} />{label}</button>)}
          </nav>
        </aside>
        <section className={styles.content}>{children}</section>
      </main>
    </div>
  );
}
