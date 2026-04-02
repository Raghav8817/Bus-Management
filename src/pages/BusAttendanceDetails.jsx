import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

function BusAttendanceDetails() {

    const navigate = useNavigate()
    const { busNumber } = useParams()

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
        setStudents(users.filter(u => u.role === "student" && String(u.busId) === String(busNumber)))
        setAttendance(attendanceData)

    }, [navigate, busNumber])


    const getStatus = (email) => {

        const record = attendance.find(
            a => a.email === email && String(a.busNumber) === String(busNumber)
        )

        if (record?.status === "present") return "PRESENT"
        return "ABSENT"
    }


    const getCounts = () => {

        const present = students.filter(s => getStatus(s.email) === "PRESENT").length
        return `${present}/${students.length}`
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
                        onClick={() => navigate("/management")}
                        className="w-full bg-gray-700 py-2 rounded-lg"
                    >
                        Bus List →
                    </button>

                    <button
                        onClick={() => navigate("/attendance")}
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

                    <div className="flex justify-between items-center mb-4 border-b border-gray-600 pb-2">

                        <div className="text-xl font-bold">
                            Bus {busNumber}
                        </div>

                        <div className="text-xl font-bold text-yellow-400">
                            {getCounts()}
                        </div>

                    </div>


                    {students.map((student, index) => {

                        const status = getStatus(student.email)

                        return (

                            <div
                                key={index}
                                className="grid grid-cols-3 items-center border-b border-gray-600 py-3"
                            >

                                <div className="flex items-center space-x-3">

                                    <div className="w-8 h-8 rounded-full bg-gray-500"></div>

                                    <span>
                                        {student.fullName}
                                    </span>

                                </div>

                                <div
                                    className={
                                        status === "PRESENT"
                                            ? "text-green-400 font-bold"
                                            : "text-red-400 font-bold"
                                    }
                                >
                                    {status}
                                </div>

                                <div className="flex items-center space-x-3 text-cyan-400 font-semibold">

                                    <span>
                                        Contact
                                    </span>

                                    <a
                                        href={`tel:${student.contact}`}
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
                    onClick={() => navigate("/attendance")}
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

export default BusAttendanceDetails