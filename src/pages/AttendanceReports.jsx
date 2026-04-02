import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

function AttendanceReports() {

    const navigate = useNavigate()

    const [management, setManagement] = useState(null)
    const [drivers, setDrivers] = useState([])
    const [students, setStudents] = useState([])
    const [attendance, setAttendance] = useState([])

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


    const getWeeklyAttendance = (busNumber) => {

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


                {/* ATTENDANCE REPORT TABLE */}

                <div className="flex-1 p-6">

                    <h2 className="text-2xl text-yellow-400 font-bold mb-6">
                        Attendance Reports
                    </h2>


                    <div className="grid grid-cols-4 font-semibold border-b border-gray-600 pb-2 mb-2">

                        <div>Buses</div>
                        <div>This week</div>
                        <div>Detailed Attendance</div>
                        <div>Printable Reports</div>

                    </div>


                    {drivers.map((driver, index) => (

                        <div
                            key={index}
                            className="grid grid-cols-4 border-b border-gray-600 py-3"
                        >

                            <div>
                                Bus {driver.busNumber}
                            </div>

                            <div>
                                {getWeeklyAttendance(driver.busNumber)}
                            </div>

                            <button
                                onClick={() => navigate(`/bus-attendance-report/${driver.busNumber}`)}
                                className="text-cyan-400"
                            >
                                Check Details
                            </button>

                            <button className="text-yellow-400">
                                Print
                            </button>

                        </div>

                    ))}

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

export default AttendanceReports