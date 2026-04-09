import { useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function VehicleReportDetails() {
    const navigate = useNavigate()
    const { busId } = useParams()
    const [management, setManagement] = useState(null)
    const [busData, setBusData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Verify session
                const uRes = await fetch(`${BASE_URL}/user-data`, { credentials: "include" });
                if (!uRes.ok) { navigate("/"); return; }
                const currUser = await uRes.json();
                setManagement(currUser);

                // Fetch bus specific overview from DB
                const overRes = await fetch(`${BASE_URL}/api/management/overview`, { credentials: "include" });
                if (overRes.ok) {
                    const data = await overRes.json();
                    const bus = data.buses.find(b => String(b.busNumber) === String(busId) || String(b.busId) === String(busId));
                    if (bus) {
                        setBusData({
                            ...bus,
                            weeklyKms: "1,240 KM",
                            fuelConsumption: "115 Liters",
                            maintenaceCost: "₹450",
                            delays: "1 Time",
                            fines: 1
                        });
                    }
                }
            } catch (err) {
                console.error(err);
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

    if (!busData) return (
        <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-6 text-center">
            <div>
                <h2 className="text-2xl font-black mb-4 uppercase tracking-tighter text-red-500">Unit NOT FOUND</h2>
                <button onClick={() => navigate("/management")} className="bg-yellow-400 text-black px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs">Return to Fleet</button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col font-sans">
             {/* Top Bar */}
             <div className="bg-black px-6 py-4 flex justify-between items-center border-b-4 border-yellow-400 shadow-xl z-50">
                <div className="flex items-center gap-3">
                    <div onClick={() => navigate("/vehicle-reports")} className="bg-white/10 p-2 rounded-lg cursor-pointer text-sm">←</div>
                    <h1 className="font-black text-lg tracking-tight uppercase tracking-tighter">Fleet <span className="text-yellow-400">Inventory</span></h1>
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
                    <div className="max-w-3xl mx-auto">
                         <div className="flex justify-between items-end mb-10 bg-zinc-900/50 p-8 rounded-[40px] border border-white/5 shadow-2xl">
                             <div>
                                <h1 className="text-4xl font-black uppercase tracking-tighter text-white">UNIT {busData.busNumber || busId}</h1>
                                <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-1">Vehicle Health & Logistics Audit</p>
                            </div>
                            <button className="bg-white text-black px-6 py-2.5 rounded-xl text-[10px] font-black uppercase hover:bg-yellow-400 transition-all">Export Data</button>
                        </div>

                        <div className="bg-zinc-900 rounded-[40px] border border-white/5 overflow-hidden shadow-2xl">
                             <div className="grid grid-cols-2 bg-white/5 px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 border-b border-white/5">
                                <div>Log Parameter</div>
                                <div>Verification Status</div>
                            </div>

                            <div className="divide-y divide-white/5 px-8">
                                <div className="grid grid-cols-2 py-6 items-center">
                                    <div className="text-sm font-bold text-gray-400 uppercase">Assigned Pilot</div>
                                    <div className="text-sm font-black text-white">{busData.fullName || "Unassigned"}</div>
                                </div>

                                <div className="grid grid-cols-2 py-6">
                                    <div className="text-sm font-bold text-gray-400 uppercase">Weekly Distance</div>
                                    <div className="text-sm font-black text-yellow-400 font-mono">{busData.weeklyKms}</div>
                                </div>

                                <div className="grid grid-cols-2 py-6">
                                    <div className="text-sm font-bold text-gray-400 uppercase">Route Assignment</div>
                                    <div className="text-sm font-black text-white truncate">{busData.routeName || "FARIDABAD - CANAL ROAD"}</div>
                                </div>

                                <div className="grid grid-cols-2 py-6">
                                    <div className="text-sm font-bold text-gray-400 uppercase">Fuel Optimization</div>
                                    <div className="text-sm font-black text-white font-mono">{busData.fuelConsumption} <span className="text-[10px] text-gray-500">(Avg 4.2 KM/L)</span></div>
                                </div>

                                <div className="grid grid-cols-2 py-6">
                                    <div className="text-sm font-bold text-gray-400 uppercase">Operational Cost</div>
                                    <div className="text-sm font-black text-green-500 font-mono">{busData.maintenaceCost} <span className="text-[10px] text-gray-500">(Misc Items)</span></div>
                                </div>

                                <div className="grid grid-cols-2 py-6 items-center">
                                    <div className="text-sm font-bold text-gray-400 uppercase">Punctuality Score</div>
                                    <div className="flex justify-between items-center text-red-400">
                                        <span className="text-xs font-black uppercase">{busData.delays} DELAY LOGGED</span>
                                        <button className="bg-zinc-800 text-[10px] font-black uppercase px-3 py-1 rounded-lg border border-white/5">View Details</button>
                                    </div>
                                </div>
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

export default VehicleReportDetails