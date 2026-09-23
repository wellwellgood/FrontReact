import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  Mic,
  Sparkles,
  X,
} from "lucide-react";
import styles from "./InterviewPreparation.module.css";
import AccountMenu from "../account/AccountMenu.jsx";
import api from "../../util/api.js";

const questions = [
  {
    title: "프로젝트에서 어떤 역할을 맡았나요?",
    type: "경험",
    hint: "프로젝트에서 맡은 역할과 기여한 부분을 구체적으로 설명해 보세요.",
  },
  {
    title: "React 상태 관리를 어떻게 했나요?",
    type: "기술",
    hint: "사용한 상태 관리 방식과 선택 이유를 사례와 함께 설명해 보세요.",
  },
  {
    title: "API 오류를 어떻게 처리했나요?",
    type: "기술",
    hint: "오류를 발견하고 사용자에게 안내한 방식을 설명해 보세요.",
  },
  {
    title: "협업 중 갈등을 해결한 경험은?",
    type: "경험",
    hint: "상황, 본인의 행동, 그리고 결과를 순서대로 적어 보세요.",
  },
  {
    title: "성능을 개선한 경험이 있나요?",
    type: "경험",
    hint: "개선 전후의 지표와 직접 수행한 작업을 포함해 보세요.",
  },
];
const demoJob = { id: "demo", company: "루미랩", role: "프론트엔드 개발자" };
const storageKey = "interview-practice-answers-v1";

export default function InterviewPreparation() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("전체");
  const [selected, setSelected] = useState(0);
  const [answers, setAnswers] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey)) || {};
    } catch {
      return {};
    }
  });
  const [jobs, setJobs] = useState([demoJob]);
  const [jobId, setJobId] = useState("demo");
  const [feedback, setFeedback] = useState(null);
  const [notice, setNotice] = useState("");
  const recognition = useRef(null);
  const job = jobs.find((item) => item.id === jobId) || jobs[0];
  const answerKey = `${jobId}:${selected}`;
  const answer = answers[answerKey] || "";
  const question = questions[selected];
  const visible = questions
    .map((item, index) => ({ ...item, index }))
    .filter((item) => filter === "전체" || item.type === filter);
  const checks = [
    [
      "상황",
      /프로젝트|문제|상황|서비스|팀/.test(answer),
      "프로젝트의 배경과 상황을 설명했는가?",
    ],
    [
      "역할",
      /역할|담당|맡|저는|제가/.test(answer),
      "본인이 맡은 역할을 명확히 밝혔는가?",
    ],
    [
      "행동",
      /개발|구현|설계|개선|해결|적용/.test(answer),
      "어떤 방식으로 문제를 해결했는가?",
    ],
    [
      "결과",
      /결과|성과|향상|감소|증가|완료|%/.test(answer),
      "구체적인 성과나 결과를 제시했는가?",
    ],
  ];

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(answers));
  }, [answers]);
  useEffect(() => {
    let active = true;
    api
      .get("/careerjet/jobs", {
        params: { keyword: "개발자", pageSize: 30, sort: "date" },
      })
      .then(({ data }) => {
        if (active && Array.isArray(data.jobs) && data.jobs.length) {
          const nextJobs = data.jobs.filter((item) => item.id && item.company && item.role);
          if (nextJobs.length) {
            setJobs(nextJobs);
            setJobId(String(nextJobs[0].id));
          }
        } else if (active && data.configured === false) {
          setNotice("Careerjet 인증키가 없어 예시 공고를 표시합니다.");
        }
      })
      .catch(() => {
        if (active)
          setNotice("채용공고를 불러오지 못해 예시 공고를 표시합니다.");
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => () => recognition.current?.stop(), []);

  const updateAnswer = (value) => {
    setAnswers((current) => ({ ...current, [answerKey]: value }));
    setFeedback(null);
  };
  const getFeedback = () => {
    if (!answer.trim()) {
      setNotice("답변을 입력한 뒤 피드백을 받아보세요.");
      return;
    }
    setNotice("");
    const completed = checks.filter(([, done]) => done).map(([label]) => label);
    const missing = checks.filter(([, done]) => !done).map(([label]) => label);
    setFeedback({
      good: completed.length
        ? `${completed.join("·")} 요소가 답변에 담겨 있어요.`
        : "면접 질문에 맞춰 답변을 시작했어요.",
      improve: missing.length
        ? `${missing.join("·")} 부분을 더 구체적으로 적어 보세요.`
        : "수치나 구체적인 사례를 더하면 설득력이 높아져요.",
    });
  };
  const startVoice = () => {
    const Recognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      setNotice("이 브라우저는 음성 입력을 지원하지 않습니다.");
      return;
    }
    recognition.current?.stop();
    const instance = new Recognition();
    recognition.current = instance;
    instance.lang = "ko-KR";
    instance.onresult = (event) =>
      updateAnswer(
        `${answer}${answer ? " " : ""}${event.results[0][0].transcript}`.slice(
          0,
          2000,
        ),
      );
    instance.onerror = () =>
      setNotice("음성 입력을 사용할 수 없습니다. 마이크 권한을 확인해 주세요.");
    instance.start();
    setNotice("음성 입력을 듣고 있습니다.");
  };

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <button type="button" className={styles.brand} onClick={() => navigate("/main")}>
          취업 대시보드
        </button>
        <nav className={styles.tabs} aria-label="주요 메뉴">
          {["종합 현황", "공고·이력서 분석", "지원 관리", "면접 준비"].map(
            (tab, index) => (
              <button
                key={tab}
                className={index === 3 ? styles.activeTab : ""}
                aria-current={index === 3 ? "page" : undefined}
                onClick={() =>
                  navigate(["/main", "/ChatApp", "/file", "/sendEmail"][index])
                }
              >
                {tab}
              </button>
            ),
          )}
        </nav>
        <AccountMenu />
      </header>
      <main className={styles.main}>
        <div className={styles.intro}>
          <div>
            <h1>내 경험으로 답하는 면접 연습</h1>
            <p>
              지원한 기업과 직무에 맞춘 예상 질문으로, 더 자신 있는 면접을
              준비하세요.
            </p>
          </div>
          <label className={styles.jobSelect}>
            <Building2 size={23} />
            <span className={styles.srOnly}>연습할 채용공고</span>
            <select
              value={jobId}
              onChange={(event) => {
                setJobId(event.target.value);
                setFeedback(null);
              }}
            >
              {jobs.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.company} · {item.role}
                </option>
              ))}
            </select>
            <ChevronDown size={19} />
          </label>
        </div>
        <div className={styles.grid}>
          <section
            className={`${styles.panel} ${styles.questions}`}
            aria-label="예상 질문"
          >
            <h2>예상 질문</h2>
            <p className={styles.subtitle}>
              이 기업과 직무에 맞춘 예상 질문입니다.
            </p>
            <div className={styles.filters}>
              {["전체", "기술", "경험"].map((item) => (
                <button
                  key={item}
                  className={filter === item ? styles.selectedFilter : ""}
                  onClick={() => setFilter(item)}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className={styles.questionList}>
              {visible.map((item) => (
                <button
                  key={item.index}
                  className={
                    selected === item.index ? styles.selectedQuestion : ""
                  }
                  onClick={() => {
                    setSelected(item.index);
                    setFeedback(null);
                    setNotice("");
                  }}
                >
                  <span>{item.index + 1}</span>
                  <span>{item.title}</span>
                </button>
              ))}
            </div>
          </section>
          <section
            className={`${styles.panel} ${styles.answerPanel}`}
            aria-label="면접 답변"
          >
            <div className={styles.questionMeta}>
              <span>
                질문 {selected + 1} / {questions.length}
              </span>
              <span className={styles.typeBadge}>{question.type} 질문</span>
            </div>
            <h2>{question.title}</h2>
            <p className={styles.answerHint}>{question.hint}</p>
            <div className={styles.answerBox}>
              <label className={styles.srOnly} htmlFor="interview-answer">
                면접 답변
              </label>
              <textarea
                id="interview-answer"
                value={answer}
                maxLength={2000}
                onChange={(event) => updateAnswer(event.target.value)}
                placeholder="여기에 답변을 입력해 주세요. 상황, 역할, 행동, 결과 순서로 적으면 좋아요."
              />
              <span>{answer.length.toLocaleString()} / 2,000</span>
            </div>
            <div className={styles.actions}>
              <button className={styles.voiceButton} onClick={startVoice}>
                <Mic size={20} />
                음성으로 답변
              </button>
              <button className={styles.feedbackButton} onClick={getFeedback}>
                <Sparkles size={20} />
                피드백 받기
              </button>
            </div>
          </section>
          <section
            className={`${styles.panel} ${styles.feedbackPanel}`}
            aria-label="답변 피드백"
          >
            <h2>AI 피드백</h2>
            <p className={styles.subtitle}>
              입력한 답변을 바탕으로 답변 구성을 확인해요.
            </p>
            <div className={`${styles.tip} ${styles.good}`}>
              <CheckCircle2 size={25} />
              <div>
                <strong>잘한 점</strong>
                <p>
                  {feedback?.good ||
                    "답변을 작성하면 잘한 점을 확인할 수 있어요."}
                </p>
              </div>
            </div>
            <div className={`${styles.tip} ${styles.improve}`}>
              <span className={styles.exclamation}>!</span>
              <div>
                <strong>보완할 점</strong>
                <p>
                  {feedback?.improve ||
                    "답변을 작성하면 보완할 점을 확인할 수 있어요."}
                </p>
              </div>
            </div>
            <div className={styles.structure}>
              <h3>답변 구성</h3>
              <p>좋은 답변은 다음과 같은 구조로 이루어져요.</p>
              {checks.map(([label, done, hint]) => (
                <div className={styles.checkRow} key={label}>
                  <span className={done ? styles.checked : styles.unchecked}>
                    {done && <Check size={15} />}
                  </span>
                  <strong>{label}</strong>
                  <span>{hint}</span>
                </div>
              ))}
            </div>
            <p className={styles.sampleNote}>
              현재 피드백은 답변의 표현을 확인하는 예시 기능입니다.
            </p>
          </section>
        </div>
      </main>
      {notice && (
        <div className={styles.notice} role="status">
          {notice}
          <button aria-label="닫기" onClick={() => setNotice("")}>
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
