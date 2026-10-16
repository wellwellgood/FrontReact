import { useEffect, useState } from "react";
import { Check, StickyNote } from "lucide-react";
import styles from "./DeveloperWorkspace.module.css";

export default function ProjectMemo({ storageKey }) {
  const [memo, setMemo] = useState(() => localStorage.getItem(storageKey) || "");
  const [saved, setSaved] = useState(true);

  useEffect(() => {
    setSaved(false);
    const timer = window.setTimeout(() => {
      localStorage.setItem(storageKey, memo);
      setSaved(true);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [memo, storageKey]);

  return (
    <section className={`${styles.panel} ${styles.memoPanel}`}>
      <div className={styles.panelTitle}>
        <div>
          <span className={`${styles.titleIcon} ${styles.memoIcon}`}><StickyNote /></span>
          <div>
            <h2>프로젝트 메모</h2>
            <p>아이디어와 다음 작업을 빠르게 기록하세요.</p>
          </div>
        </div>
        <span className={styles.savedState} aria-live="polite">
          {saved && <Check />} {saved ? "저장됨" : "저장 중…"}
        </span>
      </div>
      <label className={styles.memoLabel} htmlFor="project-memo">
        메모 내용
      </label>
      <textarea
        id="project-memo"
        value={memo}
        onChange={(event) => setMemo(event.target.value)}
        placeholder={"구현 아이디어, 확인할 API, 회고 내용을 자유롭게 적어보세요.\n\n예시\n- 모바일 메뉴 간격 확인\n- GitHub API 오류 처리 개선"}
        maxLength={4000}
      />
      <div className={styles.memoMeta}>
        <span>자동 저장</span>
        <span>{memo.length.toLocaleString()} / 4,000</span>
      </div>
    </section>
  );
}
