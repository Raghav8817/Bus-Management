import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

function ManagementReports() {

    const navigate = useNavigate()
    const [management, setManagement] = useState(null)

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
                        className="w-full bg-yellow-400 text-black py-2 rounded-lg font-semibold"
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
                        onClick={() => navigate("/routes")}
                        className="w-full bg-gray-700 py-2 rounded-lg"
                    >
                        Routes
                    </button>

                </div>


                {/* REPORT LIST */}

                <div className="flex-1 p-6">

                    <h2 className="text-2xl text-yellow-400 font-bold mb-6">
                        PRINTABLE REPORTS
                    </h2>

                    <div className="text-gray-400 mb-6">
                        You can view all reports here
                    </div>


                    <div className="space-y-4">

                        <div className="flex justify-between border-b border-gray-600 pb-3">
                            <span>Attendance Reports</span>

                            <button
                                onClick={() => navigate("/attendance-reports")}
                                className="text-cyan-400"
                            >
                                Check Details
                            </button>
                        </div>


                        <div className="flex justify-between border-b border-gray-600 pb-3">
                            <span>Routes Reports</span>
                            <button
                                onClick={() => navigate("/routes-reports")}
                                className="text-cyan-400">
                                Check Details
                            </button>
                        </div>


                        <div
                            onClick={() => navigate("/driver-reports")}
                            className="flex justify-between border-b border-gray-600 pb-3">
                            <span>Drivers Reports</span>
                            <button className="text-cyan-400">
                                Check Details
                            </button>
                        </div>


                        <div
                            onClick={() => navigate("/vehicle-reports")}
                            className="flex justify-between border-b border-gray-600 pb-3">
                            <span>Bus List/Reports</span>
                            <button className="text-cyan-400">
                                Check Details
                            </button>
                        </div>


                        <div
                            onClick={() => navigate("/licence-reports")}
                            className="flex justify-between border-b border-gray-600 pb-3">
                            <span>Licence Reports</span>
                            <button className="text-cyan-400">
                                Check Details
                            </button>
                        </div>


                        <div
                            onClick={() => navigate("/accident-reports")}
                            className="flex justify-between border-b border-gray-600 pb-3">
                            <span>Accident Reports</span>
                            <button className="text-cyan-400">
                                Check Details
                            </button>
                        </div>

                    </div>

                </div>

            </div>


            {/* BOTTOM NAV */}

            <div className="bg-black flex justify-around py-3 border-t border-gray-700">

                <button onClick={() => navigate("/management")}>
                    Dashboard
                </button>

                <button onClick={() => navigate("/management-dashboard")}>
                    Live Map
                </button>

                <button onClick={() => navigate("/attendance")}>
                    Attendance
                </button>

                <button className="text-yellow-400">
                    Reports
                </button>

                <button onClick={() => navigate("/managementpanel")}>
                    Management
                </button>

            </div>

        </div>

    )
}

export default ManagementReports