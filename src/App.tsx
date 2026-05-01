import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import PublicSpeaking from "./pages/tracks/PublicSpeaking.tsx";
import Impromptu from "./pages/tracks/Impromptu.tsx";
import Interviews from "./pages/tracks/Interviews.tsx";
import BodyLanguage from "./pages/tracks/BodyLanguage.tsx";
import Login from "./pages/Login.tsx";
import { AuthProvider } from "./context/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/tracks/public-speaking" element={<PublicSpeaking />} />
          <Route path="/tracks/impromptu" element={<Impromptu />} />
          <Route path="/tracks/interviews" element={<Interviews />} />
          <Route path="/tracks/body-language" element={<BodyLanguage />} />
          <Route path="/login" element={<Login />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
