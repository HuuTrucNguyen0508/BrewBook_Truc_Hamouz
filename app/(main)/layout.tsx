import "@/app/globals.css";
import BottomNav from "@/components/nav/BottomNav";
import AppHeader from "@/components/layout/AppHeader";
import ErrorBoundary from "@/components/shared/ErrorBoundary";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <div className="mx-auto max-w-md p-3">
        <AppHeader />
        <main className="pb-24">{children}</main>
        <BottomNav />
      </div>
    </ErrorBoundary>
  );
}
