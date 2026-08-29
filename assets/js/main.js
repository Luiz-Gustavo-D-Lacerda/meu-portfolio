/* ===== MOTION SETUP (Lenis + GSAP ScrollTrigger) ===== */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
let lenis = null;

if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

if (typeof window.Lenis !== 'undefined' && !reduceMotion) {
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.9, smoothWheel: true });
    if (hasGSAP) {
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add(t => lenis.raf(t * 1000));
        gsap.ticker.lagSmoothing(0);
    } else {
        const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
        requestAnimationFrame(raf);
    }
}

/* smooth anchor navigation */
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        const href = a.getAttribute('href');
        const target = href.length > 1 ? document.querySelector(href) : null;
        if (href !== '#' && !target) return;
        e.preventDefault();
        if (lenis)      lenis.scrollTo(target || 0, { offset: -70 });
        else            (target || document.body).scrollIntoView({ behavior: 'smooth' });
    });
});

/* word-by-word reveal for section titles */
function splitWords(el) {
    const nodes = [...el.childNodes];
    const inners = [];
    el.textContent = '';
    nodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
            node.textContent.split(/(\s+)/).forEach(part => {
                if (!part) return;
                if (!part.trim()) { el.appendChild(document.createTextNode(part)); return; }
                const mask  = document.createElement('span'); mask.className  = 'rw';
                const inner = document.createElement('span'); inner.className = 'rw-i';
                inner.textContent = part;
                mask.appendChild(inner); el.appendChild(mask); inners.push(inner);
            });
        } else {
            const mask  = document.createElement('span'); mask.className  = 'rw';
            const inner = document.createElement('span'); inner.className = 'rw-i';
            inner.appendChild(node);
            mask.appendChild(inner); el.appendChild(mask); inners.push(inner);
        }
    });
    return inners;
}

if (hasGSAP && !reduceMotion) {
    document.querySelectorAll('.section-title').forEach(title => {
        const words = splitWords(title);
        gsap.set(words, { yPercent: 115 });
        gsap.to(words, {
            yPercent: 0, duration: 0.85, ease: 'power3.out', stagger: 0.055,
            scrollTrigger: { trigger: title, start: 'top 88%', once: true }
        });
    });
    window.addEventListener('load', () => ScrollTrigger.refresh());
}

/* ===== CURSOR ===== */
const cDot  = document.getElementById('c-dot');
const cRing = document.getElementById('c-ring');
let mx = -200, my = -200, rx = -200, ry = -200;

document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cDot.style.left = mx + 'px'; cDot.style.top = my + 'px';
});
(function animRing() {
    rx += (mx - rx) * 0.13; ry += (my - ry) * 0.13;
    cRing.style.left = rx + 'px'; cRing.style.top = ry + 'px';
    requestAnimationFrame(animRing);
})();
document.querySelectorAll('a,button,.filter-btn,.skills-tab,.social-link,.hamburger,.back-top,.contact-link').forEach(el => {
    el.addEventListener('mouseenter', () => cRing.classList.add('hov'));
    el.addEventListener('mouseleave', () => cRing.classList.remove('hov'));
});
document.addEventListener('mousedown', () => cDot.classList.add('click'));
document.addEventListener('mouseup',   () => cDot.classList.remove('click'));

/* ===== SCROLL PROGRESS ===== */
const prog = document.getElementById('prog');
window.addEventListener('scroll', () => {
    const pct = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    prog.style.width = pct + '%';
    navbar.classList.toggle('scrolled', window.scrollY > 50);
    highlightNav();
});

/* ===== NAVBAR ===== */
const navbar = document.getElementById('navbar');

/* ===== HAMBURGER ===== */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
});
function closeMobile() {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
}

/* ===== TYPING ===== */
const phrases = ['Full Stack Developer', '.NET & Angular Dev', 'Python & IA Enthusiast', 'CS Student @ UNI-BH', 'Arquiteto de Software'];
let pIdx = 0, cIdx = 0, del = false;
const typedEl = document.getElementById('typed');
function type() {
    const cur = phrases[pIdx];
    typedEl.textContent = del ? cur.slice(0, cIdx--) : cur.slice(0, cIdx++);
    let d = del ? 55 : 95;
    if (!del && cIdx === cur.length + 1) { d = 1800; del = true; }
    else if (del && cIdx < 0) { del = false; pIdx = (pIdx + 1) % phrases.length; d = 380; }
    setTimeout(type, d);
}
type();

/* ===== MATRIX RAIN ===== */
const mxCanvas = document.getElementById('matrix-canvas');
const mxCtx = mxCanvas.getContext('2d');
const MX_CHARS = '.NET{}[]()=>async/await#include</>return void class def import export const let var 01'.split('');
let mxCols, mxDrops;
function mxResize() {
    mxCanvas.width  = mxCanvas.offsetWidth;
    mxCanvas.height = mxCanvas.offsetHeight;
    mxCols  = Math.floor(mxCanvas.width / 18);
    mxDrops = new Array(mxCols).fill(1);
}
let mxTick = 0;
function mxDraw() {
    if (++mxTick % 2 !== 0) return;
    mxCtx.fillStyle = 'rgba(7,7,16,0.08)';
    mxCtx.fillRect(0, 0, mxCanvas.width, mxCanvas.height);
    mxCtx.font = '13px JetBrains Mono, monospace';
    for (let i = 0; i < mxDrops.length; i++) {
        const ch = MX_CHARS[Math.floor(Math.random() * MX_CHARS.length)];
        const bright = Math.random() > 0.92;
        mxCtx.fillStyle = bright ? '#ffffff' : '#39ff14';
        mxCtx.globalAlpha = bright ? 0.9 : (Math.random() * 0.5 + 0.2);
        mxCtx.fillText(ch, i * 18, mxDrops[i] * 18);
        mxCtx.globalAlpha = 1;
        if (mxDrops[i] * 18 > mxCanvas.height && Math.random() > 0.974) mxDrops[i] = 0;
        mxDrops[i]++;
    }
}
function mxLoop() { mxDraw(); requestAnimationFrame(mxLoop); }
mxResize();
mxLoop();
window.addEventListener('resize', mxResize);

/* ===== PARTICLES ===== */
const canvas = document.getElementById('hero-canvas');
const ctx    = canvas.getContext('2d');
let pts = [];
function resize() { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; }
const colors = ['#39ff14','#7c3aed','#a855f7','#4f46e5'];
class P {
    constructor() { this.init(); }
    init() {
        this.x  = Math.random() * canvas.width;
        this.y  = Math.random() * canvas.height;
        this.r  = Math.random() * 1.6 + 0.3;
        this.vx = (Math.random() - 0.5) * 0.38;
        this.vy = (Math.random() - 0.5) * 0.38;
        this.a  = Math.random() * 0.55 + 0.08;
        this.c  = colors[Math.floor(Math.random() * colors.length)];
    }
    step() {
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.init();
    }
    draw() {
        ctx.save(); ctx.globalAlpha = this.a;
        ctx.fillStyle = this.c; ctx.shadowBlur = 8; ctx.shadowColor = this.c;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI*2); ctx.fill(); ctx.restore();
    }
}
function initPts() { pts = []; const n = Math.floor((canvas.width * canvas.height) / 8500); for (let i=0;i<n;i++) pts.push(new P()); }
function drawLines() {
    for (let i=0;i<pts.length;i++) for (let j=i+1;j<pts.length;j++) {
        const dx=pts[i].x-pts[j].x, dy=pts[i].y-pts[j].y, d=Math.sqrt(dx*dx+dy*dy);
        if (d < 120) { ctx.save(); ctx.globalAlpha=(1-d/120)*0.13; ctx.strokeStyle='#7c3aed'; ctx.lineWidth=0.5; ctx.beginPath(); ctx.moveTo(pts[i].x,pts[i].y); ctx.lineTo(pts[j].x,pts[j].y); ctx.stroke(); ctx.restore(); }
    }
}
function loop() { ctx.clearRect(0,0,canvas.width,canvas.height); pts.forEach(p=>{p.step();p.draw();}); drawLines(); requestAnimationFrame(loop); }
resize(); initPts(); loop();
window.addEventListener('resize', () => { resize(); initPts(); });

/* ===== FADE IN ===== */
if (hasGSAP && !reduceMotion) {
    ScrollTrigger.batch('.fade-in', {
        start: 'top 90%',
        once: true,
        onEnter: batch => batch.forEach((el, i) => setTimeout(() => el.classList.add('visible'), i * 80))
    });
} else {
    const io = new IntersectionObserver((entries) => {
        entries.forEach((e, i) => { if (e.isIntersecting) { setTimeout(() => e.target.classList.add('visible'), i * 80); io.unobserve(e.target); } });
    }, { threshold: 0.08 });
    document.querySelectorAll('.fade-in').forEach(el => io.observe(el));
}

/* ===== SKILL BARS ===== */
const skillIO = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.querySelectorAll('.skill-bar-fill').forEach(b => { b.style.width = b.dataset.level + '%'; }); });
}, { threshold: 0.25 });
document.querySelectorAll('.skills-panel').forEach(p => skillIO.observe(p));

const firstTabIO = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { document.querySelectorAll('#tab-frontend .skill-bar-fill').forEach(b => { b.style.width = b.dataset.level + '%'; }); firstTabIO.disconnect(); } });
}, { threshold: 0.2 });
firstTabIO.observe(document.getElementById('skills'));

/* ===== SKILLS TABS ===== */
document.querySelectorAll('.skills-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.skills-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.skills-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        const panel = document.getElementById('tab-' + tab.dataset.tab);
        panel.classList.add('active');
        setTimeout(() => { panel.querySelectorAll('.skill-bar-fill').forEach(b => { b.style.width = b.dataset.level + '%'; }); }, 50);
    });
});

/* ===== COUNTER ANIMATION ===== */
function countUp(el, target) {
    let start = null;
    const suffix = '+';
    const dur = 1600;
    function step(ts) {
        if (!start) start = ts;
        const p = Math.min((ts - start) / dur, 1);
        const e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(e * target) + suffix;
        if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}
const statsIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.querySelectorAll('.stat-num[data-target]').forEach(el => countUp(el, +el.dataset.target));
            statsIO.unobserve(e.target);
        }
    });
}, { threshold: 0.5 });
const statsEl = document.querySelector('.about-stats');
if (statsEl) statsIO.observe(statsEl);

/* ===== PROJECT FILTER ===== */
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const f = btn.dataset.filter;
        document.querySelectorAll('.project-card').forEach(c => {
            c.classList.toggle('hidden', f !== 'all' && c.dataset.category !== f);
        });
    });
});

/* ===== VANILLA TILT ===== */
VanillaTilt.init(document.querySelectorAll('[data-tilt]'), { max: 8, speed: 400, glare: true, 'max-glare': 0.12 });

/* ===== CARD MOUSE GLOW ===== */
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((e.clientX - r.left)  / r.width  * 100).toFixed(1) + '%');
        card.style.setProperty('--my', ((e.clientY - r.top)   / r.height * 100).toFixed(1) + '%');
    });
});

/* ===== MAGNETIC BUTTONS ===== */
document.querySelectorAll('.btn-primary, .btn-outline').forEach(btn => {
    btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width  / 2)) * 0.28;
        const dy = (e.clientY - (r.top  + r.height / 2)) * 0.28;
        btn.style.transform = `translateY(-2px) translate(${dx}px,${dy}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
});

/* ===== HERO SPOTLIGHT ===== */
const heroGlow = document.getElementById('hero-glow');
document.getElementById('home').addEventListener('mousemove', e => {
    const r = e.currentTarget.getBoundingClientRect();
    heroGlow.style.left = (e.clientX - r.left) + 'px';
    heroGlow.style.top  = (e.clientY - r.top)  + 'px';
});

/* ===== CONTACT FORM ===== */
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';
    btn.disabled = true;
    setTimeout(() => { this.style.display = 'none'; document.getElementById('formSuccess').style.display = 'block'; }, 1400);
});

/* ===== ACTIVE NAV ===== */
function highlightNav() {
    const y = window.scrollY + 120;
    document.querySelectorAll('section[id]').forEach(sec => {
        const link = document.querySelector(`.nav-links a[href="#${sec.id}"]`);
        if (!link) return;
        link.classList.toggle('active', y >= sec.offsetTop && y < sec.offsetTop + sec.offsetHeight);
    });
}
