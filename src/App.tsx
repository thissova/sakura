import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Pricing } from "./pages/Pricing";
import { Services } from "./pages/Services";
import { Contact } from "./pages/Contact";
import { Admin } from "./pages/Admin";
import { NotFound } from "./pages/NotFound";
import { PageLoader } from "./components/PageLoader";
import { AuthProvider } from "./contexts/AuthContext";
import { ContentProvider } from "./contexts/ContentContext";
import { useContent } from "./contexts/ContentContext";
import { LanguageProvider } from "./contexts/LanguageContext";

function AppRoutes() {
  const { isLoaded } = useContent();

  if (!isLoaded) return <PageLoader />;

  return (
    <BrowserRouter>
      <ScrollToTop />
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
