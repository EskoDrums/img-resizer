// admin.js
const loadBtn = document.getElementById('loadBtn');
const adminKeyInput = document.getElementById('adminKey');
const dashboard = document.getElementById('dashboard');
const countEl = document.getElementById('count');
const listArea = document.getElementById('listArea');
const downloadBtn = document.getElementById('downloadTxt');
const refreshBtn = document.getElementById('refreshBtn');

async function loadUsers(adminKey) {
  try {
    const res = await fetch('/api/getUsers', {
      method: 'GET',
      headers: { 'x-admin-key': adminKey }
    });
    if (!res.ok) {
      const err = await res.json().catch(()=>({message:'Failed'}));
      alert('Error: ' + (err.error || res.status));
      return null;
    }
    return res.json();
  } catch (err) {
    console.error(err);
    alert('Network error');
    return null;
  }
}

function display(users) {
  const ids = users.map(u => u.userId);
  countEl.textContent = ids.length;
  listArea.textContent = ids.join('\n');
}

loadBtn.addEventListener('click', async () => {
  const key = adminKeyInput.value.trim();
  if (!key) return alert('Enter admin key');
  const result = await loadUsers(key);
  if (result && result.users) {
    dashboard.style.display = 'block';
    display(result.users);
    // store key in session only (optional)
    sessionStorage.setItem('admin_key', key);
  }
});

refreshBtn.addEventListener('click', async () => {
  const key = sessionStorage.getItem('admin_key') || adminKeyInput.value.trim();
  if (!key) return alert('Admin key missing');
  const result = await loadUsers(key);
  if (result && result.users) display(result.users);
});

downloadBtn.addEventListener('click', () => {
  const text = listArea.textContent.trim();
  if (!text) return alert('No IDs to download');
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'telegram_user_ids.txt';
  a.click();
  URL.revokeObjectURL(url);
});
