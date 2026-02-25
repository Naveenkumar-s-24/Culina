import Dashboard from "./pages/Dashboard";
import { ToastProvider } from "./components/Toast";
import SteamCursor from "./components/SteamCursor";
import ForkCursor from "./components/ForkCursor";
import EmberBackground from "./components/EmberBackground";

export default function App() {
  return (
    <ToastProvider>
      <EmberBackground />
      <SteamCursor />
      <ForkCursor />
      <Dashboard />
    </ToastProvider>
  );
}
