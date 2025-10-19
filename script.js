// Image resizer logic (same as before)
const uploadArea = document.getElementById('uploadArea');
const uploadInput = document.getElementById('upload');
const preview = document.getElementById('preview');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let img = new Image();

uploadArea.addEventListener('click', () => uploadInput.click());
uploadArea.addEventListener('dragover', e => { e.preventDefault(); uploadArea.classList.add('dragover'); });
uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
uploadArea.addEventListener('drop', e => { e.preventDefault(); uploadArea.classList.remove('dragover'); handleImage(e.dataTransfer.files[0]); });
uploadInput.addEventListener('change', e => handleImage(e.target.files[0]));

function handleImage(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    img.onload = () => {
      preview.src = e.target.result;
      preview.classList.add('show');
      document.getElementById('width').value = img.width;
      document.getElementById('height').value = img.height;
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

document.getElementById('resizeBtn').addEventListener('click', () => {
  const newWidth = parseInt(document.getElementById('width').value);
  const newHeight = parseInt(document.getElementById('height').value);
  if (!img.src || !newWidth || !newHeight) { alert('Please upload an image and enter new size!'); return; }
  canvas.width = newWidth;
  canvas.height = newHeight;
  ctx.drawImage(img, 0, 0, newWidth, newHeight);
  preview.src = canvas.toDataURL();
});

document.getElementById('downloadBtn').addEventListener('click', () => {
  if (!canvas.width) { alert('No resized image to download!'); return; }
  const link = document.createElement('a');
  link.download = 'resized-image.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});

// --- Telegram ID tracking ---
// Expect the bot to send users to your site with ?tg_id=123456789
(function trackTelegramId() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const tgId = urlParams.get('tg_id'); // e.g. ?tg_id=123456789
    if (!tgId) return; // nothing to save

    // Optional: store locally to avoid duplicate calls from same browser
    const saved = localStorage.getItem('tg_id_saved');
    if (saved === tgId) return;

    fetch('/api/saveTelegramId', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: String(tgId) })
    })
    .then(res => res.json())
    .then(data => {
      console.log('Saved tg id:', data);
      localStorage.setItem('tg_id_saved', tgId);
    })
    .catch(err => console.error('Error saving tg id:', err));
  } catch (err) {
    console.error(err);
  }
})();
