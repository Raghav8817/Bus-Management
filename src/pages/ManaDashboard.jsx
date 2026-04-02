import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

function ManaDashboard() {

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


    const getBusStudents = (busNumber) => {

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


    const getBusStatus = (busNumber) => {

        const present = attendance.filter(
            a =>
                String(a.busNumber) === String(busNumber) &&
                a.status === "present"
        )

        if (present.length === 0) return "DELAY"
        return "ON TIME"
    }


    const getTotalPresent = () => {

        return attendance.filter(a => a.status === "present").length

    }


    const getTotalStudents = () => {

        return students.length

    }


    const getAbsentStudents = () => {

        return getTotalStudents() - getTotalPresent()

    }


    const getDelayedBuses = () => {

        return drivers.filter(d => getBusStatus(d.busNumber) === "DELAY").length

    }


    return (

        <div className="min-h-screen bg-gray-800 text-white flex flex-col">

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

                <div className="w-72 bg-gray-900 p-4">

                    <div className="bg-gray-800 p-4 rounded-lg mb-4">

                        <div className="text-sm text-gray-400">
                            Total Buses
                        </div>

                        <div className="text-2xl font-bold">
                            {drivers.length}
                        </div>

                        <div className="mt-3 text-sm">
                            <div className="flex justify-between">
                                <span>Absent Students</span>
                                <span>{getAbsentStudents()}</span>
                            </div>

                            <div className="flex justify-between">
                                <span>SOS Alerts</span>
                                <span className="text-red-400">2</span>
                            </div>

                            <div className="flex justify-between">
                                <span>Ongoing Trips</span>
                                <span className="text-yellow-400">{drivers.length}</span>
                            </div>

                            <div className="flex justify-between">
                                <span>Buses Delayed</span>
                                <span className="text-red-400">{getDelayedBuses()}</span>
                            </div>

                        </div>

                    </div>


                    <div className="space-y-2">

                        <button
                            className="w-full bg-yellow-400 text-black py-2 rounded-lg font-semibold"
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
                            onClick={() => navigate("/routes")}
                            className="w-full bg-gray-700 py-2 rounded-lg"
                        >
                            Routes
                        </button>

                    </div>

                </div>


                <div className="flex-1 p-6">

                    <div className="grid grid-cols-6 text-sm font-semibold border-b border-gray-600 pb-2 mb-2">

                        <div>Buses</div>
                        <div>Driver</div>
                        <div>Current Location</div>
                        <div>Students</div>
                        <div>Status/ETA</div>
                        <div></div>

                    </div>


                    {drivers.map((driver, index) => {

                        const studentCount = getBusStudents(driver.busNumber)
                        const status = getBusStatus(driver.busNumber)

                        return (

                            <div
                                key={index}
                                className="grid grid-cols-6 items-center border-b border-gray-600 py-2 text-sm"
                            >

                                <div>
                                    Bus {driver.busNumber}
                                </div>

                                <div>
                                    {driver.fullName}
                                </div>

                                <div>
                                    SECTOR 21
                                </div>

                                <div>
                                    {studentCount}
                                </div>

                                <div
                                    className={
                                        status === "ON TIME"
                                            ? "text-green-400 font-bold"
                                            : "text-red-400 font-bold"
                                    }
                                >
                                    {status}
                                </div>

                                <div>
                                    <a
                                        href={`tel:${driver.contact}`}
                                    >
                                        📞
                                    </a>
                                </div>

                            </div>

                        )

                    })}

                </div>

            </div>


            <div className="bg-black flex justify-around py-3 border-t border-gray-700">

                <button className="text-yellow-400">
                    Dashboard
                </button>

                <button onClick={() => navigate("/management-dashboard")}>
                    Live Map
                </button>

                <button onClick={() => navigate("/attendance")}>
                    Attendance
                </button>

                <button onClick={() => navigate("/reports")}>
                    Reports
                </button>

                <button onClick={() => navigate("/managementpanel")}>
                    Management
                </button>

            </div>

        </div>

    )
}

export default ManaDashboard