import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AccountLayout from "./AccountLayout.jsx";
import styles from "./AccountPages.module.css";

export default function AccountSettings() {
  const navigate = useNavigate();
  const [keepLogin, setKeepLogin] = useState(localStorage.getItem("keepLogin") === "true");
  const [saved, setSaved] = useState(false);
  const email = localStorage.getItem("email") || sessionStorage.getItem("email") || "jiwon@example.com";
  const save = () => { localStorage.setItem("keepLogin", String(keepLogin)); setSaved(true); };
  const removeAccount = () => {
    if (!window.confirm("계정을 삭제하시겠습니까? 저장된 지원 정보와 면접 답변이 삭제됩니다.")) return;
    localStorage.clear(); sessionStorage.clear(); navigate("/membership");
  };
  return <AccountLayout active="settings"><div className={styles.title}><h2>계정 설정</h2><p>로그인 정보와 계정 보안을 관리하세요.</p></div><div className={styles.settingsRows}><div className={styles.settingRow}><span className={styles.rowLabel}>이메일</span><input value={email} readOnly aria-label="계정 이메일" /></div><div className={styles.settingRow}><span className={styles.rowLabel}>비밀번호</span><button className={styles.outlineButton} onClick={() => navigate("/password")}>비밀번호 변경</button></div><div className={styles.settingRow}><span className={styles.rowLabel}>로그인 유지</span><div><label className={styles.switchLabel}><input type="checkbox" checked={keepLogin} onChange={(e) => { setKeepLogin(e.target.checked); setSaved(false); }} /><span className={styles.switch} /><span className={styles.hidden}>로그인 유지 설정</span></label><p>브라우저를 닫아도 로그인 상태를 유지합니다.</p></div></div><div className={styles.settingRow}><span className={styles.rowLabel}>계정 삭제</span><div><p>계정을 삭제하면 저장된 지원 정보와 면접 답변이 모두 삭제됩니다.</p><button className={styles.danger} onClick={removeAccount}>계정 삭제하기</button></div></div></div><div className={styles.actions}><button className={styles.primary} onClick={save}>변경사항 저장</button></div>{saved && <p className={styles.notice}>계정 설정이 저장되었습니다.</p>}</AccountLayout>;
}
