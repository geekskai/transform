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
      className="rounded-b-2xl border-x border-b border-gray-200 bg-white shadow-xl shadow-brand-500/10 transition-all duration-300 md:rounded-b-3xl"
      style={{
        position: "fixed",
        top: position.top,
        left: 0,
        width: "100%",
        maxHeight: "calc(100vh - 80px)",
        zIndex: DROPDOWN_Z_INDEX
      }}
    >
      <div className="mega-menu-grid px-4 py-6 sm:px-6 md:px-8 md:py-8 lg:px-10">
        {categorizedRoutes.map(categoryGroup => (
          <div
            key={categoryGroup.category}
            className="mega-menu-column mb-6 md:mb-8"
          >
            <h3 className="mega-menu-category-title mb-2 text-xs font-bold uppercase tracking-wider text-brand-700 md:mb-3 md:text-sm">
              {categoryGroup.category}
            </h3>
            <ul className="mega-menu-list gap-1 md:gap-2">
              {categoryGroup.content.map(route => (
                <li key={route.path}>
                  <Link
                    href={route.path}
                    prefetch={false}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mega-menu-link block rounded-lg px-2 py-1.5 text-xs text-gray-600 transition-all duration-300 hover:bg-brand-50 hover:text-gray-900 md:rounded-xl md:px-3 md:py-2 md:text-sm"
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
      <div className="border-t border-brand-200 bg-brand-50 px-4 py-4 sm:px-6 md:px-8 md:py-6 lg:px-10">
        <div className="mega-menu-footer-content">
          <strong className="block text-sm font-semibold text-brand-900 md:text-base">
            Ready to convert?
          </strong>
          <p className="mt-1 text-xs leading-relaxed text-gray-600 md:mt-2 md:text-sm">
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
    <nav
      className="header-nav flex h-14 items-center gap-4 bg-white px-4 sm:px-6 md:h-16 md:gap-6 lg:px-8"
      aria-label="Main"
    >
      {/* Logo - Left */}
      <Link
        href="/"
        className="header-nav-home flex items-center gap-2 rounded-xl px-2 py-1.5 text-gray-900 transition-all duration-300 hover:bg-brand-50 hover:text-brand-800 md:gap-2.5 md:rounded-2xl md:px-3 md:py-2"
      >
        <img
          src="/static/favicon.svg"
          alt=""
          width={24}
          height={24}
          className="h-6 w-6 md:h-7 md:w-7"
          aria-hidden
        />
        <span className="header-nav-brand text-sm font-semibold md:text-base">
          {SITE_CONFIG.name}
        </span>
      </Link>

      {/* Spacer - Center */}
      <div className="flex-1" />
      <SearchBox />

      <MegaMenuPane
        isOpen={isMenuOpen}
        triggerRef={triggerRef}
        onClose={closeMenu}
        onLinkClick={closeMenu}
      />
      <button
        ref={triggerRef}
        type="button"
        className={`header-nav-btn group relative overflow-hidden rounded-xl border px-3 py-2 text-sm font-semibold transition-all duration-300 md:rounded-2xl md:px-4 md:py-2.5 md:text-base ${
          isMenuOpen
            ? "border-brand-400 bg-brand-50 text-brand-800 shadow-lg shadow-brand-500/20"
            : "border-brand-300 bg-gradient-to-br from-brand-50 to-brand-100/50 text-brand-800 hover:border-brand-400 hover:shadow-lg hover:shadow-brand-500/20"
        }`}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-expanded={isMenuOpen}
        aria-haspopup="true"
        aria-controls="header-mega-menu"
      >
        <span className="absolute inset-0 bg-gradient-to-br from-brand-200/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <span className="relative flex items-center gap-1.5 md:gap-2">
          Tools
          <svg
            className={`h-3.5 w-3.5 transition-transform duration-300 md:h-4 md:w-4 ${
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
    </nav>
  );
}
