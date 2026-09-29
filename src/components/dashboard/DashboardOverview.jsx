import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, ChartNoAxesCombined, Landmark, TrendingUp, Star } from 'lucide-react';
import DashboardHeader from '../navigation/DashboardHeader.jsx';
import { instruments, initialPortfolio, summarize, recordTrade } from '../portfolio/model.js';
import styles from './DashboardOverview.module.css';
const money = n => `${Math.round(n).toLocaleString('ko-KR')}원`;
const percent = n => `${n > 0 ? '+' : ''}${n.toFixed(2)}%`;
export default function DashboardOverview({ view = 'overview', demo = false }) {
  const key = `portfolio-v1:${demo ? 'demo' : sessionStorage.getItem('username')}`;
  const [portfolio, setPortfolio] = useState(() => { try { const p = JSON.parse(localStorage.getItem(key)); return p?.version === 1 && Array.isArray(p.holdings) && Array.isArray(p.watchlist) && Array.isArray(p.transactions) && Number.isFinite(p.cash) ? p : initialPortfolio(); } catch { return initialPortfolio(); } });
  const [message, setMessage] = useState('');
  const [query, setQuery] = useState('');
  const [form, setForm] = useState({ symbol: '005930', side: 'buy', quantity: '1', price: '74000', date: new Date().toLocaleDateString('en-CA') });
  const data = summarize(portfolio);
  const save = next => { try { localStorage.setItem(key, JSON.stringify(next)); setPortfolio(next); setMessage('이 브라우저에 저장되었습니다.'); } catch { setMessage('저장 공간을 사용할 수 없습니다. 브라우저 설정을 확인해 주세요.'); } };
  const watch = symbol => save({ ...portfolio, watchlist: portfolio.watchlist.includes(symbol) ? portfolio.watchlist.filter(s => s !== symbol) : [...portfolio.watchlist, symbol] });
  const show = name => view === 'overview' || view === name;
  const title = { overview: '내 자산의 흐름을 한눈에', holdings: '보유종목', transactions: '거래내역', watchlist: '관심종목' }[view];
  const stats = [['총자산', data.total, Wallet, 'blue'], ['투자자산', data.investment, ChartNoAxesCombined, 'green'], ['현금성자산', portfolio.cash, Landmark, 'purple'], ['평가손익', data.profit, TrendingUp, 'orange']];
  return <div className={styles.dashboard}>
    {demo ? <header className={styles.header}><strong>자산 대시보드 · 데모</strong><Link to="/login">로그인</Link></header> : <DashboardHeader active={view} />}
    <main className={styles.content}>
      <section className={styles.heading}><div><h1>{title}</h1><p>자산을 기록하고 투자 현황을 확인하세요.</p></div><span className={styles.badge}>예시 시세 · KRW</span></section>
      <p className={styles.sourceNote}>초기 잔고와 시세는 Mock 데이터입니다. 거래 입력은 실제 주문 없이 이 브라우저의 사용자별 기록에만 반영됩니다. 실제 계좌·시세 API는 연결되지 않았습니다.</p>
      <section className={styles.stats} aria-label="자산 요약">{stats.map(([label, value, Icon, tone]) => <article className={styles.stat} key={label}><span className={`${styles.statIcon} ${styles[tone]}`}><Icon /></span><div className={styles.statText}><span>{label}</span><strong>{money(value)}</strong></div></article>)}</section>
      <p role="status" className={styles.feedback}>{message}</p>
      <div className={styles.grid}>
        {view === 'overview' && <><section className={styles.card}><div className={styles.cardTitle}><h2>보유자산 수익률</h2><strong className={data.profit >= 0 ? styles.positive : styles.negative}>{percent(data.returnRate)}</strong></div><p>현재 보유분의 매입원금 대비 평가손익 · 실현손익·세금·수수료 제외</p><div className={styles.returnList}>{data.holdings.map(h => <div key={h.symbol}><span>{h.name}</span><strong className={h.value >= h.cost ? styles.positive : styles.negative}>{percent((h.value - h.cost) / h.cost * 100)}</strong></div>)}</div></section>
        <section className={styles.card}><div className={styles.cardTitle}><h2>자산배분</h2><span>총자산 기준</span></div>{['국내주식', 'ETF', '현금성자산'].map(category => { const amount = category === '현금성자산' ? portfolio.cash : data.holdings.filter(h => h.category === category).reduce((sum,h) => sum + h.value,0); const ratio = data.total ? amount / data.total * 100 : 0; return <div className={styles.allocation} key={category}><div><span>{category}</span><span>{money(amount)} · {ratio.toFixed(1)}%</span></div><progress max="100" value={ratio} aria-label={`${category} 비중`} /></div>; })}</section></>}
        {show('holdings') && <section className={`${styles.card} ${view !== 'overview' ? styles.full : ''}`}><div className={styles.cardTitle}><h2>보유종목</h2><span>{data.holdings.length}종목</span></div><div className={styles.tableWrap}><table><thead><tr><th>종목</th><th>수량</th><th>평균매입가</th><th>예시 현재가</th><th>평가손익</th></tr></thead><tbody>{data.holdings.map(h => <tr key={h.symbol}><th>{h.name}<small>{h.symbol}</small></th><td>{h.quantity}주</td><td>{money(h.averageCost)}</td><td>{money(h.price)}</td><td className={h.value >= h.cost ? styles.positive : styles.negative}>{money(h.value-h.cost)}</td></tr>)}</tbody></table></div>{!data.holdings.length && <p>보유종목이 없습니다. 거래를 기록해 주세요.</p>}</section>}
        {show('watchlist') && <section className={styles.card}><div className={styles.cardTitle}><h2>관심종목</h2><span>{portfolio.watchlist.length}종목</span></div><label className={styles.search}>종목 검색<input value={query} onChange={e => setQuery(e.target.value)} placeholder="종목명 또는 코드" /></label>{instruments.filter(s => query ? `${s.name}${s.symbol}`.toLowerCase().includes(query.toLowerCase()) : portfolio.watchlist.includes(s.symbol)).map(s => <div className={styles.stockRow} key={s.symbol}><div><strong>{s.name}</strong><small>{s.symbol} · {money(s.price)} · 예시</small></div><button className={styles.bookmark} onClick={() => watch(s.symbol)} aria-label={`${s.name} 관심종목 ${portfolio.watchlist.includes(s.symbol) ? '해제' : '추가'}`} aria-pressed={portfolio.watchlist.includes(s.symbol)}><Star fill={portfolio.watchlist.includes(s.symbol) ? 'currentColor' : 'none'} /></button></div>)}<p className={styles.demoNote}>검색하여 관심종목을 추가할 수 있습니다. 검색 대상은 예시 4종목입니다.</p></section>}
        {show('transactions') && <><section className={styles.card}><div className={styles.cardTitle}><h2>거래 기록</h2><span>수동 입력</span></div><form className={styles.tradeForm} onSubmit={e => { e.preventDefault(); try { save(recordTrade(portfolio, { ...form, quantity: Number(form.quantity), price: Number(form.price) })); } catch (err) { setMessage(err.message); } }}>
          <label>종목<select value={form.symbol} onChange={e => setForm({...form, symbol:e.target.value, price:String(instruments.find(s => s.symbol === e.target.value).price)})}>{instruments.map(s => <option value={s.symbol} key={s.symbol}>{s.name}</option>)}</select></label>
          <label>구분<select value={form.side} onChange={e => setForm({...form,side:e.target.value})}><option value="buy">매수</option><option value="sell">매도</option></select></label>
          {[['quantity','수량 (주)','number'],['price','거래단가 (원)','number'],['date','거래일','date']].map(([field,label,type]) => <label key={field}>{label}<input required type={type} min={type === 'number' ? 1 : undefined} step={type === 'number' ? 1 : undefined} max={type === 'date' ? new Date().toLocaleDateString('en-CA') : undefined} value={form[field]} onChange={e => setForm({...form,[field]:e.target.value})} /></label>)}<button className={styles.primary}>거래 저장</button></form><p className={styles.demoNote}>입력 순서로 잔고에 반영합니다. 과거 시점의 잔고를 재계산하지 않습니다.</p></section>
          <section className={styles.card}><div className={styles.cardTitle}><h2>최근 거래</h2><span>{portfolio.transactions.length}건</span></div>{!portfolio.transactions.length && <p>기록한 거래가 없습니다. 초기 보유분은 예시 잔고입니다.</p>}<div className={styles.transactionList}>{portfolio.transactions.slice(0,view === 'overview' ? 5 : 100).map(t => <div className={styles.stockRow} key={t.id}><div><strong>{instruments.find(s => s.symbol === t.symbol)?.name} · {t.side === 'buy' ? '매수' : '매도'}</strong><small>{t.date} · {t.quantity}주 × {money(t.price)}</small></div><span>{money(t.quantity*t.price)}</span></div>)}</div></section></>}
      </div>
    </main>
  </div>;
}
