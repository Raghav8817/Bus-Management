import { useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function AccidentReportDetails() {
    const navigate = useNavigate()
    const { id } = useParams()
    const [management, setManagement] = useState(null)
    const [driver, setDriver] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                // Verify session
                const uRes = await fetch(`${BASE_URL}/user-data`, { credentials: "include" });
                if (!uRes.ok) { navigate("/"); return; }
                const currUser = await uRes.json();
                setManagement(currUser);

                // Fetch driver details from DB
                const dRes = await fetch(`${BASE_URL}/api/management/user/driver/${id}`, { credentials: "include" });
                if (dRes.ok) {
                    const data = await dRes.json();
                    setDriver({
                        ...data,
                        accidents: data.accidents || 0,
                        lastIncidentLocation: "Main Highway Intersection",
                        totalFines: "₹2,500"
                    });
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id, navigate]);

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
                    <div onClick={() => navigate("/accident-reports")} className="bg-white/10 p-2 rounded-lg cursor-pointer text-sm">←</div>
                    <h1 className="font-black text-lg tracking-tight uppercase tracking-tighter text-red-500">Safe <span className="text-white">Audit</span></h1>
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
                        <div className="flex justify-between items-end mb-10 bg-zinc-900 p-8 rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden">
                             <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-red-500/10 rounded-full blur-3xl"></div>
                             <div className="relative z-10">
                                <h1 className="text-3xl font-black uppercase tracking-tighter text-white">{driver?.full_name || driver?.fullName}</h1>
                                <p className="text-red-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">Incident History Report</p>
                            </div>
                            <button className="bg-white text-black px-6 py-2.5 rounded-xl text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-all">Export Log</button>
                        </div>

                        <div className="bg-zinc-900 rounded-[40px] border border-white/5 overflow-hidden shadow-2xl">
                             <div className="grid grid-cols-2 bg-white/5 px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 border-b border-white/5">
                                <div>Log Parameter</div>
                                <div>Recorded Data</div>
                            </div>

                            <div className="divide-y divide-white/5 px-8">
                                <div className="grid grid-cols-2 py-6 items-center">
                                    <div className="text-sm font-bold text-gray-400 uppercase">Incident Count</div>
                                    <div className="flex justify-between items-center">
                                        <span className={`text-sm font-black ${driver?.accidents > 0 ? 'text-red-500 font-mono' : 'text-green-500'}`}>
                                            {driver?.accidents || 0} SEVERE LOGS
                                        </span>
                                        {driver?.accidents > 0 && <button className="bg-red-500 text-white text-[10px] font-black px-4 py-1.5 rounded-xl uppercase">Issue Warning</button>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 py-6">
                                    <div className="text-sm font-bold text-gray-400 uppercase">Primary Location</div>
                                    <div className="text-sm font-black text-white">{driver?.lastIncidentLocation}</div>
                                </div>

                                <div className="grid grid-cols-2 py-6">
                                    <div className="text-sm font-bold text-gray-400 uppercase">RTO Chalaan Amnt</div>
                                    <div className="text-sm font-black text-red-400 font-mono underline decoration-red-400/20">{driver?.totalFines}</div>
                                </div>

                                <div className="grid grid-cols-2 py-6">
                                    <div className="text-sm font-bold text-gray-400 uppercase">Student Casualties</div>
                                    <div className="text-sm font-black text-green-500 uppercase tracking-widest">ZERO (CLEAN REC)</div>
                                </div>

                                <div className="grid grid-cols-2 py-6">
                                    <div className="text-sm font-bold text-gray-400 uppercase">Insurance Claim</div>
                                    <div className="text-sm font-black text-white">NA / NOT FILED</div>
                                </div>

                                <div className="grid grid-cols-2 py-6 items-center">
                                    <div className="text-sm font-bold text-gray-400 uppercase">Investigation Status</div>
                                    <span className="text-[10px] font-black uppercase py-1 px-3 bg-zinc-800 text-zinc-500 rounded-full w-fit">Closed - No Action</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-black flex justify-around py-4 border-t border-white/5 z-50 sm:hidden">
                <button onClick={() => navigate("/management")} className="text-[10px] font-black text-gray-600">DASHBOARD</button>
                <button onClick={() => navigate("/reports")} className="text-[10px] font-black text-yellow-500">REPORTS</button>
            </div>
        </div>
    )
}

export default AccidentReportDetails