import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoute = () => {
    const [auth, setAuth] = useState({ isAuth: null, role: null });
    const location = useLocation();

    // DYNAMIC URL: Uses Vercel variable if it exists, otherwise defaults to localhost
    const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // FIXED: Now uses the dynamic BASE_URL
                const res = await fetch(`${BASE_URL}/verify`, {
                    credentials: "include"
                });

                if (res.ok) {
                    const data = await res.json();
                    setAuth({ isAuth: true, role: data.role });
                } else {
                    setAuth({ isAuth: false, role: null });
                }
            } catch (err) {
                console.error("Auth Check Error:", err);
                setAuth({ isAuth: false, role: null });
            }
        };
        checkAuth();
    }, [location.pathname, BASE_URL]);

    if (auth.isAuth === null) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-gray-900 text-white">
                <p className="text-xl font-mono animate-pulse">Verifying Session...</p>
            </div>
        );
    }

    if (!auth.isAuth) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (location.pathname === "/") {
        if (auth.role === "driver") return <Navigate to="/driver-dashboard" replace />;
        if (auth.role === "management") return <Navigate to="/management-dashboard" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;