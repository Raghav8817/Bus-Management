import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import BackButton from "./BackButton"

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function InfoPage() {
    const navigate = useNavigate()
    const [info, setInfo] = useState({
        contact_phone: "Loading...",
        contact_email: "Loading...",
        college_address: "Loading...",
        transport_hours: "Loading..."
    })

    useEffect(() => {
        const fetchInfo = async () => {
            try {
                const res = await fetch(`${BASE_URL}/api/site-config`);
                if (res.ok) {
                    const data = await res.json();
                    setInfo(data);
                }
            } catch (err) {
                console.error("Failed to fetch site config:", err);
            }
        };
        fetchInfo();
    }, []);

    return (
        <div className="min-h-screen bg-black text-white font-sans relative overflow-hidden">
             {/* Background Decoration */}
             <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[10%] left-[-5%] w-[40%] h-[40%] bg-yellow-400/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[100px]"></div>
            </div>

            <div className="relative z-10 px-6 py-10 flex flex-col min-h-screen">
                <div className="flex items-center justify-between mb-12">
                    <BackButton />
                    <h1 className="text-2xl font-black uppercase tracking-tighter">Campus <span className="text-yellow-400">Hub</span></h1>
                    <div className="w-10"></div>
                </div>

                <div className="space-y-6">
                    <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 p-8 rounded-[40px] shadow-2xl">
                        <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center text-black mb-6 shadow-lg shadow-yellow-400/20">
                            <span className="text-2xl">📞</span>
                        </div>
                        <h3 className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2">Support Helpline</h3>
                        <p className="text-2xl font-black text-white">{info.contact_phone}</p>
                    </div>

                    <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 p-8 rounded-[40px] shadow-2xl">
                        <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center text-black mb-6 shadow-lg shadow-yellow-400/20">
                            <span className="text-2xl">✉️</span>
                        </div>
                        <h3 className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2">Official Email</h3>
                        <p className="text-xl font-black text-white truncate">{info.contact_email}</p>
                    </div>

                    <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 p-8 rounded-[40px] shadow-2xl">
                        <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center text-black mb-6 shadow-lg shadow-yellow-400/20">
                            <span className="text-2xl">⏰</span>
                        </div>
                        <h3 className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2">Transport Hours</h3>
                        <p className="text-xl font-black text-white">{info.transport_hours}</p>
                    </div>

                    <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 p-8 rounded-[40px] shadow-2xl flex items-start gap-4">
                        <div className="flex-1">
                             <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center text-black mb-6 shadow-lg shadow-yellow-400/20">
                                <span className="text-2xl">📍</span>
                            </div>
                            <h3 className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2">Campus Location</h3>
                            <p className="text-lg font-bold text-gray-300 leading-tight">{info.college_address}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-auto pt-10 text-center">
                    <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-600 mb-4">Version 2.4.0 • Enterprise Fleet</p>
                    <button 
                        onClick={() => navigate("/contact")}
                        className="w-full bg-white text-black py-4 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-yellow-400 transition-all shadow-xl shadow-white/5 active:scale-95"
                    >
                        Emergency Contact List
                    </button>
                </div>
            </div>
        </div>
    )
}

export default InfoPage