// hero.js
const fs = require('fs');
const HERO_DIR = './assets/hero.svg';

/**
  * FONT_DIR is a subset of GohuFont 14 Nerd Font Mono (the julienklaer.dev font)
  * holding ASCII plus '█', '·' and '→'. Rebuild it with fonttools when other glyphs are needed:
  *   pyftsubset GohuFontuni14NerdFontMono-Regular.ttf --unicodes=U+0020-007E,U+2588,U+00B7,U+2192 \
  *     --flavor=woff2 --no-hinting --desubroutinize --output-file=assets/gohufont.woff2
*/
const FONT_DIR = './assets/gohufont.woff2';

/**
  * HERO is the content of the banner, mirroring Hero.astro on the blog.
  * Widths and the typing animation are derived from the strings, edit freely.
*/
const HERO = {
    brand: '// MadJlzz',
    site: 'julienklaer.dev',
    prompt: 'reader@madlab:~$',
    command: 'whoami && cat ./welcome.txt',
    title: '// MadJlzz',
    subtitle: 'logs from the edge of the network',
};

/**
  * Same palette and starfield knobs as the blog (BaseLayout.astro, Starfield.astro).
*/
const W = 840, H = 300;
const CH = 8; // gohufont-14 advance width at 14px
const C = { bg: '#0a0e1a', fg: '#e5e9f0', dim: '#8a93a8', accent: '#7df9ff', accent2: '#ff6ec7', warn: '#fbd38d', rule: '#1f2741' };
const STAR_DENSITY = 7000;

const ROCKET_BODY = [
    '       /\\',
    '      /  \\',
    '     /----\\',
    '     |    |',
    '     | () |',
    '     |    |',
    '    /|----|\\',
    '   / |    | \\',
    '  /__|____|__\\',
];
const ROCKET_FLAME = [
    '      \\||/',
    '      ████',
    '     ██████',
    '    ████████',
    '      ████',
    '       ██',
];

const esc = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const lines = (rows, firstBaseline) => rows.map((row, i) => `<tspan x="0" y="${firstBaseline + i * 14}">${esc(row)}</tspan>`).join('');

// deterministic PRNG so the starfield does not change between builds
let seed = 42;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);

/**
  * Two drifting layers like the blog canvas: small far stars, bigger near ones.
  * Every star is drawn twice, one canvas height apart, so the drift loops seamlessly.
*/
function starfield() {
    const layers = { far: [], near: [] };
    for (let i = 0; i < Math.floor((W * H) / STAR_DENSITY); i++) {
        const z = 0.4 + rnd() * 0.6;
        const star = { x: Math.floor(rnd() * W), y: Math.floor(rnd() * H), z: z.toFixed(2), twinkle: Math.floor(rnd() * 4), delay: (rnd() * 2.6).toFixed(2) };
        (z < 0.55 ? layers.far : layers.near).push(star);
    }
    const rects = (stars, size) => stars
        .flatMap((s) => [s.y, s.y + H].map((y) => `<rect class="tw${s.twinkle}" x="${s.x}" y="${y}" width="${size}" height="${size}" opacity="${s.z}" style="animation-delay:-${s.delay}s"/>`))
        .join('\n      ');
    return { far: rects(layers.far, 1), near: rects(layers.near, 3) };
}

/**
  * The rocket is rotated 45deg like on the blog. '█' are drawn as squares
  * instead of glyphs to keep the pixel-grid look of the flame.
*/
function rocket() {
    const width = 14 * CH, height = (ROCKET_BODY.length + ROCKET_FLAME.length) * 14;
    const flameTop = ROCKET_BODY.length * 14;
    const blocks = ROCKET_FLAME.slice(1).flatMap((row, r) => [...row].flatMap((c, col) => c === '█'
        ? [`<rect x="${col * CH}" y="${flameTop + (r + 1) * 14 + 1}" width="${CH - 1}" height="13"/>`] : [])).join('');
    return `<g class="bob">
    <g transform="translate(165 172) rotate(45) translate(${-width / 2} ${-height / 2})">
      <text class="accent" filter="url(#glow-body)">${lines(ROCKET_BODY, 12)}</text>
      <g class="flame" filter="url(#glow-flame)"><text class="warn">${lines(ROCKET_FLAME.slice(0, 1), 12 + flameTop)}</text><g fill="${C.warn}" shape-rendering="crispEdges">${blocks}</g></g>
    </g>
  </g>`;
}

function render(font) {
    const stars = starfield();
    const tx = 330;                                    // terminal column
    const typedX = tx + HERO.prompt.length * CH + CH;  // .5rem gap after the prompt
    const typedW = HERO.command.length * CH;
    const steps = HERO.command.length;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="t">
  <title id="t">${esc(`${HERO.prompt} ${HERO.command} — ${HERO.title}, ${HERO.subtitle}`)}</title>
  <defs>
    <style>
      @font-face { font-family: "Gohu"; src: url(data:font/woff2;base64,${font}) format("woff2"); }
      text { font-family: "Gohu", ui-monospace, "Cascadia Code", "JetBrains Mono", monospace; font-size: 14px; white-space: pre; fill: ${C.fg}; }
      .accent { fill: ${C.accent}; } .accent2 { fill: ${C.accent2}; } .warn { fill: ${C.warn}; } .dim { fill: ${C.dim}; }
      .title { font-size: 28px; }
      .stars rect { fill: ${C.fg}; shape-rendering: crispEdges; }
      .cursor { fill: ${C.accent}; animation: blink 1s step-end infinite; }
      .drift-far { animation: drift 75s linear infinite; }
      .drift-near { animation: drift 38s linear infinite; }
      .tw0 { animation: twinkle 2.6s ease-in-out infinite; } .tw1 { animation: twinkle 3.1s ease-in-out infinite; }
      .tw2 { animation: twinkle 3.7s ease-in-out infinite; } .tw3 { animation: twinkle 4.3s ease-in-out infinite; }
      .bob { animation: bob 3s ease-in-out infinite; }
      .flame { transform-box: fill-box; transform-origin: 50% 0; animation: flicker .4s ease-in-out infinite; }
      .typing { transform-box: fill-box; transform-origin: 0 50%; animation: type 1.45s steps(${steps}, end) .25s backwards; }
      .typing-cursor { animation: follow 1.45s steps(${steps}, end) .25s backwards; }
      @keyframes blink { 0%, 49% { opacity: 1 } 50%, 100% { opacity: 0 } }
      @keyframes drift { from { transform: translateY(0) } to { transform: translateY(-${H}px) } }
      @keyframes twinkle { 0%, 100% { fill-opacity: 1 } 50% { fill-opacity: .25 } }
      @keyframes bob { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-4px) } }
      @keyframes flicker { 0%, 100% { opacity: 1; transform: scale(1, 1) } 25% { opacity: .85; transform: scale(1, .96) } 50% { opacity: 1; transform: scale(1, 1.04) } 75% { opacity: .9; transform: scale(1, .98) } }
      @keyframes type { from { transform: scaleX(0) } to { transform: scaleX(1) } }
      @keyframes follow { from { transform: translateX(-${typedW}px) } to { transform: translateX(0) } }
      @media (prefers-reduced-motion: reduce) { * { animation: none !important; } }
    </style>
    <filter id="glow-body" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur"/>
      <feFlood flood-color="${C.accent}" flood-opacity=".4"/>
      <feComposite operator="in" in2="blur"/>
      <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="glow-flame" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="blur"/>
      <feFlood flood-color="${C.accent2}" flood-opacity=".5"/>
      <feComposite operator="in" in2="blur"/>
      <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <clipPath id="frame"><rect width="${W}" height="${H}"/></clipPath>
    <clipPath id="typed-clip"><rect class="typing" x="${typedX}" y="116" width="${typedW}" height="20"/></clipPath>
  </defs>

  <rect width="${W}" height="${H}" fill="${C.bg}"/>

  <g class="stars" clip-path="url(#frame)" opacity=".55" aria-hidden="true">
    <g class="drift-far">
      ${stars.far}
    </g>
    <g class="drift-near">
      ${stars.near}
    </g>
  </g>

  <!-- site header -->
  <text class="accent" x="20" y="27">${esc(HERO.brand)}</text>
  <rect class="cursor" x="${20 + HERO.brand.length * CH}" y="15" width="${0.6 * CH}" height="14"/>
  <text class="dim" x="${W - 20}" y="27" text-anchor="end">${esc(HERO.site)}</text>
  <line x1="0" y1="44.5" x2="${W}" y2="44.5" stroke="${C.rule}" stroke-dasharray="4 3"/>

  <!-- rocket -->
  ${rocket()}

  <!-- terminal -->
  <text class="accent2" x="${tx}" y="130">${esc(HERO.prompt)}</text>
  <text x="${typedX}" y="130" clip-path="url(#typed-clip)" textLength="${typedW}" lengthAdjust="spacingAndGlyphs">${esc(HERO.command)}</text>
  <g class="typing-cursor"><rect class="cursor" x="${typedX + typedW + CH}" y="118" width="${0.6 * CH}" height="14"/></g>
  <text class="title" x="${tx}" y="176">${esc(HERO.title)}</text>
  <text class="dim" x="${tx}" y="202">${esc(HERO.subtitle)}</text>
</svg>
`;
}

fs.writeFileSync(HERO_DIR, render(fs.readFileSync(FONT_DIR).toString('base64')));
