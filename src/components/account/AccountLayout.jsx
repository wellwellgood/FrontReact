import { BellRing, Settings, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AccountMenu from "./AccountMenu.jsx";
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
      <header className={styles.header}>
        <button className={styles.brand} onClick={() => navigate("/main")}>취업 대시보드</button>
        <nav className={styles.dashboardNav} aria-label="대시보드 메뉴">
          {["종합 현황", "공고·이력서 분석", "지원 관리", "면접 준비"].map((label, index) => <button key={label} onClick={() => navigate(["/main", "/ChatApp", "/file", "/sendEmail"][index])}>{label}</button>)}
        </nav>
        <AccountMenu />
      </header>
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
