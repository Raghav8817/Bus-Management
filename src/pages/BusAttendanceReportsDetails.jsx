import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function BusAttendanceReportDetails() {
    const navigate = useNavigate()
    const { busId } = useParams()

    const [management, setManagement] = useState(null)
    const [students, setStudents] = useState([])
    const [attendance, setAttendance] = useState([])
    const [busNumberDisplay, setBusNumberDisplay] = useState("")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Verify Management Session
                const uRes = await fetch(`${BASE_URL}/user-data`, { credentials: "include" });
                if (!uRes.ok) { navigate("/"); return; }
                const currUser = await uRes.json();
                if (currUser.role !== "management") { navigate("/"); return; }
                setManagement(currUser);

                // 2. Fetch Students assigned to this bus ID
                const sRes = await fetch(`${BASE_URL}/api/users?role=student`, { credentials: "include" });
                if (sRes.ok) {
                    const allStudents = await sRes.json();
                    const busStudents = allStudents.filter(s => String(s.bus_id || s.busId) === String(busId));
                    setStudents(busStudents);
                }

                // 3. Fetch actual bus number from overview to show in header
                const overRes = await fetch(`${BASE_URL}/api/management/overview`, { credentials: "include" });
                if (overRes.ok) {
                    const data = await overRes.json();
                    const busInfo = data.buses.find(b => String(b.busId) === String(busId));
                    if (busInfo) setBusNumberDisplay(busInfo.busNumber);
                }

                // 4. Fetch Historical Attendance from DB
                const aRes = await fetch(`${BASE_URL}/api/management/attendance/bus/${busId}`, { credentials: "include" });
                if (aRes.ok) {
                    const logs = await aRes.json();
                    setAttendance(logs || []);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [navigate, busId]);

    const getAbsentDates = (emailId) => {
        const records = attendance.filter(
            a => String(a.user_id) === String(emailId) && a.status === "absent"
        );
        return records.map(r => r.date_str).join(", ") || "No Absences";
    }

    if (loading) return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-yellow-400"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col font-sans">
            {/* Top Bar */}
            <div className="bg-black px-6 py-4 flex justify-between items-center border-b-4 border-yellow-400 shadow-xl z-50">
                <div className="flex items-center gap-3">
                    <div onClick={() => navigate("/attendance-reports")} className="bg-white/10 p-2 rounded-lg cursor-pointer">←</div>
                    <h1 className="font-black text-lg tracking-tight uppercase">Presence <span className="text-yellow-400">Insights</span></h1>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-72 bg-black/50 backdrop-blur-md p-6 border-r border-white/5 flex flex-col gap-4">
                    <button onClick={() => navigate("/management")} className="w-full bg-white/5 text-gray-400 p-3 rounded-xl font-bold text-sm hover:bg-white/10 transition-all flex items-center gap-3"><span>📊</span> Overview</button>
                    <button onClick={() => navigate("/management-dashboard")} className="w-full bg-white/5 text-gray-400 p-3 rounded-xl font-bold text-sm hover:bg-white/10 transition-all flex items-center gap-3"><span>🌍</span> Live Map</button>
                    <button onClick={() => navigate("/attendance")} className="w-full bg-white/5 text-gray-400 p-3 rounded-xl font-bold text-sm hover:bg-white/10 transition-all flex items-center gap-3"><span>📋</span> Attendance</button>
                    <button onClick={() => navigate("/routes")} className="w-full bg-white/5 text-gray-400 p-3 rounded-xl font-bold text-sm hover:bg-white/10 transition-all flex items-center gap-3"><span>🛣️</span> Routes</button>
                    <button className="w-full bg-yellow-400 text-black p-3 rounded-xl font-black text-sm shadow-lg shadow-yellow-400/20 flex items-center gap-3"><span>📄</span> Reports</button>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-10 overflow-y-auto">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex justify-between items-end mb-10 bg-zinc-900/50 p-8 rounded-[40px] border border-white/5 shadow-2xl">
                             <div>
                                <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Bus {busNumberDisplay || "..."} Attendance History</h1>
                                <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-1">Detailed Absence Tracking Audit</p>
                            </div>
                            <button className="bg-white text-black px-6 py-2.5 rounded-xl text-[10px] font-black uppercase hover:bg-yellow-400 transition-all">Download Audit</button>
                        </div>

                        <div className="bg-zinc-900 rounded-[40px] border border-white/5 overflow-hidden shadow-2xl">
                             <div className="grid grid-cols-2 bg-white/5 px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-white/5">
                                <div>Student Personnel</div>
                                <div>Absence Trace Log</div>
                            </div>

                            <div className="divide-y divide-white/5 px-8">
                                {students.map((student, idx) => (
                                    <div key={idx} className="grid grid-cols-2 py-6 items-center">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-white uppercase">{student.full_name || student.fullName}</span>
                                            <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{student.email_id || student.email}</span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-mono text-red-400 bg-red-400/5 p-3 rounded-xl border border-red-400/10">
                                                {getAbsentDates(student.email_id || student.email)}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                {students.length === 0 && (
                                    <div className="p-20 text-center text-gray-600">
                                        <p className="font-black text-xs uppercase tracking-[0.3em]">No Personnel Registered to this Unit</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-black flex justify-around py-4 border-t border-white/5 z-50 sm:hidden">
                <button onClick={() => navigate("/management")} className="text-[10px] font-black text-gray-600">DASHBOARD</button>
                <button onClick={() => navigate("/reports")} className="text-[10px] font-black text-yellow-400">REPORTS</button>
            </div>
        </div>
    )
}

export default BusAttendanceReportDetails