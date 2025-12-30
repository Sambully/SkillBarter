import Sidebar from "./Sidebar";
import { useLocation } from "react-router-dom";

export default function Layout({ children }) {
    const location = useLocation();

    // Don't show sidebar on auth pages or landing
    const isAuthPage = ["/signup", "/signin", "/landing", "/"].includes(location.pathname);

    // If not authenticated (handled by route protection), we usually shouldn't show sidebar, 
    // but protected routes will handle the redirect. 
    // Here we just check path to decide layout.

    if (isAuthPage) return <>{children}</>;

    return (
        <div className="flex w-full min-h-screen bg-black">
            <Sidebar />
            <main className="flex-1 ml-[80px] p-0 relative">
                {/* ml-[80px] reserves space for collapsed sidebar */}
                {children}
            </main>
        </div>
    );
}
