import express from "express";
import axios from "axios";
import xml2js from "xml2js";

const router = express.Router();
const { parseStringPromise } = xml2js;
const WORK24_URL =
  "https://www.work24.go.kr/cm/openApi/call/wk/callOpenApiSvcInfo210L01.do";

const one = (value) => (Array.isArray(value) ? value[0] : value) || "";
const boundedNumber = (value, fallback, maximum) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), maximum) : fallback;
};

router.get("/jobs", async (req, res) => {
  const authKey = process.env.WORK24_API_KEY?.trim();
  if (!authKey) {
    return res.json({ configured: false, total: 0, jobs: [] });
  }

  const params = {
    authKey,
    callTp: "L",
    returnType: "XML",
    startPage: boundedNumber(req.query.startPage, 1, 1000),
    display: boundedNumber(req.query.display, 20, 100),
    sortOrderBy: "DESC",
  };

  const optional = ["keyword", "region", "occupation", "education", "career", "empTp", "regDate"];
  optional.forEach((key) => {
    const value = String(req.query[key] || "").trim().slice(0, 150);
    if (value) params[key] = value;
  });

  try {
    const response = await axios.get(WORK24_URL, {
      params,
      timeout: 10000,
      responseType: "text",
      headers: { Accept: "application/xml" },
    });
    const parsed = await parseStringPromise(response.data, {
      explicitArray: false,
      trim: true,
    });
    const root = parsed?.wantedRoot;
    if (!root) {
      const message = one(parsed?.openApiResult?.message) || "고용24 응답 형식을 확인할 수 없습니다.";
      return res.status(502).json({ error: message });
    }

    const wanted = root.wanted ? (Array.isArray(root.wanted) ? root.wanted : [root.wanted]) : [];
    const jobs = wanted.map((item) => ({
      id: String(one(item.wantedAuthNo)),
      company: String(one(item.company)),
      role: String(one(item.title)),
      industry: String(one(item.indTpNm)),
      salary: [one(item.salTpNm), one(item.sal)].filter(Boolean).join(" "),
      location: String(one(item.region) || one(item.basicAddr)),
      career: String(one(item.career)),
      registeredAt: String(one(item.regDt)),
      deadline: String(one(item.closeDt)),
      url: String(one(item.wantedInfoUrl)),
      source: "고용24",
    }));

    return res.json({
      configured: true,
      total: Number(one(root.total)) || jobs.length,
      page: Number(one(root.startPage)) || params.startPage,
      jobs,
    });
  } catch (error) {
    const status = error.response?.status;
    console.error("고용24 API 호출 실패:", status || error.message);
    return res.status(502).json({ error: "고용24 채용공고를 불러오지 못했습니다." });
  }
});

export default router;
