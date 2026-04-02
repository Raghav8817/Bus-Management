import { ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"

function BackButton() {
    const navigate = useNavigate()

    return (
        <button
            onClick={() => navigate(-1)}
            className="
                bg-white/90 
                backdrop-blur-md 
                text-black 
                px-4 py-2 
                rounded-full 
                shadow-lg 
                flex items-center gap-2 
                hover:scale-105 
                active:scale-95 
                transition-all duration-200
            "
        >
            <ArrowLeft size={18} />
        </button>
    )
}

export default BackButton