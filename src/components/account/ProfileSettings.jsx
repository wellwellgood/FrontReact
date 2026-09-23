import { useState } from "react";
import { UserRound } from "lucide-react";
import AccountLayout from "./AccountLayout.jsx";
import styles from "./AccountPages.module.css";

export default function ProfileSettings() {
  const userKey = sessionStorage.getItem("username") || "defaultUser";
  const initialName = sessionStorage.getItem("name") || sessionStorage.getItem("username") || "김지원";
  const [form, setForm] = useState({ name: localStorage.getItem("profileName") || initialName, email: localStorage.getItem("email") || "", role: localStorage.getItem("desiredRole") || "프론트엔드 개발자", bio: localStorage.getItem("bio") || "" });
  const [image, setImage] = useState(localStorage.getItem(`profileImage_${userKey}`) || "");
  const [saved, setSaved] = useState(false);
  const update = (key, value) => { setSaved(false); setForm((current) => ({ ...current, [key]: value })); };
  const selectImage = (event) => {
    const file = event.target.files?.[0];
    if (!file || file.size > 5 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = () => { setImage(String(reader.result)); setSaved(false); };
    reader.readAsDataURL(file);
  };
  const save = () => {
    localStorage.setItem("profileName", form.name); localStorage.setItem("email", form.email); localStorage.setItem("desiredRole", form.role); localStorage.setItem("bio", form.bio); localStorage.setItem(`profileImage_${userKey}`, image); sessionStorage.setItem("name", form.name); setSaved(true);
  };
  return <AccountLayout active="profile"><div className={styles.title}><h2>프로필 수정</h2></div><div className={styles.form}><div className={styles.photoRow}><span className={styles.photo}>{image ? <img src={image} alt="프로필 미리보기" /> : <UserRound size={58} />}</span><div className={styles.photoActions}><label className={styles.upload}>사진 변경<input type="file" accept="image/png,image/jpeg" onChange={selectImage} /></label><small>JPG, PNG 파일 (최대 5MB)</small></div></div><div className={styles.field}><label htmlFor="profile-name">이름</label><input id="profile-name" value={form.name} onChange={(e) => update("name", e.target.value)} /></div><div className={styles.field}><label htmlFor="profile-email">이메일</label><input id="profile-email" type="email" value={form.email} placeholder="jiwon@example.com" onChange={(e) => update("email", e.target.value)} /></div><div className={styles.field}><label htmlFor="profile-role">희망 직무</label><select id="profile-role" value={form.role} onChange={(e) => update("role", e.target.value)}><option>프론트엔드 개발자</option><option>백엔드 개발자</option><option>웹 개발자</option><option>UI 개발자</option><option>직접 입력</option></select></div><div className={styles.field}><label htmlFor="profile-bio">자기소개</label><textarea id="profile-bio" value={form.bio} placeholder="간단한 자기소개를 입력해 주세요." onChange={(e) => update("bio", e.target.value)} /></div><div className={styles.actions}><button className={styles.primary} onClick={save}>변경사항 저장</button><button className={styles.secondary} onClick={() => window.history.back()}>취소</button></div>{saved && <p className={styles.notice}>프로필이 저장되었습니다.</p>}</div></AccountLayout>;
}
