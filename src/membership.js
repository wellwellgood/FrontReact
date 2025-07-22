import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./membership.module.css";
import { useNavigate } from "react-router-dom";

const Membership = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    name: "",
    password: "",
    confirmPassword: "",
    phone1: "",
    phone2: "",
    phone3: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [username, setUsername] = useState("");
  const [isAvailable, setIsAvailable] = useState(null);
  const [checkMessage, setCheckMessage] = useState("");

  const showMessage = (message) => {
    console.error(message);
    setErrorMessage(message);
  };

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const UserIDcheck = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API}/api/auth/check-username`,{
          params: { username: formData.username }
        }
        
      );
      if (res.data.available) {
        setIsAvailable(true);
        setCheckMessage("사용 가능한 아이디입니다.");
      } else {
        setIsAvailable(false);
        setCheckMessage("이미 사용중인 아이디입니다.");
      }
    } catch (err) {
      console.error("❌ 아이디 중복 확인 오류:", err);
      setIsAvailable(false);
      setCheckMessage("오류 발생");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return showMessage("비밀번호가 일치하지 않습니다.");
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API}/api/auth/register`,
        {
          username: formData.username,
          name: formData.name,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          phone: `${formData.phone1}-${formData.phone2}-${formData.phone3}`
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true
        }
      );

      console.log("✅ 서버 응답:", res.data);

      if (res.data?.message === "회원가입 성공") {
        alert("🎉 회원가입이 완료되었습니다!");
        navigate("/main");
      } else {
        showMessage(res.data?.message || "회원가입 실패");
      }
    } catch (error) {
      console.error("❌ 회원가입 오류:", error);
      showMessage("서버 오류: " + (error?.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.findID}>
      <form className={styles.IDform} onSubmit={handleSubmit}>
        <div className={styles.IDarea}>
          <h1>회원가입</h1>
          {errorMessage && (
            <div className={styles.errorMsg}>{errorMessage}</div>
          )}

          <div className={styles.IDGroup}>
            <input 
              type="text"
              name="username"
              value={formData.username}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, username: e.target.value }));
                setIsAvailable(null);
              }}
              placeholder="아이디"
              className={styles.IDname}
              required 
            />
            <button
              onClick={UserIDcheck}
              type="button"
              className={styles.checkID}
            >
              아이디 체크
            </button>
          </div>
          {checkMessage && (
            <div className={`${styles.message} ${isAvailable ? styles.success : styles.error}`}>
              {checkMessage}
            </div>
          )}

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="이름"
            className={styles.name}
            required
          />
          <div className={styles.helper}>※ 영문 대소문자, 특수문자 포함 8자 이상</div>

          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="비밀번호"
            className={styles.name}
            required
          />
          <div className={styles.helper}>※ 동일한 비밀번호를 입력해주세요</div>

          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="비밀번호 확인"
            className={styles.name}
            required
          />

          <div className={styles.phoneGroup}>
            <input
              type="text"
              name="phone1"
              value={formData.phone1}
              onChange={handleChange}
              maxLength="3"
              placeholder="010"
              className={styles.phoneInput}
              required
            />
            <span>-</span>
            <input
              type="text"
              name="phone2"
              value={formData.phone2}
              onChange={handleChange}
              maxLength="4"
              placeholder="1234"
              className={styles.phoneInput}
              required
            />
            <span>-</span>
            <input
              type="text"
              name="phone3"
              value={formData.phone3}
              onChange={handleChange}
              maxLength="4"
              placeholder="5678"
              className={styles.phoneInput}
              required
            />
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={
              isLoading ||
              !formData.username ||
              !formData.name ||
              !formData.password ||
              formData.password !== formData.confirmPassword
            }
          >
            {isLoading ? "처리중..." : "가입하기"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Membership;
