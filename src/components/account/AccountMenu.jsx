import { useEffect, useRef, useState } from "react";
import { Bell, ChevronDown, LogOut, Settings, SlidersHorizontal, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import styles from "./AccountMenu.module.css";

export default function AccountMenu({ onNotify }) {
  const navigate = useNavigate();
  const wrap = useRef(null);
  const [open, setOpen] = useState(false);
  const name = sessionStorage.getItem("name") || sessionStorage.getItem("username") || "김지원";
  const userKey = sessionStorage.getItem("username") || "defaultUser";
  const image = localStorage.getItem(`profileImage_${userKey}`);

  useEffect(() => {
    const close = (event) => {
      if (!wrap.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  const go = (path) => {
    setOpen(false);
    navigate(path);
  };
  const logout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <div className={styles.account} ref={wrap}>
      <button className={styles.bell} type="button" aria-label="알림" onClick={() => onNotify ? onNotify() : go("/account/notifications")}>
        <Bell size={22} /><i />
      </button>
      <button className={styles.trigger} type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <span className={styles.avatar}>{image ? <img src={image} alt="" /> : <UserRound size={22} />}</span>
        <span>{name}</span><ChevronDown size={17} />
      </button>
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
