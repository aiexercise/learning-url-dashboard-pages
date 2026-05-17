const SOURCE_LABELS = {
  youtube: 'YouTube',
  threads: 'Threads',
  web: 'Web',
};

const SOURCE_PATTERNS = [
  ['youtube', /(^|\.)youtube\.com$|(^|\.)youtu\.be$/i],
  ['threads', /(^|\.)threads\.net$/i],
];

export function toDigestUrl(value) {
  try {
    const url = new URL(String(value || '').trim());
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    return canonicalizeUrl(url);
  } catch {
    return null;
  }
}

function canonicalizeUrl(url) {
  const next = new URL(url.href);
  const host = next.hostname.replace(/^www\./, '');
  if (host === 'youtu.be') {
    const videoId = next.pathname.split('/').filter(Boolean)[0];
    if (videoId) return new URL(`https://www.youtube.com/watch?v=${videoId}`);
  }
  if (host === 'youtube.com' || host === 'm.youtube.com') {
    const videoId = next.searchParams.get('v');
    if (videoId) return new URL(`https://www.youtube.com/watch?v=${videoId}`);
  }
  next.hash = '';
  return next;
}

export function inferSource(urlValue, explicitSource = '') {
  const normalized = String(explicitSource || '').toLowerCase();
  if (SOURCE_LABELS[normalized]) return normalized;
  const url = toDigestUrl(urlValue);
  if (!url) return 'web';
  const host = url.hostname.replace(/^www\./, '');
  const found = SOURCE_PATTERNS.find(([, pattern]) => pattern.test(host));
  return found ? found[0] : 'web';
}

export function makeId(urlValue) {
  const raw = String(urlValue || '').trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < raw.length; i += 1) {
    hash = (hash * 31 + raw.charCodeAt(i)) >>> 0;
  }
  return `url-${hash.toString(36)}`;
}

export function normalizeTags(tags) {
  if (Array.isArray(tags)) return tags.map((tag) => String(tag).trim()).filter(Boolean);
  if (typeof tags === 'string') return tags.split(',').map((tag) => tag.trim()).filter(Boolean);
  return [];
}

export function normalizeDigest(input = {}) {
  const url = toDigestUrl(input.url);
  const source = inferSource(url ? url.href : input.url, input.source);
  const createdAt = input.createdAt || input.collectedAt || new Date().toISOString();
  const title = String(input.title || (url ? url.hostname : '제목 없는 링크')).trim();
  return {
    id: input.id || makeId(url ? url.href : `${title}-${createdAt}`),
    title,
    source,
    sourceLabel: input.sourceLabel || SOURCE_LABELS[source] || 'Web',
    url: url ? url.href : String(input.url || ''),
    summary: String(input.summary || input.overview || '아직 요약이 없습니다. 원문 확인 후 요약을 보강하세요.').trim(),
    application: String(input.application || input.action || '적용 판단 대기').trim(),
    thumbnail: input.thumbnail || '',
    duration: input.duration || input.readingTime || '',
    tags: normalizeTags(input.tags),
    status: input.status || 'new',
    read: Boolean(input.read),
    saved: Boolean(input.saved || input.status === 'saved'),
    failed: Boolean(input.failed || input.status === 'failed'),
    createdAt,
    updatedAt: input.updatedAt || createdAt,
    notes: Array.isArray(input.notes) ? input.notes : [],
  };
}

export function mergeDigests(existing = [], incoming = []) {
  const byKey = new Map();
  for (const raw of existing) {
    const item = normalizeDigest(raw);
    byKey.set(item.url || item.id, item);
  }
  for (const raw of incoming) {
    const item = normalizeDigest(raw);
    const key = item.url || item.id;
    if (!byKey.has(key)) byKey.set(key, item);
  }
  return [...byKey.values()].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

export function filterDigests(items = [], { query = '', source = 'all', status = 'all' } = {}) {
  const q = String(query || '').trim().toLowerCase();
  return items.filter((item) => {
    const normalized = normalizeDigest(item);
    const sourceOk = source === 'all' || normalized.source === source;
    const statusOk = status === 'all' || normalized.status === status || (status === 'saved' && normalized.saved);
    const haystack = [
      normalized.title,
      normalized.summary,
      normalized.application,
      normalized.sourceLabel,
      normalized.url,
      ...normalized.tags,
    ].join(' ').toLowerCase();
    return sourceOk && statusOk && (!q || haystack.includes(q));
  });
}

export function computeMetrics(items = []) {
  const normalized = items.map(normalizeDigest);
  return {
    total: normalized.length,
    unread: normalized.filter((item) => !item.read).length,
    saved: normalized.filter((item) => item.saved).length,
    failed: normalized.filter((item) => item.failed || item.status === 'failed').length,
  };
}

export function sourceCounts(items = []) {
  const counts = { all: items.length, youtube: 0, threads: 0, web: 0 };
  for (const item of items.map(normalizeDigest)) {
    counts[item.source] = (counts[item.source] || 0) + 1;
  }
  return counts;
}

export function formatRelativeTime(value, now = new Date()) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const diffMs = now.getTime() - date.getTime();
  const minutes = Math.max(0, Math.floor(diffMs / 60000));
  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  })[char]);
}
