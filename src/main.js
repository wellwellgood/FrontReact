import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  UserRound,
  ChevronDown,
  ChevronRight,
  Plus,
  FileText,
  Send,
  CalendarDays,
  Clock3,
  Bookmark,
  MapPin,
  BriefcaseBusiness,
  Sparkles,
  ArrowRight,
  X,
  ChartNoAxesCombined,
} from "lucide-react";
import styles from "./main.module.css";

const jobs = [
  {
    company: "루미랩",
    role: "프론트엔드 개발자",
    desc: "사람의 가능성을 밝히는 기술, 루미랩과 함께하세요.",
    location: "서울 강남구",
    career: "경력 무관",
    tags: ["React", "TypeScript", "Next.js", "웹 성능"],
    logo: "L",
  },
  {
    company: "모아테크",
    role: "웹 개발자",
    desc: "더 나은 일상을 만드는 서비스를 함께 만듭니다.",
    location: "서울 마포구",
    career: "경력 1년 이상",
    tags: ["React", "TypeScript", "Tailwind CSS", "REST API"],
    logo: "M",
  },
];
const todos = [
  ["이력서 프로젝트 경험 보완", "구체적인 성과와 수치를 추가해보세요."],
  ["프론트엔드 면접 준비", "자주 묻는 질문을 정리하고 답변을 연습해보세요."],
  [
    "관심 공고 2건 검토",
    "마감일과 담당 업무를 확인하고 지원 여부를 결정하세요.",
  ],
];
const stats = [
  ["관심 공고", 12, FileText, "blue"],
  ["지원 완료", 8, Send, "green"],
  ["면접 예정", 2, CalendarDays, "purple"],
  ["이번 주 마감", 3, Clock3, "orange"],
];

export default function Main() {
  const navigate = useNavigate();
  const [done, setDone] = useState([]);
  const [saved, setSaved] = useState([]);
  const [period, setPeriod] = useState("이번 주");
  const [dialog, setDialog] = useState(null);
  const [account, setAccount] = useState(false);
  const [added, setAdded] = useState([]);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const name =
    sessionStorage.getItem("name") ||
    sessionStorage.getItem("username") ||
    "사용자";
  const values =
    period === "이번 주" ? [2, 4, 3, 6, 5, 2, 1] : [1, 3, 2, 4, 2, 1, 0];
  const toggle = (setter, list, item) =>
    setter(
      list.includes(item) ? list.filter((x) => x !== item) : [...list, item],
    );
  const open = (title, text) => setDialog({ title, text });
  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <button className={styles.brand} onClick={() => setDialog(null)}>
          취업 대시보드
        </button>
        <div className={styles.tabs} aria-label="주요 메뉴">
          {["종합 현황", "공고·이력서 분석", "지원 관리", "면접 준비"].map(
            (tab, i) => (
              <button
                key={tab}
                className={i === 0 ? styles.activeTab : ""}
                onClick={() =>
                  i === 1 ? navigate("/ChatApp") : i === 2 ? navigate("/file") : i
                    ? open(
                        tab,
                        "이 화면은 디자인 미리보기입니다. 해당 기능은 아직 연결되지 않았습니다.",
                      )
                    : setDialog(null)
                }
              >
                {tab}
              </button>
            ),
          )}
        </div>
        <div className={styles.accountArea}>
          <button
            className={styles.iconButton}
            aria-label="알림"
            onClick={() => open("알림", "새로운 알림이 없습니다.")}
          >
            <Bell />
            <span className={styles.dot} />
          </button>
          <button
            className={styles.profile}
            aria-expanded={account}
            onClick={() => setAccount(!account)}
          >
            <span className={styles.avatar}>
              <UserRound />
            </span>
            <span>{name}</span>
            <ChevronDown size={16} />
          </button>
          {account && (
            <div className={styles.accountMenu}>
              <button onClick={() => navigate("/settings")}>계정 설정</button>
              <button onClick={() => navigate("/ChatApp")}>공고·이력서 분석</button>
              <button onClick={() => navigate("/file")}>파일</button>
              <button onClick={() => navigate("/sendEmail")}>이메일</button>
              <button
                onClick={() => {
                  sessionStorage.clear();
                  navigate("/login");
                }}
              >
                로그아웃
              </button>
            </div>
          )}
        </div>
      </header>
      <main className={styles.content}>
        <section className={styles.heading}>
          <div>
            <h1>지원의 흐름을 한눈에</h1>
            <p>오늘의 준비가 다음 기회로 이어집니다.</p>
          </div>
          <button
            className={styles.primary}
            onClick={() => setDialog({ title: "공고 추가", add: true })}
          >
            <Plus />
            공고 추가
          </button>
        </section>
        <section className={styles.stats} aria-label="지원 현황 예시">
          {stats.map(([label, number, Icon, tone], i) => (
            <button
              className={styles.stat}
              key={label}
              onClick={() =>
                open(
                  label,
                  "예시 데이터입니다. 실제 지원 현황 연동은 준비 중입니다.",
                )
              }
            >
              <span className={`${styles.statIcon} ${styles[tone]}`}>
                <Icon />
              </span>
              <span className={styles.statText}>
                <span>{label}</span>
                <strong>{number + (i === 0 ? added.length : 0)}</strong>
              </span>
              <ChevronRight className={styles.chevron} />
            </button>
          ))}
        </section>
        <div className={styles.grid}>
          <section className={styles.card}>
            <div className={styles.cardTitle}>
              <h2>주간 지원 활동</h2>
              <select
                aria-label="활동 조회 기간"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                <option>이번 주</option>
                <option>지난 주</option>
              </select>
            </div>
            <div
              className={styles.chart}
              role="img"
              aria-label={`${period} 지원 수 예시: ${values.join(", ")}`}
            >
              <span className={styles.axisTitle}>지원 수</span>
              <div className={styles.ticks}>
                {[8, 6, 4, 2, 0].map((n) => (
                  <span key={n}>{n}</span>
                ))}
              </div>
              <div className={styles.plot}>
                {values.map((v, i) => (
                  <div className={styles.barColumn} key={i}>
                    <div
                      className={styles.bar}
                      style={{ height: `${(v / 8) * 100}%` }}
                    >
                      <span>{v}</span>
                    </div>
                    <span className={styles.day}>{"월화수목금토일"[i]}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
          <section className={styles.card}>
            <div className={styles.cardTitle}>
              <h2>오늘 할 일</h2>
              <span className={styles.date}>
                {new Date().toLocaleDateString("ko-KR", {
                  month: "long",
                  day: "numeric",
                  weekday: "short",
                })}
              </span>
            </div>
            <div className={styles.todos}>
              {todos.map(([title, desc], i) => (
                <label
                  className={`${styles.todo} ${done.includes(i) ? styles.completed : ""}`}
                  key={title}
                >
                  <input
                    type="checkbox"
                    checked={done.includes(i)}
                    onChange={() => toggle(setDone, done, i)}
                  />
                  <span>
                    <strong>{title}</strong>
                    <small>{desc}</small>
                  </span>
                </label>
              ))}
            </div>
          </section>
          <section className={styles.card}>
            <div className={styles.cardTitle}>
              <h2>추천 공고</h2>
              <button
                className={styles.textButton}
                onClick={() =>
                  open(
                    "추천 공고",
                    "현재 표시된 공고는 디자인을 위한 가상 기업의 예시입니다.",
                  )
                }
              >
                더보기 <ChevronRight size={16} />
              </button>
            </div>
            {[...jobs, ...added].map((job, i) => (
              <article className={styles.job} key={i}>
                <div
                  className={`${styles.companyLogo} ${i === 1 ? styles.darkLogo : ""}`}
                >
                  {job.logo}
                </div>
                <div className={styles.jobBody}>
                  <h3>
                    {job.company} · {job.role}
                  </h3>
                  <p>{job.desc}</p>
                  <div className={styles.tags}>
                    {job.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
                <div className={styles.jobMeta}>
                  <span>
                    <MapPin />
                    {job.location}
                  </span>
                  <span>
                    <BriefcaseBusiness />
                    {job.career}
                  </span>
                </div>
                <button
                  className={`${styles.bookmark} ${saved.includes(i) ? styles.saved : ""}`}
                  aria-label={`${job.company} 공고 저장`}
                  aria-pressed={saved.includes(i)}
                  onClick={() => toggle(setSaved, saved, i)}
                >
                  <Bookmark />
                </button>
              </article>
            ))}
          </section>
          <section className={`${styles.card} ${styles.guide}`}>
            <div className={styles.guideLabel}>
              <Sparkles />
              AI 준비 가이드
            </div>
            <div className={styles.guideContent}>
              <div>
                <h2>프로젝트 성과를 수치로 보완해 보세요.</h2>
                <p>
                  구체적인 수치는 경험을 더 명확하고
                  <br />
                  신뢰감 있게 전달할 수 있습니다.
                  <br />
                  예를 들어, 사용자 수, 성능 개선률, 처리 시간 등을
                  <br />
                  활용해 보세요.
                </p>
                <button
                  className={styles.outline}
                  onClick={() =>
                    open(
                      "프로젝트 경험 작성 가이드",
                      "문제 → 맡은 역할 → 해결 과정 → 결과 순서로 작성해 보세요. 직접 측정한 처리 시간이나 사용자 수를 근거와 함께 적으면 좋습니다. 이 안내는 예시이며 AI 분석 결과가 아닙니다.",
                    )
                  }
                >
                  자세히 보기 <ArrowRight size={18} />
                </button>
              </div>
              <div className={styles.illustration} aria-hidden="true">
                <span>AI</span>
                <ChartNoAxesCombined />
              </div>
            </div>
          </section>
        </div>
        <p className={styles.demoNote}>
          디자인 미리보기 · 통계와 추천 공고는 예시 데이터이며, 추가·체크·저장은
          현재 화면에서만 유지됩니다.
        </p>
      </main>
      {dialog && (
        <div
          className={styles.overlay}
          onClick={() => setDialog(null)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setDialog(null);
          }}
        >
          <section
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dashboard-dialog-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.cardTitle}>
              <h2 id="dashboard-dialog-title">{dialog.title}</h2>
              <button
                autoFocus
                className={styles.iconButton}
                aria-label="닫기"
                onClick={() => setDialog(null)}
              >
                <X />
              </button>
            </div>
            {dialog.add ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setAdded([
                    ...added,
                    {
                      company: company.trim(),
                      role: role.trim(),
                      logo: company.trim().slice(0, 1),
                      desc: "직접 추가한 관심 공고",
                      location: "지역 미입력",
                      career: "경력 미입력",
                      tags: ["관심 공고"],
                    },
                  ]);
                  setCompany("");
                  setRole("");
                  setDialog(null);
                }}
              >
                <label>
                  기업명
                  <input
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </label>
                <label>
                  직무
                  <input
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  />
                </label>
                <button
                  className={styles.primary}
                  disabled={!company.trim() || !role.trim()}
                >
                  추가하기
                </button>
              </form>
            ) : (
              <p>{dialog.text}</p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
