import React, { Fragment } from "react";
import { categorizedRoutes, Route } from "@utils/routes";
import Link from "next/link";
import { useRouter } from "next/router";
import SearchBox from "@components/Searchbox";

export default function Navigator() {
  const router = useRouter();

  return (
    <>
      <div className="app-search-wrap">
        <SearchBox />
      </div>

      <nav
        className="app-nav-list"
        aria-label="Tools"
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          paddingBottom: 12
        }}
      >
        {categorizedRoutes.map(route => {
          return (
            <Fragment key={route.category}>
              <div className="app-nav-category">{route.category}</div>

              {(route.content as Route[])
                .sort((a, b) => a.label.localeCompare(b.label))
                .map((a: Route) => {
                  const isActive = router.pathname === a.path;
                  return (
                    <Link
                      key={a.label}
                      href={a.path}
                      prefetch={false}
                      target="_blank"
                      className={`app-nav-item ${
                        isActive ? "app-nav-item--active" : ""
                      }`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {a.label}
                    </Link>
                  );
                })}
            </Fragment>
          );
        })}
      </nav>
    </>
  );
}
