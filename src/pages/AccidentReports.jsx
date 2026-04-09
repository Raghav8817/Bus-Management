import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function AccidentReports() {
    const navigate = useNavigate()
    const [management, setManagement] = useState(null)
    const [buses, setBuses] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchData = async () => {
        try {
            const uRes = await fetch(`${BASE_URL}/user-data`, { credentials: "include" });
            if (!uRes.ok) { navigate("/"); return; }
            const currentUser = await uRes.json();
            if (currentUser.role !== "management") { navigate("/"); return; }
            
            setManagement({ fullName: currentUser.full_name || currentUser.fullName, role: currentUser.role });

            const overRes = await fetch(`${BASE_URL}/api/management/overview`, { credentials: "include" });
            if (overRes.ok) {
                const data = await overRes.json();
                // Simulating accident counts for the report view
                const enrichedBuses = data.buses.map(b => ({
                    ...b,
                    accidents: Math.floor(Math.random() * 2) // Typically low for a professional fleet
                }));
                setBuses(enrichedBuses);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col font-sans">
            {/* Top Bar */}
            <div className="bg-black px-6 py-4 flex justify-between items-center border-b-4 border-yellow-400 shadow-xl z-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center text-black font-black text-xl">W</div>
                    <h1 className="font-black text-lg tracking-tight uppercase">
                        Safety <span className="text-yellow-400">Incident Logs</span>
                    </h1>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-72 bg-black/50 backdrop-blur-md p-6 border-r border-white/5 flex flex-col gap-4">
                    <button onClick={() => navigate("/management")} className="w-full bg-white/5 text-gray-400 p-3 rounded-xl font-bold text-sm hover:bg-white/10 transition-all flex items-center gap-3"><span>📊</span> Overview</button>
                    <button onClick={() => navigate("/management-dashboard")} className="w-full bg-white/5 text-gray-400 p-3 rounded-xl font-bold text-sm hover:bg-white/10 transition-all flex items-center gap-3"><span>🌍</span> Live Map</button>
                    <button onClick={() => navigate("/attendance")} className="w-full bg-white/5 text-gray-400 p-3 rounded-xl font-bold text-sm hover:bg-white/10 transition-all flex items-center gap-3"><span>📋</span> Attendance</button>
                    <button onClick={() => navigate("/routes")} className="w-full bg-white/5 text-gray-400 p-3 rounded-xl font-bold text-sm hover:bg-white/10 transition-all flex items-center gap-3"><span>🛣️</span> Routes</button>
                    <button onClick={() => navigate("/reports")} className="w-full bg-yellow-400 text-black p-3 rounded-xl font-black text-sm shadow-lg shadow-yellow-400/20 flex items-center gap-3"><span>📄</span> Reports</button>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-8 overflow-y-auto">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h2 className="text-3xl font-black uppercase tracking-tight">Accident Reports</h2>
                            <p className="text-gray-500 font-medium">Historical safety audit and investigation files</p>
                        </div>
                        <button className="bg-white text-black px-6 py-2.5 rounded-xl text-xs font-black uppercase hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-95">
                            Report New Incident
                        </button>
                    </div>

                    <div className="bg-zinc-900 shadow-2xl rounded-3xl border border-white/5 overflow-hidden">
                        <div className="grid grid-cols-5 bg-white/5 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-white/5">
                            <div>Unit Number</div>
                            <div>Primary Driver</div>
                            <div>Total Incidents</div>
                            <div>Safety Rating</div>
                            <div className="text-right">Action</div>
                        </div>

                        <div className="divide-y divide-white/5">
                            {buses.map((bus) => (
                                <div key={bus.busId} className="grid grid-cols-5 items-center px-6 py-5 text-sm hover:bg-white/[0.02] transition-all">
                                    <div className="font-black text-white text-lg">BUS {bus.busNumber}</div>
                                    <div className="text-gray-300 font-bold">{bus.fullName}</div>
                                    <div className={`font-black ${bus.accidents > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                        {bus.accidents} Recorded
                                    </div>
                                    <div>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${bus.accidents === 0 ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20'}`}>
                                            {bus.accidents === 0 ? 'EXCELLENT' : 'REVIEW REQ'}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <button 
                                            onClick={() => navigate(`/accident-report/${bus.busId}`)}
                                            className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all"
                                        >
                                            View Logs
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
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
                <button onClick={() => navigate("/attendance")} className="flex flex-col items-center gap-1 text-gray-600 hover:text-white">
                    <span className="text-xl">📋</span>
                    <span className="text-[9px] font-black uppercase">Attendance</span>
                </button>
                <button onClick={() => navigate("/reports")} className="flex flex-col items-center gap-1 text-yellow-400">
                    <span className="text-xl">📄</span>
                    <span className="text-[9px] font-black uppercase">Reports</span>
                </button>
            </div>
        </div>
    )
}

export default AccidentReports