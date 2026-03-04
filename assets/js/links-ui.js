(() => {
  const gridRoot = document.getElementById('links-grid');
  const filtersRoot = document.getElementById('category-filters');
  const searchInput = document.getElementById('links-search');
  const countEl = document.getElementById('links-count');

  if (!gridRoot || !filtersRoot || !searchInput) return;

  let activeCategory = 'All';
  let query = '';
  let links = [];

  function normalize(text) {
    return (text || '').toLowerCase().trim();
  }

  function cardTemplate(item) {
    const tags = (item.tags || []).slice(0, 4).map((tag) => `<span>${tag}</span>`).join('');
    const sub = item.subcategory ? `<span>${item.subcategory}</span>` : '';

    return `
      <article class="link-card reveal" data-url="${item.url}">
        <div>
          <h3>${item.title}</h3>
          <p>${item.description}</p>
        </div>
        <div class="link-meta">
          <span>${item.category}</span>
          ${sub}
          ${tags}
        </div>
        <a class="link-action" href="${item.url}" target="_blank" rel="noopener noreferrer">Open Link</a>
      </article>
    `;
  }

  function groupByCategory(items) {
    const grouped = new Map();
    items.forEach((item) => {
      if (!grouped.has(item.category)) {
        grouped.set(item.category, []);
      }
      grouped.get(item.category).push(item);
    });
    return grouped;
  }

  function renderFilters(categories) {
    const allCategories = ['All', ...categories];
    filtersRoot.innerHTML = allCategories
      .map(
        (category) =>
          `<button class="filter-pill ${category === activeCategory ? 'active' : ''}" data-category="${category}">${category}</button>`
      )
      .join('');

    filtersRoot.querySelectorAll('[data-category]').forEach((button) => {
      button.addEventListener('click', () => {
        activeCategory = button.getAttribute('data-category') || 'All';
        render();
      });
    });
  }

  function filteredLinks() {
    return links.filter((item) => {
      const categoryMatch = activeCategory === 'All' || item.category === activeCategory;
      const searchable = `${item.title} ${item.description} ${item.author} ${item.category} ${item.subcategory || ''} ${(item.tags || []).join(' ')}`;
      const queryMatch = !query || normalize(searchable).includes(query);
      return categoryMatch && queryMatch;
    });
  }

  function render() {
    const current = filteredLinks();

    if (countEl) {
      countEl.textContent = `${current.length} links`;
    }

    if (!current.length) {
      gridRoot.innerHTML = '<div class="empty-state">No links match that filter yet. Try another category or clear search.</div>';
      return;
    }

    const grouped = groupByCategory(current);
    const sections = [];

    grouped.forEach((items, category) => {
      sections.push(`
        <section class="links-section" aria-label="${category}">
          <h2>${category}</h2>
          <p class="links-subtext">${items.length} resources in this group.</p>
          <div class="links-grid">
            ${items.map(cardTemplate).join('')}
          </div>
        </section>
      `);
    });

    gridRoot.innerHTML = sections.join('');

    if (typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined') {
      window.gsap.utils.toArray('#links-grid .link-card').forEach((card) => {
        window.gsap.fromTo(
          card,
          { opacity: 0, y: 18 },
          {
            opacity: 1,
            y: 0,
            duration: 0.45,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 88%',
            },
          }
        );
      });
    }

    window.dispatchEvent(new CustomEvent('links:rendered'));
  }

  searchInput.addEventListener('input', (event) => {
    query = normalize(event.target.value);
    render();
  });

  fetch('/assets/data/links.json')
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Could not load links: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      links = Array.isArray(data.items) ? data.items : [];
      const categories = [...new Set(links.map((item) => item.category))].sort((a, b) => a.localeCompare(b));
      renderFilters(categories);
      render();
    })
    .catch((error) => {
      gridRoot.innerHTML = `<div class="empty-state">Could not load links data. ${error.message}</div>`;
    });
})();
