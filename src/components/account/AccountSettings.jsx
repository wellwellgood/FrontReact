import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AccountLayout from "./AccountLayout.jsx";
import styles from "./AccountPages.module.css";

export default function AccountSettings() {
  const navigate = useNavigate();
  const [keepLogin, setKeepLogin] = useState(localStorage.getItem("keepLogin") === "true");
  const [saved, setSaved] = useState(false);
  const email = localStorage.getItem(`email_${sessionStorage.getItem("username")}`) || sessionStorage.getItem("email") || "";
  const save = () => { localStorage.setItem("keepLogin", String(keepLogin)); setSaved(true); };
  const removeAccount = () => {
    if (!window.confirm("현재 계정의 브라우저 설정을 초기화하고 로그아웃할까요? 서버 계정과 GitHub 연결은 유지됩니다.")) return;
    const user = sessionStorage.getItem("username"); ["profileName", "email", "developerRole", "bio", "profileImage"].forEach(key => localStorage.removeItem(`${key}_${user}`)); sessionStorage.clear(); navigate("/login");
  };
  return <AccountLayout active="settings"><div className={styles.title}><h2>계정 설정</h2><p>로그인 정보와 계정 보안을 관리하세요.</p></div><div className={styles.settingsRows}><div className={styles.settingRow}><span className={styles.rowLabel}>GitHub 연결</span><div><p>대시보드에서 GitHub 계정 연결과 해제를 관리할 수 있습니다.</p><button className={styles.outlineButton} onClick={() => navigate("/dashboard")}>연결 관리</button></div></div><div className={styles.settingRow}><span className={styles.rowLabel}>이메일</span><input value={email} readOnly aria-label="계정 이메일" /></div><div className={styles.settingRow}><span className={styles.rowLabel}>비밀번호</span><button className={styles.outlineButton} onClick={() => navigate("/password")}>비밀번호 변경</button></div><div className={styles.settingRow}><span className={styles.rowLabel}>로그인 유지</span><div><label className={styles.switchLabel}><input type="checkbox" checked={keepLogin} onChange={(e) => { setKeepLogin(e.target.checked); setSaved(false); }} /><span className={styles.switch} /><span className={styles.hidden}>로그인 유지 설정</span></label><p>로그인 유지 선호를 저장합니다. 실제 세션 유지 정책은 인증 서버를 따릅니다.</p></div></div><div className={styles.settingRow}><span className={styles.rowLabel}>브라우저 설정 초기화</span><div><p>이 브라우저의 프로필 설정만 초기화됩니다. 서버 계정과 GitHub 연결은 유지됩니다.</p><button className={styles.danger} onClick={removeAccount}>설정 초기화 및 로그아웃</button></div></div></div><div className={styles.actions}><button className={styles.primary} onClick={save}>변경사항 저장</button></div>{saved && <p className={styles.notice}>계정 설정이 저장되었습니다.</p>}</AccountLayout>;
}
