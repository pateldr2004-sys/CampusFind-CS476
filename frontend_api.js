const CampusFindAPI = (() => {
  const API_BASE = window.CAMPUSFIND_API_BASE || '/api';

  function getToken() {
    return localStorage.getItem('campusfindToken');
  }

  function getUser() {
    try { return JSON.parse(localStorage.getItem('campusfindUser') || 'null'); }
    catch { return null; }
  }

  function setSession(token, user) {
    localStorage.setItem('campusfindToken', token);
    localStorage.setItem('campusfindUser', JSON.stringify(user));
  }

  function clearSession() {
    localStorage.removeItem('campusfindToken');
    localStorage.removeItem('campusfindUser');
  }

  async function request(path, options = {}) {
    const headers = options.headers || {};
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await response.json() : await response.text();

    if (!response.ok) {
      const message = data?.message || data || 'Request failed';
      throw new Error(message);
    }
    return data;
  }

  async function postJson(path, body) {
    return request(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  }

  function showMessage(form, message, isError = false) {
    let box = form.querySelector('.api-message');
    if (!box) {
      box = document.createElement('p');
      box.className = 'api-message helper-text';
      form.appendChild(box);
    }
    box.textContent = message;
    box.style.color = isError ? '#b00020' : 'inherit';
  }

  function requireAuth(role) {
    const token = getToken();
    const user = getUser();
    if (!token || !user || (role && user.role !== role)) return null;
    return user;
  }

  return { request, postJson, getToken, getUser, setSession, clearSession, showMessage, requireAuth };
})();

function setupSignup() {
  const form = document.getElementById('signup-form');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    if (event.defaultPrevented) return;
    event.preventDefault();

    const payload = new FormData();
    payload.append('fullName', document.getElementById('name')?.value || '');
    payload.append('email', document.getElementById('email')?.value || '');
    payload.append('password', document.getElementById('password')?.value || '');
    payload.append('phone', document.getElementById('phone')?.value || '');
    const file = document.getElementById('file')?.files?.[0];
    if (file) payload.append('file', file);

    try {
      CampusFindAPI.showMessage(form, 'Creating account...');
      await CampusFindAPI.request('/auth/signup', { method: 'POST', body: payload });
      alert('Account created successfully. Please log in.');
      window.location.href = 'login.html';
    } catch (err) {
      CampusFindAPI.showMessage(form, err.message, true);
    }
  });
}

function setupLogin() {
  const form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    if (event.defaultPrevented) return;
    event.preventDefault();

    try {
      CampusFindAPI.showMessage(form, 'Logging in...');
      const data = await CampusFindAPI.postJson('/auth/login', {
        email: document.getElementById('email')?.value || '',
        password: document.getElementById('password')?.value || ''
      });
      CampusFindAPI.setSession(data.token, data.user);
      window.location.href = 'report.html';
    } catch (err) {
      CampusFindAPI.showMessage(form, err.message, true);
    }
  });
}

function setupAdminLogin() {
  const form = document.getElementById('admin-login-form');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    if (event.defaultPrevented) return;
    event.preventDefault();

    try {
      CampusFindAPI.showMessage(form, 'Logging in...');
      const data = await CampusFindAPI.postJson('/auth/admin/login', {
        email: document.getElementById('admin-email')?.value || form.querySelector('input[type="email"]')?.value || '',
        password: document.getElementById('admin-password')?.value || form.querySelector('input[type="password"]')?.value || ''
      });
      CampusFindAPI.setSession(data.token, data.user);
      window.location.href = 'admin_dashboard.html';
    } catch (err) {
      CampusFindAPI.showMessage(form, err.message, true);
    }
  });
}

function setupLostReport() {
  const form = document.getElementById('report-form');
  if (!form) return;

  const user = CampusFindAPI.requireAuth();
  if (!user) {
    alert('Please log in before submitting a lost item report.');
    window.location.href = 'login.html';
    return;
  }

  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');
  if (emailInput && !emailInput.value) emailInput.value = user.email || '';
  if (phoneInput && !phoneInput.value) phoneInput.value = user.phone || '';

  form.addEventListener('submit', async (event) => {
    if (event.defaultPrevented) return;
    event.preventDefault();

    const payload = new FormData();
    payload.append('email', document.getElementById('email')?.value || '');
    payload.append('phone', document.getElementById('phone')?.value || '');
    payload.append('itemCategory', document.getElementById('category')?.value || '');
    payload.append('itemName', document.getElementById('item')?.value || '');
    payload.append('dateLost', document.getElementById('date')?.value || '');
    payload.append('lastKnownLocation', document.getElementById('location')?.value || '');
    payload.append('description', document.getElementById('description')?.value || '');
    const file = document.getElementById('file')?.files?.[0];
    if (file) payload.append('file', file);

    try {
      CampusFindAPI.showMessage(form, 'Submitting report...');
      const data = await CampusFindAPI.request('/lost-reports', { method: 'POST', body: payload });
      window.location.href = `claim_success.html?reference=${encodeURIComponent(data.referenceNumber)}`;
    } catch (err) {
      CampusFindAPI.showMessage(form, err.message, true);
    }
  });
}

function setupStatusLookup() {
  const form = document.getElementById('status-form');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const result = document.getElementById('status-result');
    const ref = document.getElementById('status-reference')?.value || '';
    const email = document.getElementById('status-email')?.value || '';

    try {
      const data = await CampusFindAPI.request(`/lost-reports/status?referenceNumber=${encodeURIComponent(ref)}&email=${encodeURIComponent(email)}`);
      result.textContent = `Status: ${data.report.status} — Item: ${data.report.itemName}`;
      result.style.color = 'inherit';
    } catch (err) {
      result.textContent = err.message;
      result.style.color = '#b00020';
    }
  });
}

async function setupAdminDashboard() {
  const dashboard = document.querySelector('.dashboard-main');
  if (!dashboard) return;

  const user = CampusFindAPI.requireAuth('admin');
  if (!user) {
    alert('Please log in as an admin.');
    window.location.href = 'admin_login.html';
    return;
  }

  const signout = document.querySelector('.header-actions a.admin-link');
  signout?.addEventListener('click', (event) => {
    event.preventDefault();
    CampusFindAPI.clearSession();
    window.location.href = 'admin_login.html';
  });

  const form = document.getElementById('found-item-form');
  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      CampusFindAPI.showMessage(form, 'Saving found item...');
      const data = await CampusFindAPI.postJson('/found-items', {
        itemTitle: document.getElementById('found-item-title')?.value || '',
        dropOffLocation: document.getElementById('found-dropoff-location')?.value || '',
        itemCategory: document.getElementById('found-item-category')?.value || '',
        privateVerificationNotes: document.getElementById('found-verification-notes')?.value || ''
      });
      CampusFindAPI.showMessage(form, `Found item saved. Matches created: ${data.matchesCreated}`);
      form.reset();
      await loadDashboard();
    } catch (err) {
      CampusFindAPI.showMessage(form, err.message, true);
    }
  });

  async function loadDashboard() {
    try {
      const data = await CampusFindAPI.request('/admin/dashboard');
      const cards = document.querySelectorAll('.metric-card strong');
      if (cards[0]) cards[0].textContent = data.metrics.itemsInHolding;
      if (cards[1]) cards[1].textContent = data.metrics.openLostReports;
      if (cards[2]) cards[2].textContent = data.metrics.matchesPendingReview;

      const list = document.querySelector('.match-list');
      if (list) {
        list.innerHTML = '';
        if (!data.recentMatches.length) {
          list.innerHTML = '<div class="match-item"><strong>No pending matches</strong><span>Add a found item to generate possible matches.</span></div>';
        }
        data.recentMatches.forEach((match) => {
          const lost = match.lostReportId || {};
          const found = match.foundItemId || {};
          const row = document.createElement('div');
          row.className = 'match-item';
          row.innerHTML = `
            <strong>${found.itemTitle || 'Found item'} ↔ ${lost.itemName || 'Lost report'}</strong>
            <span>${lost.referenceNumber || ''} · Similarity: ${match.similarity} · Score: ${match.score ?? 'N/A'}</span>
            <span>${lost.email || ''}</span>
            <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.5rem;">
              <button class="btn btn-secondary" data-confirm="${match._id}">Confirm</button>
              <button class="btn btn-primary" data-release="${match._id}">Release</button>
              <button class="btn btn-secondary" data-reject="${match._id}">Reject</button>
            </div>
          `;
          list.appendChild(row);
        });
      }
    } catch (err) {
      console.error(err);
    }
  }

  document.addEventListener('click', async (event) => {
    const confirmId = event.target?.dataset?.confirm;
    const rejectId = event.target?.dataset?.reject;
    const releaseId = event.target?.dataset?.release;

    try {
      if (confirmId) {
        await CampusFindAPI.request(`/matches/${confirmId}/confirm`, { method: 'PATCH' });
        await loadDashboard();
      }
      if (rejectId) {
        await CampusFindAPI.request(`/matches/${rejectId}/reject`, { method: 'PATCH' });
        await loadDashboard();
      }
      if (releaseId) {
        await CampusFindAPI.postJson(`/release/${releaseId}`, { notes: 'Released after in-person ownership verification.' });
        await loadDashboard();
      }
    } catch (err) {
      alert(err.message);
    }
  });

  await loadDashboard();
}

function setupSuccessPage() {
  const refSpan = document.getElementById('success-reference-number');
  if (!refSpan) return;
  const ref = new URLSearchParams(window.location.search).get('reference');
  if (ref) refSpan.textContent = ref;
}

document.addEventListener('DOMContentLoaded', () => {
  setupSignup();
  setupLogin();
  setupAdminLogin();
  setupLostReport();
  setupStatusLookup();
  setupAdminDashboard();
  setupSuccessPage();
});
