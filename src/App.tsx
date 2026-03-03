import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AnimatePresence } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import Index from "./pages/Index";
import BlogPost from "./pages/BlogPost";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Categories from "./pages/Categories";
import CategoryDetail from "./pages/CategoryDetail";
import Newsletter from "./pages/Newsletter";
import WriteForUs from "./pages/WriteForUs";
import WriteEditor from "./pages/WriteEditor";
import CreatorDashboard from "./pages/CreatorDashboard";
import CreatorServices from "./pages/CreatorServices";
import CreatorProfile from "./pages/CreatorProfile";
import Bookmarks from "./pages/Bookmarks";
import TagPage from "./pages/TagPage";
import Careers from "./pages/Careers";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import NotFound from "./pages/NotFound";
import Sponsorship from "./pages/Sponsorship";
import Admin from "./pages/Admin";
import ResearchPapers from "./pages/ResearchPapers";
import ResearchPaper from "./pages/ResearchPaper";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/post/:slug" element={<PageTransition><BlogPost /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/categories" element={<PageTransition><Categories /></PageTransition>} />
        <Route path="/category/:slug" element={<PageTransition><CategoryDetail /></PageTransition>} />
        <Route path="/newsletter" element={<PageTransition><Newsletter /></PageTransition>} />
        <Route path="/write-for-us" element={<PageTransition><WriteForUs /></PageTransition>} />
        <Route path="/creator/services" element={<PageTransition><CreatorServices /></PageTransition>} />
        <Route path="/creator/dashboard" element={<PageTransition><CreatorDashboard /></PageTransition>} />
        <Route path="/creator/write" element={<PageTransition><WriteEditor /></PageTransition>} />
        <Route path="/creator/write/:id" element={<PageTransition><WriteEditor /></PageTransition>} />
        <Route path="/creator/:username" element={<PageTransition><CreatorProfile /></PageTransition>} />
        <Route path="/bookmarks" element={<PageTransition><Bookmarks /></PageTransition>} />
        <Route path="/tag/:slug" element={<PageTransition><TagPage /></PageTransition>} />
        <Route path="/careers" element={<PageTransition><Careers /></PageTransition>} />
        <Route path="/privacy-policy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />
        <Route path="/terms-of-service" element={<PageTransition><TermsOfService /></PageTransition>} />
        <Route path="/sponsorship" element={<PageTransition><Sponsorship /></PageTransition>} />
        <Route path="/research-papers" element={<PageTransition><ResearchPapers /></PageTransition>} />
        <Route path="/research/:slug" element={<PageTransition><ResearchPaper /></PageTransition>} />
        <Route path="/admin" element={<PageTransition><Admin /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <AnimatedRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
