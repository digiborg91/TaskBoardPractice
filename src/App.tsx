import { useAuth } from "./lib/auth";
import { AuthPage } from "./pages/AuthPage";
import { BoardPage } from "./pages/BoardPage";

export default function App() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
      </div>
    );
  }

  return session ? <BoardPage /> : <AuthPage />;
}
