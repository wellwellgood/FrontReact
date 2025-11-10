// RedirectOnKeyword.jsx
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// ROUTE_TABLE, norm, goByKeyword를 공용 util로 빼서 import 하거나 동일하게 정의
import { goByKeyword } from "./searchRouting"; // 예시

export default function RedirectOnKeyword() {
  const { search } = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    const kw = new URLSearchParams(search).get("keyword");
    if (kw) goByKeyword(navigate, kw);
  }, [search, navigate]);
  return null; // 즉시 리다이렉트
}
