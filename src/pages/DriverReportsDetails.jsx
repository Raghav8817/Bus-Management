import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function DriverReportDetails() {
    const navigate = useNavigate()
    const { driverId } = useParams()
    const [management, setManagement] = useState(null)
    const [driver, setDriver] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDriver = async () => {
            try {
                // Verify session
                const uRes = await fetch(`${BASE_URL}/user-data`, { credentials: "include" });
                if (!uRes.ok) { navigate("/"); return; }
                const currUser = await uRes.json();
                setManagement(currUser);

                // Fetch driver details from DB
                const dRes = await fetch(`${BASE_URL}/api/management/user/driver/${driverId}`, { credentials: "include" });
                if (dRes.ok) {
                    const data = await dRes.json();
                    setDriver(data);
                }
            } catch (err) {
                console.error("Failed to fetch driver:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDriver();
    }, [driverId, navigate]);

    if (loading) return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-yellow-400"></div>
        </div>
    );

    if (!driver) return (
        <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-6">
            <div className="text-center">
                <h2 className="text-2xl font-black mb-4">DRIVER NOT FOUND</h2>
                <button onClick={() => navigate("/driver-reports")} className="bg-yellow-400 text-black px-6 py-2 rounded-xl font-bold">Back to Reports</button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col font-sans">
            {/* Top Bar */}
            <div className="bg-black px-6 py-4 flex justify-between items-center border-b-4 border-yellow-400 shadow-xl z-50">
                <div className="flex items-center gap-3">
                    <div onClick={() => navigate("/driver-reports")} className="bg-white/10 p-2 rounded-lg cursor-pointer">←</div>
                    <h1 className="font-black text-lg tracking-tight uppercase">Driver <span className="text-yellow-400">Profile</span></h1>
                </div>
                <div className="text-right flex items-center gap-4">
                    <div className="hidden sm:block">
                        <div className="font-bold text-xs">{management?.fullName}</div>
                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Admin Control</div>
                    </div>
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
                    <div className="max-w-4xl mx-auto space-y-8">
                        {/* Driver Header Card */}
                        <div className="bg-zinc-900 rounded-[40px] p-8 border border-white/5 relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 p-8">
                                <span className="bg-green-500/10 text-green-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-500/20">Active Personnel</span>
                            </div>
                            
                            <div className="flex items-center gap-8 mb-10">
                                <div className="w-32 h-32 bg-gray-800 rounded-3xl flex items-center justify-center text-4xl border border-white/10">👤</div>
                                <div>
                                    <h2 className="text-4xl font-black uppercase tracking-tighter text-white">{driver.full_name || driver.fullName}</h2>
                                    <p className="text-yellow-400 font-bold uppercase tracking-widest text-xs mt-1">Pilot ID: {driver.driver_id || driver.driverId}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-black/40 p-5 rounded-3xl border border-white/5">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Assigned Unit</p>
                                    <p className="text-xl font-black text-white">BUS {driver.bus_number || driver.busNumber}</p>
                                </div>
                                <div className="bg-black/40 p-5 rounded-3xl border border-white/5">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Primary Route</p>
                                    <p className="text-xl font-black text-white">{driver.route || "MAIN ROUTE"}</p>
                                </div>
                                <div className="bg-black/40 p-5 rounded-3xl border border-white/5">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Shift Type</p>
                                    <p className="text-xl font-black text-white">{driver.shift || "FULL DAY"}</p>
                                </div>
                                <div className="bg-black/40 p-5 rounded-3xl border border-white/5">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Joining Date</p>
                                    <p className="text-xl font-black text-white">{driver.joinDate || "2024-01-15"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Secondary Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-zinc-900 rounded-[40px] p-8 border border-white/5 shadow-xl">
                                <h3 className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-6">Employment Analytics</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-3 border-b border-white/5">
                                        <span className="text-sm font-bold text-gray-400">Monthly Remuneration</span>
                                        <span className="text-sm font-black text-green-400">₹{driver.salary || "18,500"}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-white/5">
                                        <span className="text-sm font-bold text-gray-400">Payment Status</span>
                                        <span className="text-xs font-black uppercase bg-zinc-800 px-3 py-1 rounded-full text-zinc-400 border border-white/5">Processing</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3">
                                        <span className="text-sm font-bold text-gray-400">Total Safety Incidents</span>
                                        <span className="text-sm font-black text-red-400">{driver.complaints || 0} RECRDS</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-zinc-900 rounded-[40px] p-8 border border-white/5 shadow-xl">
                                <h3 className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-6">Compliance & Support</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-3 border-b border-white/5">
                                        <span className="text-sm font-bold text-gray-400">Primary Contact</span>
                                        <span className="text-sm font-black text-blue-400">{driver.contact_number || driver.contact}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-white/5">
                                        <span className="text-sm font-bold text-gray-400">Driver License ID</span>
                                        <span className="text-sm font-black text-white uppercase font-mono tracking-tighter">DL-{driver.driver_id || driver.driverId}X</span>
                                    </div>
                                     <div className="flex justify-between items-center py-3">
                                        <span className="text-sm font-bold text-gray-400">Emergency Address</span>
                                        <span className="text-xs font-black text-gray-500 max-w-[150px] text-right truncate">{driver.address || "GURGAON SECTOR 10"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Bar */}
                        <div className="flex gap-4">
                            <button className="flex-1 bg-white text-black py-4 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-yellow-400 transition-all shadow-xl active:scale-95">Print Driver File</button>
                            <button className="flex-1 bg-red-500/10 text-red-500 border border-red-500/20 py-4 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-red-500 hover:text-white transition-all active:scale-95">Deactivate Profile</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-black flex justify-around py-4 border-t border-white/5 z-50 sm:hidden">
                <button onClick={() => navigate("/management")} className="text-xs font-black text-gray-500">DASHBOARD</button>
                <button onClick={() => navigate("/reports")} className="text-xs font-black text-yellow-400">REPORTS</button>
            </div>
        </div>
    )
}

export default DriverReportDetails