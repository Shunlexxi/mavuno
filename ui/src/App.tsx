/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { hederaTestnet } from "@reown/appkit/networks";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { WagmiProvider } from "wagmi";
import { createAppKit } from "@reown/appkit/react";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import FarmerPage from "./pages/pledger/FarmerPage";

const queryClient = new QueryClient();

const projectId = import.meta.env.VITE_REOWN_PROJECT_ID;

const metadata = {
  name: "Mavuno",
  description:
    "Empowering rural farmers through community-backed micro-lending on Hedera Hashgraph.",
  url: window.location.href,
  icons: ["https://avatars.githubusercontent.com/u/31002956"],
};

const networks = [hederaTestnet];

const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true,
});

createAppKit({
  adapters: [wagmiAdapter],
  networks: networks as any,
  themeMode: "light",
  featuredWalletIds: [
    "a29498d225fa4b13468ff4d6cf4ae0ea4adcbd95f07ce8a843a1dee10b632f3f",
    "a9104b630bac1929ad9ac2a73a17ed4beead1889341f307bff502f89b46c8501",
  ],
  projectId,
  metadata,
  features: {
    analytics: true,
  },
});

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_API_KEY,
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FB_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FB_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FB_APP_ID,
  measurementId: import.meta.env.VITE_FB_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
getAnalytics(app);

const App = () => (
  <WagmiProvider config={wagmiAdapter.wagmiConfig}>
    <QueryClientProvider client={queryClient}>
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
              <Route path="pledge/:farmerAddress" element={<PledgePage />} />
              <Route path="farmers/:farmerAddress" element={<FarmerPage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

export default App;
