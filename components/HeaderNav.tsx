/**
 * Top header: brand logo, Tools mega menu, Search.
 * DESIGN-SPEC §3.6 Secondary button (Tools), §3.2 Card (mega pane), §1 theme.
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

const useSafeLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

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
    setRect({ top: r.bottom + GAP, left: r.left, width: r.width });
  }, [triggerRef]);

  useSafeLayoutEffect(() => {
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
}): React.ReactNode {
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
      role="menu"
      className="rounded-b-3xl border-x border-b border-gray-200 bg-white shadow-xl shadow-[#16F2B3]/10 transition-all duration-300"
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
            <h3 className="mega-menu-category-title text-sm font-bold text-[var(--brand-700)]">
              {categoryGroup.category}
            </h3>
            <ul className="mega-menu-list">
              {categoryGroup.content.map(route => (
                <li key={route.path}>
                  <Link
                    href={route.path}
                    prefetch={false}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mega-menu-link block rounded-xl px-2 py-1.5 text-sm text-gray-600 transition-all duration-300 hover:bg-[var(--brand-50)] hover:text-gray-900 hover:shadow-[var(--brand-500)]/5"
                    onClick={onLinkClick}
                  >
                    {route.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-[var(--brand-200)] bg-[var(--brand-50)] px-6 py-5 md:px-8">
        <div className="mega-menu-footer-content">
          <strong className="block text-base font-semibold text-[var(--brand-900)]">
            Ready to convert?
          </strong>
          <p className="mt-1 text-sm leading-relaxed text-gray-600">
            Select a tool above to get started immediately. No signup required.
          </p>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(dropdown, document.body) as React.ReactNode;
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
    <nav className="header-nav bg-white" aria-label="Main">
      <Link
        href="/"
        className="header-nav-home rounded-2xl px-3 py-2 text-gray-900 transition-all duration-300 hover:bg-[var(--brand-50)] hover:text-[var(--brand-800)]"
      >
        <img
          src="/static/favicon.svg"
          alt=""
          width={28}
          height={28}
          aria-hidden
        />
        <span className="header-nav-brand font-semibold">
          {SITE_CONFIG.name}
        </span>
      </Link>

      <div className="header-nav-center">
        <button
          ref={triggerRef}
          type="button"
          className={`header-nav-btn group relative overflow-hidden rounded-2xl border px-4 py-2.5 font-semibold transition-all duration-300 ${
            isMenuOpen
              ? "border-[var(--brand-400)] bg-[var(--brand-50)] text-[var(--brand-800)] shadow-lg shadow-[#16F2B3]/20"
              : "border-[var(--brand-300)] bg-gradient-to-br from-[var(--brand-50)] to-[var(--brand-100)]/50 text-[var(--brand-800)] hover:border-[var(--brand-400)] hover:shadow-lg hover:shadow-[#16F2B3]/20"
          }`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-expanded={isMenuOpen}
          aria-haspopup="true"
          aria-controls="header-mega-menu"
        >
          <span className="absolute inset-0 bg-gradient-to-br from-[var(--brand-200)]/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <span className="relative flex items-center gap-2">
            Tools
            <svg
              className={`h-4 w-4 transition-transform duration-300 ${
                isMenuOpen ? "rotate-180" : ""
              }`}
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
          </span>
        </button>
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
