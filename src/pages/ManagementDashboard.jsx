import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap,
} from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet-routing-machine"

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Custom Icons
const activeBusIcon = (busNumber) => L.divIcon({
    className: "",
    html: `
    <div style="position:relative; width:48px; height:48px;">
      <!-- Pulsing sonar effect -->
      <div style="position:absolute; inset:-12px; background:#facc15; border-radius:50%; opacity:0.4; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="position:absolute; inset:-24px; background:#facc15; border-radius:50%; opacity:0.2; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      
      <!-- Main Marker -->
      <div style="
        width:48px; height:48px; 
        background:#facc15; 
        border:4px solid #000; 
        border-radius:14px; 
        display:flex; flex-direction:column; align-items:center; justify-content:center; 
        box-shadow: 0 10px 25px rgba(250,204,21,0.5);
        transform: translateY(-5px);
        transition: transform 0.3s;
      ">
        <span style="font-size:22px; line-height:1;">🚌</span>
        <span style="font-size:10px; font-weight:900; color:black; margin-top:-2px; background:white; padding:0 4px; border-radius:4px; border:1px solid black;">#${busNumber}</span>
      </div>
      
      <!-- Pointy Stick -->
      <div style="
        position:absolute; bottom:-8px; left:50%; transform:translateX(-50%);
        width:0; height:0; 
        border-left:8px solid transparent; border-right:8px solid transparent; 
        border-top:10px solid #000;
      "></div>
    </div>`,
    iconSize: [48, 48],
    iconAnchor: [24, 48],
    popupAnchor: [0, -45],
})

const idleBusIcon = (busNumber) => L.divIcon({
    className: "",
    html: `
    <div style="position:relative; width:40px; height:40px;">
      <div style="
        width:40px; height:40px; 
        background:#3f3f46; 
        border:3px solid #fff; 
        border-radius:12px; 
        display:flex; flex-direction:column; align-items:center; justify-content:center; 
        opacity:0.9;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      ">
        <span style="font-size:18px; line-height:1;">🚌</span>
        <span style="font-size:8px; font-weight:800; color:white; margin-top:-1px;">#${busNumber}</span>
      </div>
    </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
})

const offlineBusIcon = (busNumber) => L.divIcon({
    className: "",
    html: `
    <div style="position:relative; width:34px; height:34px;">
      <div style="
        width:34px; height:34px; 
        background:#18181b; 
        border:2px dashed #52525b; 
        border-radius:10px; 
        display:flex; flex-direction:column; align-items:center; justify-content:center; 
        opacity:0.6;
      ">
        <span style="font-size:14px; line-height:1;">🚌</span>
        <span style="font-size:7px; font-weight:700; color:#71717a;">#${busNumber}</span>
      </div>
    </div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17],
})

const COLLEGE_COORDS = [28.4595, 77.0266];

// --- ADVANCED ROUTING COMPONENT ---
function RoutingMachine({ waypoints }) {
    const map = useMap();
    const routingControlRef = useRef(null);

    useEffect(() => {
        if (!map || !waypoints || waypoints.length < 2) {
            if (routingControlRef.current) {
                map.removeControl(routingControlRef.current);
                routingControlRef.current = null;
            }
            return;
        }

        // Remove existing control
        if (routingControlRef.current) {
            map.removeControl(routingControlRef.current);
        }

        const lWaypoints = waypoints.map(wp => L.latLng(wp[0], wp[1]));

        routingControlRef.current = L.Routing.control({
            waypoints: lWaypoints,
            lineOptions: {
                styles: [{ color: "#3b82f6", weight: 6, opacity: 0.8 }] // Premium blue road path
            },
            createMarker: () => null, // Hide internal markers
            addWaypoints: false,
            routeWhileDragging: false,
            draggableWaypoints: false,
            fitSelectedRoutes: false,
            show: false // Hide instructions UI
        }).addTo(map);

        return () => {
            if (routingControlRef.current) {
                map.removeControl(routingControlRef.current);
            }
        };
    }, [map, waypoints]);

    return null;
}

// Component to fit all markers in view or focus on one
function FitAllBuses({ buses, focusBus }) {
    const map = useMap()
    useEffect(() => {
        if (focusBus) {
            const lat = parseFloat(focusBus.latitude) || COLLEGE_COORDS[0];
            const lng = parseFloat(focusBus.longitude) || COLLEGE_COORDS[1];
            map.flyTo([lat, lng], 16, { duration: 1.5 })
        } else {
            const allPoints = buses.map(b => [
                parseFloat(b.latitude) || COLLEGE_COORDS[0],
                parseFloat(b.longitude) || COLLEGE_COORDS[1]
            ])
            if (allPoints.length > 0) {
                map.fitBounds(L.latLngBounds(allPoints), { padding: [50, 50], maxZoom: 15 })
            }
        }
    }, [buses, focusBus, map])
    return null
}

function ManagementDashboard() {
    const navigate = useNavigate()
    const [management, setManagement] = useState(null)
    const [buses, setBuses] = useState([])
    const [summary, setSummary] = useState({
        totalBuses: 0,
        totalStudents: 0,
        totalPresent: 0,
        totalAbsent: 0,
        ongoingTrips: 0
    })
    const [focusBus, setFocusBus] = useState(null);
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
                setSummary(data.summary);
                
                // Keep focus object updated with new coordinates
                if (focusBus) {
                    const updated = data.buses.find(b => b.busId === focusBus.busId);
                    if (updated) setFocusBus(updated);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000); // Faster polling for live road tracking
        return () => clearInterval(interval);
    }, [focusBus]);

    const logout = async () => {
        try {
            await fetch(`${BASE_URL}/logout`, { method: "POST", credentials: "include" });
            navigate("/login");
        } catch(e) { navigate("/login"); }
    }

    // Helper to extract waypoints
    const getWaypointsForBus = (bus) => {
        if (!bus || !bus.waypoints) return [];
        try {
            return typeof bus.waypoints === 'string' ? JSON.parse(bus.waypoints) : bus.waypoints;
        } catch(e) { return []; }
    };

    return (
        <div className="h-screen bg-gray-950 text-white flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-black border-b-2 border-yellow-400 px-6 py-3 flex items-center justify-between shadow-2xl z-50">
                <div className="flex items-center gap-4">
                    <div className="bg-yellow-400 w-10 h-10 rounded-xl flex items-center justify-center font-black text-black text-xl">W</div>
                    <div>
                        <h1 className="text-sm font-black tracking-tight leading-none uppercase">WCTM Transport <span className="text-yellow-400">Control</span></h1>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Road Intelligence Map</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex gap-4">
                        <div className="text-center">
                            <p className="text-[9px] text-gray-500 font-black uppercase">Fleet Status</p>
                            <p className="text-sm font-black text-yellow-400">{summary.ongoingTrips}/{summary.totalBuses} active</p>
                        </div>
                    </div>
                    <button onClick={logout} className="bg-red-500/10 text-red-500 px-4 py-2 rounded-xl text-xs font-black hover:bg-red-500/20 transition-all uppercase">
                        Logout
                    </button>
                </div>
            </div>

            <div className="flex flex-1 relative">
                {/* Stats Sidebar Overlay */}
                <div className="absolute top-6 left-6 z-[1000] flex flex-col gap-3 w-64 pointer-events-none">
                    <div className="bg-black/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl pointer-events-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Select Unit</h3>
                            {focusBus && (
                                <button 
                                    onClick={() => setFocusBus(null)}
                                    className="text-[9px] text-yellow-400 font-black bg-yellow-400/10 px-2 py-1 rounded-full uppercase"
                                >
                                    View ALL
                                </button>
                            )}
                        </div>
                        
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {buses.map(bus => (
                                <div 
                                    key={bus.busId} 
                                    onClick={() => setFocusBus(bus)}
                                    className={`flex items-center justify-between border-b border-white/5 pb-2 cursor-pointer hover:bg-white/5 p-2 rounded-xl transition-all ${focusBus?.busId === bus.busId ? 'bg-yellow-400/10 border-yellow-400/20' : ''}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${bus.tripActive ? 'bg-yellow-400 animate-pulse shadow-[0_0_8px_#facc15]' : 'bg-zinc-700'}`}></div>
                                        <div className="flex flex-col">
                                            <span className={`text-xs font-black ${focusBus?.busId === bus.busId ? 'text-yellow-400' : 'text-white'}`}>BUS {bus.busNumber}</span>
                                            <span className="text-[8px] text-gray-500 font-bold uppercase">{bus.route || "Default Route"}</span>
                                        </div>
                                    </div>
                                    <span className={`text-[9px] font-black uppercase ${bus.tripActive ? 'text-yellow-400' : 'text-gray-600'}`}>
                                        {bus.tripActive ? 'Track' : 'Idle'}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <button 
                            onClick={() => navigate("/management")}
                            className="w-full mt-6 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all font-sans"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                </div>

                {/* Map Container */}
                <div className="flex-1 bg-zinc-900">
                    <MapContainer
                        center={[28.4595, 77.0266]}
                        zoom={12}
                        style={{ height: "100%", width: "100%" }}
                        zoomControl={false}
                        attributionControl={false}
                    >
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            attribution='&copy; CARTO'
                        />

                        {/* Roadmap Rendering */}
                        <RoutingMachine waypoints={getWaypointsForBus(focusBus)} />

                        {/* All Bus Markers */}
                        {buses.map((bus) => {
                            const lat = parseFloat(bus.latitude) || COLLEGE_COORDS[0];
                            const lng = parseFloat(bus.longitude) || COLLEGE_COORDS[1];
                            const isOffline = !bus.latitude || !bus.longitude;

                            return (
                                <Marker 
                                    key={bus.busId} 
                                    position={[lat, lng]} 
                                    icon={bus.tripActive ? activeBusIcon(bus.busNumber) : (isOffline ? offlineBusIcon(bus.busNumber) : idleBusIcon(bus.busNumber))}
                                    opacity={isOffline ? 0.6 : 1}
                                >
                                    <Popup className="custom-popup" closeButton={false}>
                                        <div className="p-1 min-w-[140px]">
                                            <p className="text-[10px] font-black text-gray-500 uppercase">Unit Intel</p>
                                            <h4 className="font-black text-sm mt-0.5 tracking-tight">BUS {bus.busNumber}</h4>
                                            <p className="text-[10px] text-yellow-400 font-bold uppercase mb-2">{bus.route || "Default Route"}</p>
                                            
                                            <div className="mt-2 space-y-1">
                                                <p className="text-[10px] font-bold">Pilot: <span className="text-white">{bus.fullName || "Unassigned"}</span></p>
                                                <p className="text-[10px] font-bold text-green-400">Boarding: {bus.presentStudents}/{bus.totalStudents}</p>
                                                
                                                <div className="mt-2 p-2 bg-white/5 rounded-lg">
                                                    <p className="text-[9px] font-black uppercase text-gray-400">System Status</p>
                                                    <p className={`text-[10px] font-bold mt-0.5 ${bus.tripActive ? 'text-yellow-400' : (isOffline ? 'text-red-500' : 'text-gray-400')}`}>
                                                        {bus.tripActive ? '● LIVE TRACKING' : (isOffline ? '⚠ OFFLINE / IDLE' : '○ STATIONARY')}
                                                    </p>
                                                </div>
                                                
                                                {bus.lastUpdated && (
                                                    <p className="text-[8px] text-gray-600 font-bold uppercase mt-2 text-center italic">
                                                        Last Sync: {new Date(bus.lastUpdated).toLocaleTimeString()}
                                                    </p>
                                                )}
                                            </div>
                                            
                                            {bus.contact && (
                                              <a 
                                                href={`tel:${bus.contact}`} 
                                                className="block mt-3 bg-blue-500 text-white text-[10px] font-black text-center py-2 rounded-lg uppercase tracking-widest transition-all hover:bg-blue-600 shadow-lg shadow-blue-500/20"
                                              >
                                                Emergency Comms
                                              </a>
                                            )}
                                        </div>
                                    </Popup>
                                </Marker>
                            );
                        })}

                        <FitAllBuses buses={buses} focusBus={focusBus} />
                    </MapContainer>
                </div>
            </div>

            {/* Bottom Nav */}
            <div className="bg-black flex justify-around py-4 border-t border-white/5 z-50">
                <button onClick={() => navigate("/management")} className="flex flex-col items-center gap-1 text-gray-600 hover:text-white transition-all">
                    <span className="text-xl">📊</span>
                    <span className="text-[9px] font-black uppercase">Overview</span>
                </button>
                <div className="flex flex-col items-center gap-1 text-yellow-400 scale-110">
                    <span className="text-xl">🌍</span>
                    <span className="text-[9px] font-black uppercase">Live Map</span>
                </div>
                <button onClick={() => navigate("/attendance")} className="flex flex-col items-center gap-1 text-gray-600 hover:text-white transition-all">
                    <span className="text-xl">📋</span>
                    <span className="text-[9px] font-black uppercase">Attendance</span>
                </button>
                <button onClick={() => navigate("/reports")} className="flex flex-col items-center gap-1 text-gray-600 hover:text-white transition-all">
                    <span className="text-xl">📄</span>
                    <span className="text-[9px] font-black uppercase">Reports</span>
                </button>
            </div>
            
            <style>{`
                .custom-popup .leaflet-popup-content-wrapper {
                    background: #09090b;
                    color: white;
                    border-radius: 20px;
                    border: 1px solid rgba(255,255,255,0.1);
                    padding: 6px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.8);
                }
                .custom-popup .leaflet-popup-tip { background: #09090b; }
                .leaflet-routing-container { display: none !important; } /* Hide instructions UI */
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 10px; }
            `}</style>
        </div>
    )
}

export default ManagementDashboard