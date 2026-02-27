// Frontend JS: fetch /api/search?q=... and render responsive cards
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('searchForm');
  const qInput = document.getElementById('q');
  const grid = document.getElementById('grid');
  const hint = document.getElementById('hint');
  const sortSelect = document.getElementById('sort');
  const compareBtn = document.getElementById('compareBtn');
  const exportBtn = document.getElementById('exportBtn');

  let currentItems = [];
  const selectedForCompare = new Map();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const q = qInput.value.trim();
    if (!q) return;
    hint.style.display = 'none';
    grid.innerHTML = '<p class="no-results">Searching...</p>';

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      currentItems = data.results || [];
      applyFiltersAndRender();
    } catch (err) {
      grid.innerHTML = '<p class="no-results">Search failed. Try again.</p>';
      console.error(err);
    }
  });

  sortSelect.addEventListener('change', () => applyFiltersAndRender());

  exportBtn.addEventListener('click', () => {
    if (!currentItems.length) return;
    const csv = toCSV(currentItems);
    downloadCSV(csv, 'results.csv');
  });

  compareBtn.addEventListener('click', () => {
    const selected = Array.from(selectedForCompare.values());
    if (selected.length < 2) return alert('Select at least two items to compare');
    renderComparePanel(selected);
  });

  function applyFiltersAndRender() {
    const checkedSites = Array.from(document.querySelectorAll('.site-filter input:checked')).map(n => n.value);
    let items = currentItems.filter(it => checkedSites.includes(it.site));

    const sort = sortSelect.value;
    if (sort === 'price-asc') items.sort((a,b)=>a.price-b.price);
    if (sort === 'price-desc') items.sort((a,b)=>b.price-a.price);

    renderResults(items);
  }

  function formatCurrency(n) { return '₹' + n.toLocaleString(); }

  function renderResults(items) {
    if (!items || items.length === 0) { grid.innerHTML = '<p class="no-results">No products found.</p>'; return; }

    // Find lowest price per title
    const lowestByTitle = {};
    items.forEach(it => {
      const key = it.title.toLowerCase();
      if (!lowestByTitle[key] || it.price < lowestByTitle[key].price) lowestByTitle[key] = it;
    });

    grid.innerHTML = '';
    items.forEach(it => {
      const card = document.createElement('div');
      card.className = 'card';
      const isBest = lowestByTitle[it.title.toLowerCase()] && lowestByTitle[it.title.toLowerCase()].id === it.id;
      if (isBest) card.classList.add('best-price');

      const checked = selectedForCompare.has(it.id) ? 'checked' : '';

      card.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center">
          <label style="font-size:13px;color:var(--muted)"><input type="checkbox" data-id="${it.id}" ${checked}/> Compare</label>
          ${isBest?'<div class="best-label">Lowest price</div>':''}
        </div>
        <img src="${it.image}" alt="${escapeHtml(it.title)}" onerror="this.style.opacity=0.6" />
        <div class="meta">
          <div>
            <div class="title">${escapeHtml(it.title)}</div>
            <div class="site">${escapeHtml(it.site)}</div>
          </div>
          <div style="text-align:right">
            <div class="price">${formatCurrency(it.price)}</div>
          </div>
        </div>
        <div class="actions">
          <button class="btn view" onclick="window.open('${it.url}','_blank')">View Product</button>
          <button class="btn buy" onclick="window.open('${it.url}','_blank')">Buy</button>
        </div>
      `;

      grid.appendChild(card);
    });

    // wire compare checkboxes
    grid.querySelectorAll('input[type="checkbox"][data-id]').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const id = cb.getAttribute('data-id');
        const item = items.find(x=>x.id===id);
        if (!item) return;
        if (cb.checked) selectedForCompare.set(id, item); else selectedForCompare.delete(id);
        compareBtn.disabled = selectedForCompare.size < 2;
        compareBtn.textContent = `Compare (${selectedForCompare.size})`;
        exportBtn.disabled = items.length === 0;
      });
    });
  }

  function renderComparePanel(list) {
    // simple CSV-like comparison view in new window
    let html = `<h2 style="color:#e6eef8">Compare (${list.length})</h2><table style="width:100%;border-collapse:collapse;color:#e6eef8">`;
    html += '<tr><th style="text-align:left">Title</th><th>Site</th><th>Price</th><th>Link</th></tr>';
    list.forEach(it=>{
      html += `<tr><td style="padding:8px 6px">${escapeHtml(it.title)}</td><td style="padding:8px 6px">${escapeHtml(it.site)}</td><td style="padding:8px 6px">${formatCurrency(it.price)}</td><td style="padding:8px 6px"><a href="${it.url}" target="_blank">Open</a></td></tr>`;
    });
    html += '</table>';
    const w = window.open('','_blank','width=800,height=600');
    w.document.body.style.background = '#071020';
    w.document.body.innerHTML = html;
  }

  function toCSV(items) {
    const rows = [['id','title','site','price','url']];
    items.forEach(it=>rows.push([it.id, it.title, it.site, it.price, it.url]));
    return rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
  }

  function downloadCSV(text, filename){
    const blob = new Blob([text], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }

  // Minimal escaping
  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[c]); }

});
