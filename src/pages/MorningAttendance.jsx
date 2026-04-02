import AttendanceTemplate from "./AttendanceTemplate"
import BottomNav from "./BottomNav"

function MorningAttendance() {
  return (
    <div className="relative min-h-screen">
      <AttendanceTemplate type="morning" />
      <BottomNav />
    </div>
  )
}

export default MorningAttendance