
import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./serverF/chatServer/css/password.module.css";
import api from "./util/api.js";
import { Lock } from 'lucide-react';

export default function Password() {
  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [timer, setTimer] = useState(0);
  const [devCode, setDevCode] = useState("");
  const [sendStatus, setSendStatus] = useState("");
  const [sending, setSending] = useState(false);
  const showDevCode = process.env.NODE_ENV === "development" && window.location.hostname === "localhost";
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
    if (!phone.trim()) return alert("전화번호를 입력해주세요.");
    if (sending) return;
    setSending(true);
    setDevCode("");
    setTimer(0);
    setIsVerified(false);
    setVerificationCode("");
    setResetToken("");
    setSendStatus("인증번호 요청 중...");
    try {
      const res = await api.post("/auth/send-code", { phone }, { timeout: 10000 });
      setTimer(180);
      if (showDevCode && res.data.code) {
        setDevCode(String(res.data.code));
        setSendStatus("아래 개발용 인증번호를 입력하세요. 실제 SMS는 발송되지 않습니다.");
      } else {
        setSendStatus(res.data.message || "인증번호 요청이 완료됐습니다.");
      }
    } catch (err) {
      setSendStatus(err.response?.data?.message || (err.code === "ECONNABORTED"
        ? "요청 시간이 초과됐습니다. 백엔드 서버를 확인하세요."
        : "인증번호 요청 실패: 백엔드 10000번 서버와 CORS 설정을 확인하세요."));
    } finally {
      setSending(false);
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
      const res = await api.post("/auth/reset-password", {
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
          <Lock className={styles.icon} />
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
            placeholder="전화번호 입력 (예: 010-1234-5678)(- 없이 작성 부탁드립니다)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button className={styles.sendBtn} onClick={handleSendCode} disabled={sending}>
            {sending ? "요청 중..." : "인증번호 받기"}
          </button>
          <p role="status">{sendStatus}</p>
          {showDevCode && devCode && timer > 0 && !isVerified && (
            <p>개발용 인증번호: <strong>{devCode}</strong></p>
          )}
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
