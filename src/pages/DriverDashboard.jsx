import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

function DriverDashboard() {

    const navigate = useNavigate()
    const [driver, setDriver] = useState(null)
    const [students, setStudents] = useState([])
    const [attendance, setAttendance] = useState([])
    const [tripStarted, setTripStarted] = useState(false)

    useEffect(() => {

        const currentUser = JSON.parse(localStorage.getItem("user"))
        const allUsers = JSON.parse(localStorage.getItem("users")) || []
        const allAttendance = JSON.parse(localStorage.getItem("attendance")) || []

        // if (!currentUser || currentUser.role !== "driver") {
        //     navigate("/login")
        //     return
        // }

        setDriver(currentUser)
        setAttendance(allAttendance)

        
        const busStudents = allUsers.filter(
            (user) =>
                user.role === "student" &&
                String(user.busId) === String(currentUser.busNumber)
        )

        setStudents(busStudents)

    }, [navigate])


    const logout = () => {
        localStorage.removeItem("user")
        localStorage.removeItem("isLoggedIn")
        navigate("/")
    }


    const getAttendanceStatus = (studentEmail) => {

        const record = attendance.find(
            (a) => String(a.email) === String(studentEmail)
        )

        return record?.status === "present"
    }


    const toggleTrip = () => {

        const newStatus = !tripStarted
        setTripStarted(newStatus)

        
        localStorage.setItem(
            "tripStatus",
            JSON.stringify({
                busNumber: driver?.busNumber,
                started: newStatus
            })
        )
    }


    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-yellow-400 p-4">

            {/* Top bar */}
            <div className="bg-yellow-400 rounded-2xl p-4 shadow-xl mb-6 flex justify-between items-center">

                <div>
                    <h1 className="text-xl font-bold">
                        Bus {driver?.busNumber} Driver
                    </h1>

                    <p className="text-sm">
                        Good Morning, {driver?.fullName}
                    </p>
                </div>

                <button
                    onClick={logout}
                    className="bg-black text-white px-4 py-2 rounded-lg"
                >
                    Logout
                </button>

            </div>


            {/* Emergency Button */}
            <div className="bg-white rounded-2xl p-4 shadow-lg mb-6">

                <button
                    onClick={() => alert("Calling Transport Management...")}
                    className="w-full bg-yellow-400 py-3 rounded-xl font-semibold hover:scale-105 transition"
                >
                    🚨 Emergency Call
                </button>

            </div>


            {/* Students List */}
            <div className="space-y-4">

                {students.map((student) => {

                    const checkedIn = getAttendanceStatus(student.email)

                    return (
                        <div
                            key={student.email}
                            className="bg-white rounded-2xl p-4 shadow-lg flex justify-between items-center hover:scale-[1.02] transition"
                        >

                            <div>

                                <h2 className="font-bold">
                                    {student.fullName}
                                </h2>

                                <p className="text-sm text-gray-600">
                                    Stop: {student.stop || "N/A"}
                                </p>

                            </div>

                            <div>

                                {checkedIn ? (
                                    <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm">
                                        ✅ Checked In
                                    </span>
                                ) : (
                                    <span className="bg-red-500 text-white px-4 py-2 rounded-full text-sm">
                                        ❌ Not Checked
                                    </span>
                                )}

                            </div>

                        </div>
                    )

                })}


                {students.length === 0 && (
                    <p className="text-white text-center mt-10">
                        No students assigned to this bus.
                    </p>
                )}

            </div>


            {/* Start Trip Button */}
            <div className="fixed bottom-0 left-0 right-0 bg-yellow-400 p-4 rounded-t-3xl shadow-xl">

                <button
                    onClick={toggleTrip}
                    className={`w-full py-3 rounded-xl font-bold text-white transition ${
                        tripStarted
                            ? "bg-red-500"
                            : "bg-green-500"
                    }`}
                >
                    {tripStarted ? "END TRIP" : "START TRIP"}
                </button>

            </div>

        </div>
    )
}

export default DriverDashboard