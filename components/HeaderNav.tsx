/**
 * Top header: Search (standalone) + Mega Menu for Tools.
 * Dropdowns render via React Portal to document.body.
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
const GAP = 12;

function useTriggerPosition(
  triggerRef: React.RefObject<HTMLButtonElement>,
  isOpen: boolean
) {
  const [rect, setRect] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const update = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    // Center the menu relative to the viewport or trigger, depending on design.
    // For Mega Menu, we want it to be fullish width or centered.
    // Let's position it relative to the trigger but simpler.
    setRect({ top: r.bottom + GAP, left: r.left, width: r.width });
  }, [triggerRef]);

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

function MegaMenuPane({
  isOpen,
  triggerRef,
  onClose,
  onLinkClick
}: {
  isOpen: boolean;
  triggerRef: React.RefObject<HTMLButtonElement>;
  onClose: () => void;
  onLinkClick: () => void;
}) {
  const position = useTriggerPosition(triggerRef, isOpen);

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
      if (triggerRef.current?.contains(target)) return;
      const pane = document.getElementById("header-mega-menu");
      if (pane?.contains(target)) return;
      onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen || !position || typeof document === "undefined") return null;

  const dropdown = (
    <div
      id="header-mega-menu"
      className="mega-menu-pane"
      role="menu"
      style={{
        position: "fixed",
        top: position.top,
        left: 0,
        width: "100%",
        maxHeight: "calc(100vh - 80px)",
        zIndex: DROPDOWN_Z_INDEX
      }}
    >
      <div className="mega-menu-grid">
        {categorizedRoutes.map(categoryGroup => (
          <div key={categoryGroup.category} className="mega-menu-column">
            <h3 className="mega-menu-category-title">
              {categoryGroup.category}
            </h3>
            <ul className="mega-menu-list">
              {categoryGroup.content.map(route => (
                <li key={route.path}>
                  <Link href={route.path} prefetch={false}>
                    <a className="mega-menu-link" onClick={onLinkClick}>
                      {route.label}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mega-menu-footer">
        <div className="mega-menu-footer-content">
          <strong>Ready to convert?</strong>
          <p>
            Select a tool above to get started immediately. No signup required.
          </p>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(dropdown, document.body);
}

export default function HeaderNav() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  useEffect(() => {
    router.events.on("routeChangeComplete", closeMenu);
    return () => router.events.off("routeChangeComplete", closeMenu);
  }, [router.events, closeMenu]);

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

      <div className="header-nav-center">
        {/* Mega Menu Trigger */}
        <button
          ref={triggerRef}
          type="button"
          className={`header-nav-btn ${
            isMenuOpen ? "header-nav-btn--active" : ""
          }`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-expanded={isMenuOpen}
          aria-haspopup="true"
          aria-controls="header-mega-menu"
        >
          Tools
          <svg
            className={`header-nav-chevron ${isMenuOpen ? "rotate-180" : ""}`}
            width="10"
            height="6"
            viewBox="0 0 10 6"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 1L5 5L9 1"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <Link href="/blog">
          <a className="header-nav-link">Blog</a>
        </Link>
      </div>

      <div className="header-nav-right">
        <SearchBox />
      </div>

      <MegaMenuPane
        isOpen={isMenuOpen}
        triggerRef={triggerRef}
        onClose={closeMenu}
        onLinkClick={closeMenu}
      />
    </nav>
  );
}
