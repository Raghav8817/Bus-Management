import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function DriverDetails() {
    const navigate = useNavigate()
    const { busNumber } = useParams() // Note: Legacy route uses busNumber, I'll adapt the API search
    const [management, setManagement] = useState(null)
    const [driver, setDriver] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Verify session
                const uRes = await fetch(`${BASE_URL}/user-data`, { credentials: "include" });
                if (!uRes.ok) { navigate("/"); return; }
                const currUser = await uRes.json();
                setManagement(currUser);

                // Fetch driver details by Bus Number (adapting finding logic to DB)
                // We'll fetch all drivers and find the one with this bus number, 
                // or I could add a specific API. For now, using overview which is cached.
                const overRes = await fetch(`${BASE_URL}/api/management/overview`, { credentials: "include" });
                if (overRes.ok) {
                    const data = await overRes.json();
                    const found = data.buses.find(b => String(b.busNumber) === String(busNumber));
                    if (found) {
                        // Get full profile
                        const dRes = await fetch(`${BASE_URL}/api/management/user/driver/${found.driverId || found.driver_id}`, { credentials: "include" });
                        if (dRes.ok) {
                            setDriver(await dRes.json());
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to fetch driver details:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [busNumber, navigate]);

    if (loading) return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-yellow-400"></div>
        </div>
    );

    if (!driver) return (
        <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-6 text-center">
            <div>
                <h2 className="text-2xl font-black mb-4 uppercase tracking-tighter text-red-500">Unit Unassigned</h2>
                <p className="text-gray-500 mb-8 max-w-xs">This bus does not have a registered pilot in the secure database.</p>
                <button onClick={() => navigate("/management")} className="bg-yellow-400 text-black px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs">Return to Fleet</button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col font-sans">
            {/* Top Bar */}
            <div className="bg-black px-6 py-4 flex justify-between items-center border-b-4 border-yellow-400 shadow-xl z-50">
                <div className="flex items-center gap-3">
                    <div onClick={() => navigate("/management")} className="bg-white/10 p-2 rounded-lg cursor-pointer">←</div>
                    <h1 className="font-black text-lg tracking-tight uppercase tracking-tighter">Pilot <span className="text-yellow-400">Operations</span></h1>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-72 bg-black/50 backdrop-blur-md p-6 border-r border-white/5 flex flex-col gap-4">
                    <button onClick={() => navigate("/management")} className="w-full bg-yellow-400 text-black p-3 rounded-xl font-black text-sm shadow-lg shadow-yellow-400/20 flex items-center gap-3"><span>📊</span> Overview</button>
                    <button onClick={() => navigate("/management-dashboard")} className="w-full bg-white/5 text-gray-400 p-3 rounded-xl font-bold text-sm hover:bg-white/10 transition-all flex items-center gap-3"><span>🌍</span> Live Map</button>
                    <button onClick={() => navigate("/attendance")} className="w-full bg-white/5 text-gray-400 p-3 rounded-xl font-bold text-sm hover:bg-white/10 transition-all flex items-center gap-3"><span>📋</span> Attendance</button>
                    <button onClick={() => navigate("/routes")} className="w-full bg-white/5 text-gray-400 p-3 rounded-xl font-bold text-sm hover:bg-white/10 transition-all flex items-center gap-3"><span>🛣️</span> Routes</button>
                    <button onClick={() => navigate("/reports")} className="w-full bg-white/5 text-gray-400 p-3 rounded-xl font-bold text-sm hover:bg-white/10 transition-all flex items-center gap-3"><span>📄</span> Reports</button>
                </div>

                {/* Details Container */}
                <div className="flex-1 p-10 overflow-y-auto">
                    <div className="max-w-4xl mx-auto space-y-8">
                        <div className="bg-zinc-900 rounded-[40px] p-10 border border-white/5 shadow-2xl relative">
                            <h2 className="text-5xl font-black uppercase tracking-tighter mb-2 text-white">Bus {driver.bus_number || driver.busNumber}</h2>
                            <p className="text-yellow-400 font-bold uppercase tracking-[0.2em] text-[10px] mb-12">Flight Operations Command</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Assigned Pilot</p>
                                        <p className="text-2xl font-black text-white uppercase">{driver.full_name || driver.fullName}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Contact Payload</p>
                                        <p className="text-xl font-bold text-cyan-400">{driver.contact_number || driver.contact}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Service Tenure</p>
                                        <p className="text-xl font-bold text-white uppercase tracking-tight">{driver.joinDate || "EST. 2024"}</p>
                                    </div>
                                </div>

                                <div className="space-y-6 bg-black/40 p-8 rounded-[30px] border border-white/5">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-gray-400 uppercase">Operational Shift</span>
                                        <span className="text-xs font-black text-yellow-400 uppercase">{driver.shift || "MORNING"}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-gray-400 uppercase">License Status</span>
                                        <span className="text-[10px] font-black text-green-500 bg-green-500/10 px-3 py-1 rounded-full uppercase border border-green-500/20">Updated</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-gray-400 uppercase">Remuneration</span>
                                        <span className="text-xs font-black text-white">₹{driver.salary || "18,500"}</span>
                                    </div>
                                    <div className="pt-4 border-t border-white/5">
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 text-center underline">Safety Records</p>
                                        <p className="text-2xl font-black text-red-500 text-center">{driver.complaints || 0} INCIDENTS</p>
                                    </div>
                                </div>
                            </div>

                             <button className="mt-12 w-full bg-red-600/10 border border-red-600/20 py-4 text-xs font-black uppercase tracking-widest text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all active:scale-95 shadow-xl">
                                Terminate Assignment
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DriverDetails