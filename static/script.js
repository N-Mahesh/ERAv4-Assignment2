// --- Animal selection (radios) + image display ---
(function () {
  function qs(sel, ctx = document) { return ctx.querySelector(sel); }
  function qsa(sel, ctx = document) { return Array.from(ctx.querySelectorAll(sel)); }

  const img = qs('#animal-img');
  const placeholder = qs('#animal-placeholder');
  const radios = qsa('input[type="radio"][name="animal"]');

  function render(key) {
    if (!key) {
      img.style.display = 'none';
      img.alt = '';
      placeholder.style.display = 'block';
      placeholder.textContent = 'No animal selected';
      return;
    }
    const src = (window.STATIC_IMAGES && window.STATIC_IMAGES[key]) || '';
    if (!src) {
      img.style.display = 'none';
      placeholder.style.display = 'block';
      placeholder.textContent = 'Image not found';
      return;
    }
    img.onerror = () => {
      img.style.display = 'none';
      placeholder.style.display = 'block';
      placeholder.textContent = 'Failed to load image';
    };
    img.onload = () => {
      placeholder.style.display = 'none';
      img.style.display = 'block';
    };
    img.src = src;
    img.alt = key;
  }

  // Event delegation keeps this resilient even if inputs are re-rendered
  document.addEventListener('change', (e) => {
    if (e.target && e.target.matches('input[type="radio"][name="animal"]')) {
      render(e.target.value);
    }
  });

  // Initial state (handles pre-checked or restored form state)
  const pre = radios.find(r => r.checked);
  render(pre ? pre.value : null);
})();

// --- Upload (input + drag-drop) ---
(function () {
  const form = document.getElementById('upload-form');
  const input = document.getElementById('file-input');
  const result = document.getElementById('upload-result');
  const dropZone = document.getElementById('drop-zone');

  const renderUpload = (payload, isError = false) => {
    result.classList.remove('error', 'success');
    result.classList.add(isError ? 'error' : 'success');

    if (isError) {
      result.textContent = `Error: ${payload}`;
      return;
    }

    result.textContent =
      `Name: ${payload.name}\n` +
      `Size: ${payload.size_human} (${payload.size_bytes} bytes)\n` +
      `Type: ${payload.type}`;
  };

  async function uploadFile(file) {
    if (!file) {
      renderUpload("No file selected.", true);
      return;
    }
    const fd = new FormData();
    fd.append('file', file);

    try {
      const res = await fetch('/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Upload failed');
      renderUpload(data, false);
    } catch (err) {
      renderUpload(err.message || String(err), true);
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    uploadFile(input.files?.[0]);
  });

  // Drag & drop
  const onDragOver = (e) => { e.preventDefault(); dropZone.classList.add('dragover'); };
  const onDragLeave = () => dropZone.classList.remove('dragover');
  const onDrop = (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const file = e.dataTransfer.files?.[0];
    uploadFile(file);
  };

  dropZone.addEventListener('dragover', onDragOver);
  dropZone.addEventListener('dragleave', onDragLeave);
  dropZone.addEventListener('drop', onDrop);

  // Click to trigger file dialog
  dropZone.addEventListener('click', () => input.click());
  dropZone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') input.click();
  });
})();
