import { Outlet, useLocation } from "react-router-dom"
import BackButton from "./BackButton"
import BottomNav from "./BottomNav"

function Layout() {
    const location = useLocation()

    const hideBackRoutes = ["/home", "/account"]
    const hideNavRoutes = [
        "/",
        "/signup",
        "/forgot-password",
        "/new-password"
    ]

    const showBack = !hideBackRoutes.includes(location.pathname)
    const showNav = !hideNavRoutes.includes(location.pathname)

    return (
        <div className="relative min-h-screen">

            {showBack && (
                <div className="fixed top-6 left-6 z-50">
                    <BackButton />
                </div>
            )}

            <Outlet />

            {showNav && <BottomNav />}
        </div>
    )
}

export default Layout