import { useEffect, useRef } from 'react';

export default function SectionTabs({ sections, activeSection, onSelect }) {
  const scrollRef = useRef(null);
  const activeRef = useRef(null);

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const tab = activeRef.current;
      const left = tab.offsetLeft - container.offsetWidth / 2 + tab.offsetWidth / 2;
      container.scrollTo({ left, behavior: 'smooth' });
    }
  }, [activeSection]);

  return (
    <div className="pillbar">
      <div className="pillbar-scroll" ref={scrollRef}>
        {sections.map((section) => (
          <button
            key={section}
            ref={activeSection === section ? activeRef : null}
            type="button"
            className={`pill ${activeSection === section ? 'active' : ''}`}
            onClick={() => onSelect(section)}
          >
            {section}
          </button>
        ))}
      </div>
    </div>
  );
}
