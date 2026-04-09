import { useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function RouteReportDetails() {
    const navigate = useNavigate()
    const { busId } = useParams()
    const [management, setManagement] = useState(null)
    const [waypoints, setWaypoints] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Verify session
                const uRes = await fetch(`${BASE_URL}/user-data`, { credentials: "include" });
                if (!uRes.ok) { navigate("/"); return; }
                const currUser = await uRes.json();
                setManagement(currUser);

                // Fetch routes from DB
                const rRes = await fetch(`${BASE_URL}/api/routes/${busId}`);
                if (rRes.ok) {
                    const data = await rRes.json();
                    setWaypoints(data.waypoints || []);
                }
            } catch (err) {
                console.error("Failed to fetch route data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [busId, navigate]);

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
                    <div onClick={() => navigate("/routes-reports")} className="bg-white/10 p-2 rounded-lg cursor-pointer text-sm">←</div>
                    <h1 className="font-black text-lg tracking-tight uppercase tracking-tighter">Route <span className="text-yellow-400">Logistics</span></h1>
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
                                <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Unit {busId} Route Report</h1>
                                <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-1">Geographic Waypoint Audit</p>
                            </div>
                            <button className="bg-white text-black px-6 py-2.5 rounded-xl text-[10px] font-black uppercase hover:bg-yellow-400 transition-all">Download Path</button>
                        </div>

                        <div className="bg-zinc-900 rounded-[40px] border border-white/5 overflow-hidden shadow-2xl">
                             <div className="grid grid-cols-4 bg-white/5 px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 border-b border-white/5">
                                <div>Sequence</div>
                                <div>Waypoint Location</div>
                                <div className="text-center">Coordinates</div>
                                <div className="text-right">Action</div>
                            </div>

                            <div className="divide-y divide-white/5">
                                {waypoints.map((wp, index) => (
                                    <div key={index} className="grid grid-cols-4 items-center px-8 py-5 text-sm hover:bg-white/[0.02] transition-all">
                                        <div className="flex items-center gap-4">
                                            <span className="w-8 h-8 rounded-full bg-yellow-400/10 text-yellow-400 flex items-center justify-center font-black text-[10px] border border-yellow-400/20">
                                                {String(index + 1).padStart(2, '0')}
                                            </span>
                                        </div>
                                        <div className="font-bold text-white uppercase tracking-tight">{wp.stop_name || wp.stop || `STOP ${index + 1}`}</div>
                                        <div className="text-center font-mono text-[10px] text-zinc-500">
                                            {wp.lat?.toFixed(4)}, {wp.lng?.toFixed(4)}
                                        </div>
                                        <div className="text-right">
                                            <button className="text-green-400 text-[10px] font-black uppercase hover:underline">Verify Stop</button>
                                        </div>
                                    </div>
                                ))}

                                {waypoints.length === 0 && (
                                    <div className="p-20 text-center text-gray-600">
                                        <p className="font-black text-xs uppercase tracking-[0.3em]">No Dynamic Route Configured</p>
                                        <button 
                                            onClick={() => navigate("/routes")}
                                            className="mt-6 bg-white/5 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-white/10 transition-all"
                                        >
                                            Configure Route Editor
                                        </button>
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

export default RouteReportDetails