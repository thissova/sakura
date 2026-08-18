import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { PageLoader } from "./components/PageLoader";
import { AuthProvider } from "./contexts/AuthContext";
import { ContentProvider } from "./contexts/ContentContext";
import { LanguageProvider } from "./contexts/LanguageContext";

// Home ships in the main bundle (it is the landing page); the rest are fetched
// on navigation so the first paint stays small. Admin especially — it is the
// biggest page and only ever used by the owner.
const Services = lazy(() =>
  import("./pages/Services").then((m) => ({ default: m.Services })),
);
const Pricing = lazy(() =>
  import("./pages/Pricing").then((m) => ({ default: m.Pricing })),
);
const Contact = lazy(() =>
  import("./pages/Contact").then((m) => ({ default: m.Contact })),
);
const Admin = lazy(() =>
  import("./pages/Admin").then((m) => ({ default: m.Admin })),
);
const NotFound = lazy(() =>
  import("./pages/NotFound").then((m) => ({ default: m.NotFound })),
);

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/northwind" element={<Admin />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="o-sluzbach" element={<Services />} />
            <Route path="cenik" element={<Pricing />} />
            <Route path="kontakt" element={<Contact />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ContentProvider>
          <AppRoutes />
        </ContentProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
