import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoute = () => {
    const [auth, setAuth] = useState({ isAuth: null, role: null });
    const location = useLocation();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch("http://localhost:3000/verify", {
                    credentials: "include"
                });
                const data = await res.json();

                if (res.ok) {
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
    }, [location.pathname]);

    // 1. Still Loading
    if (auth.isAuth === null) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-gray-900 text-white">
                <p className="text-xl font-mono">Verifying Session...</p>
            </div>
        );
    }

    // 2. Not Logged In
    if (!auth.isAuth) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 3. Logged In - Redirect Dashboards if at Root "/"
    if (location.pathname === "/") {
        if (auth.role === "driver") return <Navigate to="/driver-dashboard" replace />;
        if (auth.role === "management") return <Navigate to="/management-dashboard" replace />;
    }

    // 4. THE FIX: Always return Outlet for nested routing
    return <Outlet />;
};

export default ProtectedRoute;