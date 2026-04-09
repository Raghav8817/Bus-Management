import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { MapContainer, TileLayer, Marker, useMap, Polyline } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Fix Leaflet Icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

// Tool to capture clicks on map for waypoints
function MapEvents({ onMapClick }) {
    const map = useMap();
    useEffect(() => {
        map.on("click", (e) => {
            onMapClick([e.latlng.lat, e.latlng.lng]);
        });
        return () => map.off("click");
    }, [map, onMapClick]);
    return null;
}

function ManagementRoutes() {
    const navigate = useNavigate()
    const [management, setManagement] = useState(null)
    const [buses, setBuses] = useState([])
    const [editingBus, setEditingBus] = useState(null)
    const [newRouteName, setNewRouteName] = useState("")
    const [tempWaypoints, setTempWaypoints] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchData = async () => {
        try {
            const userRes = await fetch(`${BASE_URL}/user-data`, { credentials: "include" });
            if (!userRes.ok) { navigate("/"); return; }
            const userData = await userRes.json();
            if (userData.role !== "management") { navigate("/"); return; }
            setManagement(userData);

            const overRes = await fetch(`${BASE_URL}/api/management/overview`, { credentials: "include" });
            if (overRes.ok) {
                const data = await overRes.json();
                setBuses(data.buses);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { fetchData(); }, []);

    const startEditing = (bus) => {
        setEditingBus(bus);
        setNewRouteName(bus.route || "");
        // Parse waypoints if they exist
        try {
            const pts = typeof bus.waypoints === 'string' ? JSON.parse(bus.waypoints) : bus.waypoints;
            setTempWaypoints(pts || []);
        } catch(e) { setTempWaypoints([]); }
    };

    const handleSave = async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/management/driver-route`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    busId: editingBus.busId,
                    route: newRouteName,
                    waypoints: tempWaypoints
                }),
                credentials: "include"
            });

            if (res.ok) {
                setEditingBus(null);
                fetchData();
            } else {
                alert("Failed to save route");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const addWaypoint = (latlng) => {
        setTempWaypoints([...tempWaypoints, latlng]);
    };

    const clearWaypoints = () => setTempWaypoints([]);

    const removeWaypoint = (idx) => {
        setTempWaypoints(tempWaypoints.filter((_, i) => i !== idx));
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col font-sans">
            {/* Top Bar */}
            <div className="bg-black px-6 py-4 flex justify-between items-center border-b-4 border-yellow-400 shadow-xl z-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center text-black font-black text-xl">W</div>
                    <h1 className="font-black text-lg tracking-tight uppercase">
                        Route <span className="text-yellow-400">Management</span>
                    </h1>
                </div>
                <div className="text-right flex items-center gap-4">
                    <div className="font-bold text-sm">{management?.full_name || management?.fullName}</div>
                    <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-yellow-400 font-bold border border-white/10">
                        {management?.full_name?.charAt(0)}
                    </div>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-72 bg-black/50 backdrop-blur-md p-6 border-r border-white/5 flex flex-col gap-4">
                    <button onClick={() => navigate("/management")} className="w-full bg-white/5 text-gray-400 p-3 rounded-xl font-bold text-sm hover:bg-white/10 transition-all flex items-center gap-3"><span>📊</span> Overview</button>
                    <button onClick={() => navigate("/management-dashboard")} className="w-full bg-white/5 text-gray-400 p-3 rounded-xl font-bold text-sm hover:bg-white/10 transition-all flex items-center gap-3"><span>🌍</span> Live Map</button>
                    <button onClick={() => navigate("/attendance")} className="w-full bg-white/5 text-gray-400 p-3 rounded-xl font-bold text-sm hover:bg-white/10 transition-all flex items-center gap-3"><span>📋</span> Attendance</button>
                    <button className="w-full bg-yellow-400 text-black p-3 rounded-xl font-black text-sm shadow-lg shadow-yellow-400/20 flex items-center gap-3"><span>🛣️</span> Routes</button>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-8 overflow-y-auto">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-3xl font-black uppercase tracking-tight">Active Bus Routes</h2>
                            <p className="text-gray-500 font-medium">Define and assign road paths for your fleet</p>
                        </div>
                    </div>

                    {!editingBus ? (
                        <div className="bg-zinc-900/50 rounded-3xl border border-white/5 overflow-hidden">
                            <div className="grid grid-cols-5 bg-white/5 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-white/5">
                                <div>Bus</div>
                                <div className="col-span-2">Assigned Route Path</div>
                                <div>Stops</div>
                                <div className="text-right">Manage</div>
                            </div>
                            {buses.map((bus) => (
                                <div key={bus.busId} className="grid grid-cols-5 items-center px-6 py-5 border-b border-white/5 hover:bg-white/[0.02] transition-all">
                                    <div className="font-black text-white text-lg">BUS {bus.busNumber}</div>
                                    <div className="col-span-2">
                                        <span className="bg-yellow-400/10 text-yellow-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-yellow-400/20">
                                            {bus.route || "UNASSIGNED"}
                                        </span>
                                    </div>
                                    <div className="text-gray-400 text-xs font-bold">
                                         {bus.waypoints ? (typeof bus.waypoints === 'string' ? JSON.parse(bus.waypoints).length : bus.waypoints.length) : 0} Waypoints
                                    </div>
                                    <div className="text-right">
                                        <button onClick={() => startEditing(bus)} className="bg-white/5 hover:bg-white/20 px-4 py-2 rounded-xl text-xs font-black uppercase border border-white/5 transition-all">
                                            Edit Route
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* ROUTE BUILDER TOOL */
                        <div className="grid grid-cols-12 gap-8 h-full min-h-[500px]">
                            <div className="col-span-4 flex flex-col gap-6 bg-zinc-900/50 p-6 rounded-3xl border border-white/5">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-2">Route Name</label>
                                    <input 
                                        type="text" 
                                        value={newRouteName} 
                                        onChange={(e) => setNewRouteName(e.target.value)}
                                        className="w-full bg-black border border-white/10 p-3 rounded-xl text-sm font-bold focus:border-yellow-400 outline-none transition-all"
                                        placeholder="e.g. Sector 14 to WCTM Campus"
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Waypoints List</label>
                                        <button onClick={clearWaypoints} className="text-[9px] text-red-400 font-bold uppercase hover:underline">Clear All</button>
                                    </div>
                                    <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                                        {tempWaypoints.map((pt, idx) => (
                                            <div key={idx} className="bg-black/40 p-2 rounded-lg flex justify-between items-center border border-white/5 group">
                                                <span className="text-[10px] font-mono text-gray-400">Stop {idx+1}: {pt[0].toFixed(4)}, {pt[1].toFixed(4)}</span>
                                                <button onClick={() => removeWaypoint(idx)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-all text-sm">×</button>
                                            </div>
                                        ))}
                                        {tempWaypoints.length === 0 && <p className="text-xs text-gray-600 italic">No points selected. Click on the map to add stops.</p>}
                                    </div>
                                </div>

                                <div className="mt-auto flex gap-3">
                                    <button onClick={() => setEditingBus(null)} className="flex-1 bg-white/5 py-3 rounded-xl text-xs font-black uppercase hover:bg-white/10 transition-all">Cancel</button>
                                    <button onClick={handleSave} className="flex-1 bg-yellow-400 text-black py-3 rounded-xl text-xs font-black uppercase shadow-lg shadow-yellow-400/20 hover:scale-[1.02] transition-all">Save Route</button>
                                </div>
                            </div>

                            <div className="col-span-8 bg-zinc-800 rounded-3xl overflow-hidden border border-white/10 relative">
                                <div className="absolute top-4 left-4 z-[1000] bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-[10px] font-black uppercase tracking-widest text-yellow-400">
                                    Click Map to Add Stops
                                </div>
                                <MapContainer center={[28.4595, 77.0266]} zoom={12} className="h-full w-full">
                                    <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                                    <MapEvents onMapClick={addWaypoint} />
                                    {tempWaypoints.map((pt, i) => (
                                        <Marker key={i} position={pt} />
                                    ))}
                                    {tempWaypoints.length > 1 && (
                                        <Polyline positions={tempWaypoints} color="#facc15" weight={3} dashArray="5, 10" />
                                    )}
                                </MapContainer>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 10px; }
            `}</style>
        </div>
    )
}

export default ManagementRoutes