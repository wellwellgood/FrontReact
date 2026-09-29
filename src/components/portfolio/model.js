export const instruments = [
  { symbol: '005930', name: '삼성전자', price: 74000, category: '국내주식' },
  { symbol: '000660', name: 'SK하이닉스', price: 185000, category: '국내주식' },
  { symbol: '069500', name: 'KODEX 200', price: 36000, category: 'ETF' },
  { symbol: '035420', name: 'NAVER', price: 210000, category: '국내주식' },
];
export const initialPortfolio = () => ({ version: 1, cash: 5000000, holdings: [
  { symbol: '005930', quantity: 30, averageCost: 68000 },
  { symbol: '000660', quantity: 10, averageCost: 190000 },
  { symbol: '069500', quantity: 50, averageCost: 32000 },
], watchlist: ['005930', '035420'], transactions: [] });
export function summarize(portfolio, prices = instruments) {
  const holdings = portfolio.holdings.map(h => { const stock = prices.find(s => s.symbol === h.symbol); return { ...h, ...stock, value: h.quantity * stock.price, cost: h.quantity * h.averageCost }; });
  const investment = holdings.reduce((n, h) => n + h.value, 0);
  const cost = holdings.reduce((n, h) => n + h.cost, 0);
  return { holdings, investment, total: investment + portfolio.cash, profit: investment - cost, returnRate: cost ? (investment - cost) / cost * 100 : 0 };
}
export function recordTrade(portfolio, { symbol, side, quantity, price, date }) {
  if (!instruments.some(s => s.symbol === symbol) || !['buy', 'sell'].includes(side) || !Number.isSafeInteger(quantity) || quantity <= 0 || !Number.isFinite(price) || price <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(date) || date > new Date().toLocaleDateString('en-CA')) throw new Error('종목, 날짜, 수량 및 가격을 확인해 주세요.');
  const amount = quantity * price;
  if (!Number.isSafeInteger(amount)) throw new Error('금액은 정수 원 단위로 입력해 주세요.');
  const current = portfolio.holdings.find(h => h.symbol === symbol);
  if (side === 'buy' && amount > portfolio.cash) throw new Error('현금성자산이 부족합니다.');
  if (side === 'sell' && (!current || current.quantity < quantity)) throw new Error('보유 수량보다 많이 매도할 수 없습니다.');
  const nextQuantity = (current?.quantity || 0) + (side === 'buy' ? quantity : -quantity);
  const averageCost = side === 'buy' ? ((current?.quantity || 0) * (current?.averageCost || 0) + amount) / nextQuantity : current.averageCost;
  const holdings = portfolio.holdings.filter(h => h.symbol !== symbol);
  if (nextQuantity) holdings.push({ symbol, quantity: nextQuantity, averageCost });
  return { ...portfolio, holdings, cash: portfolio.cash + (side === 'buy' ? -amount : amount), transactions: [{ id: `${Date.now()}-${Math.random()}`, symbol, side, quantity, price, date }, ...portfolio.transactions] };
}
