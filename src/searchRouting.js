// src/searchRouting.js
export const ROUTE_TABLE = {
    // 필요 키워드만 채우면 됨. 예시:
    dashboard: { path: "/" },
    chat: { path: "/chatApp" },
    settings: { path: "/main", anchor: "settings" },
    file: { path: "/file" },
    sendemail: { path: "/sendemail" },
    membership: { path: "/membership" },

};

export const norm = (s = "") => s.trim().toLowerCase();

/** 검색어 → 라우팅 */
export function goByKeyword(navigate, raw) {
    const keyRaw = raw ?? "";
    const key = norm(keyRaw);
    // 우선 원문 키로 찾고, 없으면 소문자 키로 재탐색
    const dest = ROUTE_TABLE[keyRaw] || ROUTE_TABLE[key];
    if (!dest) {
        // 폴백: 기존 검색 주소로 이동
        navigate(`/search?keyword=${encodeURIComponent(keyRaw)}`);
        return;
    }
    if (dest.anchor) {
        navigate(`${dest.path}#${dest.anchor}`, { replace: true });
        // 앵커 스크롤
        setTimeout(() => {
            document.getElementById(dest.anchor)?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 0);
    } else {
        navigate(dest.path, { replace: true, state: { fromSearch: keyRaw } });
    }
}
export function resolveDest(raw = "") {
    const key = raw.trim().toLowerCase();
    return ROUTE_TABLE[raw] || ROUTE_TABLE[key] || null;
}
