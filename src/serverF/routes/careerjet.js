import express from "express";
import axios from "axios";

const router = express.Router();
const CAREERJET_URL = "https://search.api.careerjet.net/v4/query";

const boundedNumber = (value, fallback, maximum) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), maximum) : fallback;
};

const text = (value, maximum = 120) => String(value || "").trim().slice(0, maximum);

router.get("/jobs", async (req, res) => {
  const apiKey = process.env.CAREERJET_API_KEY?.trim();
  if (!apiKey) {
    return res.json({ configured: false, total: 0, jobs: [] });
  }

  const forwardedIp = req.headers["x-forwarded-for"];
  const userIp = String(Array.isArray(forwardedIp) ? forwardedIp[0] : forwardedIp || req.ip)
    .split(",")[0]
    .trim();

  const params = {
    locale_code: "ko_KR",
    keywords: text(req.query.keyword || req.query.keywords),
    location: text(req.query.location),
    page: boundedNumber(req.query.page, 1, 10),
    page_size: boundedNumber(req.query.pageSize || req.query.display, 20, 100),
    sort: ["relevance", "date", "salary"].includes(req.query.sort)
      ? req.query.sort
      : "date",
    user_ip: userIp || "127.0.0.1",
    user_agent: req.get("user-agent") || "Unknown",
  };

  try {
    const response = await axios.get(CAREERJET_URL, {
      params,
      timeout: 10000,
      auth: { username: apiKey, password: "" },
      headers: {
        Accept: "application/json",
        Referer: req.get("referer") || process.env.FRONTEND_URL || "http://localhost:3000",
      },
    });

    const jobs = (Array.isArray(response.data?.jobs) ? response.data.jobs : []).map(
      (item, index) => ({
        id: String(item.id || item.url || `${params.page}-${index}`),
        company: String(item.company || "회사명 미제공"),
        role: String(item.title || "채용공고"),
        location: String(item.locations || item.location || ""),
        salary: String(item.salary || ""),
        description: String(item.description || ""),
        registeredAt: String(item.date || ""),
        url: String(item.url || ""),
        source: "Careerjet",
      }),
    );

    return res.json({
      configured: true,
      total: Number(response.data?.hits) || jobs.length,
      pages: Number(response.data?.pages) || 1,
      page: params.page,
      jobs,
    });
  } catch (error) {
    const status = error.response?.status;
    console.error("Careerjet API 호출 실패:", status || error.message);
    return res.status(502).json({ error: "Careerjet 채용공고를 불러오지 못했습니다." });
  }
});

export default router;
