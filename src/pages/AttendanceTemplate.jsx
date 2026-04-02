import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

function AttendanceTemplate({ type }) {

    const today = new Date()
    const todayDate = today.getDate()
    const todayMonth = today.getMonth()
    const todayYear = today.getFullYear()

    const [currentMonth] = useState(today)
    const [attendance, setAttendance] = useState({})
    const [selectedStatus, setSelectedStatus] = useState(null)

    const storageKey = `attendance_${type}`

    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem(storageKey))
        if (saved) setAttendance(saved)
    }, [storageKey])

    const isToday = (day) =>
        year === todayYear &&
        month === todayMonth &&
        day === todayDate

    const handleSave = () => {
        if (!selectedStatus) {
            alert("Please select attendance type first.")
            return
        }

        const key = `${year}-${month}-${todayDate}`

        const updatedAttendance = {
            ...attendance,
            [key]: selectedStatus
        }

        setAttendance(updatedAttendance)
        localStorage.setItem(storageKey, JSON.stringify(updatedAttendance))

        alert("Attendance saved successfully ✅")
    }

    const calculateAttendance = () => {
        const records = Object.values(attendance)
        const total = records.filter(r => r !== "holiday").length
        const present = records.filter(r => r === "present").length
        if (total === 0) return 0
        return Math.round((present / total) * 100)
    }

    const getStatusColor = (day) => {
        const key = `${year}-${month}-${day}`
        const status = attendance[key]

        if (status === "present") return "bg-green-500 text-black"
        if (status === "absent") return "bg-red-500 text-black"
        if (status === "holiday") return "bg-black text-white"

        return isToday(day)
            ? "bg-yellow-300 text-black"
            : "bg-gray-300 opacity-40"
    }

    return (
        <div className="min-h-screen pb-24 bg-gradient-to-b from-yellow-400 to-black p-4">

            <div className="bg-white rounded-3xl p-4 shadow-xl">

                <div className="flex justify-between items-center mb-4">
                    <button disabled>
                        <ChevronLeft size={24} className="opacity-30" />
                    </button>

                    <h2 className="font-bold text-lg uppercase">
                        {type.toUpperCase()} ATTENDANCE
                    </h2>

                    <button disabled>
                        <ChevronRight size={24} className="opacity-30" />
                    </button>
                </div>

                <div className="grid grid-cols-7 text-center font-semibold border-b pb-2">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
                        <div key={day}>{day}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-2 mt-2">
                    {Array.from({ length: firstDay === 0 ? 6 : firstDay - 1 }).map((_, i) => (
                        <div key={"empty" + i}></div>
                    ))}

                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1
                        return (
                            <div
                                key={day}
                                className={`p-2 text-center rounded 
                                    ${getStatusColor(day)}
                                    ${isToday(day) ? "cursor-pointer" : "cursor-not-allowed"}
                                `}
                            >
                                {day}
                            </div>
                        )
                    })}
                </div>

                <div className="mt-4 bg-gray-200 rounded-xl p-2 text-center font-semibold">
                    Attendance: <span className="text-blue-600">{calculateAttendance()}%</span>
                </div>
            </div>

            <div className="mt-6 space-y-4">

                <button
                    onClick={() => setSelectedStatus("absent")}
                    className={`w-full py-3 rounded-xl flex items-center gap-3 px-4 
                        ${selectedStatus === "absent" ? "bg-red-600 text-white" : "bg-black text-white"}`}
                >
                    <div className="w-5 h-5 bg-red-500 rounded-full"></div>
                    ABSENT
                </button>

                <button
                    onClick={() => setSelectedStatus("present")}
                    className={`w-full py-3 rounded-xl flex items-center gap-3 px-4 
                        ${selectedStatus === "present" ? "bg-green-600 text-white" : "bg-black text-white"}`}
                >
                    <div className="w-5 h-5 bg-green-500 rounded-full"></div>
                    PRESENT
                </button>

                <button
                    onClick={() => setSelectedStatus("holiday")}
                    className={`w-full py-3 rounded-xl flex items-center gap-3 px-4 
                        ${selectedStatus === "holiday" ? "bg-gray-700 text-white" : "bg-black text-white"}`}
                >
                    <div className="w-5 h-5 bg-black rounded-full border border-white"></div>
                    COLLEGE HOLIDAY
                </button>

                <button
                    onClick={handleSave}
                    className="w-full bg-cyan-400 py-3 rounded-xl font-bold text-black"
                >
                    SAVE ATTENDANCE
                </button>

            </div>

        </div>
    )
}

export default AttendanceTemplate