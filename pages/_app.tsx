import HeaderNav from "@components/HeaderNav";
import "@styles/main.css";

export default function App({ Component, pageProps }) {
  return (
    <div className="app-root light">
      <header className="app-header" role="banner">
        <HeaderNav />
      </header>

      <main className="app-main" role="main">
        <div className="app-content">
          <Component {...pageProps} />
        </div>
      </main>
    </div>
  );
}
