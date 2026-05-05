import { AnimatePresence, motion } from 'motion/react';
import { useMemo, useState } from 'react';

export type LinkItem = {
  title: string;
  description: string;
  url: string;
  category: string;
  subcategory?: string | null;
  author?: string;
  tags?: string[];
};

const projectCategories = new Set(['Core Projects', 'Ecosystem Projects']);

export default function LinkConsole({ items }: { items: LinkItem[] }) {
  const displayItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const aProject = projectCategories.has(a.category) ? 1 : 0;
      const bProject = projectCategories.has(b.category) ? 1 : 0;
      if (aProject !== bProject) return aProject - bProject;
      return a.category.localeCompare(b.category) || a.title.localeCompare(b.title);
    });
  }, [items]);

  const categories = useMemo(() => {
    const entries = Array.from(new Set(displayItems.map((item) => item.category)));
    const referenceCategories = entries.filter((entry) => !projectCategories.has(entry)).sort();
    const ownWorkCategories = entries.filter((entry) => projectCategories.has(entry)).sort();
    return ['All finds', ...referenceCategories, ...ownWorkCategories];
  }, [displayItems]);

  const [category, setCategory] = useState('All finds');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const needle = query.toLowerCase().trim();
    return displayItems.filter((item) => {
      const inCategory = category === 'All finds' || item.category === category;
      const haystack = `${item.title} ${item.description} ${item.category} ${item.subcategory ?? ''} ${(item.tags ?? []).join(' ')}`.toLowerCase();
      return inCategory && (!needle || haystack.includes(needle));
    });
  }, [category, displayItems, query]);

  return (
    <section className="link-console" id="links-console">
      <aside className="console-rail" aria-label="Link categories">
        <span className="eyebrow">Archive controls</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          type="search"
          placeholder="Search the found-link basket"
        />
        <div className="filter-list">
          {categories.map((entry) => (
            <button
              type="button"
              key={entry}
              className={entry === category ? 'is-active' : ''}
              onClick={() => setCategory(entry)}
            >
              {entry}
            </button>
          ))}
        </div>
      </aside>
      <div className="console-results">
        <div className="console-status">
          <span>{filtered.length} saved links</span>
          <span>{category}</span>
        </div>
        <AnimatePresence mode="popLayout">
          {filtered.map((item, index) => (
            <motion.a
              layout
              className="link-row"
              href={item.url}
              key={`${item.url}-${item.title}`}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.24, delay: Math.min(index, 8) * 0.015, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="row-number">{String(index + 1).padStart(2, '0')}</span>
              <div className="link-row-copy">
                <p className="link-row-meta">{item.category}{item.subcategory ? ` / ${item.subcategory}` : ''}</p>
                <h2>{item.title}</h2>
                <span>{item.description}</span>
              </div>
              <strong>Open</strong>
            </motion.a>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
