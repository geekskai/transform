/**
 * Top header: Search (standalone) + one dropdown per category.
 * Dropdowns render via React Portal to document.body so they are never clipped by header/body overflow.
 */
import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useLayoutEffect
} from "react";
import ReactDOM from "react-dom";
import Link from "next/link";
import { useRouter } from "next/router";
import { categorizedRoutes, Route } from "@utils/routes";
import SearchBox from "@components/Searchbox";
import { SITE_CONFIG } from "../lib/seo";

const DROPDOWN_Z_INDEX = 9999;
const GAP = 6;

function useTriggerPosition(
  triggerRefs: React.MutableRefObject<Record<string, HTMLButtonElement | null>>,
  category: string,
  isOpen: boolean
) {
  const [rect, setRect] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const update = useCallback(() => {
    const el = triggerRefs.current[category];
    if (!el) return;
    const r = el.getBoundingClientRect();
    setRect({ top: r.bottom + GAP, left: r.left, width: r.width });
  }, [triggerRefs, category]);

  useLayoutEffect(() => {
    if (!isOpen) {
      setRect(null);
      return;
    }
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [isOpen, update]);

  return rect;
}

function CategoryDropdown({
  category,
  content,
  currentPath,
  isOpen,
  triggerRefs,
  onClose,
  onLinkClick
}: {
  category: string;
  content: Route[];
  currentPath: string;
  isOpen: boolean;
  triggerRefs: React.MutableRefObject<Record<string, HTMLButtonElement | null>>;
  onClose: () => void;
  onLinkClick: () => void;
}) {
  const position = useTriggerPosition(triggerRefs, category, isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const trigger = triggerRefs.current[category];
      if (trigger?.contains(target)) return;
      const pane = document.getElementById(`header-nav-pane-${category}`);
      if (pane?.contains(target)) return;
      onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, category, onClose, triggerRefs]);

  if (!isOpen || !position || typeof document === "undefined") return null;

  const sortedContent = [...content].sort((a, b) =>
    a.label.localeCompare(b.label)
  );

  const dropdown = (
    <div
      id={`header-nav-pane-${category}`}
      className="header-nav-portal-pane"
      role="menu"
      aria-label={category}
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
        minWidth: 180,
        maxWidth: 320,
        maxHeight: "min(70vh, 400px)",
        zIndex: DROPDOWN_Z_INDEX
      }}
    >
      <ul className="header-nav-cat-list">
        {sortedContent.map((a: Route) => {
          const isActive = currentPath === a.path;
          const displayName =
            category.toLowerCase() !== "others"
              ? `${category} ${a.label}`
              : a.label;
          return (
            <li key={a.path} role="none">
              <Link href={a.path} prefetch={false}>
                <a
                  className={`header-nav-cat-link ${
                    isActive ? "header-nav-cat-link--active" : ""
                  }`}
                  role="menuitem"
                  aria-current={isActive ? "page" : undefined}
                  onClick={onLinkClick}
                >
                  {displayName}
                </a>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );

  return ReactDOM.createPortal(dropdown, document.body);
}

export default function HeaderNav() {
  const router = useRouter();
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const closeAll = useCallback(() => setOpenCategory(null), []);

  useEffect(() => {
    router.events.on("routeChangeComplete", closeAll);
    return () => router.events.off("routeChangeComplete", closeAll);
  }, [router.events, closeAll]);

  const currentPath = router.pathname || "";

  const toggleCategory = (category: string) => {
    setOpenCategory(prev => (prev === category ? null : category));
  };

  return (
    <nav className="header-nav" aria-label="Main">
      <Link href="/">
        <a className="header-nav-home">
          <img
            src="/static/favicon.svg"
            alt=""
            width={28}
            height={28}
            aria-hidden
          />
          <span className="header-nav-brand">{SITE_CONFIG.name}</span>
        </a>
      </Link>

      <div className="header-nav-search-wrap">
        <SearchBox />
      </div>

      <div className="header-nav-categories">
        {categorizedRoutes.map(({ category, content }) => {
          const isOpen = openCategory === category;
          return (
            <React.Fragment key={category}>
              <button
                ref={el => {
                  triggerRefs.current[category] = el;
                }}
                type="button"
                className="header-nav-cat-btn"
                onClick={() => toggleCategory(category)}
                aria-expanded={isOpen}
                aria-haspopup="true"
                aria-controls={`menu-${category}`}
              >
                {category}
                <span className="header-nav-chevron" aria-hidden="true">
                  ▼
                </span>
              </button>
              <CategoryDropdown
                category={category}
                content={content as Route[]}
                currentPath={currentPath}
                isOpen={isOpen}
                triggerRefs={triggerRefs}
                onClose={closeAll}
                onLinkClick={closeAll}
              />
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
}
