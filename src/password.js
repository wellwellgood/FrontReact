
import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./serverF/chatServer/css/password.module.css";
import api from "./util/api.js";

export default function Password() {
  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [timer, setTimer] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [result, setResult] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetToken, setResetToken] = useState("");

  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(countdown);
    }
  }, [timer]);

  const handleSendCode = async () => {
    if (!phone) return alert("전화번호를 입력해주세요.");
    try {
      const res = await api.post("/auth/send-code", { phone });
      setTimer(180);
      console.log(`인증번호가 전송되었습니다. (${res.data.code})`);
    } catch (err) {
      console.error("❌ 인증번호 전송 실패:", err);
      alert("인증번호 발송 실패");
    }
  };

  const handleVerify = async () => {
    if (!verificationCode) return alert("인증번호를 입력해주세요.");
    try {
      const res = await api.post("/auth/verify-code", { phone, code: verificationCode });
      setIsVerified(true);
      alert("✅ 인증 성공");
    } catch (err) {
      console.error("❌ 인증 실패:", err);
      alert(err.response?.data?.message || "인증 실패");
    }
  };

  const handleFindPassword = async () => {
    if (!isVerified) return alert("전화번호 인증이 필요합니다.");
    try {
      const phoneParts = phone.split("-");
      const res = await api.post("/auth/find-password", {
        username: userId,
        name,
        phone1: phoneParts[0],
        phone2: phoneParts[1],
        phone3: phoneParts[2]
      });
      alert("인증 완료. 새 비밀번호를 입력하세요.");
      setResetToken(res.data.token);
    } catch (err) {
      console.error("❌ 비밀번호 찾기 실패:", err);
      alert(err.response?.data?.message || "비밀번호 찾기 실패");
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !resetToken) return alert("새 비밀번호를 입력해주세요.");
    try {
      const res = await api.post("/reset-password", {
        token: resetToken,
        newPassword
      });
      setResult(res.data.message);
    } catch (err) {
      console.error(err);
      alert("비밀번호 재설정 요청 실패");
    }
  };

  return (
    <div className={styles.findID}>
      <div className={styles.IDform}>
        <div className={styles.IDarea}>
          <h1>비밀번호 찾기</h1>
          <input
            className={styles.name}
            type="text"
            placeholder="아이디 입력"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <input
            className={styles.name}
            type="text"
            placeholder="이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className={styles.number}
            type="text"
            placeholder="전화번호 입력 (예: 010-1234-5678)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button className={styles.sendBtn} onClick={handleSendCode}>인증번호 받기</button>
          {timer > 0 && <p>남은 시간: {timer}s</p>}

          <input
            className={styles.verifyCode}
            type="text"
            placeholder="인증번호 입력"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
          />
          <button className={styles.verifyBtn} onClick={handleVerify}>인증 확인</button>

          <button className={styles.findBtn} onClick={handleFindPassword}>임시 비밀번호 받기</button>

          {resetToken && (
            <>
              <input
                className={styles.verifyCode}
                type="password"
                placeholder="새 비밀번호 입력"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button className={styles.verifyBtn} onClick={handleResetPassword}>비밀번호 재설정</button>
            </>
          )}

          {result && <div className={styles.result}>{result}</div>}
        </div>
      </div>
    </div>
  );
}
