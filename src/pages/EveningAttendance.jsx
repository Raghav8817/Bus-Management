import AttendanceTemplate from "./AttendanceTemplate"
import BottomNav from "./BottomNav"

function EveningAttendance() {
  return (
    <div className="relative min-h-screen">
      <AttendanceTemplate type="evening" />
      <BottomNav />
    </div>
  )
}

export default EveningAttendance