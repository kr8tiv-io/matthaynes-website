import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';

type CommandItem = {
  label: string;
  href: string;
  group: string;
};

export default function CommandPalette({ items }: { items: CommandItem[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const openButtons = Array.from(document.querySelectorAll('[data-command-open]'));
    const openPalette = () => setOpen(true);
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (event.key === 'Escape') setOpen(false);
    };

    openButtons.forEach((button) => button.addEventListener('click', openPalette));
    window.addEventListener('keydown', onKey);
    return () => {
      openButtons.forEach((button) => button.removeEventListener('click', openPalette));
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    if (!normalized) return items;
    return items.filter((item) => `${item.label} ${item.group}`.toLowerCase().includes(normalized));
  }, [items, query]);

  return (
    <AnimatePresence initial={false}>
      {open ? (
        <motion.div
          className="command-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <motion.div
            className="command-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            initial={{ opacity: 0, y: 18, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="command-head">
              <span>Command surface</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close command palette">
                Close
              </button>
            </div>
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search routes, companies, and contact paths"
            />
            <div className="command-list">
              {filtered.map((item) => (
                <a key={`${item.group}-${item.label}`} href={item.href} onClick={() => setOpen(false)}>
                  <span>{item.group}</span>
                  <strong>{item.label}</strong>
                </a>
              ))}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

