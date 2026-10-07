import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import styles from "./App.module.css";
import api from "./util/api.js"; // API 호출을 위한 axios 인스턴스

function LoginPage() {
  const navigate = useNavigate();
  const [ID, setId] = useState("");
  const [PW, setPw] = useState("");
  const [PWvalid, setPWvalid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [notAllow, setNotAllow] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  const goToid = () => navigate("/id");
  const goToPassword = () => navigate("/password");
  const goToMembership = () => navigate("/membership");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.clear();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const HandleID = (e) => {
    const value = e.target.value;
    setId(value);
    const regex = /^[A-Za-z0-9]+$/;
    setNotAllow(!regex.test(value));
  };

  const HandlePW = (e) => {
    const value = e.target.value;
    setPw(value);
    const regex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,20}$/;
    setPWvalid(regex.test(value));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      loginButton();
    }
  };

  const loginButton = async () => {
    if (isSubmitting) return;
    setErrorMessage("");
    setIsSubmitting(true);
    try {
      const response = await api.post(
        "/auth/login",
        {
          username: ID,
          password: PW,
        },
        { withCredentials: true }
      );
  
      const { accessToken, username, name } = response.data;
  
      sessionStorage.setItem("username", username);
      localStorage.setItem("username", username);
      sessionStorage.setItem("name", name);
      sessionStorage.setItem("userToken", accessToken);
  
      navigate("/dashboard");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "로그인 서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요."
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className={styles.App}>
      <header className={styles["App-header"]}>
        <div className={styles.login}>
          <div className={styles.logintext}><h1>Hello,</h1><h2>Every one</h2></div>
          <div className={styles.loginform}>
            <h1 className={styles.text}>LOGIN</h1>
            <div className={styles.loginbox}>
              <input
                className={styles.id}
                type="text"
                placeholder="ID"
                value={ID}
                onChange={HandleID}
                autoComplete="username"
                autoCapitalize="none"
                spellCheck="false"
              />
              <div className={styles.passwordField}>
                <input
                  className={styles.pw}
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={PW}
                  onChange={HandlePW}
                  onKeyDown={handleKeyDown}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 표시"}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((visible) => !visible)}
                >
                  {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                </button>
              </div>
            </div>
            {errorMessage && (
              <p className={styles["error-message"]}>{errorMessage}</p>
            )}
            <button
              className={styles.linkpage}
              onClick={loginButton}
              disabled={!PWvalid || notAllow || isSubmitting}
            >
              <span>{isSubmitting ? "로그인 중..." : "Login"}</span>
            </button>
            <div className={styles.findbox}>
              <button className={styles.findbtn} onClick={goToid}>
                아이디 찾기
              </button>
              <button className={styles.findbtn} onClick={goToPassword}>
                비밀번호 찾기
              </button>
              <button className={styles.findbtn} onClick={goToMembership}>
                회원가입
              </button>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

export default LoginPage;
