import { useEffect, useRef, useState } from "react";
import { Check, GripVertical, Pencil, Trash2, X } from "lucide-react";
import styles from "./DeveloperWorkspace.module.css";

export default function TodoCard({
  task,
  statuses,
  onDelete,
  onMove,
  onUpdate,
  onDragStart,
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const startEditing = () => {
    setDraft(task.title);
    setEditing(true);
  };

  const cancelEditing = () => {
    setDraft(task.title);
    setEditing(false);
  };

  const saveTitle = () => {
    const nextTitle = draft.trim();
    if (!nextTitle) return;
    onUpdate(task.id, nextTitle);
    setEditing(false);
  };

  return (
    <article
      className={`${styles.todoCard} ${editing ? styles.todoCardEditing : ""}`}
      draggable={!editing}
      onDragStart={(event) => onDragStart(event, task.id)}
    >
      <button
        type="button"
        className={styles.dragHandle}
        aria-label={`${task.title} 순서 변경`}
        title="드래그하여 이동"
      >
        <GripVertical />
      </button>
      <div className={styles.todoBody}>
        {editing ? (
          <input
            ref={inputRef}
            className={styles.todoEditInput}
            value={draft}
            maxLength={80}
            aria-label="할 일 제목 수정"
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") saveTitle();
              if (event.key === "Escape") cancelEditing();
            }}
          />
        ) : (
          <strong>{task.title}</strong>
        )}
        <select
          className={styles.mobileStatus}
          value={task.status}
          aria-label={`${task.title} 상태`}
          onChange={(event) => onMove(task.id, event.target.value)}
        >
          {statuses.map((status) => (
            <option key={status.id} value={status.id}>
              {status.label}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.todoActions}>
        {editing ? (
          <>
            <button
              type="button"
              className={styles.saveEditButton}
              onClick={saveTitle}
              disabled={!draft.trim()}
              aria-label="수정 내용 저장"
            >
              <Check />
            </button>
            <button
              type="button"
              className={styles.cancelEditButton}
              onClick={cancelEditing}
              aria-label="수정 취소"
            >
              <X />
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className={styles.editButton}
              onClick={startEditing}
              aria-label={`${task.title} 수정`}
            >
              <Pencil />
            </button>
            <button
              type="button"
              className={styles.deleteButton}
              onClick={() => onDelete(task.id)}
              aria-label={`${task.title} 삭제`}
            >
              <Trash2 />
            </button>
          </>
        )}
      </div>
    </article>
  );
}
