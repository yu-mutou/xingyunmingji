const { djb2, mulberry32, shuffle, simpleHash } = require('./prng');
const {
  LUCKY_COLORS, DIRECTIONS, ZODIAC_KEYS, ZODIAC_NAMES,
  DIMENSION_KEYS, BASE_WEIGHTS, FORTUNE_LEVELS,
  CATEGORIES, CATEGORY_LABELS, CATEGORY_ICONS,
} = require('./constants');
const { TEMPLATES } = require('./templates');

// Build deterministic seed from user identity + date
function buildSeed(openid, dateStr, profile, round) {
  const input = `${openid}|${dateStr}|${profile.zodiac}|${profile.chineseZodiac}|${profile.birthYear}|round${round || 0}`;
  return djb2(input);
}

// Generate six dimension scores
function generateScores(rng, profile) {
  const scores = {};
  for (const dim of DIMENSION_KEYS) {
    const base = (rng() + rng() + rng()) / 3;
    const raw = Math.floor(base * 100);

    const zHash = simpleHash(profile.zodiac + dim);
    const zodiacMod = (zHash % 21) - 10;

    const czHash = simpleHash(profile.chineseZodiac + dim);
    const czMod = (czHash % 17) - 8;

    scores[dim] = Math.max(1, Math.min(100, raw + zodiacMod + czMod));
  }
  return scores;
}

// Compute weighted overall score
function computeOverall(scores, rng) {
  let totalWeight = 0;
  let weightedSum = 0;
  for (const d of DIMENSION_KEYS) {
    const w = BASE_WEIGHTS[d] + (rng() * 0.2 - 0.1);
    weightedSum += scores[d] * w;
    totalWeight += w;
  }
  return Math.round(weightedSum / totalWeight);
}

// Determine fortune level from overall score
function getLevel(overallScore) {
  for (const lv of FORTUNE_LEVELS) {
    if (overallScore >= lv.minScore) return lv;
  }
  return FORTUNE_LEVELS[FORTUNE_LEVELS.length - 1];
}

// Get score bucket name
function getBucket(score) {
  if (score >= 90) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'average';
  if (score >= 30) return 'poor';
  return 'terrible';
}

// Select dimension comments
function selectComments(scores, rng) {
  const comments = {};
  for (const dim of DIMENSION_KEYS) {
    const bucket = getBucket(scores[dim]);
    const pool = TEMPLATES.dimensionComments[dim][bucket];
    const idx = Math.floor(rng() * pool.length);
    comments[dim] = pool[idx];
  }
  return comments;
}

// Select do's and don'ts
function selectDosDonts(rng) {
  const shuffledCats = shuffle(CATEGORIES, rng);

  const dos = [];
  for (let i = 0; i < 3; i++) {
    const cat = shuffledCats[i];
    const pool = TEMPLATES.dos[cat];
    const idx = Math.floor(rng() * pool.length);
    dos.push({ category: CATEGORY_LABELS[cat], text: pool[idx], icon: CATEGORY_ICONS[cat] });
  }

  const donts = [];
  for (let i = 1; i < 4; i++) {
    const cat = shuffledCats[i];
    const pool = TEMPLATES.donts[cat];
    const idx = Math.floor(rng() * pool.length);
    donts.push({ category: CATEGORY_LABELS[cat], text: pool[idx], icon: CATEGORY_ICONS[cat] });
  }

  return { dos, donts };
}

// Select lucky info
function selectLuckyInfo(rng, userZodiac) {
  const colorIdx = Math.floor(rng() * LUCKY_COLORS.length);
  const dirIdx = Math.floor(rng() * DIRECTIONS.length);
  const num = Math.floor(rng() * 99) + 1;
  const compatibleKeys = ZODIAC_KEYS.filter(k => k !== userZodiac);
  const compIdx = Math.floor(rng() * compatibleKeys.length);
  const compatKey = compatibleKeys[compIdx];

  return {
    color: LUCKY_COLORS[colorIdx],
    number: num,
    direction: DIRECTIONS[dirIdx],
    compatibleZodiac: ZODIAC_NAMES[compatKey],
  };
}

// Main generator
function generateFortune(openid, dateStr, profile, round) {
  const seed = buildSeed(openid, dateStr, profile, round);
  const rng = mulberry32(seed);

  const scores = generateScores(rng, profile);
  const overallScore = computeOverall(scores, rng);
  const level = getLevel(overallScore);
  const comments = selectComments(scores, rng);
  const { dos, donts } = selectDosDonts(rng);
  const luckyInfo = selectLuckyInfo(rng, profile.zodiac);

  const dimensions = {};
  for (const dim of DIMENSION_KEYS) {
    dimensions[dim] = { score: scores[dim], comment: comments[dim] };
  }

  return {
    date: dateStr,
    overallScore,
    level: level.label,
    levelColor: level.color,
    dimensions,
    dosList: dos,
    dontsList: donts,
    luckyInfo,
    refreshCount: 0,
    isBookmarked: false,
  };
}

module.exports = { generateFortune };
