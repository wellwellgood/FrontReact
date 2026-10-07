import { useEffect, useRef, useState } from "react";
import { Bell, CheckCircle2, ChevronDown, LogOut, Settings, SlidersHorizontal, Trash2, UserRound, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import styles from "./AccountMenu.module.css";

const initialNotifications = [
  { id: 1, icon: Bell, title: "GitHub 계정을 연결하세요", detail: "본인의 공개 프로젝트와 활동을 확인할 수 있습니다.", time: "안내" },
  { id: 2, icon: CheckCircle2, title: "프로젝트를 즐겨찾기에 저장하세요", detail: "연결한 사용자 계정별로 서버에 저장됩니다.", time: "안내" },
];

export default function AccountMenu({ side = false, expanded = false }) {
  const navigate = useNavigate();
  const wrap = useRef(null);
  const name = sessionStorage.getItem("name") || sessionStorage.getItem("username") || "김지원";
  const userKey = sessionStorage.getItem("username") || "defaultUser";
  const dismissedKey = `dismissedNotifications_${userKey}`;
  const image = localStorage.getItem(`profileImage_${userKey}`);
  const [open, setOpen] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [notices, setNotices] = useState(() => {
    try {
      const dismissed = JSON.parse(localStorage.getItem(dismissedKey) || "[]");
      return initialNotifications.filter(({ id }) => !dismissed.includes(id));
    } catch {
      return initialNotifications;
    }
  });
  const [unread, setUnread] = useState(notices.length > 0);

  useEffect(() => {
    const close = (event) => {
      if (!wrap.current?.contains(event.target)) {
        setOpen(false);
        setNoticeOpen(false);
      }
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  const go = (path) => {
    setOpen(false);
    setNoticeOpen(false);
    navigate(path);
  };
  const logout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  const dismissNotice = (id) => {
    const next = notices.filter((notice) => notice.id !== id);
    const dismissed = initialNotifications
      .filter((notice) => !next.some((item) => item.id === notice.id))
      .map((notice) => notice.id);
    localStorage.setItem(dismissedKey, JSON.stringify(dismissed));
    setNotices(next);
    if (next.length === 0) setUnread(false);
  };

  const clearNotices = () => {
    localStorage.setItem(
      dismissedKey,
      JSON.stringify(initialNotifications.map(({ id }) => id)),
    );
    setNotices([]);
    setUnread(false);
  };

  return (
    <div className={`${styles.account} ${side ? styles.side : ""} ${expanded ? styles.expanded : ""}`} ref={wrap}>
      <button
        className={styles.bell}
        type="button"
        aria-label="알림 목록"
        aria-expanded={noticeOpen}
        onClick={() => {
          setNoticeOpen((value) => !value);
          setOpen(false);
          setUnread(false);
        }}
      >
        <Bell size={22} />{unread && notices.length > 0 && <i />}
      </button>
      <button className={styles.trigger} type="button" aria-expanded={open} onClick={() => { setOpen((value) => !value); setNoticeOpen(false); }}>
        <span className={styles.avatar}>{image ? <img src={image} alt="" /> : <UserRound size={22} />}</span>
        <span>{name}</span><ChevronDown size={17} />
      </button>
      {noticeOpen && (
        <section className={styles.notifications} aria-label="최근 알림">
          <div className={styles.noticeHeader}>
            <div>
              <strong>알림</strong>
              <span>{notices.length}개</span>
            </div>
            <div className={styles.noticeActions}>
              {notices.length > 0 && (
                <button type="button" className={styles.clearButton} onClick={clearNotices}>
                  <Trash2 size={15} /> 전체 지우기
                </button>
              )}
              <button type="button" onClick={() => go("/account/notifications")}>설정</button>
            </div>
          </div>
          <div className={styles.noticeList}>
            {notices.length === 0 ? (
              <div className={styles.emptyNotice}>
                <CheckCircle2 size={30} />
                <strong>새로운 알림이 없습니다</strong>
                <p>새 소식이 생기면 이곳에 표시됩니다.</p>
              </div>
            ) : notices.map(({ id, icon: Icon, title, detail, time }) => (
              <article className={styles.noticeItem} key={id}>
                <span className={styles.noticeIcon}><Icon size={18} /></span>
                <div><strong>{title}</strong><p>{detail}</p><small>{time}</small></div>
                <button type="button" className={styles.dismissButton} aria-label={`${title} 알림 지우기`} onClick={() => dismissNotice(id)}>
                  <X size={15} />
                </button>
              </article>
            ))}
          </div>
        </section>
      )}
      {open && (
        <div className={styles.menu}>
          <button type="button" onClick={() => go("/account/profile")}><UserRound size={17} />프로필 수정</button>
          <button type="button" onClick={() => go("/settings")}><Settings size={17} />계정 설정</button>
          <button type="button" onClick={() => go("/account/notifications")}><SlidersHorizontal size={17} />알림 설정</button>
          <hr />
          <button type="button" onClick={logout}><LogOut size={17} />로그아웃</button>
        </div>
      )}
    </div>
  );
}
