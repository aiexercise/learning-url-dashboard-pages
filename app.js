import {
  computeMetrics,
  escapeHtml,
  filterDigests,
  formatRelativeTime,
  mergeDigests,
  normalizeDigest,
  sourceCounts,
  toDigestUrl,
} from './app-core.mjs';

const STORAGE_KEY = 'url-digest.items.v1';
const DATA_URL = './data/digests.json';

const state = {
  baseItems: [],
  items: [],
  query: '',
  activeSource: 'all',
  selectedId: null,
};

const els = {
  list: document.querySelector('#digestList'),
  detail: document.querySelector('#detailBody'),
  search: document.querySelector('#searchInput'),
  addPanel: document.querySelector('#addPanel'),
  toggleAddForm: document.querySelector('#toggleAddForm'),
  refreshButton: document.querySelector('#refreshButton'),
  formNote: document.querySelector('#formNote'),
  sideSourceButtons: [...document.querySelectorAll('[data-side-source]')],
  sourceCounts: [...document.querySelectorAll('[data-source-count]')],
};

function loadLocalItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw).map(normalizeDigest) : [];
  } catch (error) {
    console.warn('localStorage 항목을 읽지 못했습니다.', error);
    return [];
  }
}

function saveLocalItems(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.map(normalizeDigest), null, 2));
}

async function fetchJsonItems() {
  try {
    const response = await fetch(`${DATA_URL}?t=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    const items = Array.isArray(payload) ? payload : payload.items || payload.digests || [];
    return items.map(normalizeDigest);
  } catch (error) {
    console.warn('data/digests.json을 읽지 못했습니다. localStorage 데이터만 표시합니다.', error);
    return [];
  }
}

function hydrateItems() {
  state.items = mergeDigests(loadLocalItems(), state.baseItems);
}

function persistItem(nextItem) {
  const normalized = normalizeDigest(nextItem);
  const localItems = loadLocalItems().filter((item) => item.id !== normalized.id && item.url !== normalized.url);
  saveLocalItems([normalized, ...localItems]);
  hydrateItems();
  state.selectedId = normalized.id;
}

function currentList() {
  return filterDigests(state.items, {
    query: state.query,
    source: state.activeSource,
  });
}

function updateMetrics() {
  const metrics = computeMetrics(state.items);
  const counts = sourceCounts(state.items);

  document.querySelector('#metricTotal').textContent = metrics.total;
  document.querySelector('#metricUnread').textContent = metrics.unread;
  document.querySelector('#metricSaved').textContent = metrics.saved;
  document.querySelector('#metricFailed').textContent = metrics.failed;
  document.querySelector('#navInboxCount').textContent = metrics.total;
  document.querySelector('#navSavedCount').textContent = metrics.saved;
  document.querySelector('#navFailedCount').textContent = metrics.failed;

  els.sourceCounts.forEach((el) => {
    el.textContent = counts[el.dataset.sourceCount] ?? 0;
  });

  els.sideSourceButtons.forEach((button) => {
    button.classList.toggle('selected', button.dataset.sideSource === state.activeSource);
  });
}

function renderTags(tags = []) {
  if (!tags.length) return '';
  return `<div class="tag-row">${tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div>`;
}

function renderCard(item) {
  const safe = normalizeDigest(item);
  const selected = state.selectedId === safe.id ? ' selected' : '';
  const savedMark = safe.saved ? '★' : '☆';
  return `
    <article class="digest-card${selected}" data-id="${escapeHtml(safe.id)}" data-source="${escapeHtml(safe.source)}">
      <button class="digest-select" type="button" data-action="select" data-id="${escapeHtml(safe.id)}" aria-pressed="${state.selectedId === safe.id}">
        <div class="digest-main">
          <div class="digest-meta">
            <span class="badge ${escapeHtml(safe.source)}">${escapeHtml(safe.sourceLabel)}</span>
            <span>${escapeHtml(formatRelativeTime(safe.createdAt))}</span>
            ${safe.duration ? `<span>${escapeHtml(safe.duration)}</span>` : ''}
            ${safe.failed ? '<span class="status failed">실패</span>' : ''}
          </div>
          <h3>${escapeHtml(safe.title)}</h3>
          <p>${escapeHtml(safe.summary)}</p>
          <p class="application-line">적용요소: ${escapeHtml(safe.application)}</p>
          ${renderTags(safe.tags)}
        </div>
      </button>
      <div class="digest-actions">
        <button class="icon-button" type="button" data-action="save" data-id="${escapeHtml(safe.id)}" title="저장">${savedMark}</button>
        <a class="icon-button link-button" href="${escapeHtml(safe.url)}" target="_blank" rel="noreferrer" title="원문 열기">↗</a>
      </div>
    </article>
  `;
}

function renderDetail() {
  const filtered = currentList();
  const item = state.items.find((candidate) => candidate.id === state.selectedId) || filtered[0];
  if (!item) {
    els.detail.innerHTML = '<p class="empty-detail">조건에 맞는 링크가 없습니다.</p>';
    return;
  }

  const safe = normalizeDigest(item);
  const notes = safe.notes.length
    ? safe.notes.map((note) => `<li>${escapeHtml(note)}</li>`).join('')
    : '<li>아직 추가 판단이 없습니다. 학습 처리 후 판단 메모를 보강하세요.</li>';

  els.detail.innerHTML = `
    <div class="detail-meta">
      <span class="badge ${escapeHtml(safe.source)}">${escapeHtml(safe.sourceLabel)}</span>
      <span>${escapeHtml(formatRelativeTime(safe.createdAt))}</span>
      ${safe.duration ? `<span>${escapeHtml(safe.duration)}</span>` : ''}
      ${safe.failed ? '<span class="status failed">실패</span>' : ''}
    </div>
    <h2><a href="${escapeHtml(safe.url)}" target="_blank" rel="noreferrer">${escapeHtml(safe.title)}</a></h2>
    <p>${escapeHtml(safe.summary)}</p>
    ${renderTags(safe.tags)}
    <div class="insight-box">
      <strong>적용요소</strong>
      <p>${escapeHtml(safe.application)}</p>
    </div>
    <div class="insight-box">
      <strong>판단 / 메모</strong>
      <ul>${notes}</ul>
    </div>
    <div class="detail-actions">
      <button class="primary-button" type="button" data-action="save" data-id="${escapeHtml(safe.id)}">${safe.saved ? '저장 해제' : '저장'}</button>
      <a class="primary-button ghost" href="${escapeHtml(safe.url)}" target="_blank" rel="noreferrer">원문 열기</a>
    </div>
  `;
}

function render() {
  const filtered = currentList();
  updateMetrics();

  if (!state.selectedId && filtered[0]) state.selectedId = filtered[0].id;
  if (state.selectedId && !filtered.some((item) => item.id === state.selectedId)) {
    state.selectedId = filtered[0]?.id || null;
  }

  els.list.innerHTML = filtered.length
    ? filtered.map(renderCard).join('')
    : '<div class="empty-state">조건에 맞는 요약이 없습니다.</div>';
  renderDetail();
}

async function reloadData() {
  els.refreshButton.disabled = true;
  state.baseItems = await fetchJsonItems();
  hydrateItems();
  if (!state.selectedId && state.items[0]) state.selectedId = state.items[0].id;
  render();
  els.refreshButton.disabled = false;
}

function toggleSave(id) {
  const item = state.items.find((candidate) => candidate.id === id);
  if (!item) return;
  const next = normalizeDigest({ ...item, saved: !item.saved, status: item.saved ? 'new' : 'saved' });
  persistItem(next);
  render();
}

els.search.addEventListener('input', (event) => {
  state.query = event.target.value;
  render();
});

els.sideSourceButtons.forEach((button) => {
  button.addEventListener('click', () => {
    state.activeSource = button.dataset.sideSource || 'all';
    render();
  });
});

els.list.addEventListener('click', (event) => {
  const actionEl = event.target.closest('[data-action]');
  if (!actionEl) return;

  if (actionEl.dataset.action === 'save') {
    toggleSave(actionEl.dataset.id);
    return;
  }

  if (actionEl.dataset.action === 'select') {
    state.selectedId = actionEl.dataset.id;
    const selected = state.items.find((item) => item.id === state.selectedId);
    if (selected) persistItem({ ...selected, read: true });
    render();
  }
});

els.detail.addEventListener('click', (event) => {
  const actionEl = event.target.closest('[data-action="save"]');
  if (actionEl) toggleSave(actionEl.dataset.id);
});

els.toggleAddForm.addEventListener('click', () => {
  const nextHidden = !els.addPanel.hidden;
  els.addPanel.hidden = nextHidden;
  els.toggleAddForm.setAttribute('aria-expanded', String(!nextHidden));
});

els.addPanel.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(els.addPanel));
  if (!toDigestUrl(data.url)) {
    els.formNote.textContent = 'http 또는 https URL만 저장할 수 있습니다.';
    return;
  }

  const item = normalizeDigest({
    url: data.url,
    title: data.title,
    summary: data.summary,
    application: data.application,
    tags: data.tags,
    status: 'new',
  });

  persistItem(item);
  els.addPanel.reset();
  els.formNote.textContent = '저장했습니다. 이 브라우저 localStorage에 보관됩니다.';
  render();
});

els.refreshButton.addEventListener('click', reloadData);

reloadData();
