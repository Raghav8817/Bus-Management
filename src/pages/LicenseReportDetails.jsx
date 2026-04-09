import { useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function LicenceReportDetails() {
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
                        licenceStatus: data.licenceStatus || "Active",
                        licenceNumber: data.licenceNumber || `DL-${id}X234`,
                        expiryDate: data.expiryDate || "2027-05-20"
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

    const isActive = driver?.licenceStatus === "Active";

    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col font-sans">
            {/* Top Bar */}
            <div className="bg-black px-6 py-4 flex justify-between items-center border-b-4 border-yellow-400 shadow-xl z-50">
                <div className="flex items-center gap-3">
                    <div onClick={() => navigate("/licence-reports")} className="bg-white/10 p-2 rounded-lg cursor-pointer text-sm">←</div>
                    <h1 className="font-black text-lg tracking-tight uppercase">Compliance <span className="text-yellow-400">Audit</span></h1>
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
                                <h1 className="text-3xl font-black uppercase tracking-tighter text-white">{driver?.full_name || driver?.fullName}</h1>
                                <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-1">Official Licensing Report</p>
                            </div>
                            <button className="bg-white text-black px-6 py-2.5 rounded-xl text-[10px] font-black uppercase hover:bg-yellow-400 transition-all">Print Audit</button>
                        </div>

                        <div className="bg-zinc-900 rounded-[40px] border border-white/5 overflow-hidden shadow-2xl">
                            <div className="grid grid-cols-2 bg-white/5 px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 border-b border-white/5">
                                <div>Credential Field</div>
                                <div>Verification Status</div>
                            </div>

                            <div className="divide-y divide-white/5 px-8">
                                <div className="grid grid-cols-2 py-6 items-center">
                                    <div className="text-sm font-bold text-gray-400 uppercase">License Status</div>
                                    <div className="flex justify-between items-center">
                                        <span className={`text-xs font-black uppercase px-3 py-1 rounded-full border ${isActive ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                            {isActive ? "Verified / Valid" : "Expired / Invalid"}
                                        </span>
                                        {!isActive && <button className="bg-red-500 text-white text-[10px] font-black px-4 py-1.5 rounded-xl uppercase shadow-lg shadow-red-500/20">Revoke Duty</button>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 py-6">
                                    <div className="text-sm font-bold text-gray-400 uppercase">Credential ID</div>
                                    <div className="text-sm font-black text-white font-mono tracking-tighter underline decoration-yellow-400/30">{driver?.licenceNumber}</div>
                                </div>

                                <div className="grid grid-cols-2 py-6">
                                    <div className="text-sm font-bold text-gray-400 uppercase">Issuing RTO</div>
                                    <div className="text-sm font-black text-white">Haryana Transport Authority</div>
                                </div>

                                <div className="grid grid-cols-2 py-6">
                                    <div className="text-sm font-bold text-gray-400 uppercase">Outstanding Fines</div>
                                    <div className="text-sm font-black text-yellow-400 font-mono">03 PENDING CHALAAN</div>
                                </div>

                                <div className="grid grid-cols-2 py-6">
                                    <div className="text-sm font-bold text-gray-400 uppercase">Expiry Deadline</div>
                                    <div className="text-sm font-black text-white">{driver?.expiryDate}</div>
                                </div>

                                <div className="grid grid-cols-2 py-6 items-center">
                                    <div className="text-sm font-bold text-gray-400 uppercase">Digital Card</div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-zinc-500 uppercase">Not Uploaded</span>
                                        <button className="text-yellow-400 text-[10px] font-black uppercase hover:underline">Request Scan</button>
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

export default LicenceReportDetails