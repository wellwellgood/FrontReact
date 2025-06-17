// ✅ React 회원가입 컴포넌트 (membership.js)
import React, { useState } from "react";
import axios from "axios";
import styles from "./membership.module.css";

const Membership = () => {
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    password: "",
    confirmPassword: "",
    phone1: "",
    phone2: "",
    phone3: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("비밀번호가 일치하지 않습니다.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await axios.post(
        "https://react-server-wmqa.onrender.com/api/auth/register",
        {
          username: formData.username,
          name: formData.name,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          phone1: formData.phone1,
          phone2: formData.phone2,
          phone3: formData.phone3,
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
        window.location.href = "/";
      } else {
        setErrorMessage(res.data?.message || "회원가입 실패");
      }
    } catch (error) {
      console.error("❌ 회원가입 오류:", {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        message: error?.message,
        fullError: error
      });
      setErrorMessage("서버 오류: " + (error?.response?.data?.message || error.message));
    } finally {
      console.log("🔥 finally 도착함");
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.findID}>
      <form className={styles.IDform} onSubmit={handleSubmit}>
        <div className={styles.IDarea}>
          <h1>회원가입</h1>
          {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}

          <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="아이디" className={styles.name} required />
          <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="이름" className={styles.name} required />
          <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="비밀번호" className={styles.name} required />
          <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="비밀번호 확인" className={styles.name} required />

          <div className={styles.phoneGroup}>
            <input type="text" name="phone1" value={formData.phone1} onChange={handleChange} maxLength="3" placeholder="010" className={styles.phoneInput} required />
            <span>-</span>
            <input type="text" name="phone2" value={formData.phone2} onChange={handleChange} maxLength="4" placeholder="1234" className={styles.phoneInput} required />
            <span>-</span>
            <input type="text" name="phone3" value={formData.phone3} onChange={handleChange} maxLength="4" placeholder="5678" className={styles.phoneInput} required />
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
