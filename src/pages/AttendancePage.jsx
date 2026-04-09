import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function AttendancePage() {
    const navigate = useNavigate()
    const [buses, setBuses] = useState([])
    const [management, setManagement] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchAttendanceData = async () => {
            try {
                // 1. Verify management auth
                const userRes = await fetch(`${BASE_URL}/user-data`, { credentials: "include" });
                if (!userRes.ok) { navigate("/"); return; }
                const userData = await userRes.json();
                if (userData.role !== "management") { navigate("/"); return; }
                
                setManagement({ 
                    fullName: userData.full_name || userData.fullName, 
                    role: userData.role 
                });

                // 2. Fetch Overview Data (contains attendance counts)
                const overRes = await fetch(`${BASE_URL}/api/management/overview`, { credentials: "include" });
                if (overRes.ok) {
                    const data = await overRes.json();
                    setBuses(data.buses);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAttendanceData();
    }, [navigate]);

    if (loading) return <div className="h-screen bg-gray-950 flex items-center justify-center text-white font-black">LOADING ATTENDANCE...</div>

    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col font-sans">
            {/* Top bar */}
            <div className="bg-black px-6 py-4 flex justify-between items-center border-b-4 border-yellow-400 shadow-xl z-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center text-black font-black text-xl">W</div>
                    <h1 className="font-black text-lg tracking-tight uppercase">
                        Attendance <span className="text-yellow-400">Control</span>
                    </h1>
                </div>

                <div className="text-right flex items-center gap-4">
                    <div className="hidden sm:block">
                        <div className="font-bold text-sm leading-none">{management?.fullName}</div>
                        <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-1">Admin Head</div>
                    </div>
                    <div className="w-10 h-10 bg-zinc-800 border border-white/10 rounded-full flex items-center justify-center text-yellow-400 font-bold">
                        {management?.fullName?.charAt(0)}
                    </div>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-72 bg-black/50 backdrop-blur-md p-6 border-r border-white/5 flex flex-col gap-4">
                    <button
                        onClick={() => navigate("/management")}
                        className="w-full bg-white/5 text-gray-400 p-3 rounded-xl font-bold text-sm hover:bg-white/10 transition-all flex items-center gap-3"
                    >
                        <span>🚌</span> Bus List
                    </button>
                    <button
                         onClick={() => navigate("/management-dashboard")}
                        className="w-full bg-white/5 text-gray-400 p-3 rounded-xl font-bold text-sm hover:bg-white/10 transition-all flex items-center gap-3"
                    >
                        <span>🌍</span> Live Map
                    </button>
                    <button
                        className="w-full bg-yellow-400 text-black p-3 rounded-xl font-black text-sm shadow-lg shadow-yellow-400/20 flex items-center gap-3"
                    >
                        <span>📋</span> Attendance
                    </button>
                    <button
                        onClick={() => navigate("/reports")}
                        className="w-full bg-white/5 text-gray-400 p-3 rounded-xl font-bold text-sm hover:bg-white/10 transition-all flex items-center gap-3"
                    >
                        <span>📊</span> Reports
                    </button>
                    <button
                        onClick={() => navigate("/drivers")}
                        className="w-full bg-white/5 text-gray-400 p-3 rounded-xl font-bold text-sm hover:bg-white/10 transition-all flex items-center gap-3"
                    >
                        <span>👤</span> Drivers
                    </button>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-8 overflow-y-auto">
                    <h2 className="text-3xl font-black mb-6 uppercase tracking-tight">Daily Attendance Summary</h2>
                    
                    <div className="bg-zinc-900/50 rounded-3xl border border-white/5 overflow-hidden">
                        <div className="grid grid-cols-4 bg-white/5 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-white/5">
                            <div>Bus Number</div>
                            <div>Student Presence</div>
                            <div>Attendance %</div>
                            <div className="text-right">Action</div>
                        </div>

                        {buses.map((bus, index) => {
                            const percent = Math.round((bus.presentStudents / (bus.totalStudents || 1)) * 100);
                            return (
                                <div key={index} className="grid grid-cols-4 items-center px-6 py-5 border-b border-white/5 hover:bg-white/[0.02] transition-all">
                                    <div className="font-black text-lg">BUS {bus.busNumber}</div>
                                    <div className="font-bold text-gray-400">
                                        <span className="text-white text-xl">{bus.presentStudents}</span> / {bus.totalStudents}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-yellow-400" style={{ width: `${percent}%` }}></div>
                                            </div>
                                            <span className="text-xs font-black text-yellow-400">{percent}%</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <button
                                            onClick={() => navigate(`/busattendance/${bus.busId}`)}
                                            className="bg-yellow-400/10 text-yellow-400 px-4 py-2 rounded-xl text-xs font-black hover:bg-yellow-400 hover:text-black transition-all"
                                        >
                                            VIEW DETAILS
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Footer Nav */}
            <div className="bg-black flex justify-around py-4 border-t border-white/5 z-50">
                <button onClick={() => navigate("/management")} className="flex flex-col items-center gap-1 text-gray-600 hover:text-white">
                    <span className="text-xl">📊</span>
                    <span className="text-[9px] font-black uppercase">Overview</span>
                </button>
                <button onClick={() => navigate("/management-dashboard")} className="flex flex-col items-center gap-1 text-gray-600 hover:text-white">
                    <span className="text-xl">🌍</span>
                    <span className="text-[9px] font-black uppercase">Live Map</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-yellow-400">
                    <span className="text-xl">📋</span>
                    <span className="text-[9px] font-black uppercase">Attendance</span>
                </button>
                <button onClick={() => navigate("/reports")} className="flex flex-col items-center gap-1 text-gray-600 hover:text-white">
                    <span className="text-xl">📄</span>
                    <span className="text-[9px] font-black uppercase">Reports</span>
                </button>
            </div>
        </div>
    )
}

export default AttendancePage