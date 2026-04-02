import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

function AttendancePage() {

    const navigate = useNavigate()

    const [drivers, setDrivers] = useState([])
    const [students, setStudents] = useState([])
    const [attendance, setAttendance] = useState([])
    const [management, setManagement] = useState(null)

    useEffect(() => {

        const currentUser = JSON.parse(localStorage.getItem("user"))
        const users = JSON.parse(localStorage.getItem("users")) || []
        const attendanceData = JSON.parse(localStorage.getItem("attendance")) || []

        if (!currentUser || currentUser.role !== "management") {
            navigate("/")
            return
        }

        setManagement(currentUser)
        setDrivers(users.filter(u => u.role === "driver"))
        setStudents(users.filter(u => u.role === "student"))
        setAttendance(attendanceData)

    }, [navigate])


    const getBusAttendance = (busNumber) => {

        const busStudents = students.filter(
            s => String(s.busId) === String(busNumber)
        )

        const present = attendance.filter(
            a =>
                String(a.busNumber) === String(busNumber) &&
                a.status === "present"
        )

        return `${present.length}/${busStudents.length}`
    }


    return (

        <div className="min-h-screen bg-gray-800 text-white flex flex-col">

            <div className="bg-black flex justify-between items-center px-6 py-4 border-b-4 border-yellow-400">

                <div className="flex items-center space-x-4">
                    <h1 className="font-bold text-lg">
                        WORLD COLLEGE OF TECHNOLOGY & MANAGEMENT
                    </h1>
                </div>

                <div className="text-right">
                    <h2 className="font-bold">
                        {management?.fullName}
                    </h2>
                    <p className="text-sm text-gray-400">
                        Transportation Head
                    </p>
                </div>

            </div>


            <div className="flex flex-1">

                <div className="w-72 bg-gray-900 p-4 space-y-3">

                    <button
                        onClick={() => navigate("/buslist")}
                        className="w-full bg-gray-700 py-2 rounded-lg"
                    >
                        Bus List →
                    </button>

                    <button
                        className="w-full bg-yellow-400 text-black py-2 rounded-lg font-semibold"
                    >
                        Attendance →
                    </button>

                    <button
                        onClick={() => navigate("/reports")}
                        className="w-full bg-gray-700 py-2 rounded-lg"
                    >
                        Reports →
                    </button>

                    <button
                        onClick={() => navigate("/drivers")}
                        className="w-full bg-gray-700 py-2 rounded-lg"
                    >
                        Drivers →
                    </button>

                    <button
                        onClick={() => navigate("/routes")}
                        className="w-full bg-gray-700 py-2 rounded-lg"
                    >
                        Routes →
                    </button>

                </div>


                <div className="flex-1 p-6">

                    <div className="grid grid-cols-3 font-semibold border-b border-gray-600 pb-3 mb-3">
                        <div>Bus</div>
                        <div>Students</div>
                        <div></div>
                    </div>


                    {drivers.map((driver, index) => {

                        const attendanceCount = getBusAttendance(driver.busNumber)

                        return (

                            <div
                                key={index}
                                className="grid grid-cols-3 items-center border-b border-gray-600 py-3"
                            >

                                <div>
                                    Bus {driver.busNumber}
                                </div>

                                <div>
                                    {attendanceCount}
                                </div>

                                <div>

                                    <button
                                        onClick={() =>
                                            navigate(`/busattendance/${driver.busNumber}`)
                                        }
                                        className="text-cyan-400 font-semibold"
                                    >
                                        Check Details
                                    </button>

                                </div>

                            </div>

                        )

                    })}

                </div>

            </div>


            <div className="bg-black flex justify-around py-3 border-t border-gray-700">

                <button
                    onClick={() => navigate("/management")}
                    className="text-sm"
                >
                    Dashboard
                </button>

                <button
                    onClick={() => navigate("/management-dashboard")}
                    className="text-sm"
                >
                    Live Map
                </button>

                <button
                    className="text-sm text-yellow-400"
                >
                    Attendance
                </button>

                <button
                    onClick={() => navigate("/reports")}
                    className="text-sm"
                >
                    Reports
                </button>

                <button
                    onClick={() => navigate("/managementpanel")}
                    className="text-sm"
                >
                    Management
                </button>

            </div>

        </div>

    )
}

export default AttendancePage