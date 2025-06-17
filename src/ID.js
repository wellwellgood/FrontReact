import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./serverF/chatServer/css/ID.module.css";

export default function ID() {
  const [verificationCode, setVerificationCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [foundID, setFoundID] = useState("");
  const [timer, setTimer] = useState(0);

  const [formData, setFormData] = useState({
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

  const handleSendCode = async () => {
    const { phone1, phone2, phone3 } = formData;

    if (!phone1 || !phone2 || !phone3) {
      return alert("전화번호를 모두 입력해주세요.");
    }

    const phone = `${phone1}-${phone2}-${phone3}`;

    try {
      const res = await axios.post("/api/auth/send-code", { phone });
      if (res.data.success) {
        alert("인증번호가 전송되었습니다.");
        setGeneratedCode(res.data.code); // ⚠️ 테스트용. 운영에선 서버 저장.
        setTimer(180);
      } else {
        alert("전송 실패");
      }
    } catch (err) {
      console.error("❌ 인증번호 전송 실패:", err);
      alert("인증번호 전송에 실패했습니다.");
    }
  };

  const handleVerify = () => {
    if (verificationCode === generatedCode) {
      setIsVerified(true);
      alert("✅ 인증 성공");
    } else {
      alert("❌ 인증 실패: 코드가 일치하지 않습니다.");
    }
  };

  const handleFindID = async () => {
    if (!isVerified) return alert("전화번호 인증을 먼저 해주세요.");

    const { phone1, phone2, phone3 } = formData;
    const phone = `${phone1}-${phone2}-${phone3}`;

    try {
      const res = await axios.post("/api/find-id", { phone });
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
          <div className={styles.phoneGroup}>
            <input type="text" name="phone1" value={formData.phone1} onChange={handleChange} maxLength="3" placeholder="010" className={styles.phoneInput} required />
            <span>-</span>
            <input type="text" name="phone2" value={formData.phone2} onChange={handleChange} maxLength="4" placeholder="1234" className={styles.phoneInput} required />
            <span>-</span>
            <input type="text" name="phone3" value={formData.phone3} onChange={handleChange} maxLength="4" placeholder="5678" className={styles.phoneInput} required />
          </div>
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

          <button className={styles.findBtn} onClick={handleFindID}>아이디 찾기</button>

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
