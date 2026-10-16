import { NotebookPen } from "lucide-react";
import DashboardHeader from "../navigation/DashboardHeader.jsx";
import ProjectMemo from "./ProjectMemo.jsx";
import TodoBoard from "./TodoBoard.jsx";
import styles from "./DeveloperWorkspace.module.css";

export default function DeveloperWorkspace() {
  const userKey = sessionStorage.getItem("username") || "guest";

  return (
    <div className={styles.workspacePage}>
      <DashboardHeader active="workspace" />
      <main className={styles.content}>
        <section className={styles.heading}>
          <div>
            <span className={styles.eyebrow}>MY WORKSPACE</span>
            <h1>개발 작업 공간</h1>
            <p>해야 할 개발 작업과 프로젝트 메모를 한곳에서 관리하세요.</p>
          </div>
        </section>

        <section className={styles.workspaceGrid}>
          <TodoBoard storageKey={`giterview:todos:${userKey}`} />
          <ProjectMemo storageKey={`giterview:memo:${userKey}`} />
        </section>

        <p className={styles.storageNote}>
          <NotebookPen aria-hidden="true" />
          작성한 내용은 현재 브라우저에 자동 저장됩니다.
        </p>
      </main>
    </div>
  );
}
