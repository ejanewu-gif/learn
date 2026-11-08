/**
 * EJ的研習講義與講課推進引擎 (GitHub Pages 靜態版)
 */

let workshopsData = [];
let currentWorkshop = null;
let activeCategory = '全部';
let searchTerm = '';
let activeTimer = null;
let timerSecondsRemaining = 0;

document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  await loadWorkshopsData();
  handleRouting();

  window.addEventListener('popstate', () => {
    handleRouting();
  });
});

/**
 * 1. 載入資料 (workshops.json)
 */
async function loadWorkshopsData() {
  try {
    const res = await fetch('data/workshops.json?v=' + Date.now());
    if (!res.ok) throw new Error('無法讀取研習場次資料');
    workshopsData = await res.json();
  } catch (err) {
    console.error('載入失敗:', err);
    workshopsData = getFallbackWorkshops();
  }
}

/**
 * 2. 路由處理
 */
function handleRouting() {
  const params = new URLSearchParams(window.location.search);
  const workshopId = params.get('id') || params.get('date');
  const navBackBtn = document.getElementById('navBackBtn');

  if (workshopId) {
    currentWorkshop = workshopsData.find(w => w.id === workshopId || w.date === workshopId);
    if (currentWorkshop) {
      if (navBackBtn) navBackBtn.style.display = 'inline-flex';
      renderWorkshopDetail(currentWorkshop);
      return;
    }
  }

  if (navBackBtn) navBackBtn.style.display = 'none';
  renderWorkshopPortal(workshopsData);
}

/**
 * 3. 渲染首頁場次入口 (自動過濾 hidden 場次)
 */
function renderWorkshopPortal(workshops) {
  const container = document.getElementById('mainContent');
  
  // 前台過濾掉 status === 'hidden' 的內部草稿
  const visibleWorkshops = workshops.filter(w => w.status !== 'hidden');

  if (visibleWorkshops.length === 0) {
    container.innerHTML = `
      <div class="hero-box">
        <h2 class="hero-title">目前暫無公開的研習場次</h2>
        <p class="hero-subtitle">所有場次目前已封存或設為內部準備中，請稍後再訪。</p>
      </div>
    `;
    return;
  }

  let cardsHtml = visibleWorkshops.map(w => {
    const isProtected = w.status === 'protected';
    return `
      <div class="workshop-card" onclick="navigateToWorkshop('${w.id}')">
        <div class="date-badge">
          <span class="month">${w.monthText}</span>
          <span class="day">${w.dayText}</span>
          <span class="dow">${w.dayOfWeek}</span>
        </div>
        <div class="workshop-details">
          <div class="workshop-tags">
            ${w.isLatest ? '<span class="tag-badge tag-latest">最新場次</span>' : ''}
            ${isProtected 
              ? '<span class="tag-badge tag-locked">🔒 需通關密語</span>' 
              : '<span class="tag-badge tag-public">✨ 公開教材</span>'}
          </div>
          <h3 class="workshop-title">${w.title}</h3>
          <div class="workshop-meta">
            <span>📅 ${w.date} (${w.dayOfWeek})</span>
            <span>⏰ ${w.duration}</span>
            <span>📍 ${w.location}</span>
          </div>
          <p class="workshop-desc">${w.description}</p>
        </div>
        <div class="workshop-arrow">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="hero-box">
      <div class="hero-pill">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
        研習教材與提示詞共享中心
      </div>
      <h2 class="hero-title">請選擇研習場次進入教材庫</h2>
      <p class="hero-subtitle">點選您參與的研習活動，獲取當天實戰提示詞範本、講義簡報、操作鷹架與教學資源導航。</p>
    </div>

    <div class="workshop-grid">
      ${cardsHtml}
    </div>
  `;
}

function navigateToWorkshop(id) {
  const url = new URL(window.location);
  url.searchParams.set('id', id);
  window.history.pushState({}, '', url);
  handleRouting();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function navigateToPortal() {
  const url = new URL(window.location);
  url.searchParams.delete('id');
  url.searchParams.delete('date');
  window.history.pushState({}, '', url);
  handleRouting();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * 4. 渲染單一場次頁面 (包含通關密語驗證閘門)
 */
function renderWorkshopDetail(workshop) {
  const container = document.getElementById('mainContent');

  // 檢查是否需通關密語且尚未解鎖
  const unlockKey = `unlocked_${workshop.id}`;
  const isUnlocked = localStorage.getItem(unlockKey) === 'true';

  if (workshop.status === 'protected' && !isUnlocked) {
    renderPasscodeGate(workshop);
    return;
  }

  // 快速下載/連結按鈕區
  let quickAccessBtns = [];
  if (workshop.slideUrl) {
    quickAccessBtns.push(`
      <a href="${workshop.slideUrl}" target="_blank" rel="noopener noreferrer" class="nav-btn primary" title="開啟研習講義與簡報">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
        講義簡報下載
      </a>
    `);
  }
  if (workshop.feedbackUrl) {
    quickAccessBtns.push(`
      <a href="${workshop.feedbackUrl}" target="_blank" rel="noopener noreferrer" class="nav-btn success" title="填寫課堂回饋問卷">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        學員回饋表單
      </a>
    `);
  }
  quickAccessBtns.push(`
    <button class="nav-btn purple" onclick="openQrModal('${window.location.href}', '${workshop.title}')" title="投影給學員掃描進站">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
      投影 QR Code
    </button>
  `);

  // 分類膠囊
  const categories = workshop.categories || ['全部'];
  const pillsHtml = categories.map((cat, idx) => `
    <button type="button" class="pill-btn ${idx === 0 ? 'active' : ''}" data-category="${cat}" onclick="setCategoryFilter('${cat}')">
      ${cat}
    </button>
  `).join('');

  container.innerHTML = `
    <div class="hero-box" style="padding-bottom: 22px;">
      <div class="hero-pill">
        📅 ${workshop.date}・${workshop.duration}・📍 ${workshop.location}
      </div>
      <h2 class="hero-title">${workshop.title}</h2>
      <p class="hero-subtitle">${workshop.subtitle || workshop.description}</p>
      
      <!-- 快速資源列 -->
      <div class="quick-access-bar">
        ${quickAccessBtns.join('')}
      </div>
    </div>

    <!-- 工具過濾列 -->
    <div class="toolbar-sticky">
      <div class="search-box-row">
        <div class="search-input-wrapper">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" id="searchInput" class="search-input" placeholder="搜尋提示詞、關鍵字、工具名稱..." oninput="handleSearch(this.value)">
          <button id="searchClearBtn" class="search-clear-btn" onclick="clearSearch()">✕</button>
        </div>
      </div>
      <div class="pill-container" id="pillsContainer">
        ${pillsHtml}
      </div>
    </div>

    <!-- 卡片列表區 -->
    <div class="feed-container" id="feedContainer">
      ${renderResourceCards(workshop.resources || [])}
    </div>

    <div id="emptySearchState" style="display:none; text-align:center; padding: 60px 20px; color: var(--text-muted);">
      <p style="font-size: 1.1rem; font-weight: 600;">🔍 找不到符合「<span id="emptyQuery"></span>」的提示詞或工具</p>
      <p style="font-size: 0.88rem; margin-top: 6px;">請嘗試更換關鍵字或重設分類標籤。</p>
    </div>
  `;
}

/**
 * 5. 通關密碼輸入鎖定卡片
 */
function renderPasscodeGate(workshop) {
  const container = document.getElementById('mainContent');
  container.innerHTML = `
    <div class="locked-gate-card">
      <div class="locked-gate-icon">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      </div>
      <h3 style="font-size: 1.4rem; font-weight: 800; margin-bottom: 8px;">研習教材通關鎖定</h3>
      <p style="color: var(--text-muted); font-size: 0.92rem; line-height: 1.5;">
        本場次<strong>《${workshop.title}》</strong>為專屬工作坊教材。<br>
        請輸入講師現場公佈的【4 碼通關密語】以解鎖實作提示詞庫：
      </p>

      <form id="passcodeForm" onsubmit="verifyPasscode(event, '${workshop.id}', '${workshop.passcode}')">
        <div class="passcode-input-group">
          <input type="password" id="passcodeInput" class="passcode-input" placeholder="請輸入通關密碼" maxlength="20" autofocus required autocomplete="off">
          <button type="submit" class="nav-btn primary" style="padding: 10px 20px; font-weight: 700;">解鎖</button>
        </div>
      </form>
      <p style="font-size: 0.8rem; color: var(--text-light); margin-top: 14px;">提示：解鎖後今日於本瀏覽器無需重複輸入密碼。</p>
    </div>
  `;
}

function verifyPasscode(e, workshopId, correctPasscode) {
  e.preventDefault();
  const input = document.getElementById('passcodeInput');
  const val = input.value.trim();

  if (val === correctPasscode) {
    localStorage.setItem(`unlocked_${workshopId}`, 'true');
    showToast('🎉 通關密語驗證成功！正在載入教材...');
    setTimeout(() => {
      renderWorkshopDetail(currentWorkshop);
    }, 400);
  } else {
    showToast('❌ 通關密語錯誤，請確認講師公佈之代碼！');
    input.select();
    input.focus();
  }
}

/**
 * 6. 渲染卡片 (Prompt 卡片 vs 工具卡片)
 */
function renderResourceCards(resources) {
  if (!resources.length) {
    return `<div style="text-align:center; padding: 40px; color: var(--text-muted);">本場次目前尚無建立教材卡片。</div>`;
  }

  return resources.map(item => {
    if (item.type === 'tool') {
      return `
        <div class="resource-card" data-category="${item.category}" data-search="${(item.title + ' ' + item.desc).toLowerCase()}">
          <div class="tool-card-body">
            <div>
              <div class="card-stage-badge">🔗 ${item.stage || '推薦工具'}</div>
              <h3 class="card-title">${item.title}</h3>
              <p class="card-desc">${item.desc}</p>
              <div class="tool-url-preview">${item.url}</div>
            </div>
            <div>
              <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="nav-btn primary" style="padding: 10px 18px;">
                ${item.buttonText || '開啟網站'}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
              </a>
            </div>
          </div>
        </div>
      `;
    }

    const highlightedPrompt = highlightPlaceholders(item.prompt);
    const practiceMins = item.practiceTimeMinutes || 5;

    return `
      <div class="resource-card" id="card-${item.id}" data-category="${item.category}" data-search="${(item.title + ' ' + item.desc + ' ' + item.prompt).toLowerCase()}">
        <div class="card-header-bar">
          <div class="card-meta-left">
            <div class="card-stage-badge">
              <span>🎯 ${item.stage}</span>
              ${item.stepNumber ? `<span>・ 步驟 ${item.stepNumber}</span>` : ''}
            </div>
            <h3 class="card-title">${item.title}</h3>
            <p class="card-desc">${item.desc}</p>
          </div>
          <div class="card-header-actions">
            <!-- 聚焦 -->
            <button type="button" class="action-icon-btn" onclick="toggleSpotlight('card-${item.id}')" title="突顯此卡片（講課引導）">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line></svg>
              聚焦
            </button>
            <!-- 實作計時 -->
            <button type="button" class="action-icon-btn" onclick="startTimer(${practiceMins}, '${item.title}')" title="啟動實作倒數">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              ${practiceMins}分實作
            </button>
          </div>
        </div>

        <div class="prompt-box">
          <div class="prompt-box-header">
            <span class="prompt-box-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
              AI PROMPT TEMPLATE
            </span>
            <button type="button" class="copy-btn" onclick="copyPromptText(this, decodeURIComponent('${encodeURIComponent(item.prompt)}'))">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              一鍵複製提示詞
            </button>
          </div>
          <div class="prompt-box-body">${highlightedPrompt}</div>
        </div>

        ${item.tips ? `
          <div class="card-tips-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            <div><strong>講師小叮嚀：</strong> ${item.tips}</div>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

function highlightPlaceholders(text) {
  if (!text) return '';
  const escaped = escapeHtml(text);
  return escaped.replace(
    /(【[^】\r\n]+】|\[[^\]\r\n]+\])/g,
    '<span class="placeholder-highlight">$1</span>'
  );
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[m]));
}

async function copyPromptText(button, text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }

    const originalHtml = button.innerHTML;
    button.classList.add('copied');
    button.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
      已複製！
    `;
    showToast('✅ 提示詞已複製！直接至 AI 對話視窗貼上並修改【括號】內容。');

    setTimeout(() => {
      button.classList.remove('copied');
      button.innerHTML = originalHtml;
    }, 2000);
  } catch (err) {
    showToast('❌ 複製失敗，請手動全選複製');
  }
}

function setCategoryFilter(category) {
  activeCategory = category;
  document.querySelectorAll('.pill-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-category') === category);
  });
  filterCards();
}

function handleSearch(val) {
  searchTerm = val.trim().toLowerCase();
  const clearBtn = document.getElementById('searchClearBtn');
  if (clearBtn) clearBtn.style.display = searchTerm ? 'block' : 'none';
  filterCards();
}

function clearSearch() {
  const input = document.getElementById('searchInput');
  if (input) {
    input.value = '';
    searchTerm = '';
    document.getElementById('searchClearBtn').style.display = 'none';
    input.focus();
    filterCards();
  }
}

function filterCards() {
  const cards = document.querySelectorAll('.resource-card');
  let visibleCount = 0;

  cards.forEach(card => {
    const cardCat = card.getAttribute('data-category');
    const cardSearch = card.getAttribute('data-search') || '';

    const matchCat = (activeCategory === '全部' || cardCat === activeCategory);
    const matchSearch = (!searchTerm || cardSearch.includes(searchTerm));

    if (matchCat && matchSearch) {
      card.style.display = '';
      visibleCount++;
    } else {
      card.style.display = 'none';
    }
  });

  const emptyState = document.getElementById('emptySearchState');
  if (emptyState) {
    emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
    const emptyQuery = document.getElementById('emptyQuery');
    if (emptyQuery) emptyQuery.innerText = searchTerm;
  }
}

function toggleSpotlight(cardId) {
  const card = document.getElementById(cardId);
  if (!card) return;

  const isActive = card.classList.contains('spotlight-active');
  document.querySelectorAll('.resource-card').forEach(c => c.classList.remove('spotlight-active'));

  if (!isActive) {
    card.classList.add('spotlight-active');
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    showToast('💡 已鎖定此卡片為教學焦點');
  }
}

function startTimer(minutes, title) {
  const timerBar = document.getElementById('timerBar');
  const timerTitle = document.getElementById('timerTitle');

  if (activeTimer) clearInterval(activeTimer);

  timerSecondsRemaining = minutes * 60;
  if (timerTitle) timerTitle.innerText = `⏱️ ${title || '課堂實作時間'}`;
  updateTimerDisplay();

  if (timerBar) timerBar.classList.add('active');

  activeTimer = setInterval(() => {
    timerSecondsRemaining--;
    updateTimerDisplay();

    if (timerSecondsRemaining <= 0) {
      clearInterval(activeTimer);
      activeTimer = null;
      showToast('🔔 實作時間結束！請學員聚焦回講師投影畫面。');
      playBeepSound();
    }
  }, 1000);

  showToast(`⏱️ 已啟動 ${minutes} 分鐘實作倒數！`);
}

function updateTimerDisplay() {
  const display = document.getElementById('timerDisplay');
  if (!display) return;
  const m = Math.floor(timerSecondsRemaining / 60);
  const s = timerSecondsRemaining % 60;
  display.innerText = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function stopTimer() {
  if (activeTimer) {
    clearInterval(activeTimer);
    activeTimer = null;
  }
  const timerBar = document.getElementById('timerBar');
  if (timerBar) timerBar.classList.remove('active');
  showToast('計時器已關閉');
}

function playBeepSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {}
}

function openQrModal(url, title) {
  const modal = document.getElementById('qrModal');
  const img = document.getElementById('qrModalImg');
  const titleEl = document.getElementById('qrModalTitle');
  const urlEl = document.getElementById('qrModalUrl');

  if (titleEl) titleEl.innerText = title;
  if (urlEl) urlEl.innerText = url;
  if (img) {
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(url)}`;
  }

  if (modal) modal.classList.add('active');
}

function closeQrModal() {
  const modal = document.getElementById('qrModal');
  if (modal) modal.classList.remove('active');
}

function initTheme() {
  const saved = localStorage.getItem('course_guide_theme');
  if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.body.classList.add('dark-mode');
  }
}

function toggleTheme() {
  const isDark = document.body.classList.toggle('dark-mode');
  localStorage.setItem('course_guide_theme', isDark ? 'dark' : 'light');
  showToast(isDark ? '🌙 已切換為深色模式（護眼投影）' : '☀️ 已切換為淺色模式');
}

function showToast(msg) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerText = msg;
  container.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('show'));

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2400);
}

function getFallbackWorkshops() {
  return [
    {
      id: "workshop-default",
      date: "2026-11-15",
      dayOfWeek: "週日",
      monthText: "11月",
      dayText: "15",
      isLatest: true,
      status: "public",
      title: "AI 賦能教學與行政減負實戰工作坊",
      duration: "09:00 - 12:00（3小時）",
      location: "電腦教室 / 線上同步",
      description: "本場次示範教案素養命題、校本學習單與行政公文快速生成。",
      categories: ["全部", "常用網站", "教案備課", "評量命題", "行政減負"],
      resources: []
    }
  ];
}
