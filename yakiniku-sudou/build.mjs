// 焼肉すどう 系列サイト ページ生成スクリプト
// 使い方: node build.mjs  → index.html / kumamoto.html / haruyoshi.html / yoko.html / newyoko.html を出力
import { writeFileSync } from 'node:fs';

const CASTLE = `<svg viewBox="0 0 800 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#261b13"/><stop offset="1" stop-color="#0d0a08"/></linearGradient><linearGradient id="hz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(217,104,58,0)"/><stop offset="1" stop-color="rgba(217,104,58,.3)"/></linearGradient></defs><rect width="800" height="300" fill="url(#hz)"/><path d="M0 300 L0 240 Q120 230 200 215 Q330 190 420 195 Q560 200 650 185 Q740 175 800 190 L800 300Z" fill="url(#cg)"/><g fill="#0b0908" stroke="#c6a66a" stroke-width=".8" stroke-opacity=".55"><path d="M330 215 L470 215 L462 190 L338 190Z"/><path d="M345 190 L455 190 L448 160 L352 160Z"/><path d="M355 160 L445 160 L438 130 L362 130Z"/><path d="M366 130 L434 130 L428 103 L372 103Z"/><path d="M372 103 L428 103 L400 86Z"/><path d="M332 190 Q345 186 352 190" fill="none"/><path d="M448 190 Q455 186 468 190" fill="none"/><path d="M345 160 Q352 156 362 160" fill="none"/><path d="M438 160 Q445 156 455 160" fill="none"/><path d="M356 130 Q364 126 372 130" fill="none"/><path d="M428 130 Q436 126 444 130" fill="none"/><path d="M500 220 L590 220 L584 195 L506 195Z"/><path d="M508 195 L582 195 L576 172 L514 172Z"/><path d="M514 172 L576 172 L545 158Z"/></g><path d="M0 300 L0 262 Q200 250 400 258 Q600 266 800 250 L800 300Z" fill="#0a0807"/></svg>`;

const NOREN = `<svg viewBox="0 0 800 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><defs><linearGradient id="nh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(217,104,58,0)"/><stop offset="1" stop-color="rgba(217,104,58,.28)"/></linearGradient></defs><rect width="800" height="300" fill="url(#nh)"/><g stroke="#c6a66a" stroke-opacity=".5" fill="#0d0a08"><rect x="120" y="0" width="112" height="210"/><rect x="236" y="0" width="112" height="210"/><rect x="352" y="0" width="112" height="210"/><rect x="468" y="0" width="112" height="210"/><rect x="584" y="0" width="112" height="210"/></g><g fill="none" stroke="#efe8dc" stroke-opacity=".12"><path d="M176 0v210M292 0v210M408 0v210M524 0v210M640 0v210"/></g><rect x="100" y="0" width="620" height="4" fill="#c6a66a" fill-opacity=".6"/><path d="M0 300 L0 262 Q200 250 400 258 Q600 266 800 250 L800 300Z" fill="#0a0807"/></svg>`;

const PARK = `<svg viewBox="0 0 800 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><defs><linearGradient id="ph" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(217,104,58,0)"/><stop offset="1" stop-color="rgba(217,104,58,.26)"/></linearGradient></defs><rect width="800" height="300" fill="url(#ph)"/><circle cx="640" cy="120" r="44" fill="none" stroke="#c6a66a" stroke-opacity=".6"/><path d="M0 300 L0 230 Q100 215 220 228 Q360 245 480 226 Q620 206 800 224 L800 300Z" fill="#141009"/><g stroke="#efe8dc" stroke-opacity=".12" fill="none"><path d="M0 240 Q200 232 400 240 T800 240"/><path d="M0 252 Q200 246 400 254 T800 252"/><path d="M0 264 Q200 258 400 266 T800 264"/></g><g fill="#0b0908" stroke="#c6a66a" stroke-opacity=".5"><path d="M140 226 c0-40 30-60 30-90 c0 30 30 50 30 90z"/><path d="M300 236 c0-36 26-54 26-80 c0 26 26 44 26 80z"/><path d="M520 222 c0-44 34-66 34-98 c0 32 34 54 34 98z"/></g><path d="M0 300 L0 272 Q200 262 400 270 Q600 278 800 262 L800 300Z" fill="#0a0807"/></svg>`;

const CITY = `<svg viewBox="0 0 800 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><defs><linearGradient id="ch" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(217,104,58,0)"/><stop offset="1" stop-color="rgba(217,104,58,.26)"/></linearGradient></defs><rect width="800" height="300" fill="url(#ch)"/><g fill="#0d0a08" stroke="#c6a66a" stroke-opacity=".45"><rect x="60" y="120" width="90" height="140"/><rect x="170" y="80" width="70" height="180"/><rect x="260" y="140" width="120" height="120"/><rect x="400" y="60" width="80" height="200"/><rect x="500" y="110" width="100" height="150"/><rect x="620" y="150" width="130" height="110"/></g><g fill="#c6a66a" fill-opacity=".35"><rect x="80" y="140" width="8" height="10"/><rect x="110" y="140" width="8" height="10"/><rect x="80" y="170" width="8" height="10"/><rect x="185" y="100" width="8" height="10"/><rect x="215" y="100" width="8" height="10"/><rect x="185" y="130" width="8" height="10"/><rect x="215" y="160" width="8" height="10"/><rect x="420" y="80" width="8" height="10"/><rect x="450" y="80" width="8" height="10"/><rect x="420" y="110" width="8" height="10"/><rect x="450" y="140" width="8" height="10"/><rect x="520" y="130" width="8" height="10"/><rect x="560" y="160" width="8" height="10"/><rect x="650" y="170" width="8" height="10"/><rect x="700" y="170" width="8" height="10"/></g><path d="M0 300 L0 262 Q200 254 400 262 Q600 270 800 256 L800 300Z" fill="#0a0807"/></svg>`;

const stores = [
{
  slug:'kumamoto', photo:true, name:'焼肉すどう 熊本本店', short:'熊本本店', en:'Yakiniku Sudou · Kumamoto Honten', area:'熊本・上通',
  role:'The Origin', tagline:'一頭ごとに肉質を見極め、焼師が一枚ずつ焼き上げる。熊本城を望む小国杉の三階で、焼肉すどうの原点を。',
  metaBand:'おまかせ ¥16,500 / 選べる ¥11,000', postal:'860-0845', address:'熊本県熊本市中央区上通町4-10 トラヤビル 3F',
  description:'焼肉すどう 熊本本店（熊本市中央区上通町・トラヤビル3F）。一頭ごとに肉質を見極め、焼師が一枚ずつ最高の焼き加減で仕上げるフルアテンド型の焼肉。食べログ 焼肉 WEST 百名店 2024・2025 選出。',
  kicker:'Kumamoto · Kamitori · Full-Attend Yakiniku', vert:'焼師が焼く、フルアテンド焼肉。',
  title:'一枚を、<br><em>極める。</em>',
  lead:'一頭ごとに異なる肉質を見極め、部位に合わせて切り、<strong>焼師</strong>が一枚ずつ最高の焼き加減で仕上げる。<br>あなたは、ただ味わうだけでいい。熊本・上通、熊本城を望む三階の焼肉。',
  seals:[['Tabelog','百名店','Yakiniku West 2025'],['Tabelog','百名店','Yakiniku 2024']],
  infobar:[['Hours','17:00 – 23:00'],['Closed','不定休'],['Address','上通町 トラヤビル 3F']],
  concept:{
    lead:'焼くのは、焼師。<br>あなたは、<em>味わうだけ</em>。',
    copy:['焼肉すどうは、お客様がご自身で焼かない「フルアテンド型」の焼肉店です。テーブルに立つ焼師が、肉の厚み、脂の入り方、その日の状態を見ながら一枚ずつ焼き上げ、最高のタイミングでお皿へ。会話を止めることなく、肉だけに集中できる時間をお約束します。','九州産の黒毛和牛、熊本が誇るあか牛。産地やカット、提供の順番にまで意味を持たせ、「小細工のない、本当に美味しい一枚」を追い求めています。'],
    pillars:[['選ぶ','Select','一頭ごとに違う肉質を、店主が自らの目で見極める。青果市場で培った「目利き」の感覚が、肉の仕入れにも生きています。'],['切る','Cut','部位ごとに、最も旨い厚みと向きがある。厚切りにするもの、薄く引くもの。東京・浜松町の名店で学んだ希少部位の扱いを、熊本の肉に重ねます。'],['焼く','Grill','最後の一手は、焼師の仕事。火との距離、返す瞬間、休ませる時間。全てを委ねていただくからこそ届く、理想の焼き加減があります。']]
  },
  feature:{
    en:'Grill Master', jp:'焼師という仕事', visual:'', vtext:'火と肉の、間に立つ。', corner:'The Grill Master',
    lead:'熟練の焼師が、<br>すべての一枚を焼き上げる。',
    copy:['焼肉の味は、焼き手で決まる。そう考える私たちは、肉を焼く専門のスタッフ「焼師」を店の看板に据えてきました。お客様の食べる速度に合わせ、塩から、タレへ。軽い部位から、濃い部位へ。コースの流れそのものを、テーブルで設計します。','店主・須藤悦男は、東京・浜松町の焼肉店で約7年にわたり修業。希少部位を活かす技術を携え、食材に恵まれた熊本で「焼肉すどう」を開きました。'],
    timeline:[['—','青果市場での勤務を経て、東京・浜松町の焼肉店へ。約7年の修業。'],['2012','独立。'],['2013','熊本・上通に「焼肉すどう」誕生。'],['2016','福岡・春吉に出店。'],['2024–25','熊本本店が、食べログ「焼肉 百名店」に2年連続で選出。']]
  },
  courses:[
    {tag:'Signature',name:'おまかせコース',price:'¥16,500',note:'税込 / お一人様',meta:['120 min','要予約','焼師フルアテンド'],desc:'その日最良の肉を、店主が肉質で選び抜く。塩で楽しむ希少部位から、シャトーブリアンのステーキ、タレ焼きへ。焼肉すどうの全てを味わえる一本です。',list:['シャトーブリアンのステーキを含む','部位・内容はその日の仕入れで変わります','ご予約時に苦手な食材をお知らせください'],sig:true},
    {tag:'Standard',name:'選べるコース',price:'¥11,000',note:'税込 / お一人様',meta:['120 min','焼師フルアテンド'],desc:'はじめての方にもおすすめの、焼肉すどうの基本。塩、タレ、締めまで、焼師がテーブルで焼き上げる流れはそのままに、気軽にお楽しみいただけます。',list:['ステーキは含まれません','席数に限りがあります','お飲み物は別途']}
  ],
  menu:[['お肉の盛合せ','人数分で','その日のおすすめ部位を、焼師が順にお焼きします。盛合せ、またはコースを人数分ご注文ください。'],['スペシャル馬ユッケ','¥2,750','熊本といえば、馬。甘い脂と赤身の旨みを、まずは生で。'],['牛すじスパイスカレー','¥990','16種のスパイスを自家ブレンド。焼肉の締めに、小さく一皿。'],['土鍋ご飯','¥330〜','土鍋で炊き上げる白いご飯。小 ¥330 / 中 ¥440 / 大 ¥550。'],['塩ミノ','¥1,650','歯ざわりで楽しむ、焼師渾身の一枚。'],['シマチョウ','¥1,320','脂の甘みを、火で引き出す。'],['キムチ盛合せ','¥1,100','肉の合間に、箸休めを。'],['サラダ / 野菜焼き','¥770 / ¥550','地元の野菜も、焼師がテーブルで。']],
  menuNote:'※ 価格はすべて税込表示です。仕入れ状況により内容・価格が変更となる場合があります。',
  space:{
    lead:'熊本城を望む、<br>小国杉の三階。',
    copy:'上通アーケードのビル3階。窓の向こうには熊本城。店内には熊本が誇る小国杉をふんだんに使い、木の温もりとシックな陰影が同居する空間に仕上げました。ゆったりとしたテーブル席を中心に、席と席の間にはロールスクリーンの間仕切りを。接待にも、記念日にも。',
    stats:[['26','席','テーブル席中心',true],['3','F','熊本城を望む眺望'],['貸切','可','ご相談ください'],['120','分','コースのお時間']],
    svg:CASTLE, vtag:'View · Kumamoto Castle', vjp:'上通町 トラヤビル 3F'
  },
  awards:[['Tabelog','焼肉 WEST 百名店<br>2025 選出','食べログ 焼肉 WEST 百名店 2025'],['Tabelog','焼肉 百名店<br>2024 選出','食べログ 焼肉 百名店 2024'],['Guests','熊本観光の<br>新定番へ','国内外のお客様にご愛顧いただいています']],
  info:{access:'熊本市電「通町筋」電停より徒歩約2分<br>上通アーケード内',hours:'17:00 – 23:00',hoursNote:'最終入店 21:30 ／ ランチの営業日はお電話・SNSでご確認ください',closed:'不定休',tel:[['050-5448-3772','ご予約専用'],['096-288-5729','店舗']],seats:'26席（テーブル席）／ 貸切可',budget:'¥10,000 〜 ¥14,999',links:[['https://tabelog.com/kumamoto/A4301/A430101/43008422/','食べログ']]},
  mapQ:'熊本県熊本市中央区上通町4-10', mapName:'焼肉すどう 熊本本店',
  reserve:{title:'今夜の一枚を、<br>ご予約ください。',text:'おまかせコースはご予約制です。17名様以上の団体やご希望日時のご相談は、お電話にて承ります。',tel:'050-5448-3772',sub:'Reservation · 17:00 – 23:00（最終入店 21:30）',web:'https://www.tablecheck.com/shops/yakinikusudo-kumamoto/reserve'}
},
{
  slug:'haruyoshi', photo:true, name:'焼肉すどう 春吉', short:'春吉', en:'Yakiniku Sudou · Haruyoshi', area:'福岡・春吉',
  role:'Fukuoka Flagship', tagline:'暖簾で仕切られた半個室、ソムリエの選ぶワイン、そして焼師。熊本の技を、福岡・春吉の静かな路地で。',
  metaBand:'上焼肉 ¥13,200 / 特上焼肉 ¥16,500', postal:'810-0003', address:'福岡県福岡市中央区春吉3-11-19 パノラマスクエア博多 1F',
  description:'焼肉すどう 春吉（福岡市中央区春吉・パノラマスクエア博多1F）。暖簾で仕切られた半個室で、焼師が一枚ずつ焼き上げるフルアテンド焼肉。完全予約制。上焼肉コース13,200円、特上焼肉コース16,500円。食べログアワード Bronze 受賞。',
  kicker:'Fukuoka · Haruyoshi · Full-Attend Yakiniku', vert:'暖簾の奥で、焼師が焼く。',
  title:'静かに、<br><em>深く。</em>',
  lead:'天神南から歩いて数分。暖簾で仕切られた半個室に、<strong>焼師</strong>とソムリエ。<br>熊本で生まれたフルアテンド焼肉を、福岡の夜のために研ぎ澄ませた一軒です。',
  seals:[['Tabelog','Bronze','Award 2026'],['Tabelog','百名店','Yakiniku']],
  infobar:[['Hours','17:00 – 24:00'],['Closed','不定休'],['Address','春吉 パノラマスクエア博多 1F']],
  concept:{
    lead:'接待にも、記念日にも。<br><em>暖簾の内側</em>という贅沢。',
    copy:['春吉店は、全席を暖簾で仕切った半個室。隣席の気配を遠ざけ、目の前には焼師だけがいる。完全予約制で、2〜3名様は2時間、4名様以上は2時間半。時間をゆっくり使っていただくための設計です。','肉はその日の仕入れから焼師が組み立て、ワインはソムリエがコースの流れに合わせてご提案。福岡の中心にいながら、声を落として話したくなる夜を。'],
    pillars:[['仕切る','Noren','暖簾一枚で、路地の喧騒も隣席の視線も遠ざける。半個室だからこその、落ち着いた会話と火の音。'],['組む','Compose','塩から、タレへ。赤身から、脂へ。その日の肉を見て、焼師がコースの順番を組み上げます。'],['合わせる','Pair','ソムリエが、肉の味わいにワインを重ねる。日本酒、焼酎のご用意も。']]
  },
  feature:{
    en:'Grill Master', jp:'焼師とソムリエ', visual:'noren', vtext:'暖簾の、内側で。', corner:'Haruyoshi',
    lead:'焼師が焼き、<br>ソムリエが合わせる。',
    copy:['熊本本店で磨いたフルアテンドのスタイルを、2016年、福岡・春吉へ。カウンターでは、肉を焼き上げる焼師の手元を目の前に。テーブルでは暖簾の内側で、静かに。','上焼肉コースはより上質な部位を、特上焼肉コースは赤身を中心に、さらに厳選した部位をお出しします。'],
    timeline:[['2013','熊本・上通に「焼肉すどう」誕生。'],['2016.05','福岡・春吉に出店。'],['2021','姉妹店「焼肉ヨーコ」を大濠に。'],['2022','セカンドブランド「焼肉ニューヨーコ」を春吉に。'],['2026','食べログアワード Bronze 受賞。']]
  },
  courses:[
    {tag:'Signature',name:'特上焼肉コース',price:'¥16,500',note:'税込 / お一人様 / サービス料10%別',meta:['完全予約制','赤身中心','焼師フルアテンド'],desc:'赤身を中心に、上焼肉コースよりもさらに厳選した部位をお出しします。その日の仕入れで内容は変わります。',list:['前日までのご予約をお願いします','2〜3名様 2時間制 / 4名様以上 2時間半制','ディナーはお子様のご入店をご遠慮いただいています'],sig:true},
    {tag:'Standard',name:'上焼肉コース',price:'¥13,200',note:'税込 / お一人様 / サービス料10%別',meta:['完全予約制','焼師フルアテンド'],desc:'焼肉すどう 春吉の基本。塩焼き、タレ焼き、締めの一品、デザートまで、焼師がテーブルで組み立てる一本です。',list:['前日までのご予約をお願いします','内容・金額は仕入れにより変わります','お飲み物は別途']}
  ],
  menu:[['黒毛和牛の焼きしゃぶ','¥1,500','薄く引いたサーロインを、さっと火にくぐらせて。'],['タン元 / タン中','コース内','厚みと向きを変えて、同じタンの違う表情を。'],['シャトーブリアン','コース内','コースの中盤、火入れの見せ場。'],['ハラミ','コース内','赤身の旨みを、タレで。'],['ワインペアリング','お問い合わせ','ソムリエがコースの流れに合わせてご提案します。'],['締めと甘味','コース内','冷麺、カレー、プリンなど、その日の一皿。']],
  menuNote:'※ 価格は税込、サービス料10%を別途頂戴します。コースの内容および金額は仕入れにより変わります。',
  space:{
    lead:'暖簾で仕切る、<br>全席半個室。',
    copy:'春吉の路地、パノラマスクエア博多の1階。30席すべてを暖簾で仕切り、どの席からも隣が気にならないようにしました。焼師の手元を眺めるならカウンターへ。ご接待や記念日には、テーブルの半個室へ。',
    stats:[['30','席','全席 暖簾仕切り',true],['半個室','','テーブル席'],['カウンター','','焼師の手元を目の前に'],['2.5','h','4名様以上のお時間']],
    svg:NOREN, vtag:'Noren · Semi-private', vjp:'春吉 パノラマスクエア博多 1F'
  },
  awards:[['Tabelog','食べログアワード<br>Bronze 受賞','Tabelog Award 2026 Bronze'],['Tabelog','焼肉 百名店<br>選出店','食べログ 焼肉 百名店'],['Guests','福岡の<br>フルアテンド焼肉','接待・記念日にご利用いただいています']],
  info:{access:'地下鉄七隈線「天神南」駅より徒歩約4分<br>春吉・西中洲エリア',hours:'17:00 – 24:00',hoursNote:'L.O. 23:00 ／ 完全予約制（前日まで）',closed:'不定休（年末年始）',tel:[['050-3137-1010','ご予約専用'],['092-287-8015','店舗']],seats:'30席（全席暖簾仕切りの半個室・カウンター）',budget:'¥15,000 〜 ¥19,999',links:[['https://tabelog.com/fukuoka/A4001/A400103/40043061/','食べログ']]},
  mapQ:'福岡県福岡市中央区春吉3-11-19', mapName:'焼肉すどう 春吉',
  reserve:{title:'暖簾の内側を、<br>ご予約ください。',text:'完全予約制です。前日までにご予約をお願いいたします。ご接待・記念日のご相談もお気軽に。',tel:'050-3137-1010',sub:'Reservation · 17:00 – 24:00（L.O. 23:00）',web:'https://www.tablecheck.com/shops/yakinikusudo-haruyoshi/reserve'}
},
{
  slug:'yoko', name:'焼肉ヨーコ', short:'ヨーコ', en:'Yakiniku Yoko · Ohori', area:'福岡・大濠',
  role:'Charcoal · Casual', tagline:'すどうの目利きで選んだ黒毛和牛を、炭火で、自分の手で。大濠公園のほとり、肩の力を抜いて通える「町の焼肉」。',
  metaBand:'飲めるロース ¥1,650 / アラカルト主体', postal:'810-0075', address:'福岡県福岡市中央区港1-4-16 サンシャイン大濠北 1F',
  description:'焼肉ヨーコ（福岡市中央区港・大濠公園）。焼肉すどうの姉妹店。店主が厳選した黒毛和牛を炭火で焼く、アラカルト主体のカジュアルな焼肉店。名物「飲めるロース」。',
  kicker:'Fukuoka · Ohori · Charcoal Yakiniku', vert:'炭火で、自分の手で。',
  title:'炭火と、<br><em>日常。</em>',
  lead:'焼肉すどうの店主が、同じ目で選んだ黒毛和牛。それを<strong>炭火</strong>で、ご自身の手で焼く。<br>大濠公園のほとりに、気取らず通える姉妹店をつくりました。',
  seals:[['Sister','すどう','Yakiniku Sudou']],
  infobar:[['Hours','17:00 – 22:30'],['Closed','不定休'],['Address','港 サンシャイン大濠北 1F']],
  concept:{
    lead:'いい肉を、<br><em>気軽に</em>、炭火で。',
    copy:['ヨーコは、焼肉すどうの「町の焼肉」。本店の目利きで仕入れた黒毛和牛を、炭火の網でご自身の手で焼いていただきます。コースではなく、好きな部位を好きな順に。アラカルト主体の自由さが、この店の流儀です。','肉マニアの店主が、品質と鮮度だけで選んだ肉。名物の「飲めるロース」は、売れ筋の一番。まずはこれから。'],
    pillars:[['選ぶ','Select','仕入れの目は、本店と同じ。鮮度と質だけで選んだ黒毛和牛を、日常の価格で。'],['炭で','Charcoal','遠赤外線でじんわり、表面は香ばしく。炭火だから出せる香りがあります。'],['自分で','Your Hands','焼き加減はお好みで。会話しながら、網の上を眺める時間こそ、焼肉の楽しみ。']]
  },
  feature:{
    en:'Charcoal', jp:'炭火という選択', visual:'charcoal', vtext:'火を、囲む。', corner:'Ohori · Charcoal',
    lead:'本店の肉を、<br>炭火の網で。',
    copy:['2021年、大濠に開いたヨーコは、フルアテンドの本店とは逆の発想から生まれました。焼くのは、あなた。だからこそ、肉そのものの良さが問われる。有田牛などの黒毛和牛を、店主の目で選び続けています。','飲めるロース、タン塩、ハラミ。定番の部位を、迷わず頼める安心感を大切にしています。'],
    timeline:[['2013','熊本・上通に「焼肉すどう」誕生。'],['2016','福岡・春吉に「焼肉すどう 春吉」。'],['2021.04','姉妹店「焼肉ヨーコ」を大濠に開店。'],['2022','セカンドブランド「焼肉ニューヨーコ」を春吉に。']]
  },
  courses:[
    {tag:'À la carte',name:'お席のみのご予約',price:'アラカルト',note:'お好きな部位を、お好きな順に',meta:['炭火','セルフ焼き','2時間制（混雑時）'],desc:'ヨーコにコースはありません。名物の飲めるロースから、タン塩、ハラミへ。食べたいものを、食べたい分だけ。ご予約はお席のみで承ります。',list:['混雑時はお席を2時間制とさせていただきます','季節・仕入れにより内容が変わります','お飲み物は別途'],sig:true}
  ],
  menu:[['飲めるロース','¥1,650','売れ筋の一番。薄く引いたロースを、さっと炙って。'],['タン塩','¥1,760','店主おすすめ。薬味のニンニクと一緒に。'],['ハラミ','¥2,200','ヨーコの名物。赤身の旨みをタレで。'],['和牛タン','¥3,300','厚みで楽しむ、特別な一皿。'],['ホルモン各種','時価','鮮度の良いものだけを、その日の分だけ。'],['キムチ / サラダ','お問い合わせ','肉の合間に。']],
  menuNote:'※ 価格は税込表示です。季節や仕入れにより、内容・価格が変更となる場合があります。',
  space:{
    lead:'大濠公園のほとり、<br>炭の香り。',
    copy:'サンシャイン大濠北の1階。公園を散歩した帰りに、ふらりと寄れる距離感を大切にしました。テーブル席を中心に、炭火の網を囲んで。',
    stats:[['20','席','テーブル席',true],['炭火','','備長炭の網焼き'],['2','h','混雑時のお時間'],['徒歩','10分','大濠公園駅より']],
    svg:PARK, vtag:'Ohori Park', vjp:'港 サンシャイン大濠北 1F'
  },
  awards:null,
  info:{access:'地下鉄空港線「大濠公園」駅より徒歩約10分',hours:'17:00 – 22:30',hoursNote:'L.O. 22:00',closed:'不定休',tel:[['050-5448-3773','ご予約専用'],['092-791-8547','店舗']],seats:'20席（テーブル席）',budget:'¥6,000 〜 ¥7,999',links:[['https://tabelog.com/fukuoka/A4001/A400105/40057178/','食べログ']]},
  mapQ:'福岡県福岡市中央区港1-4-16', mapName:'焼肉ヨーコ',
  reserve:{title:'今夜は炭火で、<br>気軽に。',text:'お席のみのご予約を承ります。当日のご来店も歓迎ですが、週末はご予約をおすすめします。',tel:'050-5448-3773',sub:'Reservation · 17:00 – 22:30（L.O. 22:00）',web:'https://www.tablecheck.com/shops/yakiniku-yoko/reserve'}
},
{
  slug:'newyoko', name:'焼肉ニューヨーコ', short:'ニューヨーコ', en:'Yakiniku New Yoko · Haruyoshi', area:'福岡・春吉',
  role:'Everyday · Second Brand', tagline:'本店ゆずりの黒毛和牛を、良心的な価格で。昼から夜まで、50席の大衆焼肉。すどうの肉を、いちばん近くに。',
  metaBand:'飲めるロース ¥1,650 / 昼焼肉あり', postal:'810-0003', address:'福岡県福岡市中央区春吉3-23-3 アルテ天神 1F',
  description:'焼肉ニューヨーコ（福岡市中央区春吉・アルテ天神1F）。焼肉すどう 春吉のセカンドブランド。A4黒毛和牛を良心的な価格で、昼から夜まで。名物「飲めるロース」「特製コプチャン」。50席、20〜50名の貸切可。',
  kicker:'Fukuoka · Haruyoshi · Everyday Yakiniku', vert:'いい肉を、毎日の値段で。',
  title:'毎日に、<br><em>いい肉を。</em>',
  lead:'焼肉すどう 春吉のセカンドブランド。本店ゆずりの<strong>黒毛和牛</strong>を、良心的な価格で、昼から夜まで。<br>仕事帰りにも、昼の焼肉にも。春吉でいちばん気軽な、すどうの肉。',
  seals:[['Second','すどう','Brand of Sudou']],
  infobar:[['Hours','12:00 – 24:00'],['Closed','不定休'],['Address','春吉 アルテ天神 1F']],
  concept:{
    lead:'本店ゆずりの肉を、<br><em>良コスパ</em>で。',
    copy:['ニューヨーコは、焼肉すどう 春吉の2軒目。A5ではなく、旨みとサシの甘みがちょうどいいA4等級の黒毛和牛を選び、価格を抑えました。50席のにぎやかな店内で、肩肘を張らずに。','昼焼肉も、宴会の貸切も。本店で培った肉の目利きを、いちばん多くの人に届けるための店です。'],
    pillars:[['A4という選択','Grade','旨みとサシのバランスが良く、毎日でも重くない。価格と味の、いちばんいい交点。'],['昼から','Lunch','昼焼肉をご用意。ランチの焼肉という贅沢を、春吉の日常に。'],['みんなで','Together','20〜50名様の貸切に対応。歓送迎会、お祝い、チームの打ち上げに。']]
  },
  feature:{
    en:'Everyday', jp:'大衆焼肉という姿勢', visual:'city', vtext:'春吉の、夜に。', corner:'Haruyoshi · New Yoko',
    lead:'すどうの肉を、<br>いちばん近くに。',
    copy:['2022年2月、春吉に開いたニューヨーコは、焼肉すどうの中でいちばん「開かれた」店です。名物の飲めるロース、特製コプチャン、タン塩、ハラミ。定番をきちんと、良心的な価格で。','カード・PayPay対応。昼焼肉はInstagramの予約ページからも受け付けています。'],
    timeline:[['2013','熊本・上通に「焼肉すどう」誕生。'],['2016','福岡・春吉に「焼肉すどう 春吉」。'],['2021','姉妹店「焼肉ヨーコ」を大濠に。'],['2022.02','セカンドブランド「焼肉ニューヨーコ」を春吉に開店。']]
  },
  courses:[
    {tag:'Lunch',name:'昼焼肉',price:'¥1,500〜',note:'目安 / お一人様',meta:['予約制','Instagram受付'],desc:'昼から焼肉という贅沢を、気軽な価格で。昼焼肉はInstagramの予約ページ、またはお電話で受け付けています。',list:['営業日・時間はSNSでご確認ください','内容は季節により変わります'],sig:true},
    {tag:'Party',name:'貸切・宴会',price:'20〜50名',note:'貸切対応',meta:['50席','カード / PayPay可'],desc:'歓送迎会やお祝いに、店内を貸し切りで。人数・ご予算に合わせてご提案します。',list:['個室はございません','駐車場はございません','お気軽にお問い合わせください']}
  ],
  menu:[['【名物】飲めるロース','¥1,650','薄く引いたロースを、さっと炙って。ニューヨーコの必食。'],['特製コプチャン','¥1,100','脂の甘みを、火で引き出す。'],['タン塩','お問い合わせ','定番を、きちんと。'],['ハラミ','お問い合わせ','赤身の旨みをタレで。'],['冷麺','お問い合わせ','締めの一杯。'],['キムチ','お問い合わせ','肉の合間に。']],
  menuNote:'※ 価格は税込表示です。仕入れにより内容・価格が変更となる場合があります。',
  space:{
    lead:'50席の、<br>にぎやかな夜。',
    copy:'天神南から歩いて4分、アルテ天神の1階。50席の店内は、ひとりでも、大人数でも。20〜50名様の貸切にも対応しています。',
    stats:[['50','席','テーブル席',true],['貸切','可','20〜50名様'],['昼','〜夜','12:00 – 24:00'],['徒歩','4分','天神南駅より']],
    svg:CITY, vtag:'Haruyoshi · Tenjin Minami', vjp:'春吉 アルテ天神 1F'
  },
  awards:null,
  info:{access:'地下鉄七隈線「天神南」駅より徒歩約4分',hours:'12:00 – 24:00',hoursNote:'L.O. 22:30 ／ 昼焼肉は予約制',closed:'不定休',tel:[['050-5869-1165','ご予約専用'],['092-733-2988','店舗']],seats:'50席（個室なし）／ 貸切 20〜50名様',budget:'昼 ¥1,500 〜 2,000 ／ 夜 ¥4,000 〜 5,000',links:[['https://tabelog.com/fukuoka/A4001/A400103/40059546/','食べログ']]},
  mapQ:'福岡県福岡市中央区春吉3-23-3', mapName:'焼肉ニューヨーコ',
  reserve:{title:'今日の焼肉は、<br>ニューヨーコで。',text:'お席のご予約、貸切のご相談を承ります。昼焼肉はInstagramの予約ページからもどうぞ。',tel:'050-5869-1165',sub:'Reservation · 12:00 – 24:00（L.O. 22:30）',web:'https://www.tablecheck.com/shops/yakinikunewyoko/reserve'}
}
];

const esc = s => s;
const HEAD = (title, desc, slug) => `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${desc}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="焼肉すどう">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:locale" content="ja_JP">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0b0a09">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Shippori+Mincho+B1:wght@400;500;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Noto+Sans+JP:wght@300;400;500&display=swap" rel="stylesheet">
<link rel="icon" type="image/png" href="assets/logo-ivory.png">
<link rel="apple-touch-icon" href="assets/logo-ivory.png">
<meta property="og:image" content="assets/grill-master.jpg">
<link rel="stylesheet" href="assets/site.css?v=3">
</head>
<body data-page="${slug}">
<div class="loader" id="loader" aria-hidden="true"><div class="loader-mark"><img src="assets/logo-gold.png" alt=""></div><div class="loader-en">YAKINIKU SUDOU</div></div>
<div class="cursor" id="cursor"><div class="cursor-dot"></div></div>
<div class="cursor-ring" id="cursorRing"></div>
`;

const header = (nav, brandJp, brandEn) => `<header class="header" id="header">
  <a href="index.html" class="brand" aria-label="焼肉すどう">
    <span class="brand-mark"><img src="assets/logo-ivory.png" alt=""></span>
    <span class="brand-text"><span class="brand-jp">${brandJp}</span><span class="brand-en">${brandEn}</span></span>
  </a>
  <nav class="nav" id="nav">${nav}</nav>
  <button class="burger" id="burger" aria-label="メニュー" aria-expanded="false"><span></span><span></span><span></span></button>
</header>
`;

const footer = () => `<footer class="footer">
  <div class="wrap">
    <div class="footer-top">
      <a href="index.html" class="brand" aria-label="焼肉すどう">
        <span class="brand-mark"><img src="assets/logo-ivory.png" alt=""></span>
        <span class="brand-text"><span class="brand-jp">焼肉すどう</span><span class="brand-en">Yakiniku Sudou · Kumamoto / Fukuoka</span></span>
      </a>
      <div class="footer-stores">
        ${stores.map(s=>`<a href="${s.slug}.html"><b>${s.name}</b>〒${s.postal}　${s.address}</a>`).join('\n        ')}
      </div>
    </div>
    <div class="footer-copy"><span>© Yakiniku Sudou</span><span>Kumamoto · Fukuoka</span></div>
  </div>
</footer>
<a href="#top" class="totop" id="totop" aria-label="ページ上部へ"><svg viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7"/></svg></a>
<script src="assets/site.js?v=3"></script>
</body>
</html>
`;

function storePage(s){
  const nav = `<a href="index.html" class="jp">系列店</a><a href="#concept">Concept</a><a href="#course">Course</a><a href="#space">Space</a><a href="#access">Access</a><a href="#reserve" class="nav-reserve">ご予約</a>`;
  const ld = {
    "@context":"https://schema.org","@type":"Restaurant","name":s.name,"servesCuisine":"焼肉","priceRange":s.info.budget,
    "telephone":s.info.tel[0][0],"address":{"@type":"PostalAddress","postalCode":s.postal,"addressCountry":"JP","streetAddress":s.address},
    "acceptsReservations":"True"
  };
  let h = HEAD(`${s.name}｜焼肉すどう`, s.description, s.slug);
  h += header(nav, s.name, s.en);
  h += `<main id="top">
<section class="hero${s.photo?' has-photo':''}">
  ${s.photo?'<div class="hero-photo" style="background-image:url(assets/grill-master.jpg)"></div>':''}
  <div class="hero-bg"></div>
  <canvas id="embers" aria-hidden="true"></canvas>
  <p class="hero-vert">${s.vert}</p>
  <div>
    <p class="hero-kicker">${s.kicker}</p>
    <h1 class="hero-title" data-split>${s.title}</h1>
    <div class="hero-row">
      <p class="hero-lead">${s.lead}</p>
      <div class="hero-ctas">
        <a href="#reserve" class="btn btn-primary"><i></i>ご予約はこちら</a>
        <a href="#course" class="btn"><i></i>お品書きを見る</a>
      </div>
    </div>
  </div>
  <div class="hero-scroll"><b></b>Scroll</div>
  <div class="hero-badges">${s.seals.map(b=>`<div class="seal">${b[0]}<em>${b[1]}</em>${b[2]}</div>`).join('')}</div>
</section>
<div class="infobar">${s.infobar.map(i=>`<span>${i[0]}<b>${i[1]}</b></span>`).join('')}</div>

<section class="section concept" id="concept">
  <div class="wrap">
    <div class="sec-head rv"><span class="sec-num">01</span><h2 class="sec-en">Philosophy</h2><span class="sec-jp">私たちの考え</span></div>
    <div class="concept-grid">
      <div class="concept-statement">
        <p class="lead rv">${s.concept.lead}</p>
        ${s.concept.copy.map((c,i)=>`<p class="copy rv"${i===0?' style="margin-top:32px"':''}>${c}</p>`).join('\n        ')}
      </div>
      <div class="pillars">
        ${s.concept.pillars.map((p,i)=>`<div class="pillar rv"><span class="pillar-num">0${i+1}</span><div><h3>${p[0]}<small>${p[1]}</small></h3><p>${p[2]}</p></div></div>`).join('\n        ')}
      </div>
    </div>
  </div>
</section>

<section class="section master" id="master">
  <div class="wrap">
    <div class="sec-head rv"><span class="sec-num">02</span><h2 class="sec-en">${s.feature.en}</h2><span class="sec-jp">${s.feature.jp}</span></div>
    <div class="master-grid">
      <figure class="visual ${s.feature.visual}${s.photo?' photo':''} rv">
        ${s.photo?'<img src="assets/grill-master.jpg" alt="焼師が肉を焼き上げる様子">':'<!-- 写真を入れる場合はここに <img src="..." alt=""> を追加 -->'}
        <span class="heat"></span><span class="vtext">${s.feature.vtext}</span><span class="corner">${s.feature.corner}</span>
      </figure>
      <div class="master-copy">
        <p class="lead rv">${s.feature.lead}</p>
        ${s.feature.copy.map(c=>`<p class="copy rv">${c}</p>`).join('\n        ')}
        <ul class="timeline rv">${s.feature.timeline.map(t=>`<li><b>${t[0]}</b><span>${t[1]}</span></li>`).join('')}</ul>
      </div>
    </div>
  </div>
</section>

<section class="section course" id="course">
  <div class="wrap">
    <div class="sec-head rv"><span class="sec-num">03</span><h2 class="sec-en">Course</h2><span class="sec-jp">コース・お品書き</span></div>
    <div class="course-cards${s.courses.length===1?' single':''}">
      ${s.courses.map(c=>`<article class="card${c.sig?' is-signature':''} rv">
        <span class="card-tag">${c.tag}</span>
        <h3>${c.name}</h3>
        <div class="price">${c.price}<small>${c.note}</small></div>
        <div class="meta">${c.meta.map(m=>`<span>${m}</span>`).join('')}</div>
        <p>${c.desc}</p>
        <ul>${c.list.map(l=>`<li>${l}</li>`).join('')}</ul>
      </article>`).join('\n      ')}
    </div>
    <div class="sec-head rv" style="margin-bottom:24px"><span class="sec-num">À la carte</span><h2 class="sec-en" style="font-size:clamp(28px,3.8vw,52px)">Specialities</h2></div>
    <div class="menu-grid">
      ${s.menu.map(m=>`<div class="menu-item rv"><span class="menu-name">${m[0]}</span><span class="menu-price">${m[1]}</span><span class="menu-desc">${m[2]}</span></div>`).join('\n      ')}
    </div>
    <p class="note rv">${s.menuNote}</p>
  </div>
</section>

<section class="section space" id="space">
  <div class="wrap">
    <div class="sec-head rv"><span class="sec-num">04</span><h2 class="sec-en">Space</h2><span class="sec-jp">空間</span></div>
    <div class="space-grid">
      <div>
        <p class="lead rv">${s.space.lead}</p>
        <p class="copy rv" style="margin-top:28px">${s.space.copy}</p>
        <div class="stats rv">
          ${s.space.stats.map(t=>{
            const isNum=/^\d+$/.test(t[0]);
            const b = t[3] ? `<b data-count="${t[0]}"><small>${t[1]}</small></b>` : (isNum ? `<b>${t[0]}<small>${t[1]}</small></b>` : `<b class="jp">${t[0]}${t[1]?`<small>${t[1]}</small>`:''}</b>`);
            return `<div class="stat">${b}<span>${t[2]}</span></div>`;
          }).join('\n          ')}
        </div>
      </div>
      <figure class="space-visual rv">
        <!-- 写真を入れる場合はここに <img src="..." alt=""> を追加 -->
        ${s.space.svg}
        <span class="vtag">${s.space.vtag}</span><span class="vjp">${s.space.vjp}</span>
      </figure>
    </div>
  </div>
</section>
${s.awards?`
<section class="awards"><div class="wrap awards-row">${s.awards.map(a=>`<div class="award rv"><small>${a[0]}</small><b>${a[1]}</b><span>${a[2]}</span></div>`).join('')}</div></section>`:''}

<section class="section access" id="access">
  <div class="wrap">
    <div class="sec-head rv"><span class="sec-num">05</span><h2 class="sec-en">Access</h2><span class="sec-jp">店舗情報</span></div>
    <div class="access-grid">
      <dl class="info rv">
        <div><dt>Name</dt><dd><strong>${s.name}</strong><br>${s.en.replace(' · ',' ')}</dd></div>
        <div><dt>Address</dt><dd>〒${s.postal}<br>${s.address}</dd></div>
        <div><dt>Access</dt><dd>${s.info.access}</dd></div>
        <div><dt>Hours</dt><dd><strong>${s.info.hours}</strong><small>${s.info.hoursNote}</small></dd></div>
        <div><dt>Closed</dt><dd>${s.info.closed}</dd></div>
        <div><dt>Tel</dt><dd>${s.info.tel.map(t=>`<a href="tel:${t[0].replace(/-/g,'')}">${t[0]}</a>（${t[1]}）`).join('<br>')}</dd></div>
        <div><dt>Seats</dt><dd>${s.info.seats}</dd></div>
        <div><dt>Budget</dt><dd>${s.info.budget}</dd></div>
        <div><dt>Links</dt><dd>${s.info.links.map(l=>`<a href="${l[0]}" target="_blank" rel="noopener">${l[1]}</a>`).join('　')}　<a href="index.html">系列店一覧</a></dd></div>
      </dl>
      <div class="map rv">
        <div class="map-fallback"><div><small>Map</small><b>${s.address.replace(/^福岡県|^熊本県/,'').replace(' ','<br>')}</b><a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.mapName+' '+s.address)}" target="_blank" rel="noopener" class="btn"><i></i>Google マップで開く</a></div></div>
        <iframe title="${s.name} 地図" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=${encodeURIComponent(s.mapQ)}&z=17&output=embed"></iframe>
      </div>
    </div>
  </div>
</section>

<section class="reserve" id="reserve">
  <div class="wrap">
    <span class="sec-num rv">06 — Reservation</span>
    <h2 class="rv">${s.reserve.title}</h2>
    <p class="rv">${s.reserve.text}</p>
    <a href="tel:${s.reserve.tel.replace(/-/g,'')}" class="tel rv">${s.reserve.tel}</a>
    <span class="tel-sub rv">${s.reserve.sub}</span>
    <div class="hero-ctas rv">
      <a href="${s.reserve.web}" target="_blank" rel="noopener" class="btn btn-primary"><i></i>WEBで予約する</a>
      <a href="tel:${s.reserve.tel.replace(/-/g,'')}" class="btn"><i></i>電話で予約する</a>
    </div>
  </div>
</section>
</main>
<script type="application/ld+json">${JSON.stringify(ld)}</script>
`;
  h += footer();
  return h;
}

function indexPage(){
  const nav = `<a href="#stores" class="jp">系列店</a><a href="#philosophy">Philosophy</a><a href="#history">History</a><a href="kumamoto.html#reserve" class="nav-reserve">ご予約</a>`;
  let h = HEAD('焼肉すどう｜熊本本店・春吉・ヨーコ・ニューヨーコ', '熊本・上通で生まれたフルアテンド焼肉「焼肉すどう」。熊本本店、福岡・春吉店、姉妹店の焼肉ヨーコ（大濠）、焼肉ニューヨーコ（春吉）。一頭ごとに肉質を見極め、焼師が一枚ずつ焼き上げる。', 'index');
  h += header(nav, '焼肉すどう', 'Yakiniku Sudou · Kumamoto / Fukuoka');
  h += `<main id="top">
<section class="hero has-photo">
  <div class="hero-photo" style="background-image:url(assets/grill-master.jpg)"></div>
  <div class="hero-bg"></div>
  <canvas id="embers" aria-hidden="true"></canvas>
  <p class="hero-vert">熊本に生まれ、福岡へ。四つの焼肉。</p>
  <div>
    <p class="hero-kicker">Yakiniku Sudou · Est. Kumamoto · Fukuoka</p>
    <h1 class="hero-title" data-split>一枚を、<br><em>極める。</em></h1>
    <div class="hero-row">
      <p class="hero-lead">一頭ごとに肉質を見極め、部位に合わせて切り、<strong>焼師</strong>が一枚ずつ焼き上げる。<br>熊本・上通で生まれたその流儀は、いま福岡の三つの店へと受け継がれています。</p>
      <div class="hero-ctas">
        <a href="#stores" class="btn btn-primary"><i></i>店舗を選ぶ</a>
        <a href="#philosophy" class="btn"><i></i>私たちの考え</a>
      </div>
    </div>
  </div>
  <div class="hero-scroll"><b></b>Scroll</div>
  <div class="hero-badges"><div class="seal">Tabelog<em>百名店</em>Yakiniku 2024 · 25</div><div class="seal">Tabelog<em>Bronze</em>Award 2026</div></div>
</section>
<div class="infobar"><span>Kumamoto<b>熊本本店</b></span><span>Fukuoka<b>春吉</b></span><span>Fukuoka<b>ヨーコ</b></span><span>Fukuoka<b>ニューヨーコ</b></span></div>

<section class="section stores" id="stores">
  <div class="wrap">
    <div class="sec-head rv"><span class="sec-num">01</span><h2 class="sec-en">Stores</h2><span class="sec-jp">四つの店</span></div>
    <div class="store-grid">
      ${stores.map((s,i)=>`<a href="${s.slug}.html" class="store rv">
        <span class="store-num">0${i+1} — ${s.role}</span>
        <h3>${s.name}</h3>
        <span class="en">${s.en}</span>
        <p>${s.tagline}</p>
        <div class="meta"><span><b>${s.area}</b></span><span>${s.metaBand}</span></div>
        <span class="go"><i></i>View</span>
      </a>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="section concept" id="philosophy">
  <div class="wrap">
    <div class="sec-head rv"><span class="sec-num">02</span><h2 class="sec-en">Philosophy</h2><span class="sec-jp">私たちの考え</span></div>
    <div class="concept-grid">
      <div class="concept-statement">
        <p class="lead rv">肉は、<em>目利き</em>から。<br>味は、焼き手で決まる。</p>
        <p class="copy rv" style="margin-top:32px">店主・須藤悦男は、青果市場で「目利き」を学び、東京・浜松町の焼肉店で約7年、希少部位の扱いを修業しました。2013年、食材に恵まれた熊本・上通で「焼肉すどう」を開店。肉を焼く専門のスタッフ「焼師」が一枚ずつ焼き上げるフルアテンド型を貫いています。</p>
        <p class="copy rv">2016年には福岡・春吉へ。そして、同じ目で選んだ肉を日常の価格で楽しんでいただくために、炭火の「焼肉ヨーコ」、大衆焼肉の「焼肉ニューヨーコ」を生みました。かたちは違っても、肉を選ぶ目はひとつです。</p>
      </div>
      <div class="pillars">
        <div class="pillar rv"><span class="pillar-num">01</span><div><h3>選ぶ<small>Select</small></h3><p>一頭ごとに違う肉質を、店主自らの目で。四つの店すべてに、同じ目利きが通っています。</p></div></div>
        <div class="pillar rv"><span class="pillar-num">02</span><div><h3>切る<small>Cut</small></h3><p>部位ごとに、最も旨い厚みと向きがある。名物「飲めるロース」も、その考えから生まれました。</p></div></div>
        <div class="pillar rv"><span class="pillar-num">03</span><div><h3>焼く<small>Grill</small></h3><p>焼師に委ねる店と、自分の手で焼く店。どちらにも、肉にふさわしい火があります。</p></div></div>
      </div>
    </div>
  </div>
</section>

<section class="section master" id="history">
  <div class="wrap">
    <div class="sec-head rv"><span class="sec-num">03</span><h2 class="sec-en">History</h2><span class="sec-jp">あゆみ</span></div>
    <div class="master-grid">
      <figure class="visual photo rv"><img src="assets/grill-master.jpg" alt="焼師が肉を焼き上げる様子"><span class="heat"></span><span class="vtext">熊本から、福岡へ。</span><span class="corner">Since 2013</span></figure>
      <div class="master-copy">
        <p class="lead rv">ひとつの目利き、<br>四つのかたち。</p>
        <p class="copy rv">フルアテンドの「すどう」、炭火の「ヨーコ」、大衆焼肉の「ニューヨーコ」。価格も、焼き方も違います。けれど、肉を選ぶ目と、一枚を大切にする姿勢は同じです。</p>
        <ul class="timeline rv">
          <li><b>—</b><span>青果市場での勤務を経て、東京・浜松町の焼肉店で約7年の修業。</span></li>
          <li><b>2012</b><span>独立。</span></li>
          <li><b>2013</b><span>熊本・上通に「焼肉すどう」誕生。</span></li>
          <li><b>2016.05</b><span>福岡・春吉に「焼肉すどう 春吉」を出店。</span></li>
          <li><b>2021.04</b><span>姉妹店「焼肉ヨーコ」を福岡・大濠に開店。</span></li>
          <li><b>2022.02</b><span>セカンドブランド「焼肉ニューヨーコ」を福岡・春吉に開店。</span></li>
          <li><b>2024–25</b><span>熊本本店が、食べログ「焼肉 百名店」に2年連続で選出。</span></li>
          <li><b>2026</b><span>春吉店が、食べログアワード Bronze を受賞。</span></li>
        </ul>
      </div>
    </div>
  </div>
</section>

<section class="awards"><div class="wrap awards-row">
  <div class="award rv"><small>Kumamoto Honten</small><b>焼肉 WEST 百名店<br>2024 · 2025 選出</b><span>食べログ 焼肉 百名店</span></div>
  <div class="award rv"><small>Haruyoshi</small><b>食べログアワード<br>Bronze 受賞</b><span>Tabelog Award 2026</span></div>
  <div class="award rv"><small>Yoko · New Yoko</small><b>名物<br>飲めるロース</b><span>姉妹店の看板メニュー</span></div>
</div></section>

<section class="reserve" id="reserve">
  <div class="wrap">
    <span class="sec-num rv">04 — Reservation</span>
    <h2 class="rv">今夜の一枚を、<br>どの店で。</h2>
    <p class="rv">各店のご予約は、それぞれの店舗ページから承ります。</p>
    <div class="hero-ctas rv">
      ${stores.map(s=>`<a href="${s.slug}.html#reserve" class="btn${s.slug==='kumamoto'?' btn-primary':''}"><i></i>${s.short}</a>`).join('\n      ')}
    </div>
  </div>
</section>
</main>
`;
  h += footer();
  return h;
}

writeFileSync('index.html', indexPage());
for (const s of stores) writeFileSync(`${s.slug}.html`, storePage(s));
console.log('built: index.html, ' + stores.map(s=>s.slug+'.html').join(', '));
