import React, { useRef } from "react";
import emailjs from "@emailjs/browser";

export default function EmailForm() {
  const form = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();

    emailjs
      .sendForm(
        "service_a9udeim",       // 자신의 EmailJS 서비스 ID
        "template_3nu35ld",      // 자신의 템플릿 ID
        form.current,
        "s9Hb7DTTLBcp34TPu"      // 자신의 공개 키 (public key)
      )
      .then(
        (result) => {
          console.log(result.text);
          alert("이메일이 성공적으로 전송되었습니다!");
          e.target.reset(); // 폼 초기화
        },
        (error) => {
          console.log(error.text);
          alert("이메일 전송에 실패했습니다. 다시 시도해주세요.");
        }
      );
  };

  return (
    <form ref={form} onSubmit={handleSubmit}>
      <div>
        <label>보낸 사람 이름:</label>
        <input name="user_name" type="text" placeholder="이름" required />
      </div>
      <div>
        <label>받는 사람 이메일:</label>
        <input name="user_email" type="email" placeholder="이메일 주소" required />
      </div>
      <div>
        <label>내용:</label>
        <textarea name="message" placeholder="내용을 입력하세요" required></textarea>
      </div>
      <button type="submit">보내기</button>
    </form>
  );
}
