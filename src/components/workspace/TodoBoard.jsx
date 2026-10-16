import { useEffect, useMemo, useState } from "react";
import { ListTodo, Plus } from "lucide-react";
import TodoCard from "./TodoCard.jsx";
import styles from "./DeveloperWorkspace.module.css";

const STATUSES = [
  { id: "todo", label: "대기" },
  { id: "doing", label: "진행 중" },
  { id: "done", label: "완료" },
];

const STARTER_TASKS = [
  { id: "starter-1", title: "오늘 작업할 이슈 확인하기", status: "todo" },
  { id: "starter-2", title: "진행 중인 기능 테스트하기", status: "doing" },
];

function readTasks(storageKey) {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    return Array.isArray(saved) ? saved : STARTER_TASKS;
  } catch {
    return STARTER_TASKS;
  }
}

export default function TodoBoard({ storageKey }) {
  const [tasks, setTasks] = useState(() => readTasks(storageKey));
  const [title, setTitle] = useState("");
  const [draggedId, setDraggedId] = useState(null);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(tasks));
  }, [storageKey, tasks]);

  const counts = useMemo(
    () =>
      STATUSES.reduce((result, status) => {
        result[status.id] = tasks.filter(
          (task) => task.status === status.id,
        ).length;
        return result;
      }, {}),
    [tasks],
  );

  const addTask = (event) => {
    event.preventDefault();
    const nextTitle = title.trim();
    if (!nextTitle) return;

    setTasks((current) => [
      ...current,
      {
        id: `${Date.now()}-${Math.random()}`,
        title: nextTitle,
        status: "todo",
      },
    ]);
    setTitle("");
  };

  const moveTask = (id, status, beforeId = null) => {
    setTasks((current) => {
      if (id === beforeId) return current;
      const moving = current.find((task) => task.id === id);
      if (!moving) return current;

      const remaining = current.filter((task) => task.id !== id);
      const moved = { ...moving, status };
      const targetIndex = beforeId
        ? remaining.findIndex((task) => task.id === beforeId)
        : -1;

      if (targetIndex < 0) return [...remaining, moved];
      return [
        ...remaining.slice(0, targetIndex),
        moved,
        ...remaining.slice(targetIndex),
      ];
    });
  };

  const updateTask = (id, nextTitle) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, title: nextTitle } : task,
      ),
    );
  };

  const handleDrop = (event, status, beforeId = null) => {
    event.preventDefault();
    const id = event.dataTransfer.getData("text/plain") || draggedId;
    if (id) moveTask(id, status, beforeId);
    setDraggedId(null);
  };

  return (
    <section className={`${styles.panel} ${styles.todoPanel}`}>
      <div className={styles.panelTitle}>
        <div>
          <span className={styles.titleIcon}>
            <ListTodo />
          </span>
          <div>
            <h2>개발 할 일</h2>
            <p>카드를 드래그해 상태와 순서를 변경하세요.</p>
          </div>
        </div>
        <span className={styles.totalCount}>{tasks.length}개</span>
      </div>

      <form className={styles.todoForm} onSubmit={addTask}>
        <label htmlFor="new-developer-task">새 할 일</label>
        <input
          id="new-developer-task"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="예: 로그인 오류 재현하기"
          maxLength={80}
        />
        <button type="submit" disabled={!title.trim()}>
          <Plus /> 추가
        </button>
      </form>

      <div className={styles.board}>
        {STATUSES.map((status) => {
          const statusTasks = tasks.filter((task) => task.status === status.id);
          return (
            <section
              key={status.id}
              className={styles.todoColumn}
              data-status={status.id}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => handleDrop(event, status.id)}
            >
              <header>
                <strong>{status.label}</strong>
                <span>{counts[status.id]}</span>
              </header>
              <div className={styles.todoList}>
                {statusTasks.map((task) => (
                  <div
                    key={task.id}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.stopPropagation();
                      handleDrop(event, status.id, task.id);
                    }}
                  >
                    <TodoCard
                      task={task}
                      statuses={STATUSES}
                      onMove={moveTask}
                      onUpdate={updateTask}
                      onDelete={(id) =>
                        setTasks((current) =>
                          current.filter((item) => item.id !== id),
                        )
                      }
                      onDragStart={(event, id) => {
                        event.dataTransfer.effectAllowed = "move";
                        event.dataTransfer.setData("text/plain", id);
                        setDraggedId(id);
                      }}
                    />
                  </div>
                ))}
                {!statusTasks.length && (
                  <p className={styles.emptyColumn}>여기로 카드를 옮기세요.</p>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}
