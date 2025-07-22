import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./App.module.css";
import api from "./util/api.js"; // API 호출을 위한 axios 인스턴스

function LoginPage() {
  const navigate = useNavigate();
  const [ID, setId] = useState("");
  const [PW, setPw] = useState("");
  const [PWvalid, setPWvalid] = useState(false);
  const [notAllow, setNotAllow] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const goToid = () => navigate("/id");
  const goToPassword = () => navigate("/password");
  const goToMembership = () => navigate("/membership");

  useEffect(() => {
    console.log("✅ sessionStorage userId:", sessionStorage.getItem("userId"));
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
    try {
      const response = await api.post(
        "/api/auth/login",
        {
          username: ID,
          password: PW,
        },
        { withCredentials: true }
      );
  
      const { accessToken, username, name } = response.data;
  
      sessionStorage.setItem("username", username);
      sessionStorage.setItem("name", name);
      sessionStorage.setItem("userToken", accessToken);
  
      navigate("/main");
    } catch (error) {
      if (error.response && error.response.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("로그인 중 오류가 발생했습니다.");
      }
    }
  };
  return (
    <div className={styles.App}>
      <header className={styles["App-header"]}>
        <div className={styles.login}>
          <div className={styles.loginform}>
            <div className={styles.logo}></div>
            <h1 className={styles.text}>LOGIN</h1>
            <div className={styles.loginbox}>
              <input
                className={styles.id}
                type="text"
                placeholder="ID"
                value={ID}
                onChange={HandleID}
              />
              <input
                className={styles.pw}
                type="password"
                placeholder="Password"
                value={PW}
                onChange={HandlePW}
                onKeyDown={handleKeyDown}
              />
            </div>
            {errorMessage && (
              <p className={styles["error-message"]}>{errorMessage}</p>
            )}
            <button
              className={styles.linkpage}
              onClick={loginButton}
              disabled={!PWvalid || notAllow}
            >
              <span>Login</span>
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
