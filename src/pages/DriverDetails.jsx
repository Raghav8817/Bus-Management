import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

function DriverDetails() {

    const navigate = useNavigate()
    const { busNumber } = useParams()

    const [management, setManagement] = useState(null)
    const [driver, setDriver] = useState(null)

    useEffect(() => {

        const currentUser = JSON.parse(localStorage.getItem("user"))
        const users = JSON.parse(localStorage.getItem("users")) || []

        if (!currentUser || currentUser.role !== "management") {
            navigate("/")
            return
        }

        setManagement(currentUser)

        const driverData = users.find(
            u => u.role === "driver" && String(u.busNumber) === String(busNumber)
        )

        setDriver(driverData)

    }, [busNumber, navigate])


    if (!driver) return null


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


                {/* DRIVER DETAILS */}

                <div className="flex-1 p-6">

                    <div className="text-3xl text-yellow-400 font-bold mb-4">
                        Bus {driver.busNumber}
                    </div>

                    <div className="grid grid-cols-2 gap-y-4 text-lg">

                        <div className="text-gray-400">NAME</div>
                        <div className="text-cyan-400">{driver.fullName}</div>

                        <div className="text-gray-400">SHIFT</div>
                        <div className="text-cyan-400">
                            {driver.shift || "MORNING"}
                        </div>

                        <div className="text-gray-400">SALARY</div>
                        <div className="text-cyan-400">
                            {driver.salary || "15000"} / Month
                        </div>

                        <div className="text-gray-400">SALARY STATUS</div>
                        <div className="text-green-400">
                            {driver.salaryStatus || "PAID"}
                        </div>

                        <div className="text-gray-400">JOIN DATE</div>
                        <div className="text-cyan-400">
                            {driver.joinDate || "15 JUNE 2022"}
                        </div>

                        <div className="text-gray-400">COMPLAINTS</div>
                        <div className="text-red-400">
                            {driver.complaints || 0}
                        </div>

                        <div className="text-gray-400">LICENCE STATUS</div>
                        <div className="text-green-400">
                            {driver.licenceStatus || "UPDATED"}
                        </div>

                    </div>


                    <button
                        className="mt-10 w-full bg-red-600 py-3 text-lg font-bold rounded-lg"
                    >
                        FIRE DRIVER
                    </button>

                </div>

            </div>

        </div>

    )
}

export default DriverDetails