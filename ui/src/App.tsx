import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import { AppLayout } from "./components/Layout/AppLayout";
import FarmerDashboard from "./pages/farmer/FarmerDashboard";
import FarmerTimeline from "./pages/farmer/FarmerTimeline";
import FarmerProfile from "./pages/farmer/FarmerProfile";
import FarmerAuth from "./pages/farmer/FarmerAuth";
import PledgerDashboard from "./pages/pledger/PledgerDashboard";
import FarmersDirectory from "./pages/pledger/FarmersDirectory";
import PledgePage from "./pages/pledger/PledgePage";
import NotFound from "./pages/NotFound";
import { MavunoAppKitProvider } from "./contexts/appContext";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <MavunoAppKitProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/farmer/login" element={<FarmerAuth mode="login" />} />
            <Route
              path="/farmer/register"
              element={<FarmerAuth mode="register" />}
            />

            <Route path="/farmer" element={<AppLayout />}>
              <Route path="dashboard" element={<FarmerDashboard />} />
              <Route path="timeline" element={<FarmerTimeline />} />
              <Route path="profile" element={<FarmerProfile />} />
            </Route>

            <Route path="/pledger" element={<AppLayout />}>
              <Route path="dashboard" element={<PledgerDashboard />} />
              <Route path="farmers" element={<FarmersDirectory />} />
              <Route path="pledge/:farmerId" element={<PledgePage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </MavunoAppKitProvider>
  </QueryClientProvider>
);

export default App;
