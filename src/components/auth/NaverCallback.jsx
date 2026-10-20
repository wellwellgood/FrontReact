import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../util/api.js";
import styles from "../../App.module.css";

export default function NaverCallback() {
  const started = useRef(false);
  const navigate = useNavigate();
  const [message, setMessage] = useState("네이버 로그인을 완료하고 있습니다…");

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const params = new URLSearchParams(window.location.search);
    const state = params.get("state");
    const code = params.get("code");
    const expectedState = sessionStorage.getItem("naver-oauth-state");
    sessionStorage.removeItem("naver-oauth-state");
    window.history.replaceState({}, "", window.location.pathname);

    if (params.get("error")) {
      setMessage("네이버 로그인이 취소되었습니다.");
      return;
    }
    if (!state || state !== expectedState || !code) {
      setMessage("로그인 요청이 만료되었습니다. 로그인 화면에서 다시 시도해 주세요.");
      return;
    }

    api
      .post("/auth/naver/callback", { state, code })
      .then(({ data }) => {
        sessionStorage.setItem("username", data.username);
        localStorage.setItem("username", data.username);
        sessionStorage.setItem("name", data.name);
        sessionStorage.setItem("userToken", data.accessToken);
        navigate("/dashboard", { replace: true });
      })
      .catch((error) => {
        setMessage(
          error.response?.data?.message ||
            "네이버 로그인을 완료하지 못했습니다.",
        );
      });
  }, [navigate]);

  return (
    <main className={styles.App}>
      <section className={styles.login}>
        <div className={styles.loginform}>
          <h1 className={styles.text}>네이버 로그인</h1>
          <p role="status">{message}</p>
          <Link to="/login">로그인 화면으로 돌아가기</Link>
        </div>
      </section>
    </main>
  );
}
