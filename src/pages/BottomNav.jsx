import { Home as HomeIcon, Info, Phone, User } from "lucide-react"
import { useNavigate } from "react-router-dom"

function BottomNav() {
    const navigate = useNavigate()

    return (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full px-10 py-3 flex gap-10 shadow-lg z-50">

            <HomeIcon
                className="cursor-pointer"
                onClick={() => navigate("/home")}
            />

            <Info
                className="cursor-pointer"
                onClick={() => navigate("/info")}
             />

            <Phone
                className="cursor-pointer"
                onClick={() => navigate("/contact")}
            />

            <User
                className="cursor-pointer"
                onClick={() => navigate("/account")}
            />
        </div>
    )
}

export default BottomNav