import React, { useState } from "react";
import axios from "axios";

const API = "https://react-server-wmqa.onrender.com/api";

const ID = () => {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [result, setResult] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleInput = (setter) => (e) => setter(e.target.value);

  const sendCode = async () => {
    if (!phone.trim()) return alert("📱 전화번호를 입력해주세요.");

    try {
      setIsSending(true);
      const res = await axios.post(`${API}/auth/send-code`, { phone });

      alert(`📨 인증번호 (테스트용): ${res.data.code}`);
      setResult("✅ 인증번호 전송 완료");
    } catch (err) {
      console.error("❌ 인증번호 전송 실패", err);
      setResult("❌ 인증번호 전송 실패");
    } finally {
      setIsSending(false);
    }
  };

  const verifyCode = async () => {
    if (!code.trim()) return alert("🔒 인증번호를 입력해주세요.");

    try {
      setIsVerifying(true);
      const res = await axios.post(`${API}/auth/verify-code`, { phone, code });

      setResult("✅ 인증 성공!");
    } catch (err) {
      console.error("❌ 인증 실패", err);
      setResult("❌ 인증 실패");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h2>📱 전화번호 인증</h2>

      <div>
        <input
          type="text"
          placeholder="전화번호 입력"
          value={phone}
          onChange={handleInput(setPhone)}
          disabled={isSending || isVerifying}
        />
        <button onClick={sendCode} disabled={isSending}>
          {isSending ? "전송 중..." : "인증번호 전송"}
        </button>
      </div>

      <div style={{ marginTop: "1rem" }}>
        <input
          type="text"
          placeholder="인증번호 입력"
          value={code}
          onChange={handleInput(setCode)}
          disabled={isVerifying}
        />
        <button onClick={verifyCode} disabled={isVerifying}>
          {isVerifying ? "확인 중..." : "인증번호 확인"}
        </button>
      </div>

      {result && <p style={{ marginTop: "1rem" }}>{result}</p>}
    </div>
  );
};

export default ID;
