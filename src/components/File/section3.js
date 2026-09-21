import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Bookmark,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Heart,
  Megaphone,
  Plus,
  Search,
  Send,
  UsersRound,
  BriefcaseBusiness,
  X,
} from "lucide-react";
import styles from "./section3.module.css";

const KEY = "job-application-board-v1";
const columns = [
  {
    id: "interest",
    title: "관심",
    caption: "눈여겨보는 기업이에요.",
    Icon: Heart,
  },
  {
    id: "applied",
    title: "지원 완료",
    caption: "서류가 정상적으로 제출되었어요.",
    Icon: Send,
  },
  {
    id: "interview",
    title: "면접",
    caption: "좋은 결과를 응원해요!",
    Icon: UsersRound,
  },
  {
    id: "result",
    title: "결과",
    caption: "그동안 수고하셨어요.",
    Icon: BriefcaseBusiness,
  },
];
const seed = [
  ["루미랩", "프론트엔드 개발자", "interest", "2026-09-25", "L", "blue"],
  ["그린픽셀", "웹 개발자", "interest", "2026-09-28", "G", "green"],
  ["넥스트웨이", "프론트엔드 개발자", "interest", "2026-10-02", "N", "royal"],
  ["페이퍼플랜", "UI 개발자", "interest", "2026-10-05", "P", "purple"],
  ["모아테크", "프론트엔드 개발자", "applied", "2026-09-20", "M", "royal"],
  ["오빗웍스", "웹 개발자", "applied", "2026-09-18", "O", "navy"],
  ["하루스튜디오", "프론트엔드 개발자", "applied", "2026-09-16", "H", "orange"],
  ["브릿지랩", "웹 개발자", "applied", "2026-09-14", "B", "green"],
  ["루미랩", "프론트엔드 개발자", "interview", "2026-09-26", "L", "blue"],
  ["그린픽셀", "웹 개발자", "interview", "2026-09-28", "G", "green"],
  ["하루스튜디오", "프론트엔드 개발자", "result", "2026-09-19", "H", "orange"],
  ["넥스트웨이", "웹 개발자", "result", "2026-09-17", "N", "royal"],
].map((row, index) => ({
  id: index + 1,
  company: row[0],
  role: row[1],
  stage: row[2],
  date: row[3],
  mark: row[4],
  tone: row[5],
  skills: ["React", "TypeScript"],
  time: index === 8 ? "14:00" : index === 9 ? "10:00" : "",
  result: index === 10 ? "최종 합격" : index === 11 ? "전형 종료" : "",
}));
function readJobs() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(data) ? data : seed;
  } catch {
    return seed;
  }
}
function daysUntil(value) {
  if (!value) return Infinity;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(value + "T00:00:00") - now) / 86400000);
}
function dateLabel(value) {
  return value ? value.replaceAll("-", ". ") + "." : "날짜 미정";
}
function Card({ job, onClick }) {
  const days = daysUntil(job.date);
  let dateText = dateLabel(job.date);
  if (job.stage === "interview")
    dateText =
      job.date.slice(5, 7) +
      "월 " +
      job.date.slice(8) +
      "일 · " +
      (job.time || "시간 미정");
  return (
    <button type="button" className={styles.card} onClick={() => onClick(job)}>
      <div className={styles.cardHead}>
        <span className={styles.mark + " " + styles[job.tone]}>{job.mark}</span>
        <strong>{job.company}</strong>
        {job.result && (
          <span
            className={
              styles.resultBadge +
              " " +
              (job.result === "최종 합격" ? styles.passed : "")
            }
          >
            {job.result}
          </span>
        )}
      </div>
      <div className={styles.role}>{job.role}</div>
      <div className={styles.skills}>
        {job.skills.map((skill) => (
          <span key={skill}>{skill}</span>
        ))}
      </div>
      <div className={styles.cardFoot}>
        {job.stage === "interest" ? (
          <Bookmark size={18} />
        ) : (
          <CalendarDays size={18} />
        )}
        <span>
          {job.stage === "interest"
            ? "마감일 "
            : job.stage === "applied"
              ? "지원일 "
              : job.stage === "result"
                ? "발표일 "
                : ""}
          {dateText}
        </span>
        {job.stage === "interest" && days >= 0 && days <= 3 && (
          <em>D-{days}</em>
        )}
        <ChevronRight size={18} className={styles.arrow} />
      </div>
    </button>
  );
}
export default function FileUploadPage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState(readJobs);
  const [query, setQuery] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [selected, setSelected] = useState(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    company: "",
    role: "",
    stage: "interest",
    date: "",
    skills: "",
  });
  const save = (next) => {
    setJobs(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  };
  const urgentCount = jobs.filter(
    (j) =>
      j.stage === "interest" &&
      daysUntil(j.date) >= 0 &&
      daysUntil(j.date) <= 7,
  ).length;
  const visible = useMemo(
    () =>
      jobs.filter((j) => {
        const match = (j.company + " " + j.role + " " + j.skills.join(" "))
          .toLowerCase()
          .includes(query.trim().toLowerCase());
        return (
          match &&
          (!urgent ||
            (j.stage === "interest" &&
              daysUntil(j.date) >= 0 &&
              daysUntil(j.date) <= 7))
        );
      }),
    [jobs, query, urgent],
  );
  const addJob = (event) => {
    event.preventDefault();
    if (!form.company.trim() || !form.role.trim()) return;
    save([
      ...jobs,
      {
        id: Date.now(),
        company: form.company.trim(),
        role: form.role.trim(),
        stage: form.stage,
        date: form.date,
        skills: form.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        mark: form.company.trim()[0],
        tone: "blue",
      },
    ]);
    setForm({ company: "", role: "", stage: "interest", date: "", skills: "" });
    setAdding(false);
  };
  const changeStage = (stage) => {
    save(jobs.map((j) => (j.id === selected.id ? { ...j, stage } : j)));
    setSelected(null);
  };
  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <button type="button" className={styles.brand} onClick={() => navigate("/main")}>취업 대시보드</button>
        <nav className={styles.tabs} aria-label="대시보드 메뉴">
          <button type="button" onClick={() => navigate("/main")}>종합 현황</button>
          <button type="button" onClick={() => navigate("/ChatApp")}>공고·이력서 분석</button>
          <button type="button" className={styles.active} aria-current="page">지원 관리</button>
          <span>면접 준비</span>
        </nav>
        <div className={styles.profile}>
          <Bell size={23} />
          <i />
          <span className={styles.avatar}>김</span>
          <span>김지원</span>
          <ChevronDown size={16} />
        </div>
      </header>
      <main className={styles.main}>
        <div className={styles.top}>
          <div>
            <h1>지원부터 결과까지, 한곳에서</h1>
            <p>지원 현황을 한눈에 확인하고, 다음 기회를 준비하세요.</p>
          </div>
          <div className={styles.controls}>
            <button
              type="button"
              className={!urgent ? styles.on : ""}
              onClick={() => setUrgent(false)}
            >
              전체 {jobs.length}
            </button>
            <button
              type="button"
              className={urgent ? styles.on : ""}
              onClick={() => setUrgent(true)}
            >
              마감 임박
            </button>
            <label className={styles.search}>
              <Search size={19} />
              <input
                aria-label="기업 또는 직무 검색"
                placeholder="기업 또는 직무 검색"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <button
              type="button"
              className={styles.add}
              onClick={() => setAdding(true)}
            >
              <Plus size={20} /> 지원 추가
            </button>
          </div>
        </div>
        <div className={styles.board}>
          {columns.map(({ id, title, caption, Icon }) => {
            const items = visible.filter((j) => j.stage === id);
            return (
              <section key={id} className={styles.column + " " + styles[id]}>
                <div className={styles.columnHead}>
                  <div>
                    <Icon size={22} />
                    <h2>{title}</h2>
                    <span>{items.length}</span>
                  </div>
                  <p>{caption}</p>
                </div>
                <div className={styles.cards}>
                  {items.length ? (
                    items.map((j) => (
                      <Card key={j.id} job={j} onClick={setSelected} />
                    ))
                  ) : (
                    <p className={styles.empty}>표시할 지원 내역이 없습니다.</p>
                  )}
                </div>
              </section>
            );
          })}
        </div>
        <div className={styles.reminder}>
          <Megaphone size={27} />
          <div>
            <strong>이번 주 마감 공고 {urgentCount}건을 확인하세요.</strong>
            <p>지금 지원하면 더 많은 기회가 있어요.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setUrgent(true);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            마감순 보기 <ChevronRight size={18} />
          </button>
        </div>
      </main>
      {adding && (
        <div className={styles.backdrop} onMouseDown={() => setAdding(false)}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-title"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHead}>
              <h2 id="add-title">지원 내역 추가</h2>
              <button
                type="button"
                onClick={() => setAdding(false)}
                aria-label="닫기"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={addJob}>
              <label>
                기업명
                <input
                  required
                  value={form.company}
                  onChange={(e) =>
                    setForm({ ...form, company: e.target.value })
                  }
                  placeholder="기업명을 입력하세요"
                />
              </label>
              <label>
                직무
                <input
                  required
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  placeholder="예: 프론트엔드 개발자"
                />
              </label>
              <label>
                진행 단계
                <select
                  value={form.stage}
                  onChange={(e) => setForm({ ...form, stage: e.target.value })}
                >
                  {columns.map((c) => (
                    <option value={c.id} key={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                날짜
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </label>
              <label>
                기술 스택
                <input
                  value={form.skills}
                  onChange={(e) => setForm({ ...form, skills: e.target.value })}
                  placeholder="React, TypeScript"
                />
              </label>
              <button type="submit" className={styles.submit}>
                추가하기
              </button>
            </form>
          </div>
        </div>
      )}
      {selected && (
        <div className={styles.backdrop} onMouseDown={() => setSelected(null)}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="detail-title"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHead}>
              <h2 id="detail-title">{selected.company}</h2>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="닫기"
              >
                <X size={20} />
              </button>
            </div>
            <p className={styles.detailRole}>{selected.role}</p>
            <p className={styles.detailDate}>
              날짜: {dateLabel(selected.date)}
            </p>
            <strong className={styles.detailLabel}>진행 단계 변경</strong>
            <div className={styles.choices}>
              {columns.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  className={selected.stage === c.id ? styles.choiceOn : ""}
                  onClick={() => changeStage(c.id)}
                >
                  {c.title}
                </button>
              ))}
            </div>
            <button
              type="button"
              className={styles.delete}
              onClick={() => {
                save(jobs.filter((j) => j.id !== selected.id));
                setSelected(null);
              }}
            >
              지원 내역 삭제
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
