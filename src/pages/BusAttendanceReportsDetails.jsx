import { useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"

function BusAttendanceReportDetails() {

    const navigate = useNavigate()
    const { busId } = useParams()

    const [management, setManagement] = useState(null)
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

        const busStudents = users.filter(
            u => u.role === "student" && String(u.busId) === String(busId)
        )

        setStudents(busStudents)
        setAttendance(attendanceData)

    }, [navigate, busId])


    const getAbsentDates = (studentId) => {

        const records = attendance.filter(
            a =>
                String(a.studentId) === String(studentId) &&
                a.status === "absent"
        )

        return records.map(a => a.date).join(", ")
    }


    const getTotalAttendance = () => {

        const totalStudents = students.length

        const present = attendance.filter(
            a =>
                String(a.busNumber) === String(busId) &&
                a.status === "present"
        ).length

        const total = totalStudents * 5

        return `${present}/${total}`
    }


    return (

        <div className="min-h-screen bg-gray-900 text-white flex flex-col">

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

                <div className="w-72 bg-gray-800 p-4 space-y-2">

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


                {/* MAIN CONTENT */}

                <div className="flex-1 p-6">

                    <div className="flex justify-between items-center mb-6">

                        <h2 className="text-2xl font-bold text-yellow-400">
                            Bus {busId}
                        </h2>

                        <div className="text-2xl text-yellow-400 font-bold">
                            {getTotalAttendance()}
                        </div>

                    </div>


                    {/* TABLE HEADER */}

                    <div className="grid grid-cols-4 border-b border-gray-600 pb-2 font-semibold">

                        <div>NAME</div>
                        <div className="text-red-400">ABSENT DATES</div>
                        <div className="text-cyan-400">Contact</div>
                        <div>Printable Reports</div>

                    </div>


                    {/* STUDENTS */}

                    {students.map((student, index) => (

                        <div
                            key={index}
                            className="grid grid-cols-4 border-b border-gray-700 py-3"
                        >

                            <div>{student.fullName}</div>

                            <div className="text-red-400">
                                {getAbsentDates(student.id) || "-"}
                            </div>

                            <div className="text-cyan-400">
                                {student.contact}
                            </div>

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

                <button
                    onClick={() => navigate("/management-dashboard")}
                    className="text-sm"
                >
                    Live Map
                </button>

                <button onClick={() => navigate("/attendance")}>
                    Attendance
                </button>

                <button className="text-yellow-400">
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

export default BusAttendanceReportDetails