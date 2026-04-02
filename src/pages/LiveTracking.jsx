import { useState, useEffect } from "react"
import { Phone } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import BottomNav from "./BottomNav"

function LiveTracking() {

    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const routeType = queryParams.get("type")

    const navigate = useNavigate()

    const [distance, setDistance] = useState(5)
    const [arrivalTime, setArrivalTime] = useState(25)

    // Route Data
    const routeTitle = routeType === "evening" ? "Evening Route" : "Morning Route"
    const busNumber = routeType === "evening" ? "Bus 84" : "Bus 62"
    const currentLocation = routeType === "evening" ? "Sector 32" : "Sector 48"

    const driver = {
        name: routeType === "evening" ? "Mahesh Singh" : "Ramesh Kumar",
        phone: "9876543210"
    }

    const conductor = {
        name: routeType === "evening" ? "Amit Verma" : "Suresh Yadav",
        phone: "9123456780"
    }

    useEffect(() => {

        const interval = setInterval(() => {
            setDistance(prev => {
                if (prev <= 0.5) return 0
                return parseFloat((prev - 0.2).toFixed(1))
            })

            setArrivalTime(prev => {
                if (prev <= 1) return 0
                return prev - 1
            })
        }, 3000)

        return () => clearInterval(interval)

    }, [])

    useEffect(() => {
        localStorage.setItem(
            "trackingData",
            JSON.stringify({ distance, arrivalTime })
        )
    }, [distance, arrivalTime])

    const handleCallInfo = () => {
        alert(
            `Driver: ${driver.name}
Phone: ${driver.phone}

Conductor: ${conductor.name}
Phone: ${conductor.phone}`
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-yellow-400 to-black p-4">

            {/* ROUTE TITLE */}
            <h1 className="text-2xl font-bold mb-4">
                {routeTitle}
            </h1>

            {/* MAP AREA */}
            <div className="h-[55vh] bg-gray-800 rounded-3xl mb-4 flex items-center justify-center text-white text-lg font-bold shadow-lg">
                🚌 Live Bus Tracking Map (Simulated)
            </div>

            {/* BUS STATUS BOX */}
            <div className="bg-zinc-900 text-white rounded-2xl p-4 mb-4 shadow-md">

                <p className="font-bold text-lg mb-2">{busNumber}</p>

                <p>
                    Current Location: {currentLocation}
                </p>

                <p className="text-green-400 font-semibold mt-1">
                    {distance} km away
                </p>

                <p className="mt-1">
                    Arriving in {arrivalTime} mins
                </p>

            </div>

            {/* DRIVER BOX */}
            <div className="bg-zinc-900 text-white rounded-2xl p-4 flex justify-between items-center shadow-md">

                <div>
                    <p className="font-bold">{driver.name}</p>
                    <p className="text-sm text-gray-300">Bus Driver</p>
                </div>

                <Phone
                    className="cursor-pointer text-green-400"
                    onClick={handleCallInfo}
                />

            </div>

            {/* BACK BUTTON */}
            <button
                onClick={() => navigate("/home")}
                className="w-full bg-cyan-400 text-black py-3 rounded-xl font-bold mt-6 active:scale-95 transition"
            >
                Back to Home
            </button>

            <BottomNav />

        </div>
    )
}

export default LiveTracking