const express = require('express');
const router = express.Router();
const Coolsms = require('coolsms-node-sdk').default;

const messageService = new Coolsms('NCSXNORXIJP78SAD', '0FTJII2DY5DHHARFNEBUZM5R2MRKKWS1');

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6자리 인증번호
}

router.post('/send-code', async (req, res) => {
  const { phone1, phone2, phone3 } = req.body;
  const phone = `${phone1}${phone2}${phone3}`;

  if (!/^01[0-9]{8,9}$/.test(phone)) {
    return res.status(400).json({ message: "휴대폰 번호 형식이 올바르지 않습니다." });
  }

  const code = generateCode();

  try {
    await messageService.sendOne({
      to: phone,
      from: '010-4913-1389', // 쿨SMS에 등록한 발신번호
      text: `[인증번호] ${code} (본인확인용)`
    });

    // 추후: 인증번호 DB 또는 메모리에 저장 (ex: Redis)
    console.log(`[인증번호 전송 완료] ${phone} → ${code}`);

    res.json({ success: true });
  } catch (error) {
    console.error("문자 전송 실패:", error);
    res.status(500).json({ message: "문자 전송에 실패했습니다." });
  }
});

module.exports = router;