import { useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"

function DriverReportDetails() {

    const navigate = useNavigate()
    const { driverId } = useParams()

    const [driver, setDriver] = useState(null)

    useEffect(() => {

        const users = JSON.parse(localStorage.getItem("users")) || []

        const selectedDriver = users.find(
            u => String(u.id) === String(driverId)
        )

        setDriver(selectedDriver)

    }, [driverId])


    if (!driver) return <div className="text-white p-6">Loading...</div>


    return (

        <div className="min-h-screen bg-black text-white flex flex-col">

            {/* HEADER */}

            <div className="bg-black px-6 py-4 flex justify-between items-center border-b-4 border-yellow-400">

                
                <div className="flex items-center gap-3">

                    <img
                        src="/wctm-logo.png"   
                        alt="logo"
                        className="w-10 h-10"
                    />

                    <h1 className="font-bold text-lg">
                        WORLD COLLEGE OF TECHNOLOGY & MANAGEMENT
                    </h1>

                </div>


                
                <div className="flex items-center gap-3">

                    <div className="text-right">
                        <div className="font-bold">{driver?.fullName || "Management"}</div>
                        <div className="text-sm text-gray-400">
                            Transportation Head
                        </div>
                    </div>

                    <img
                        src="/profile.png"   
                        alt="profile"
                        className="w-10 h-10 rounded-full"
                    />

                </div>

            </div>


            <div className="flex flex-1">

                {/* SIDEBAR */}

                <div className="w-72 bg-gray-900 p-4 space-y-2">

                    <button onClick={() => navigate("/management-dashboard")} className="w-full bg-gray-700 py-2 rounded-lg">
                        Bus List
                    </button>

                    <button onClick={() => navigate("/attendance")} className="w-full bg-gray-700 py-2 rounded-lg">
                        Attendance
                    </button>

                    <button className="w-full bg-yellow-400 text-black py-2 rounded-lg font-semibold">
                        Reports
                    </button>

                    <button onClick={() => navigate("/drivers")} className="w-full bg-gray-700 py-2 rounded-lg">
                        Drivers
                    </button>

                    <button onClick={() => navigate("/routes")} className="w-full bg-gray-700 py-2 rounded-lg">
                        Routes
                    </button>

                </div>


                {/* DETAILS */}

                <div className="flex-1 p-6 space-y-4">

                    <h2 className="text-2xl text-yellow-400 font-bold">
                        {driver.fullName}
                    </h2>

                    <div><b>Bus:</b> {driver.busNumber}</div>
                    <div><b>Shift:</b> {driver.shift}</div>
                    <div><b>Salary:</b> {driver.salary}</div>
                    <div><b>Status:</b> {driver.salaryStatus}</div>
                    <div><b>Join Date:</b> {driver.joinDate}</div>
                    <div><b>Complaints:</b> {driver.complaints}</div>
                    <div><b>Licence:</b> {driver.licenceStatus}</div>

                    <button className="bg-yellow-400 text-black px-4 py-2 rounded mt-4">
                        Print Report
                    </button>

                </div>

            </div>


            {/* BOTTOM NAV */}

            <div className="bg-black flex justify-around py-3 border-t border-gray-700">

                <button onClick={() => navigate("/management-dashboard")}>Dashboard</button>
                <button>Live Map</button>
                <button onClick={() => navigate("/attendance")}>Attendance</button>
                <button className="text-yellow-400">Reports</button>
                <button>Management</button>

            </div>

        </div>

    )
}

export default DriverReportDetails