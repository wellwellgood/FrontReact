import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "../../chatServer/css/ID.module.css";

export default function ID() {
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [timer, setTimer] = useState(0);
  const [foundID, setFoundID] = useState("");

  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(countdown);
    }
  }, [timer]);

  const handleSendCode = () => {
    if (!phoneNumber) {
      alert("📞 전화번호를 입력해주세요.");
      return;
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedCode(code);
    setTimer(180);
    setIsVerified(false);
    alert(`인증번호 [${code}]가 전송되었습니다. (모의)`);
  };

  const handleVerifyCode = () => {
    if (verificationCode === generatedCode) {
      setIsVerified(true);
      alert("✅ 인증 성공!");
    } else {
      alert("❌ 인증번호가 올바르지 않습니다.");
    }
  };

  const handleFindID = () => {
    if (!isVerified) {
      alert("⚠️ 인증을 먼저 완료해주세요.");
      return;
    }
    if (!username || !phoneNumber) {
      alert("❗ 이름과 전화번호를 모두 입력해주세요.");
      return;
    }
    setFoundID("example_user123");
  };

  return (
    <div className={styles.findID}>
      <Link to="/">
        <div className={styles.img}></div>
      </Link>
      <div className={styles.IDform}>
        <div className={styles.IDarea}>
          <h1>아이디 찾기</h1>

          <input
            className={styles.name}
            placeholder="이름을 입력하세요"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            className={styles.number}
            placeholder="전화번호 (숫자만 입력)"
            value={phoneNumber}
            type="tel"
            onChange={(e) => setPhoneNumber(e.target.value)}
          />

          <button className={styles.sendBtn} onClick={handleSendCode} disabled={timer > 0}>
            {timer > 0 ? `재전송 (${timer}s)` : "인증번호 받기"}
          </button>

          <input
            className={styles.verifyCode}
            placeholder="인증번호 입력"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
          />
          <button className={styles.verifyBtn} onClick={handleVerifyCode}>인증 확인</button>

          <button className={styles.findBtn} onClick={handleFindID}>아이디 찾기</button>

          {foundID && (
            <div className={styles.result}>
              <h3>
                🎉 찾으신 아이디는: <span>{foundID}</span> 입니다.
              </h3>
              <Link to="/login">
                <button className={styles.goLogin}>로그인 하러 가기</button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}