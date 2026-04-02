import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

function ManagementDrivers() {

    const navigate = useNavigate()

    const [management, setManagement] = useState(null)
    const [drivers, setDrivers] = useState([])

    useEffect(() => {
        const fetchDrivers = async () => {
            const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
            
            try {
                // Fetch drivers from DB
                const res = await fetch(`${BASE_URL}/api/users?role=driver`, { credentials: "include" });
                if (res.ok) {
                    const data = await res.json();
                    setDrivers(data);
                }

                // Verify management auth
                const userRes = await fetch(`${BASE_URL}/user-data`, { credentials: "include" });
                if (userRes.ok) {
                    const userData = await userRes.json();
                    if (userData.role !== "management") {
                        navigate("/");
                    } else {
                        setManagement({ fullName: userData.full_name || userData.fullName, role: userData.role });
                    }
                } else {
                    navigate("/");
                }
            } catch (err) {
                console.error("Fetch error:", err);
            }
        };

        fetchDrivers();
    }, [navigate]);


    return (

        <div className="min-h-screen bg-gray-800 text-white flex flex-col">

            {/* HEADER */}

            <div className="bg-black px-6 py-4 flex justify-between items-center border-b-4 border-yellow-400">

                <h1 className="font-bold text-lg">
                    WORLD COLLEGE OF TECHNOLOGY & MANAGEMENT
                </h1>

                <div className="text-right">

                    <div className="font-bold">
                        {management?.fullName}
                    </div>

                    <div className="text-sm text-gray-400">
                        Transportation Head
                    </div>

                </div>

            </div>


            <div className="flex flex-1">

                {/* SIDEBAR */}

                <div className="w-72 bg-gray-900 p-4 space-y-2">

                    <button
                        onClick={() => navigate("/management")}
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
                        className="w-full bg-yellow-400 text-black py-2 rounded-lg font-semibold"
                    >
                        Drivers
                    </button>

                    <button
                        onClick={() => navigate("/routes")}
                        className="w-full bg-gray-700 py-2 rounded-lg"
                    >
                        Routes
                    </button>

                </div>


                {/* DRIVERS TABLE */}

                <div className="flex-1 p-6">

                    <div className="grid grid-cols-4 text-sm font-semibold border-b border-gray-600 pb-2 mb-2">

                        <div>Bus</div>
                        <div>Driver</div>
                        <div>Contact</div>
                        <div></div>

                    </div>


                    {drivers.map((driver, index) => (

                        <div
                            key={index}
                            className="grid grid-cols-4 items-center border-b border-gray-600 py-3 text-sm"
                        >

                            {/* BUS NUMBER */}

                            <div>
                                Bus {driver.busNumber}
                            </div>


                            {/* DRIVER NAME (CLICKABLE) */}

                            <div
                                onClick={() => navigate(`/driver-details/${driver.busNumber}`)}
                                className="text-cyan-400 cursor-pointer hover:underline"
                            >
                                {driver.fullName}
                            </div>


                            {/* CONTACT */}

                            <div>
                                {driver.contact}
                            </div>


                            {/* CHECK DETAILS */}

                            <div>

                                <button
                                    onClick={() => navigate(`/driver-details/${driver.busNumber}`)}
                                    className="text-cyan-400 hover:underline"
                                >
                                    Check Details
                                </button>

                            </div>

                        </div>

                    ))}

                </div>

            </div>


            {/* BOTTOM NAVBAR */}

            <div className="bg-black flex justify-around py-3 border-t border-gray-700">

                <button
                    onClick={() => navigate("/management")}
                >
                    Dashboard
                </button>

                <button
                    onClick={() => navigate("/management-dashboard")}
                >
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

export default ManagementDrivers