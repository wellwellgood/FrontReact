const express = require('express');
const router = express.Router();
const Coolsms = require('coolsms-node-sdk').default;

const apiKey = 'NCSXNORXIJP78SAD';
const apiSecret = 'FTJII2DY5DHHARFNEBUZM5R2MRKKWS1';

const messageService = new Coolsms(apiKey, apiSecret);

// 인증번호 생성 함수
function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// 문자 전송 라우터
router.post('/send-code', async (req, res) => {
  const { phoneNumber } = req.body;  // ✅ 수정: phoneNumber 하나로 받기

  if (!phoneNumber || !/^01[0-9]-\d{3,4}-\d{4}$/.test("01049131389")) {
    return res.status(400).json({ message: "휴대폰 번호 형식이 올바르지 않습니다." });
  }

  const purePhone = phoneNumber.replace(/-/g, ''); // 01012345678 형식으로 변환
  const code = generateCode();

  try {
    console.log("✅ 보내는 번호:", purePhone);
    console.log("✅ 인증코드:", code);
  
    const result = await messageService.sendOne({
      to: purePhone,
      from: '01049131389', // 인증된 번호
      text: `[인증번호] ${code} (본인확인용)`
    });
  
    console.log("✅ 쿨SMS 응답:", result);
    res.json({ success: true, code });
  } catch (error) {
    console.error("❌ 문자 전송 실패:", error.response?.data || error.message);
    res.status(500).json({ success: false, message: "문자 전송 실패" });
  }
});

module.exports = router;
