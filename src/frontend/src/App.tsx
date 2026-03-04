import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import {
  ArrowLeft,
  ClipboardList,
  Eye,
  Heart,
  Home,
  LogIn,
  LogOut,
  Shield,
  User,
} from "lucide-react";
import { useState } from "react";
import { AddVitalModal } from "./components/AddVitalModal";
import { DashboardScreen } from "./components/DashboardScreen";
import { InsuranceScreen } from "./components/InsuranceScreen";
import { MedicalHistoryScreen } from "./components/MedicalHistoryScreen";
import { ProfileScreen } from "./components/ProfileScreen";
import { VisionScreen } from "./components/VisionScreen";
import { VitalsScreen } from "./components/VitalsScreen";
import { useInternetIdentity } from "./hooks/useInternetIdentity";

type TabId = "dashboard" | "vitals" | "vision" | "insurance" | "history";
type ScreenId = TabId | "profile";

const TABS: Array<{
  id: TabId;
  label: string;
  icon: React.ReactNode;
}> = [
  { id: "dashboard", label: "Home", icon: <Home size={22} /> },
  { id: "vitals", label: "Vitals", icon: <Heart size={22} /> },
  { id: "vision", label: "Vision", icon: <Eye size={22} /> },
  { id: "insurance", label: "Insurance", icon: <Shield size={22} /> },
  { id: "history", label: "History", icon: <ClipboardList size={22} /> },
];

export default function App() {
  const { identity, login, clear, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [screen, setScreen] = useState<ScreenId>("dashboard");
  const [addVitalOpen, setAddVitalOpen] = useState(false);

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    setScreen(tab);
  };

  const handleNavigate = (target: string) => {
    if (target === "profile") {
      setScreen("profile");
    } else if (
      ["dashboard", "vitals", "vision", "insurance", "history"].includes(target)
    ) {
      handleTabChange(target as TabId);
    }
  };

  const handleBackFromProfile = () => {
    setScreen(activeTab);
  };

  const isLoggedIn = !!identity;

  if (!isLoggedIn) {
    return (
      <div className="mobile-container flex flex-col min-h-dvh">
        <LandingScreen
          onLogin={login}
          isLoggingIn={isLoggingIn || isInitializing}
        />
        <Toaster />
      </div>
    );
  }

  return (
    <div className="mobile-container">
      {/* Top Header */}
      <header className="top-header bg-card/95 backdrop-blur-md border-b border-border flex items-center px-4 gap-3">
        {screen === "profile" ? (
          <Button
            variant="ghost"
            size="icon"
            className="w-11 h-11 rounded-full"
            onClick={handleBackFromProfile}
            data-ocid="app.back.button"
          >
            <ArrowLeft size={22} />
          </Button>
        ) : (
          <div className="w-11" />
        )}
        <div className="flex-1 text-center">
          <span className="text-xl font-display font-bold text-primary tracking-tight">
            SeniorHealthManager
          </span>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="w-11 h-11 rounded-full"
            onClick={() => setScreen("profile")}
            data-ocid="app.profile.button"
          >
            <User size={22} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-11 h-11 rounded-full text-muted-foreground"
            onClick={clear}
            data-ocid="app.logout.button"
          >
            <LogOut size={18} />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="screen-content overflow-y-auto">
        {screen === "profile" && (
          <ProfileScreen onBack={handleBackFromProfile} />
        )}
        {screen === "dashboard" && (
          <DashboardScreen
            onNavigate={handleNavigate}
            onAddVital={() => setAddVitalOpen(true)}
          />
        )}
        {screen === "vitals" && <VitalsScreen />}
        {screen === "vision" && <VisionScreen />}
        {screen === "insurance" && <InsuranceScreen />}
        {screen === "history" && <MedicalHistoryScreen />}
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav bg-card/95 backdrop-blur-md border-t border-border">
        <div className="flex h-full px-2">
          {TABS.map((tab) => (
            <button
              type="button"
              key={tab.id}
              className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors rounded-xl mx-0.5 ${
                activeTab === tab.id && screen !== "profile"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => handleTabChange(tab.id)}
              data-ocid={`nav.${tab.id}.tab`}
            >
              <div
                className={`p-1.5 rounded-xl transition-colors ${
                  activeTab === tab.id && screen !== "profile"
                    ? "bg-primary/10"
                    : ""
                }`}
              >
                {tab.icon}
              </div>
              <span className="text-xs font-semibold leading-none">
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* Global Add Vital Modal */}
      <AddVitalModal
        open={addVitalOpen}
        onClose={() => setAddVitalOpen(false)}
      />

      <Toaster />
    </div>
  );
}

// ─── Landing / Login Screen ───────────────────────────────────────────────────

function LandingScreen({
  onLogin,
  isLoggingIn,
}: {
  onLogin: () => void;
  isLoggingIn: boolean;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 bg-background">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6 shadow-card">
          <Heart size={44} className="text-primary" />
        </div>
        <h1 className="text-4xl font-display font-bold text-foreground mb-2">
          SeniorHealthManager
        </h1>
        <p className="text-xl text-muted-foreground text-center leading-relaxed">
          Your personal health management companion
        </p>
      </div>

      {/* Feature List */}
      <div className="w-full space-y-3 mb-10">
        {[
          { icon: Heart, text: "Track vital signs & readings" },
          { icon: Eye, text: "Store vision & eye exam records" },
          { icon: Shield, text: "Manage insurance & Medicare" },
          { icon: ClipboardList, text: "Keep your medical history" },
        ].map(({ icon: Icon, text }) => (
          <div
            key={text}
            className="flex items-center gap-4 bg-card rounded-2xl px-5 py-4 shadow-xs"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Icon size={20} className="text-primary" />
            </div>
            <span className="text-lg font-medium">{text}</span>
          </div>
        ))}
      </div>

      {/* Login Button */}
      <Button
        className="w-full h-16 text-xl font-bold rounded-2xl shadow-elevated"
        onClick={onLogin}
        disabled={isLoggingIn}
        data-ocid="landing.login.button"
      >
        {isLoggingIn ? (
          <span className="flex items-center gap-2">
            <span className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            Signing in...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <LogIn size={22} />
            Sign In Securely
          </span>
        )}
      </Button>

      <p className="text-sm text-muted-foreground mt-4 text-center">
        Your health data is private and secure
      </p>

      {/* Footer */}
      <footer className="mt-auto pt-8 pb-2">
        <p className="text-sm text-muted-foreground text-center">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
