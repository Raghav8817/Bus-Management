import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function ManaDashboard() {
    const navigate = useNavigate()
    const [management, setManagement] = useState(null)
    const [buses, setBuses] = useState([])
    const [summary, setSummary] = useState({
        totalBuses: 0,
        totalStudents: 0,
        totalPresent: 0,
        totalAbsent: 0,
        ongoingTrips: 0
    })
    const [loading, setLoading] = useState(true)

    const fetchData = async () => {
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

            // 2. Fetch Overview Data
            const overRes = await fetch(`${BASE_URL}/api/management/overview`, { credentials: "include" });
            if (overRes.ok) {
                const data = await overRes.json();
                setBuses(data.buses);
                setSummary(data.summary);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, [navigate]);

    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col font-sans">
            {/* Top bar */}
            <div className="bg-black px-6 py-4 flex justify-between items-center border-b-4 border-yellow-400 shadow-xl z-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center text-black font-black text-xl">W</div>
                    <h1 className="font-black text-lg tracking-tight">
                        WCTM <span className="text-yellow-400 uppercase">Management</span>
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
                <div className="w-72 bg-black/50 backdrop-blur-md p-6 border-r border-white/5 flex flex-col gap-6">
                    <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 p-5 rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-yellow-400/10 rounded-full blur-2xl group-hover:bg-yellow-400/20 transition-all"></div>
                        <p className="text-[10px] text-yellow-400 font-black uppercase tracking-widest mb-1">Total Fleet</p>
                        <h2 className="text-4xl font-black text-white">{summary.totalBuses} <span className="text-sm font-medium text-gray-500 uppercase">Buses</span></h2>
                        
                        <div className="mt-6 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-400 font-bold">Absent Students</span>
                                <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-black">{summary.totalAbsent}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-400 font-bold">Ongoing Trips</span>
                                <span className="text-xs bg-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded-full font-black">{summary.ongoingTrips}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-400 font-bold">Present Today</span>
                                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-black">{summary.totalPresent}</span>
                            </div>
                        </div>
                    </div>

                    <nav className="flex flex-col gap-2">
                        <button className="flex items-center gap-3 w-full bg-yellow-400 text-black p-3 rounded-xl font-black text-sm shadow-lg shadow-yellow-400/20 transition-all">
                            <span>🚌</span> Bus List
                        </button>
                        <button onClick={() => navigate("/management-dashboard")} className="flex items-center gap-3 w-full bg-white/5 text-gray-400 p-3 rounded-xl font-bold text-sm hover:bg-white/10 transition-all">
                            <span>🌍</span> Live Map
                        </button>
                        <button onClick={() => navigate("/attendance")} className="flex items-center gap-3 w-full bg-white/5 text-gray-400 p-3 rounded-xl font-bold text-sm hover:bg-white/10 transition-all">
                            <span>📋</span> Attendance
                        </button>
                        <button onClick={() => navigate("/reports")} className="flex items-center gap-3 w-full bg-white/5 text-gray-400 p-3 rounded-xl font-bold text-sm hover:bg-white/10 transition-all">
                            <span>📄</span> Reports
                        </button>
                    </nav>

                    <div className="mt-auto border-t border-white/5 pt-6">
                         <button onClick={() => {
                             fetch(`${BASE_URL}/logout`, { method: "POST", credentials: "include" }).then(() => navigate("/login"));
                         }} className="w-full bg-red-500/10 text-red-500 p-3 rounded-xl font-bold text-sm hover:bg-red-500/20 transition-all">
                            Logout System
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-8 overflow-y-auto">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h2 className="text-3xl font-black text-white tracking-tight uppercase">Bus Fleet Overview</h2>
                            <p className="text-gray-500 font-medium tracking-tight">Real-time status of all college transport units</p>
                        </div>
                        <div className="text-[10px] text-gray-600 font-black uppercase tracking-[0.2em] bg-white/5 px-4 py-2 rounded-full border border-white/5">
                            Sync: {new Date().toLocaleTimeString()}
                        </div>
                    </div>

                    <div className="bg-zinc-900/50 rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
                        <div className="grid grid-cols-6 bg-white/5 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-white/5">
                            <div>Unit</div>
                            <div>Driver / Contact</div>
                            <div>Live Location</div>
                            <div>Capacity</div>
                            <div>Status</div>
                            <div className="text-right">Live View</div>
                        </div>

                        <div className="divide-y divide-white/5">
                            {buses.map((bus) => (
                                <div key={bus.busId} className="grid grid-cols-6 items-center px-6 py-5 text-sm hover:bg-white/[0.02] transition-colors">
                                    <div className="flex flex-col">
                                        <span className="font-black text-white">BUS {bus.busNumber}</span>
                                        <span className="text-[10px] text-gray-600 font-bold uppercase">ID: {bus.busId}</span>
                                    </div>

                                    <div className="flex flex-col">
                                        <span className="font-bold text-gray-300">{bus.fullName}</span>
                                        <a href={`tel:${bus.contact}`} className="text-[10px] text-yellow-400 font-bold hover:underline transition-all">📞 {bus.contact}</a>
                                    </div>

                                    <div>
                                        {bus.latitude ? (
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"></span>
                                                    <span className="text-[10px] font-mono text-gray-400">{parseFloat(bus.latitude).toFixed(4)}, {parseFloat(bus.longitude).toFixed(4)}</span>
                                                </div>
                                                <span className="text-[10px] text-gray-600 font-bold uppercase">Active Trace</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <span className="w-2 h-2 bg-zinc-700 rounded-full"></span>
                                                <span className="text-xs italic uppercase tracking-tighter">Offline</span>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden max-w-[60px]">
                                                <div 
                                                    className="h-full bg-green-500" 
                                                    style={{ width: `${(bus.presentStudents / (bus.totalStudents || 1)) * 100}%` }}
                                                ></div>
                                            </div>
                                            <span className="font-black text-white">{bus.presentStudents}<span className="text-gray-600">/{bus.totalStudents}</span></span>
                                        </div>
                                    </div>

                                    <div>
                                        {bus.tripActive ? (
                                            <span className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-green-500/20">Active</span>
                                        ) : (
                                            <span className="bg-zinc-800 text-zinc-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">Idle</span>
                                        )}
                                    </div>

                                    <div className="text-right">
                                        <button 
                                            onClick={() => navigate("/management-dashboard")}
                                            className="bg-white/5 hover:bg-yellow-400 hover:text-black p-2.5 rounded-xl transition-all border border-white/5 active:scale-90"
                                        >
                                            🌍
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {buses.length === 0 && (
                                <div className="p-20 text-center">
                                    <div className="text-4xl mb-4">🔍</div>
                                    <h3 className="text-xl font-black text-white uppercase">No Buses Found</h3>
                                    <p className="text-gray-500">Ensure drivers are registered in the system.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Nav */}
            <div className="bg-black flex justify-around py-4 border-t border-white/5 z-50">
                <button className="flex flex-col items-center gap-1 text-yellow-400 scale-110 pointer-events-none">
                    <span className="text-xl">📊</span>
                    <span className="text-[9px] font-black uppercase">Overview</span>
                </button>
                <button onClick={() => navigate("/management-dashboard")} className="flex flex-col items-center gap-1 text-gray-600 hover:text-white transition-all">
                    <span className="text-xl">🌍</span>
                    <span className="text-[9px] font-black uppercase">Live Map</span>
                </button>
                <button onClick={() => navigate("/attendance")} className="flex flex-col items-center gap-1 text-gray-600 hover:text-white transition-all">
                    <span className="text-xl">📋</span>
                    <span className="text-[9px] font-black uppercase">Attendance</span>
                </button>
                <button onClick={() => navigate("/reports")} className="flex flex-col items-center gap-1 text-gray-600 hover:text-white transition-all">
                    <span className="text-xl">📄</span>
                    <span className="text-[9px] font-black uppercase">Reports</span>
                </button>
            </div>
        </div>
    )
}

export default ManaDashboard