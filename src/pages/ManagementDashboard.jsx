import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

function ManagementDashboard() {

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

    const logout = () => {
        localStorage.removeItem("user")
        localStorage.removeItem("isLoggedIn")
        navigate("/")
    }

    const totalBuses = drivers.length

    const presentStudents = attendance.filter(a => a.status === "present").length
    const absentStudents = students.length - presentStudents

    const sosAlerts = attendance.filter(a => a.status === "sos").length

    const ongoingTrips = attendance.filter(a => a.trip === "started").length

    const delayedBuses = drivers.filter(d => {
        const checked = attendance.filter(a => String(a.busNumber) === String(d.busNumber) && a.status === "present")
        return checked.length === 0
    }).length


    /*if (!isLandscape) {
       return (
           <div className="h-screen flex items-center justify-center bg-black text-white text-center p-6">
               <div>
                   <h1 className="text-2xl font-bold mb-4">
                       Please Rotate Your Device
                   </h1>
                   <p className="text-gray-400">
                       Management dashboard works best in landscape mode.
                   </p>
               </div>
           </div>
       )
   }*/

    return (

        <div className="min-h-screen bg-gray-900 text-white flex flex-col">

            <div className="bg-black flex items-center justify-between px-6 py-4 border-b-4 border-yellow-400">

                <div className="flex items-center space-x-4">
                    <img
                        src="/wctm-logo.png"
                        alt="logo"
                        className="w-12 h-12"
                    />
                    <h1 className="text-lg font-bold leading-tight">
                        WORLD COLLEGE OF TECHNOLOGY & MANAGEMENT
                    </h1>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="text-right">
                        <h2 className="font-bold">
                            {management?.fullName}
                        </h2>
                        <p className="text-sm text-gray-400">
                            Transportation Head
                        </p>
                    </div>

                    <div className="w-10 h-10 bg-yellow-400 rounded-full"></div>
                </div>

            </div>

            <div className="flex flex-1">

                <div className="w-72 bg-gray-800 p-4 space-y-4">

                    <div className="bg-gray-700 p-4 rounded-xl">

                        <p className="text-sm text-gray-300">
                            Total Buses
                        </p>

                        <h2 className="text-3xl font-bold">
                            {totalBuses}
                        </h2>

                        <div className="mt-3 text-sm space-y-1">

                            <p>Absent Students {absentStudents}</p>
                            <p className="text-red-400">SOS Alerts {sosAlerts}</p>
                            <p className="text-yellow-400">Ongoing Trips {ongoingTrips}</p>
                            <p className="text-green-400">Buses Delayed {delayedBuses}</p>

                        </div>

                    </div>

                    <button
                        onClick={() => navigate("/buslist")}
                        className="w-full bg-yellow-400 text-black py-2 rounded-lg font-semibold"
                    >
                        Bus List →
                    </button>

                    <button
                        onClick={() => navigate("/attendance")}
                        className="w-full bg-gray-700 py-2 rounded-lg"
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

                    <button
                        onClick={logout}
                        className="w-full bg-red-500 py-2 rounded-lg mt-4"
                    >
                        Logout
                    </button>

                </div>

                <div className="flex-1 bg-gray-700 flex items-center justify-center">

                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/6/6f/Map_placeholder.png"
                        alt="map"
                        className="w-full h-full object-cover"
                    />

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
                    className="text-sm text-yellow-400"
                >
                    Live Map
                </button>

                <button
                    onClick={() => navigate("/attendance")}
                    className="text-sm"
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

export default ManagementDashboard