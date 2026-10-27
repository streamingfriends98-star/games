const $ = id => document.getElementById(id);
const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(p => p[1]);
const pics = (n, e) => e.repeat(n);
const THINGS = ['🍎', '🍓', '⭐', '🐥', '🍪', '🎈'];

let voiceOn = true, qs = [], idx = 0, flowers = 0, locked = false, lastSums = [];

/* Simple words for ages 2-4: Add, Take Away, Multiply, Share */
const make = {
  add() {
    const a = rnd(1, 5), b = rnd(1, 5), e = THINGS[rnd(0, 5)];
    return { title: 'Add', say: `${a} and ${b}. How many in all?`, pic: pics(a, e) + ' ➕ ' + pics(b, e),
      sum: `${a} + ${b} = ?`, ans: a + b, hint: `Count all the ${e} together.` };
  },
  sub() {
    const a = rnd(2, 9), b = rnd(1, a - 1), e = THINGS[rnd(0, 5)];
    return { title: 'Take Away', say: `Take away ${b}. How many are left?`, pic: pics(a - b, e) + '<s>' + pics(b, e) + '</s>',
      sum: `${a} − ${b} = ?`, ans: a - b, hint: 'Count the bright ones. The faded ones went away.' };
  },
  mul() {
    const a = rnd(2, 4), b = rnd(2, 3), e = THINGS[rnd(0, 5)];
    const groups = Array.from({ length: a }, () => `<span class="grp">${pics(b, e)}</span>`).join('');
    return { title: 'Multiply', say: `${a} groups with ${b} in each. How many in all?`, pic: groups,
      sum: `${a} × ${b} = ?`, ans: a * b, hint: 'Count every one in all the groups.' };
  },
  div() {
    const b = rnd(2, 3), c = rnd(2, 4), a = b * c, e = THINGS[rnd(0, 5)];
    return { title: 'Share', say: `Share ${a} between ${b} friends. How many does each friend get?`, pic: pics(a, e),
      sum: `${a} ÷ ${b} = ?`, ans: c, hint: `Make ${b} equal piles. Count one pile.` };
  }
};

function newSession() {
  const ops = shuffle(['add', 'sub', 'mul', 'div']);
  ops.push(['add', 'sub'][rnd(0, 1)]);          // 5th question: an easy one
  qs = []; const seen = new Set();
  ops.forEach(op => {
    let q, tries = 0;
    do { q = make[op](); tries++; } while ((seen.has(q.sum) || lastSums.includes(q.sum)) && tries < 20);
    seen.add(q.sum); qs.push(q);
  });
  lastSums = [...seen]; idx = 0; flowers = 0;
  $('done').hidden = true; $('play').hidden = false;
  show();
}

function choices(ans) {
  const set = new Set([ans]);
  while (set.size < 3) { const v = ans + rnd(-3, 3); if (v >= 0 && v !== ans) set.add(v); }
  return shuffle([...set]);
}

function show() {
  const q = qs[idx]; locked = false;
  $('title').textContent = q.title;
  $('say').textContent = q.say;
  $('picture').innerHTML = q.pic;
  $('sum').textContent = q.sum;
  $('hinttext').textContent = '';
  $('garden').textContent = '🌼'.repeat(flowers);
  const box = $('options'); box.innerHTML = '';
  choices(q.ans).forEach(n => {
    const b = document.createElement('button');
    b.className = 'opt'; b.type = 'button'; b.textContent = n;
    b.onclick = () => pick(b, n === q.ans);
    box.appendChild(b);
  });
  speak(`${q.title}. ${q.say}`);
}

function pick(btn, ok) {
  if (locked) return;
  const fb = $('feedback'), g = $('golu');
  if (ok) {
    locked = true; flowers++;
    fb.className = 'good'; g.className = 'golu big happy'; $('msg').textContent = 'Yay! Great job!';
    fb.hidden = false; confetti(); speak('Yay! Great job!');
    setTimeout(() => { fb.hidden = true; idx++; idx < qs.length ? show() : finish(); }, 2300);
  } else {
    btn.classList.add('wrong'); btn.disabled = true;
    fb.className = 'bad'; g.className = 'golu big sad'; $('msg').textContent = 'Try again';
    fb.hidden = false; speak('Oh no. Try again.');
    setTimeout(() => { fb.hidden = true; }, 1600);
  }
}

function confetti() {
  const bits = ['⭐', '🎈', '🌈', '🌼', '🦋', '🎉'];
  for (let i = 0; i < 26; i++) {
    const s = document.createElement('span');
    s.className = 'bit'; s.textContent = bits[rnd(0, bits.length - 1)];
    s.style.left = rnd(2, 94) + 'vw'; s.style.setProperty('--t', (1.6 + Math.random() * 1.6) + 's');
    s.style.animationDelay = (Math.random() * .5) + 's';
    document.body.appendChild(s); setTimeout(() => s.remove(), 4000);
  }
}

function finish() {
  $('play').hidden = true; $('done').hidden = false;
  $('flowers').textContent = '🌼'.repeat(flowers);
  confetti(); speak('Hooray! You did it!');
}

function speak(t) {
  if (!voiceOn || !('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(t); u.rate = .85; u.pitch = 1.3;
  speechSynthesis.speak(u);
}

$('hint').onclick = () => { $('hinttext').textContent = qs[idx].hint; speak(qs[idx].hint); };
$('again').onclick = newSession;
$('voice').onclick = e => {
  voiceOn = !voiceOn;
  e.target.textContent = voiceOn ? '🔊 Voice on' : '🔇 Voice off';
  e.target.setAttribute('aria-pressed', voiceOn);
  if (!voiceOn && 'speechSynthesis' in window) speechSynthesis.cancel();
};

newSession();
