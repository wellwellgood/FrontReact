import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  Check,
  CircleCheck,
  FileText,
  BriefcaseBusiness,
  ChartNoAxesColumnIncreasing,
  Settings,
  MapPin,
  ExternalLink,
  TriangleAlert,
  CircleHelp,
  Sparkles,
  ArrowRight,
  X,
} from "lucide-react";
import styles from "./section2.module.css";

const requirements = [
  {
    title: "React",
    status: "충족",
    tone: "green",
    icon: CircleCheck,
    text: "프로젝트 2건에서 사용한 경험이 확인돼요.",
  },
  {
    title: "TypeScript",
    status: "보완 필요",
    tone: "yellow",
    icon: TriangleAlert,
    text: "이력서에서 경험을 확인하기 어려워요.\n관련 프로젝트나 학습 경험을 추가해 보세요.",
  },
  {
    title: "REST API",
    status: "충족",
    tone: "green",
    icon: CircleCheck,
    text: "여러 프로젝트에서 API 연동 경험이 확인돼요.",
  },
  {
    title: "테스트 경험",
    status: "확인 필요",
    tone: "gray",
    icon: CircleHelp,
    text: "자동화 테스트 또는 단위 테스트 경험이 명확히 보이지 않아요.\n관련 경험이 있다면 구체적으로 작성해 보세요.",
  },
];
const initialJob = {
  company: "루미랩",
  role: "프론트엔드 개발자",
  location: "서울 강남구",
  description:
    "사용자 중심의 웹 서비스 개발 및 유지보수\n다양한 팀과 협업하여 제품 개선\n새로운 기술을 도입하고 서비스 품질 향상에 기여",
  requirements:
    "React 관련 실무 경험\nTypeScript 사용 경험\nREST API 연동 경험\n팀원과의 협업 경험",
  url: "",
};

export default function Section2() {
  const navigate = useNavigate();
  const input = useRef(null);
  const modal = useRef(null);
  const [dialog, setDialog] = useState({ title: "", text: "" });
  const [profileOpen, setProfileOpen] = useState(false);
  const [resume, setResume] = useState(null);
  const [fileError, setFileError] = useState("");
  const [job, setJob] = useState(initialJob);
  const [draft, setDraft] = useState(initialJob);
  const [changed, setChanged] = useState(false);
  const [collapsed, setCollapsed] = useState([]);
  const [urlError, setUrlError] = useState("");
  const name =
    sessionStorage.getItem("name") ||
    sessionStorage.getItem("username") ||
    "사용자";
  const showDialog = (title, text, edit = false) => {
    setDialog({ title, text, edit });
    setDraft(job);
    setUrlError("");
    modal.current.showModal();
  };
  const selectResume = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/\.(pdf|docx)$/i.test(file.name) || file.size > 10 * 1024 * 1024) {
      setFileError("10MB 이하의 PDF 또는 DOCX 파일을 선택해 주세요.");
      e.target.value = "";
      return;
    }
    setFileError("");
    setResume({ name: file.name, date: new Date().toLocaleString("ko-KR") });
    setChanged(true);
    e.target.value = "";
  };
  const saveJob = (e) => {
    e.preventDefault();
    if (draft.url.trim()) {
      try {
        if (!["http:", "https:"].includes(new URL(draft.url.trim()).protocol))
          throw new Error();
      } catch {
        setUrlError("http 또는 https로 시작하는 올바른 주소를 입력해 주세요.");
        return;
      }
    }
    setJob({
      ...draft,
      company: draft.company.trim(),
      role: draft.role.trim(),
      url: draft.url.trim(),
    });
    setChanged(true);
    modal.current.close();
  };
  const bullets = (text) =>
    text
      .split("\n")
      .filter(Boolean)
      .map((line, i) => (
        <p className={styles.bullet} key={i}>
          • {line}
        </p>
      ));
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.brand} onClick={() => navigate("/main")}>
          취업 대시보드
        </button>
        <div className={styles.tabs} aria-label="주요 메뉴">
          {["종합 현황", "공고·이력서 분석", "지원 관리", "면접 준비"].map(
            (tab, i) => (
              <button
                key={tab}
                aria-current={i === 1 ? "page" : undefined}
                className={i === 1 ? styles.active : ""}
                onClick={() =>
                  i === 0
                    ? navigate("/main")
                    : i > 1 &&
                      showDialog(tab, "해당 화면은 아직 연결되지 않았습니다.")
                }
              >
                {tab}
              </button>
            ),
          )}
        </div>
        <div className={styles.account}>
          <button
            className={styles.iconButton}
            aria-label="알림"
            onClick={() => showDialog("알림", "새로운 알림이 없습니다.")}
          >
            <Bell />
            <i />
          </button>
          <button
            className={styles.profile}
            aria-expanded={profileOpen}
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <span className={styles.avatar}>{name.slice(0, 1)}</span>
            {name}
            <ChevronDown />
          </button>
          {profileOpen && (
            <div className={styles.menu}>
              <button onClick={() => navigate("/settings")}>계정 설정</button>
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
        <section className={styles.hero}>
          <div>
            <span className={styles.badge}>
              <CircleCheck />
              {changed ? "분석 대기" : "분석 예시"}
            </span>
            <h1>내 경험과 공고를 연결하세요</h1>
            <p>
              이력서와 채용공고를 분석하여, 강점은 더 부각하고 부족한 부분은
              채워보세요.
            </p>
          </div>
          <aside>
            더 나은 기회를 향한
            <br />
            당신의 도전을 응원합니다.
            <span />
          </aside>
        </section>
        <div className={styles.columns}>
          <section className={styles.card}>
            <div className={styles.cardHeading}>
              <FileText />
              <div>
                <h2>내 이력서</h2>
                <p>지금의 이력서로 분석을 진행해요.</p>
              </div>
            </div>
            <div className={styles.upload}>
              <div className={styles.fileIcon}>
                <FileText />
              </div>
              <strong>{resume?.name || "김지원_이력서.pdf"}</strong>
              <span>
                {resume
                  ? `선택일 ${resume.date}`
                  : "예시 이력서 · 2026. 09. 18. 14:32"}
              </span>
              <button
                className={styles.outline}
                onClick={() => input.current.click()}
              >
                이력서 변경
              </button>
              <input
                ref={input}
                type="file"
                accept=".pdf,.docx"
                onChange={selectResume}
                hidden
              />
              <small>PDF, DOCX · 최대 10MB</small>
            </div>
            {fileError && (
              <p className={styles.error} role="alert">
                {fileError}
              </p>
            )}
            <div className={styles.skills}>
              <h3>
                <Settings />
                주요 스킬 {changed && <small>예시</small>}
              </h3>
              <div>
                {["React", "JavaScript", "CSS", "Git"].map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
            </div>
          </section>
          <section className={styles.card}>
            <div className={styles.cardHeading}>
              <BriefcaseBusiness />
              <div>
                <h2>채용공고</h2>
                <p>선택한 공고와 이력서를 비교해요.</p>
              </div>
              {job.url ? (
                <a
                  className={styles.external}
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  새 창에서 보기 <ExternalLink />
                </a>
              ) : (
                <button
                  className={styles.external}
                  onClick={() =>
                    showDialog(
                      "공고 링크",
                      "현재는 예시 공고입니다. 공고 변경에서 실제 주소를 입력하면 새 창에서 열 수 있어요.",
                    )
                  }
                >
                  새 창에서 보기 <ExternalLink />
                </button>
              )}
            </div>
            <div className={styles.company}>
              <span>{job.company.slice(0, 1)}</span>
              <div>
                <strong>{job.company}</strong>
                <p>일상을 더 빛나게, 함께 만드는 기술</p>
              </div>
            </div>
            <h2 className={styles.jobTitle}>{job.role}</h2>
            <div className={styles.chips}>
              <span>정규직</span>
              <span>경력 무관</span>
              <span>
                <MapPin />
                {job.location || "지역 미입력"}
              </span>
            </div>
            <div className={styles.jobSection}>
              <h3>주요 업무</h3>
              {bullets(job.description)}
            </div>
            <div className={styles.jobSection}>
              <h3>필수 요건</h3>
              {bullets(job.requirements)}
            </div>
            <button
              className={`${styles.outline} ${styles.changeJob}`}
              onClick={() => showDialog("채용공고 변경", "", true)}
            >
              공고 변경
            </button>
          </section>
          <section className={styles.card}>
            <div className={styles.cardHeading}>
              <ChartNoAxesColumnIncreasing />
              <div>
                <h2>요건별 분석</h2>
                <p>
                  {changed
                    ? "자료가 변경됐어요. 실제 AI 분석은 아직 연결되지 않았습니다."
                    : "공고의 주요 요건과 내 이력서를 비교한 예시예요."}
                </p>
              </div>
            </div>
            <div className={styles.results}>
              {requirements.map((item, i) => {
                const Icon = changed ? CircleHelp : item.icon;
                const tone = changed ? "gray" : item.tone;
                return (
                  <div className={styles.result} key={item.title}>
                    <button
                      className={styles.resultHeader}
                      aria-expanded={!collapsed.includes(i)}
                      aria-controls={`requirement-${i}`}
                      onClick={() =>
                        setCollapsed(
                          collapsed.includes(i)
                            ? collapsed.filter((n) => n !== i)
                            : [...collapsed, i],
                        )
                      }
                    >
                      <strong>{item.title}</strong>
                      <span className={`${styles.status} ${styles[tone]}`}>
                        <Icon />
                        {changed ? "분석 대기" : item.status}
                      </span>
                      <ChevronDown
                        className={collapsed.includes(i) ? styles.rotated : ""}
                      />
                    </button>
                    {!collapsed.includes(i) && (
                      <p
                        id={`requirement-${i}`}
                        className={`${styles.explanation} ${styles[tone]}`}
                      >
                        {changed
                          ? "선택한 자료의 내용을 아직 분석하지 않았습니다."
                          : item.text}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
        <section className={styles.guide}>
          <div className={styles.guideTitle}>
            <Sparkles />
            <div>
              <h2>AI 이력서 개선 제안</h2>
              <p>분석 결과를 바탕으로, 이런 내용을 추가해 보세요.</p>
            </div>
          </div>
          <div className={styles.tip}>
            <span>1</span>
            <div>
              <strong>프로젝트에서 맡은 역할을 구체적으로 적어보세요.</strong>
              <p>
                사용한 기술, 해결한 문제, 본인의 기여도를 함께 적으면 좋아요.
              </p>
            </div>
          </div>
          <div className={styles.tip}>
            <span>2</span>
            <div>
              <strong>성능 개선 전후의 수치를 추가해 보세요.</strong>
              <p>구체적인 지표는 기술 역량을 더 효과적으로 보여줘요.</p>
            </div>
          </div>
          <button
            className={styles.primary}
            onClick={() =>
              showDialog(
                "이력서 수정 초안 예시",
                "React 기반 [프로젝트명]에서 [담당 기능]을 개발했습니다. [문제]를 해결하기 위해 [구체적인 행동]을 수행했고, [측정한 지표]를 [개선 전]에서 [개선 후]로 개선했습니다. 실제 경험과 확인 가능한 수치로 채워주세요.\n\n이 내용은 작성 예시이며 업로드한 이력서의 AI 분석 결과가 아닙니다.",
              )
            }
          >
            수정 초안 보기 <ArrowRight />
          </button>
        </section>
        <p className={styles.notice}>
          디자인 미리보기 · 공고와 분석 결과는 예시입니다. 선택한 파일은 서버로
          전송되지 않으며, 변경 사항은 이 화면에서만 유지됩니다.
        </p>
      </main>
      <dialog
        ref={modal}
        className={styles.dialog}
        onClick={(e) => {
          if (e.target === e.currentTarget) modal.current.close();
        }}
      >
        <div className={styles.dialogHeader}>
          <h2>{dialog.title}</h2>
          <button
            className={styles.iconButton}
            aria-label="닫기"
            onClick={() => modal.current.close()}
          >
            <X />
          </button>
        </div>
        {dialog.edit ? (
          <form onSubmit={saveJob}>
            {[
              ["company", "기업명"],
              ["role", "직무"],
              ["location", "지역"],
              ["url", "공고 주소 (선택)"],
            ].map(([key, label]) => (
              <label key={key}>
                {label}
                <input
                  required={key === "company" || key === "role"}
                  value={draft[key]}
                  onChange={(e) =>
                    setDraft({ ...draft, [key]: e.target.value })
                  }
                />
              </label>
            ))}
            {[
              ["description", "주요 업무"],
              ["requirements", "필수 요건"],
            ].map(([key, label]) => (
              <label key={key}>
                {label}
                <textarea
                  rows={3}
                  value={draft[key]}
                  onChange={(e) =>
                    setDraft({ ...draft, [key]: e.target.value })
                  }
                />
              </label>
            ))}
            {urlError && (
              <p className={styles.error} role="alert">
                {urlError}
              </p>
            )}
            <button
              className={styles.primary}
              disabled={!draft.company.trim() || !draft.role.trim()}
            >
              저장하기 <Check />
            </button>
          </form>
        ) : (
          <p className={styles.dialogText}>{dialog.text}</p>
        )}
      </dialog>
    </div>
  );
}
