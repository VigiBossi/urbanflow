// Minimal architectural line drawings for product cards (inline SVG, no image files).
const ACCENTS = {
  gold: { stroke: '#b8955a', fill: '#d9b77d' },
  black: { stroke: '#111111', fill: '#1b1b1b' },
  chrome: { stroke: '#8a8f95', fill: '#cfd3d7' },
};

const INK = '#1a1a1a';
const CERAMIC = '#fbfaf7';

function wrap(inner) {
  return `<svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
  <g fill="none" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round">${inner}</g></svg>`;
}

const floor = (y = 204) => `<line x1="24" y1="${y}" x2="216" y2="${y}" stroke-opacity=".35"/>`;
const shadow = (cx, cy, rx, ry = 6) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#evora-shadow)" stroke="none"/>`;

const ART = {
  wcWall: (a, body = CERAMIC) => `
    <line x1="56" y1="30" x2="56" y2="204" stroke-opacity=".45"/>${floor()}
    <rect x="44" y="44" width="12" height="38" rx="2" fill="${a.fill}" stroke="${a.stroke}"/>
    ${shadow(118, 204, 52, 5)}
    <path d="M56 100 H162 C178 100 188 110 188 124 C188 150 166 168 132 170 L100 171 C92 171 88 176 88 183 V186 H56 Z" fill="${body}"/>
    <path d="M58 93 H166 C178 93 186 96 189 102" stroke-width="2.4"/>
    <path d="M70 112 H170" stroke-opacity=".25"/>`,
  wcFloor: (a, body = CERAMIC) => `
    <line x1="52" y1="30" x2="52" y2="204" stroke-opacity=".45"/>${floor()}
    <rect x="40" y="48" width="12" height="36" rx="2" fill="${a.fill}" stroke="${a.stroke}"/>
    ${shadow(118, 204, 60, 5)}
    <path d="M52 92 H154 C176 92 188 104 188 120 C188 142 170 156 146 158 C134 162 128 178 130 204 H70 C72 186 66 172 52 166 Z" fill="${body}"/>
    <path d="M54 85 H160 C174 85 184 89 188 96" stroke-width="2.4"/>`,
  basinPedestal: (a, body = CERAMIC) => `${floor()}${shadow(120, 204, 40, 5)}
    <path d="M160 204 V62 C160 34 126 34 126 58 V70" stroke="${a.stroke}" stroke-width="5.5"/>
    <ellipse cx="160" cy="203" rx="9" ry="2.5" fill="${a.fill}" stroke="${a.stroke}"/>
    <path d="M66 86 H174 C174 114 154 132 120 134 C86 132 66 114 66 86 Z" fill="${body}"/>
    <ellipse cx="120" cy="86" rx="54" ry="8" fill="${body}"/>
    <ellipse cx="120" cy="87" rx="46" ry="5.5" stroke-opacity=".35"/>
    <path d="M108 133 C104 160 101 186 98 204 H142 C139 186 136 160 132 133" fill="${body}"/>
    <rect x="92" y="200" width="56" height="4" fill="${a.fill}" stroke="${a.stroke}"/>`,
  basinCounter: (a, body = CERAMIC) => `${floor()}
    <rect x="30" y="140" width="180" height="12" fill="#efe9df"/>
    <line x1="40" y1="152" x2="40" y2="204" stroke-opacity=".35"/><line x1="200" y1="152" x2="200" y2="204" stroke-opacity=".35"/>
    <path d="M70 140 C70 110 90 98 116 98 C142 98 162 110 162 140 Z" fill="${body}"/>
    <ellipse cx="116" cy="99" rx="46" ry="5" fill="${body}"/>
    <path d="M184 140 V80 C184 64 160 64 158 82 V88" stroke="${a.stroke}" stroke-width="5"/>
    <path d="M184 112 h12" stroke="${a.stroke}" stroke-width="3.5"/>`,
  basinWall: (a, body = CERAMIC) => `
    <line x1="24" y1="56" x2="216" y2="56" stroke-opacity=".2"/>
    <rect x="58" y="104" width="124" height="46" rx="12" fill="${body}"/>
    <path d="M74 106 C80 132 160 132 166 106" stroke="#fff" stroke-opacity=".35"/>
    <rect x="112" y="72" width="16" height="8" rx="2" fill="${a.fill}" stroke="${a.stroke}"/>
    <path d="M120 80 V96" stroke="${a.stroke}" stroke-width="4"/>
    <circle cx="146" cy="76" r="4" fill="${a.fill}" stroke="${a.stroke}"/>`,
  vanity: (a, body = '#6b5a48') => `
    <path d="M86 92 V44 A34 34 0 0 1 154 44 V92" stroke-opacity=".5"/>
    <rect x="30" y="108" width="180" height="8" fill="#e6dccb"/>
    <rect x="36" y="116" width="168" height="56" fill="${body}"/>
    <line x1="36" y1="144" x2="204" y2="144" stroke="#fff" stroke-opacity=".25"/>
    <line x1="120" y1="116" x2="120" y2="172" stroke="#fff" stroke-opacity=".25"/>
    <path d="M96 108 C98 120 142 120 144 108" stroke-opacity=".35"/>
    <path d="M120 108 V96 C120 90 128 90 130 96" stroke="${a.stroke}" stroke-width="4"/>
    ${shadow(120, 196, 70, 4)}`,
  vanityDouble: (a, body = '#2b2724') => `
    <rect x="44" y="44" width="62" height="50" rx="2" stroke-opacity=".45"/><rect x="134" y="44" width="62" height="50" rx="2" stroke-opacity=".45"/>
    <rect x="22" y="110" width="196" height="6" fill="#ece6dc"/>
    <rect x="26" y="116" width="188" height="54" fill="${body}"/>
    <line x1="26" y1="143" x2="214" y2="143" stroke="#fff" stroke-opacity=".22"/>
    <path d="M58 110 C60 120 90 120 92 110 M148 110 C150 120 180 120 182 110" stroke-opacity=".35"/>
    <path d="M75 110 V98 C75 92 82 92 84 98 M165 110 V98 C165 92 172 92 174 98" stroke="${a.stroke}" stroke-width="3.5"/>
    ${shadow(120, 194, 80, 4)}`,
  faucetTall: (a) => `${floor(196)}${shadow(110, 196, 30, 4)}
    <ellipse cx="110" cy="193" rx="20" ry="4" fill="${a.fill}" stroke="${a.stroke}"/>
    <path d="M110 192 V82 C110 40 172 40 172 82 V98" stroke="${a.stroke}" stroke-width="11"/>
    <path d="M110 192 V82 C110 40 172 40 172 82 V98" stroke="${a.fill}" stroke-width="7"/>
    <path d="M110 150 L82 132" stroke="${a.stroke}" stroke-width="6"/>
    <path d="M172 104 v14" stroke="#9ec8db" stroke-opacity=".6" stroke-dasharray="2 5"/>`,
  faucetWall: (a) => `
    <line x1="40" y1="40" x2="40" y2="200" stroke-opacity=".4"/>
    <rect x="40" y="94" width="10" height="26" fill="${a.fill}" stroke="${a.stroke}"/>
    <rect x="50" y="102" width="130" height="9" rx="1" fill="${a.fill}" stroke="${a.stroke}"/>
    <rect x="40" y="148" width="8" height="18" fill="${a.fill}" stroke="${a.stroke}"/>
    <path d="M48 157 H92" stroke="${a.stroke}" stroke-width="4"/>
    <path d="M174 114 v34" stroke="#9ec8db" stroke-opacity=".6" stroke-dasharray="2 5"/>`,
  faucetFloor: (a) => `${floor()}${shadow(96, 204, 24, 4)}
    <ellipse cx="96" cy="202" rx="16" ry="3.5" fill="${a.fill}" stroke="${a.stroke}"/>
    <path d="M96 202 V70 C96 34 156 34 156 70 V84" stroke="${a.stroke}" stroke-width="8"/>
    <path d="M96 202 V70 C96 34 156 34 156 70 V84" stroke="${a.fill}" stroke-width="5"/>
    <path d="M96 120 h18" stroke="${a.stroke}" stroke-width="5"/>
    <rect x="112" y="128" width="8" height="34" rx="3" fill="${a.fill}" stroke="${a.stroke}"/>
    <path d="M116 162 C116 178 104 186 96 186" stroke-opacity=".4"/>`,
  showerRain: (a) => `
    <line x1="24" y1="30" x2="216" y2="30" stroke-opacity=".4"/>
    <path d="M120 30 V64" stroke="${a.stroke}" stroke-width="4"/>
    <ellipse cx="120" cy="68" rx="70" ry="8" fill="${a.fill}" stroke="${a.stroke}"/>
    ${[66, 84, 102, 120, 138, 156, 174].map((x) => `<path d="M${x} 82 V${170 + (x % 3) * 8}" stroke="#9ec8db" stroke-opacity=".55" stroke-dasharray="2 7"/>`).join('')}
    ${floor(204)}`,
  showerColumn: (a) => `
    <line x1="68" y1="28" x2="68" y2="204" stroke-opacity=".4"/>${floor()}
    <path d="M74 190 V46 C74 36 80 32 92 32 H150" stroke="${a.stroke}" stroke-width="5"/>
    <rect x="128" y="30" width="56" height="6" rx="3" fill="${a.fill}" stroke="${a.stroke}"/>
    <rect x="66" y="118" width="44" height="14" rx="7" fill="${a.fill}" stroke="${a.stroke}"/>
    <rect x="90" y="140" width="8" height="40" rx="4" fill="${a.fill}" stroke="${a.stroke}"/>
    ${[136, 148, 160, 172].map((x) => `<path d="M${x} 42 V${130 + (x % 4) * 6}" stroke="#9ec8db" stroke-opacity=".5" stroke-dasharray="2 7"/>`).join('')}`,
  showerScreen: (a) => `
    <line x1="40" y1="28" x2="40" y2="204" stroke-opacity=".45"/>${floor()}
    <rect x="44" y="36" width="122" height="166" fill="#dfeef2" fill-opacity=".45" stroke-opacity=".4"/>
    <path d="M44 36 H166" stroke="${a.stroke}" stroke-width="3"/><path d="M44 202 H166" stroke="${a.stroke}" stroke-width="3"/>
    <path d="M166 36 L40 36" stroke="${a.stroke}" stroke-width="2"/>
    <path d="M60 60 L100 40 M60 90 L130 50" stroke="#fff" stroke-width="2" stroke-opacity=".8"/>`,
};

export function productArt(p) {
  const a = ACCENTS[p.accent] || ACCENTS.gold;
  const fn = ART[p.art];
  return fn ? wrap(fn(a, p.body)) : '';
}
