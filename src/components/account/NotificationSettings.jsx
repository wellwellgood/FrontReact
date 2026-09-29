import { useState } from "react";
import { BellRing, BriefcaseBusiness, CalendarDays, Mail, Megaphone } from "lucide-react";
import AccountLayout from "./AccountLayout.jsx";
import styles from "./AccountPages.module.css";

const items = [
  ["price", "관심종목 가격 알림", "설정만 저장됩니다. 시세 API 및 알림 발송 연결이 필요합니다.", CalendarDays],
  ["portfolio", "자산 점검 알림", "정기 자산 점검 알림 설정입니다. 발송 기능은 미연동입니다.", BellRing],
  ["trade", "거래 기록 알림", "거래 기록 알림 설정입니다. 발송 기능은 미연동입니다.", BriefcaseBusiness],
  ["recommend", "추천 공고", "희망 직무와 경력에 맞는 새로운 공고를 알려드려요.", Megaphone],
  ["email", "이메일 알림", "중요한 알림을 이메일로도 받아보세요.", Mail],
];
export default function NotificationSettings() {
  const [values, setValues] = useState(() => Object.fromEntries(items.map(([id]) => [id, localStorage.getItem(`notification_${id}`) !== "false"])));
  const [saved, setSaved] = useState(false);
  const save = () => { Object.entries(values).forEach(([id, value]) => localStorage.setItem(`notification_${id}`, String(value))); setSaved(true); };
  return <AccountLayout active="notifications"><div className={styles.title}><h2>알림 설정</h2><p>자산 관리에 필요한 알림을 선택하세요.</p></div><div className={styles.notificationList}>{items.map(([id, title, description, Icon]) => <div className={styles.notificationRow} key={id}><span className={styles.notificationIcon}><Icon size={24} /></span><div><h3>{title}</h3><p>{description}</p></div><label className={styles.switchLabel}><input type="checkbox" checked={values[id]} onChange={(e) => { setValues((current) => ({ ...current, [id]: e.target.checked })); setSaved(false); }} /><span className={styles.switch} /><span className={styles.hidden}>{title}</span></label></div>)}</div><div className={styles.actions}><button className={styles.primary} onClick={save}>변경사항 저장</button></div>{saved && <p className={styles.notice}>알림 설정이 저장되었습니다.</p>}</AccountLayout>;
}
