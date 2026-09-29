import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { githubRequest } from './api';
import styles from '../dashboard/DashboardOverview.module.css';
export default function GitHubCallback() {
  const started = useRef(false);
  const navigate = useNavigate();
  const [message, setMessage] = useState('GitHub 계정을 연결하고 있습니다…');
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const params = new URLSearchParams(window.location.search);
    const state = params.get('state'); const code = params.get('code');
    const expected = sessionStorage.getItem('github-oauth-state');
    sessionStorage.removeItem('github-oauth-state');
    window.history.replaceState({}, '', window.location.pathname);
    if (params.get('error')) { setMessage('GitHub 연결을 취소했습니다. 대시보드에서 다시 연결할 수 있습니다.'); return; }
    if (!state || state !== expected || !code) { setMessage('연결 요청이 만료되었거나 다른 브라우저에서 시작되었습니다. 대시보드에서 다시 연결해 주세요.'); return; }
    githubRequest('post', '/callback', { state, code })
      .then(() => navigate('/dashboard', { replace: true }))
      .catch(error => setMessage(error.response?.data?.message || '연결을 완료하지 못했습니다. 로그인 상태와 서버 연결을 확인해 주세요.'));
  }, [navigate]);
  return <main className={styles.dashboard}><section className={styles.content}><div className={styles.card}><h1>GitHub 연결</h1><p role="status">{message}</p><Link to="/dashboard">대시보드로 돌아가기</Link></div></section></main>;
}
