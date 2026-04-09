import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

function BusAttendanceDetails() {
    const navigate = useNavigate()
    const { busId } = useParams()

    const [management, setManagement] = useState(null)
    const [students, setStudents] = useState([])
    const [attendance, setAttendance] = useState([])
    const [busNumberDisplay, setBusNumberDisplay] = useState("")
    const [loading, setLoading] = useState(true)

    const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Verify session
                const userRes = await fetch(`${BASE_URL}/user-data`, { credentials: "include" });
                if (!userRes.ok) { navigate("/"); return; }
                const userData = await userRes.json();
                setManagement(userData);

                // Fetch students for this bus ID
                const sRes = await fetch(`${BASE_URL}/api/users?role=student`, { credentials: "include" });
                if (sRes.ok) {
                    const allStudents = await sRes.json();
                    setStudents(allStudents.filter(u => String(u.bus_id || u.busId) === String(busId)));
                }

                // Fetch actual bus number from overview to show in header
                const overRes = await fetch(`${BASE_URL}/api/management/overview`, { credentials: "include" });
                if (overRes.ok) {
                    const data = await overRes.json();
                    const busInfo = data.buses.find(b => String(b.busId) === String(busId));
                    if (busInfo) setBusNumberDisplay(busInfo.busNumber);
                }

                // Fetch attendance logs for this bus ID
                const aRes = await fetch(`${BASE_URL}/api/management/attendance/bus/${busId}`, { credentials: "include" });
                if (aRes.ok) {
                    setAttendance(await aRes.json());
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [navigate, busId]);

    const getStatus = (email) => {
        const record = attendance.find(a => String(a.user_id) === String(email));
        if (record?.status === "present") return "PRESENT";
        return "ABSENT";
    }

    const getCounts = () => {
        const present = students.filter(s => getStatus(s.email_id || s.email) === "PRESENT").length;
        return `${present}/${students.length}`;
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
                    <div onClick={() => navigate("/attendance")} className="bg-white/10 p-2 rounded-lg cursor-pointer">←</div>
                    <h1 className="font-black tracking-tight uppercase">Daily <span className="text-yellow-400">Roster</span></h1>
                </div>
                <div className="text-right flex items-center gap-4">
                    <div className="hidden sm:block">
                        <div className="font-bold text-xs">{management?.full_name || management?.fullName}</div>
                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Admin</div>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-72 bg-black/50 backdrop-blur-md p-6 border-r border-white/5 flex flex-col gap-4">
                    <button onClick={() => navigate("/management")} className="w-full bg-white/5 text-gray-400 p-3 rounded-xl font-bold text-sm hover:bg-white/10 transition-all flex items-center gap-3"><span>📊</span> Dashboard</button>
                    <button onClick={() => navigate("/management-dashboard")} className="w-full bg-white/5 text-gray-400 p-3 rounded-xl font-bold text-sm hover:bg-white/10 transition-all flex items-center gap-3"><span>🌍</span> Live Map</button>
                    <button onClick={() => navigate("/attendance")} className="w-full bg-yellow-400 text-black p-3 rounded-xl font-black text-sm shadow-lg shadow-yellow-400/20 flex items-center gap-3"><span>📋</span> Attendance</button>
                    <button onClick={() => navigate("/reports")} className="w-full bg-white/5 text-gray-400 p-3 rounded-xl font-bold text-sm hover:bg-white/10 transition-all flex items-center gap-3"><span>📄</span> Reports</button>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-8 overflow-y-auto">
                    <div className="flex justify-between items-center mb-10 bg-zinc-900/50 p-6 rounded-[30px] border border-white/5">
                        <div>
                            <h2 className="text-3xl font-black uppercase text-yellow-400 tracking-tighter leading-none">Bus {busNumberDisplay || '...'}</h2>
                            <p className="text-gray-500 font-medium text-[10px] uppercase tracking-widest mt-2">Active Boarding Logs • {new Date().toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-4xl font-black text-white leading-none">{getCounts()}</div>
                            <p className="text-[9px] font-black text-gray-600 uppercase mt-1">Present / Total</p>
                        </div>
                    </div>

                    <div className="bg-zinc-900 shadow-2xl rounded-3xl border border-white/5 overflow-hidden">
                        <div className="grid grid-cols-3 bg-white/5 px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-white/5">
                            <div>Student Identity</div>
                            <div className="text-center">Boarding Status</div>
                            <div className="text-right">Quick Contact</div>
                        </div>

                        <div className="divide-y divide-white/5">
                            {students.map((student, idx) => {
                                const status = getStatus(student.email_id || student.email);
                                return (
                                    <div key={idx} className="grid grid-cols-3 items-center px-8 py-5 text-sm hover:bg-white/[0.02] transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-800 to-black flex items-center justify-center font-black text-gray-600 border border-white/5">
                                                {(student.full_name || student.fullName)?.charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-black text-white uppercase tracking-tight">{student.full_name || student.fullName}</span>
                                                <span className="text-[10px] text-gray-600 font-bold uppercase">{student.email_id || student.email}</span>
                                            </div>
                                        </div>

                                        <div className="text-center">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${status === "PRESENT" ? "bg-green-500/10 text-green-500 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]" : "bg-red-500/10 text-red-500 border-red-500/20"}`}>
                                                {status}
                                            </span>
                                        </div>

                                        <div className="text-right">
                                            <a 
                                                href={`tel:${student.contact_number || student.contact}`}
                                                className="inline-flex items-center gap-2 bg-white/5 hover:bg-yellow-400 hover:text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border border-white/5 group"
                                            >
                                                <span className="group-hover:translate-x-[-2px] transition-transform">📞</span> Call
                                            </a>
                                        </div>
                                    </div>
                                );
                            })}
                            {students.length === 0 && (
                                <div className="p-20 text-center text-gray-600">
                                    <p className="font-black text-xs uppercase tracking-[0.3em]">No students synchronized for this unit</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-black flex justify-around py-4 border-t border-white/5 z-50">
                <button onClick={() => navigate("/management")} className="flex flex-col items-center gap-1 text-gray-600">
                    <span className="text-xl">📊</span>
                    <span className="text-[9px] font-black uppercase">Dashboard</span>
                </button>
                <button onClick={() => navigate("/management-dashboard")} className="flex flex-col items-center gap-1 text-gray-600">
                    <span className="text-xl">🌍</span>
                    <span className="text-[9px] font-black uppercase">Live Map</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-yellow-400">
                    <span className="text-xl">📋</span>
                    <span className="text-[9px] font-black uppercase">Attendance</span>
                </button>
                <button onClick={() => navigate("/reports")} className="flex flex-col items-center gap-1 text-gray-600">
                    <span className="text-xl">📄</span>
                    <span className="text-[9px] font-black uppercase">Reports</span>
                </button>
            </div>
        </div>
    )
}

export default BusAttendanceDetails