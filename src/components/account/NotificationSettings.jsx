import { useState } from "react";
import { BellRing, BriefcaseBusiness, CalendarDays, Mail } from "lucide-react";
import AccountLayout from "./AccountLayout.jsx";
import styles from "./AccountPages.module.css";

const items = [
  ["github_issue", "이슈 알림", "이슈 알림 수신 선호를 저장합니다.", CalendarDays],
  ["github_pr", "PR 알림", "Pull Request 알림 수신 선호를 저장합니다.", BellRing],
  ["github_activity", "프로젝트 활동", "프로젝트 활동 알림 수신 선호를 저장합니다.", BriefcaseBusiness],
  ["email", "이메일 알림", "이메일 수신 선호를 저장합니다.", Mail],
];
export default function NotificationSettings() {
  const [values, setValues] = useState(() => Object.fromEntries(items.map(([id]) => [id, localStorage.getItem(`notification_${sessionStorage.getItem("username")}_${id}`) !== "false"])));
  const [saved, setSaved] = useState(false);
  const save = () => { Object.entries(values).forEach(([id, value]) => localStorage.setItem(`notification_${sessionStorage.getItem("username")}_${id}`, String(value))); setSaved(true); };
  return <AccountLayout active="notifications"><div className={styles.title}><h2>알림 설정</h2><p>개발 활동 알림 선호를 저장합니다. 자동 알림 발송은 아직 연결되지 않았습니다.</p></div><div className={styles.notificationList}>{items.map(([id, title, description, Icon]) => <div className={styles.notificationRow} key={id}><span className={styles.notificationIcon}><Icon size={24} /></span><div><h3>{title}</h3><p>{description}</p></div><label className={styles.switchLabel}><input type="checkbox" checked={values[id]} onChange={(e) => { setValues((current) => ({ ...current, [id]: e.target.checked })); setSaved(false); }} /><span className={styles.switch} /><span className={styles.hidden}>{title}</span></label></div>)}</div><div className={styles.actions}><button className={styles.primary} onClick={save}>변경사항 저장</button></div>{saved && <p className={styles.notice}>알림 설정이 저장되었습니다.</p>}</AccountLayout>;
}
