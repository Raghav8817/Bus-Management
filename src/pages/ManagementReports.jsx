import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function ManagementReports() {
    const navigate = useNavigate()
    const [management, setManagement] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const uRes = await fetch(`${BASE_URL}/user-data`, { credentials: "include" });
                if (!uRes.ok) { navigate("/"); return; }
                const currentUser = await uRes.json();
                if (currentUser.role !== "management") { navigate("/"); return; }
                
                setManagement({ 
                    fullName: currentUser.full_name || currentUser.fullName, 
                    role: currentUser.role 
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [navigate]);

    const reportCategories = [
        { title: "Attendance Reports", desc: "Detailed records of student and driver attendance.", path: "/attendance-reports", icon: "📋" },
        { title: "Drivers Reports", desc: "Performance, contact, and assigned bus data.", path: "/driver-reports", icon: "👤" },
        { title: "Routes Reports", desc: "Mapping, road paths, and waypoint details.", path: "/routes-reports", icon: "🛣️" },
        { title: "Vehicles Reports", desc: "Fleet status, bus numbers, and registration.", path: "/vehicle-reports", icon: "🚌" },
        { title: "License Reports", desc: "Manage driver legal documentation and expires.", path: "/licence-reports", icon: "🆔" },
        { title: "Accident Reports", desc: "Log and review safety incidents and history.", path: "/accident-reports", icon: "⚠️" },
    ];

    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col font-sans">
            {/* Top Bar */}
            <div className="bg-black px-6 py-4 flex justify-between items-center border-b-4 border-yellow-400 shadow-xl z-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center text-black font-black text-xl">W</div>
                    <h1 className="font-black text-lg tracking-tight uppercase">
                        Reports <span className="text-yellow-400">Center</span>
                    </h1>
                </div>

                <div className="text-right flex items-center gap-4">
                    <div className="hidden sm:block">
                        <div className="font-bold text-sm leading-none">{management?.fullName}</div>
                        <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-1">Admin Head</div>
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
                <div className="flex-1 p-8 overflow-y-auto">
                    <h2 className="text-3xl font-black mb-2 uppercase tracking-tight">Printable Reports</h2>
                    <p className="text-gray-500 mb-8 font-medium">Access and generate official transport documentation</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {reportCategories.map((report, idx) => (
                            <div 
                                key={idx}
                                onClick={() => navigate(report.path)}
                                className="bg-zinc-900 border border-white/5 p-6 rounded-3xl hover:bg-zinc-800 transition-all cursor-pointer group hover:border-yellow-400/30 shadow-2xl"
                            >
                                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform origin-left">{report.icon}</div>
                                <h3 className="text-lg font-black text-white mb-2">{report.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed mb-6">{report.desc}</p>
                                <div className="text-[10px] font-black uppercase text-yellow-400/60 group-hover:text-yellow-400 flex items-center gap-2">
                                    Generate Report <span>→</span>
                                </div>
                            </div>
                        ))}
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
                <button className="flex flex-col items-center gap-1 text-yellow-400">
                    <span className="text-xl">📄</span>
                    <span className="text-[9px] font-black uppercase">Reports</span>
                </button>
            </div>
        </div>
    )
}

export default ManagementReports