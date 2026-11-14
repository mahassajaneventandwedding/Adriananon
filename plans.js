/* ===== Adriana & Non · Thames Valley Khao Yai — shared plan geometry + SVG builders =====
   ผังคร่าวๆ (ไม่ตามสเกลจริง) อ้างอิงผังสนามหญ้า Private Lawn, ผังโซนจากโรงแรม และผังที่ทีม Mahassajan วาด
   Reception layout: stage at top; long tables run toward the buffet line. Zone 3 / Zone 2 sit by the hotel buildings below the lawn. */
(function(){
const D = window.SEAT_DATA;
const NS = 'http://www.w3.org/2000/svg';
function el(tag, attrs, parent, text){
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (text != null) e.textContent = text;
  if (parent) parent.appendChild(e);
  return e;
}

/* ---------- Reception geometry ---------- */
const PITCH_Z1 = 24, PITCH_Z = 26;
const GEO = {
  'Z1-1': {x:440, y1:180}, 'Z1-2': {x:520, y1:180}, 'Z1-3': {x:600, y1:180},
  'Z3-A': {x:76,  y1:968}, 'Z3-B': {x:148, y1:968}, 'Z3-C': {x:220, y1:968}, 'Z3-D': {x:292, y1:968},
  'Z2-A': {x:406, y1:968}, 'Z2-B': {x:478, y1:968}, 'Z2-C': {x:550, y1:968}, 'Z2-D': {x:622, y1:968}
};
const TBY = {};
D.tables.forEach(t => {
  Object.assign(t, GEO[t.id]);
  t.pitch = t.zone === '1' ? PITCH_Z1 : PITCH_Z;
  t.rows = Math.max(t.left.length, t.right.length);
  t.y2 = t.y1 + t.rows * t.pitch;
  // extra chairs the hotel will add (guest listed in the file without a seat number)
  t.extraL = D.guests.filter(g => g.table === t.id && g.extra === 'L');
  t.extraR = D.guests.filter(g => g.table === t.id && g.extra === 'R');
  t.yEnd = t.y1 + Math.max(t.left.length + t.extraL.length, t.right.length + t.extraR.length) * t.pitch;
  TBY[t.id] = t;
});
function extraPos(g){
  const t = TBY[g.table], L = g.extra === 'L', arr = L ? t.extraL : t.extraR;
  const i = (L ? t.left.length : t.right.length) + arr.indexOf(g);
  return [t.x + (L ? -21 : 21), t.y1 + t.pitch/2 + i * t.pitch];
}
function seatPos(t, s){
  let i = t.left.indexOf(s), side = -1;
  if (i < 0){ i = t.right.indexOf(s); side = 1; }
  return [t.x + side * 21, t.y1 + t.pitch/2 + i * t.pitch];
}
function seatSide(t, s){ return t.left.includes(s) ? 'L' : 'R'; }
function seatIndex(t, s){ const i = t.left.indexOf(s); return (i >= 0 ? i : t.right.indexOf(s)) + 1; }
function seatList(t){ return [...t.left, ...t.right]; }

/* zone crops for the guest card */
const VIEW = { '1':'0 0 700 880', '2':'355 897 340 276', '3':'25 888 340 285', all:'0 0 700 1200' };

function lawn(svg){
  el('path', {d:'M412 0 L 6 880', class:'water'}, svg);
  el('polygon', {points:'420,30 680,30 680,860 40,860', class:'lawn'}, svg);
}

function buildVenue(opts = {}){
  const svg = el('svg', {viewBox: VIEW.all, role:'img', 'aria-label':'ผังงาน Thames Valley Khao Yai', class:'plan-svg'});
  lawn(svg);
  // features across the water (from the planner's site plan)
  const feat = (x, y, w, label, th, cls='feat') => {
    el('rect', {x, y, width:w, height:34, rx:8, class:cls}, svg);
    el('text', {x:x+w/2, y:y+(th?15:21), class:'f-en'}, svg, label);
    if (th) el('text', {x:x+w/2, y:y+27, class:'f-th'}, svg, th);
  };
  feat(70, 70, 128, 'Reception', 'ลงทะเบียน', 'feat entry');
  feat(232, 30, 118, 'Photo Backdrop', 'มุมถ่ายภาพ');
  feat(150, 268, 92, 'Singer', 'นักร้อง');
  feat(28, 420, 100, 'Gallery', 'แกลเลอรี');
  el('text', {x:150, y:620, class:'water-lbl'}, svg, 'สระน้ำ & สะพานหิน');
  feat(588, 862, 92, 'Bouquet');
  // stage
  el('rect', {x:480, y:42, width:120, height:56, rx:8, class:'stage'}, svg);
  el('text', {x:540, y:66, class:'st-en'}, svg, 'STAGE');
  el('text', {x:540, y:84, class:'st-th'}, svg, 'เวทีบ่าวสาว');
  el('text', {x:60, y:850, class:'zone-lbl', 'text-anchor':'start'}, svg, 'ZONE 1 · PRIVATE LAWN');
  // buffet
  el('rect', {x:170, y:792, width:390, height:22, rx:5, class:'buffet'}, svg);
  el('text', {x:365, y:807, class:'f-th', style:'font-size:11px'}, svg, 'ไลน์อาหาร (บุฟเฟต์) · Buffet');
  // lower zones
  [['3', 40, 'ZONE 3'], ['2', 370, 'ZONE 2']].forEach(([z, x, lbl]) => {
    el('rect', {x, y:900, width:290, height:262, rx:16, class:'zone-box'}, svg);
    el('text', {x:x+145, y:930, class:'zone-lbl'}, svg, lbl);
    const n = D.tables.filter(t => t.zone === z).reduce((a, t) => a + t.cap, 0);
    el('text', {x:x+145, y:948, class:'f-th'}, svg, n + ' ที่นั่ง');
  });
  el('text', {x:350, y:1188, class:'f-th', style:'font-size:11px'}, svg, 'ผังคร่าวๆ ไม่ตามสเกลจริง');
  drawTables(svg, opts);
  return svg;
}

function drawTables(svg, opts){
  const taken = new Set();
  D.guests.forEach(g => g.seats.forEach(s => taken.add(s)));
  D.tables.forEach(t => {
    const g = el('g', {class:'tg', 'data-t':t.id}, svg);
    el('rect', {x:t.x-9, y:t.y1, width:18, height:t.y2-t.y1, rx:3, class:'tb'}, g);
    el('rect', {x:t.x-33, y:t.y1-10, width:66, height:t.yEnd-t.y1+20, rx:12, class:'ring', style:'display:none'}, g);
    if (t.yEnd > t.y2) el('rect', {x:t.x-9, y:t.y2, width:18, height:t.yEnd-t.y2, rx:3, class:'tb ext'}, g);
    for (const x of [...t.extraL, ...t.extraR]){
      const [cx, cy] = extraPos(x);
      el('circle', {cx, cy, r:7, class:'ch extra'}, g);
      el('text', {x:cx, y:cy+0.5, class:'ch-n', style:'fill:#A8552F'}, g, '+');
    }
    const yl = t.yEnd;
    if (t.zone === '1'){
      el('text', {x:t.x, y:yl+22, class:'tb-name'}, g, t.label);
      el('text', {x:t.x, y:yl+37, class:'tb-sub'}, g, 'ที่ ' + Math.min(...seatList(t)) + '–' + Math.max(...seatList(t)));
    } else {
      el('text', {x:t.x, y:yl+20, class:'tb-sub'}, g, Math.min(...seatList(t)) + '–' + Math.max(...seatList(t)));
    }
    for (const s of seatList(t)){
      const [x, y] = seatPos(t, s);
      el('circle', {cx:x, cy:y, r:7, class:'ch' + (taken.has(s) ? ' taken' : '')}, g);
      el('text', {x, y:y+0.5, class:'ch-n'}, g, s);
    }
  });
  el('g', {id:'me-rec'}, svg);
}

/* ---------- Ceremony geometry ---------- */
const CER = { aisle:540, pitch:20, gap:22, rowY:[150,178,206,234] };
function cerPos(code){
  const side = code[0], n = +code.slice(1), row = Math.floor((n-1)/6), k = (n-1)%6;
  // Left: L01 is the outer seat, L06 next to the aisle. Right: R01 next to the aisle, R06 outer.
  const x = side === 'L' ? CER.aisle - CER.gap - (5-k)*CER.pitch : CER.aisle + CER.gap + k*CER.pitch;
  return [x, CER.rowY[row]];
}
function cerInfo(code){
  const side = code[0], n = +code.slice(1), row = Math.floor((n-1)/6)+1, k = (n-1)%6;
  const fromAisle = side === 'L' ? 6-k : k+1;
  return {side, row, fromAisle, sideTh: side === 'L' ? 'ซ้าย' : 'ขวา', sideEn: side === 'L' ? 'Left' : 'Right'};
}
const CER_CODES = Object.keys(D.ceremony);

function buildCeremony(){
  const svg = el('svg', {viewBox:'300 20 400 270', role:'img', 'aria-label':'ผังที่นั่งพิธีแลกคำมั่นสัญญา', class:'plan-svg'});
  lawn(svg);
  el('rect', {x:480, y:42, width:120, height:56, rx:8, class:'stage'}, svg);
  el('text', {x:540, y:66, class:'st-en'}, svg, 'STAGE');
  el('text', {x:540, y:84, class:'st-th'}, svg, 'เวทีบ่าวสาว');
  el('line', {x1:540, y1:118, x2:540, y2:262, class:'aisle'}, svg);
  el('text', {x:540, y:278, class:'f-th', style:'font-size:9.5px'}, svg, 'ทางเดินบ่าวสาว');
  CER.rowY.forEach((y, i) => { el('rect', {x:534, y:y-7, width:12, height:14, fill:'#E4EBDA'}, svg); el('text', {x:540, y:y+3.5, class:'row-n'}, svg, i+1); });
  el('text', {x:470, y:128, class:'f-th', style:'font-size:9px'}, svg, 'ฝั่งซ้าย');
  el('text', {x:612, y:128, class:'f-th', style:'font-size:9px'}, svg, 'ฝั่งขวา');
  const g = el('g', {}, svg);
  CER_CODES.forEach(c => {
    const [x, y] = cerPos(c);
    el('rect', {x:x-7.5, y:y-7.5, width:15, height:15, rx:4, class:'cc' + (D.ceremony[c] ? ' taken' : ''), 'data-c':c}, g);
  });
  el('text', {x:330, y:280, class:'f-th', style:'font-size:9px;text-anchor:start'}, svg, 'ผังคร่าวๆ');
  el('g', {id:'me-cer'}, svg);
  return svg;
}

window.PLAN = { D, TBY, el, extraPos, buildVenue, buildCeremony, seatPos, seatSide, seatIndex, seatList, cerPos, cerInfo, CER_CODES, VIEW };
})();
