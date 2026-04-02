import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

function RouteDetails() {

    const navigate = useNavigate()
    const { busNumber } = useParams()

    const [management, setManagement] = useState(null)

    const stops = [
        "WCTM",
        "Sector 21",
        "Sector 22",
        "Sector 23",
        "Sector 24",
        "Sector 25",
        "WCTM return"
    ]

    useEffect(() => {

        const currentUser = JSON.parse(localStorage.getItem("user"))

        if (!currentUser || currentUser.role !== "management") {
            navigate("/")
            return
        }

        setManagement(currentUser)

    }, [navigate])


    return (

        <div className="min-h-screen bg-gray-800 text-white flex flex-col">

            {/* HEADER */}

            <div className="bg-black px-6 py-4 flex justify-between items-center border-b-4 border-yellow-400">

                <h1 className="font-bold text-lg">
                    WORLD COLLEGE OF TECHNOLOGY & MANAGEMENT
                </h1>

                <div className="text-right">
                    <div className="font-bold">{management?.fullName}</div>
                    <div className="text-sm text-gray-400">
                        Transportation Head
                    </div>
                </div>

            </div>


            <div className="flex flex-1">

                {/* SIDEBAR */}

                <div className="w-72 bg-gray-900 p-4 space-y-2">

                    <button
                        onClick={() => navigate("/management-dashboard")}
                        className="w-full bg-gray-700 py-2 rounded-lg"
                    >
                        Bus List
                    </button>

                    <button
                        onClick={() => navigate("/attendance")}
                        className="w-full bg-gray-700 py-2 rounded-lg"
                    >
                        Attendance
                    </button>

                    <button
                        onClick={() => navigate("/reports")}
                        className="w-full bg-gray-700 py-2 rounded-lg"
                    >
                        Reports
                    </button>

                    <button
                        onClick={() => navigate("/drivers")}
                        className="w-full bg-gray-700 py-2 rounded-lg"
                    >
                        Drivers
                    </button>

                    <button
                        className="w-full bg-yellow-400 text-black py-2 rounded-lg font-semibold"
                    >
                        Routes
                    </button>

                </div>


                {/* ROUTE DETAILS */}

                <div className="flex-1 p-6">

                    <h2 className="text-2xl text-yellow-400 font-bold mb-4">
                        {busNumber} Number Bus Route
                    </h2>

                    <div className="grid grid-cols-4 font-semibold border-b border-gray-600 pb-2 mb-2">

                        <div>Bus Stop No.</div>
                        <div>Bus Route</div>
                        <div className="text-green-400">ADD STOP</div>
                        <div className="text-red-400">REMOVE STOP</div>

                    </div>


                    {stops.map((stop, index) => (

                        <div
                            key={index}
                            className="grid grid-cols-4 border-b border-gray-600 py-3"
                        >

                            <div>
                                {index + 1}
                            </div>

                            <div>
                                {stop}
                            </div>

                            <button className="text-green-400">
                                Add
                            </button>

                            <button className="text-red-400">
                                Stop
                            </button>

                        </div>

                    ))}

                </div>

            </div>


            {/* BOTTOM NAV */}

            <div className="bg-black flex justify-around py-3 border-t border-gray-700">

                <button
                    onClick={() => navigate("/management")}
                >
                    Dashboard
                </button>

                <button onClick={() => navigate("/management-dashboard")}>
                    Live Map
                </button>

                <button
                    onClick={() => navigate("/attendance")}
                >
                    Attendance
                </button>

                <button
                    onClick={() => navigate("/reports")}
                >
                    Reports
                </button>

                <button onClick={() => navigate("/managementpanel")}>
                    Management
                </button>

            </div>

        </div>

    )
}

export default RouteDetails