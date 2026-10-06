// 事業承継・M&A 準備度診断 — 設問と採点ロジック
// ブラウザ（assets/shindan.js）とサーバー（netlify/functions/shindan-report.mjs）の両方で使う。

export const QUESTIONS = [
  {
    id: 'role', title: 'あなたのお立場を教えてください。', type: 'single',
    options: [
      { v: 'owner', label: 'オーナー経営者（代表者）' },
      { v: 'successor', label: '後継者・役員' },
      { v: 'family', label: '経営者のご家族' },
      { v: 'other', label: 'その他' }
    ]
  },
  {
    id: 'revenue', title: '直近の年商（売上高）はどのくらいですか。', type: 'single',
    options: [
      { v: 'lt1', label: '1億円未満' },
      { v: '1to5', label: '1億〜5億円' },
      { v: '5to10', label: '5億〜10億円' },
      { v: '10to30', label: '10億〜30億円' },
      { v: 'gt30', label: '30億円以上' }
    ]
  },
  {
    id: 'age', title: '現経営者の年齢を教えてください。', type: 'single',
    options: [
      { v: 'lt50', label: '50歳未満' },
      { v: '50s', label: '50代' },
      { v: '60s', label: '60代' },
      { v: '70p', label: '70歳以上' }
    ]
  },
  {
    id: 'successor', title: '後継者は決まっていますか。', type: 'single',
    options: [
      { v: 'family', label: '親族の後継者が決まっている' },
      { v: 'internal', label: '社内の役員・社員に候補がいる' },
      { v: 'none', label: '後継者がいない' },
      { v: 'undecided', label: 'まだ考えていない' }
    ]
  },
  {
    id: 'stage', title: '事業承継・M&Aの検討状況はいかがですか。', type: 'single',
    options: [
      { v: 'info', label: '情報収集の段階' },
      { v: 'talking', label: '仲介会社・金融機関などと話をしている' },
      { v: 'offer', label: '買い手候補から条件の提示を受けている' },
      { v: 'progress', label: '具体的に交渉・手続きが進んでいる' },
      { v: 'none', label: '特に検討していない' }
    ]
  },
  {
    id: 'timing', title: '承継・譲渡を実現したい時期はいつ頃ですか。', type: 'single',
    options: [
      { v: 'lt1', label: '1年以内' },
      { v: '1to3', label: '1〜3年以内' },
      { v: '3to5', label: '3〜5年以内' },
      { v: 'undecided', label: '未定' }
    ]
  },
  {
    id: 'interest', title: 'もっとも関心のあるテーマはどれですか。', type: 'single',
    options: [
      { v: 'sell', label: '会社の譲渡・売却' },
      { v: 'mbo', label: '役員・社員への承継（MBO）' },
      { v: 'improve', label: '経営改善・企業価値の向上' },
      { v: 'second', label: '提示された条件の妥当性の確認' }
    ]
  },
  {
    id: 'finance', title: '決算書や財務の状況は整理できていますか。', type: 'single',
    options: [
      { v: 'ready', label: '整理できており、すぐ説明できる' },
      { v: 'partial', label: '一部は整理できている' },
      { v: 'notyet', label: 'あまり整理できていない' }
    ]
  },
  {
    id: 'concerns', title: '気になっていることをすべてお選びください。', type: 'multi',
    options: [
      { v: 'valuation', label: '自社の価値（株価）がわからない' },
      { v: 'employees', label: '社員の雇用を守りたい' },
      { v: 'guarantee', label: '個人保証・借入金の扱い' },
      { v: 'terms', label: '提示条件・進め方が妥当か不安' },
      { v: 'nobody', label: '社内外に相談相手がいない' },
      { v: 'tax', label: '税金・相続への影響' }
    ]
  }
];

const pts = (map, v) => map[v] ?? 0;

// 回答から「準備度」「緊急度」「見込み度（社内用）」を算出する
export function scoreAnswers(a) {
  const concerns = Array.isArray(a.concerns) ? a.concerns : [];

  // 準備度：承継に向けた準備がどこまで進んでいるか（0-100）
  const readiness = Math.min(100,
    pts({ family: 30, internal: 22, none: 6, undecided: 0 }, a.successor) +
    pts({ ready: 30, partial: 16, notyet: 4 }, a.finance) +
    pts({ progress: 25, offer: 22, talking: 16, info: 8, none: 0 }, a.stage) +
    pts({ lt1: 15, '1to3': 12, '3to5': 8, undecided: 2 }, a.timing)
  );

  // 緊急度：早めに手を打つべき度合い（0-100）
  const urgency = Math.min(100,
    pts({ '70p': 35, '60s': 25, '50s': 12, lt50: 4 }, a.age) +
    pts({ none: 25, undecided: 18, internal: 8, family: 4 }, a.successor) +
    pts({ lt1: 25, '1to3': 18, '3to5': 8, undecided: 4 }, a.timing) +
    pts({ offer: 15, progress: 15, talking: 8, info: 4, none: 0 }, a.stage)
  );

  // 見込み度（社内の優先順位づけ用。利用者には表示しない）
  const fit =
    pts({ owner: 25, successor: 18, family: 10, other: 3 }, a.role) +
    pts({ gt30: 25, '10to30': 22, '5to10': 18, '1to5': 12, lt1: 5 }, a.revenue) +
    Math.round(urgency * 0.35) +
    pts({ offer: 15, progress: 12, talking: 10, info: 4, none: 0 }, a.stage);
  const tier = fit >= 70 ? 'A' : fit >= 45 ? 'B' : 'C';

  return { readiness, urgency, fit, tier, service: recommendService(a, concerns), concerns };
}

export const SERVICES = {
  second: { name: 'M&Aセカンドオピニオン', url: 'business-05.html',
    why: '提示された条件や進め方を、利害関係のない第三者の立場で検証することで、譲渡対価と納得感の両方を高められます。' },
  mbo: { name: 'MBO支援', url: 'business-04.html',
    why: '社内の役員・社員への承継は、資金調達と既存株主との調整が鍵です。早い段階から設計することで選択肢が広がります。' },
  sell: { name: '事業承継・M&A（譲受）', url: 'business-02.html',
    why: '当社グループ自らが受け皿となり、雇用と技術を守りながら事業を次代へつなぐ選択肢があります。' },
  improve: { name: '経営支援', url: 'business-03.html',
    why: '承継の前に財務・組織・営業を整えることで、企業価値が高まり、承継の選択肢も増えます。' }
};

function recommendService(a, concerns) {
  if (a.stage === 'offer' || a.interest === 'second' || concerns.includes('terms')) return 'second';
  if (a.interest === 'mbo' || a.successor === 'internal') return 'mbo';
  if (a.interest === 'improve' || a.finance === 'notyet') return 'improve';
  return 'sell';
}

// 回答・スコアから、すぐ表示できる定型の所見を作る（AIが使えないときの代替にもなる）
export function ruleReport(a, s) {
  const out = [];
  if (s.urgency >= 60) out.push('経営者の年齢・後継者・希望時期から見て、早めの着手が望ましい状況です。承継の準備には一般に数年かかるといわれています。');
  else if (s.urgency >= 35) out.push('今すぐではなくても、数年以内を見据えて選択肢を整理しておくと、条件面で有利に進めやすくなります。');
  else out.push('時間的な余裕がある今のうちに、企業価値を高める取り組みを進めておくことで、将来の選択肢が広がります。');

  if (a.successor === 'none' || a.successor === 'undecided') out.push('後継者が決まっていない場合、親族内承継・社内承継（MBO）・第三者への譲渡を比較検討することが第一歩です。');
  if (a.finance !== 'ready') out.push('決算書や資産・負債の状況を整理しておくと、自社の価値を正しく把握でき、交渉でも説明しやすくなります。');
  if (a.stage === 'offer' || s.concerns.includes('terms')) out.push('すでに条件の提示を受けている場合は、合意前に第三者の目で条件と進め方を確認することをおすすめします。');
  if (s.concerns.includes('guarantee')) out.push('個人保証や借入金の扱いは、譲渡条件の中で交渉できる重要な論点です。');
  if (s.concerns.includes('employees')) out.push('社員の雇用維持は、相手先選びと契約条件の両面で確保していくことができます。');
  return out.slice(0, 4);
}

export function labelOf(qid, v) {
  const q = QUESTIONS.find(q => q.id === qid);
  if (!q) return '';
  const vals = Array.isArray(v) ? v : [v];
  return vals.map(x => (q.options.find(o => o.v === x) || {}).label).filter(Boolean).join('、');
}
