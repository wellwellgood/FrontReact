import React, { useState, useEffect } from "react";
import api from "./util/api.js";
import styles from "./serverF/chatServer/css/ID.module.css";

export default function ID() {
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [foundID, setFoundID] = useState("");
  const [timer, setTimer] = useState(0);
  const [isCodeSent, setIsCodeSent] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone1: "",
    phone2: "",
    phone3: "",
  });

  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(countdown);
    }
  }, [timer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const makePhoneNumber = () => {
    const { phone1, phone2, phone3 } = formData;
    return `${phone1}-${phone2}-${phone3}`;
  };

  const handleSendCode = async () => {
    const phone = makePhoneNumber();

    try {
      const res = await api.post("/auth/send-code", { phone });
      alert("✅ 인증번호가 전송되었습니다: " + res.data.code); // 테스트용
      setTimer(180); // 3분
      setIsCodeSent(true);
    } catch (err) {
      console.error("❌ 인증번호 요청 실패:", err);
      alert(err.response?.data?.message || "오류 발생");
    }
  };

  const handleVerifyCode = async () => {
    const phone = makePhoneNumber();

    try {
      const res = await api.post("/auth/verify-code", {
        phone,
        code: verificationCode,
      });

      alert("✅ 인증 성공: " + res.data.message);
      setIsVerified(true);  
    } catch (err) {
      console.error("❌ 인증 실패:", err);
      alert("❌ 인증 실패: " + (err.response?.data?.message || "오류 발생"));
    }
  };

  const handleFindID = async () => {
    if (!isVerified) return alert("전화번호 인증을 먼저 해주세요.");
    const { name, phone1, phone2, phone3 } = formData;

    try {
      const res = await api.post("/auth/find-id", {
        name,
        phone1,
        phone2,
        phone3,
      });
      setFoundID(res.data.username);
    } catch (err) {
      console.error("❌ 아이디 찾기 실패:", err);
      alert(err.response?.data?.message || "아이디 찾기에 실패했습니다.");
    }
  };

  return (
    <div className={styles.findID}>
      <div className={styles.IDform}>
        <div className={styles.IDarea}>
          <h1>아이디 찾기</h1>

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="이름"
            className={styles.nameInput}
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

          <button className={styles.sendBtn} onClick={handleSendCode}>
            인증번호 받기
          </button>

          {timer > 0 && <p>남은 시간: {timer}s</p>}

          {isCodeSent && (
            <>
              <input
                type="text"
                placeholder="인증번호 입력"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className={styles.verifyCode}
              />
              <button onClick={handleVerifyCode} className={styles.verifyBtn}>인증번호 확인</button>
            </>
          )}

          <button className={styles.findBtn} onClick={handleFindID}>
            아이디 찾기
          </button>

          {foundID && (
            <div className={styles.result}>
              당신의 아이디는 <span>{foundID}</span> 입니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
