import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"

function VehiclesReports() {

  const navigate = useNavigate()

  const [management, setManagement] = useState(null)
  const [drivers, setDrivers] = useState([])

  useEffect(() => {

    const currentUser = JSON.parse(localStorage.getItem("user"))
    const users = JSON.parse(localStorage.getItem("users")) || []

    if (!currentUser || currentUser.role !== "management") {
      navigate("/")
      return
    }

    setManagement(currentUser)

    const driverList = users.filter(u => u.role === "driver")
    setDrivers(driverList)

  }, [navigate])

  return (

    <div className="min-h-screen bg-black text-white flex flex-col">

      <div className="bg-black px-6 py-4 flex justify-between items-center border-b-4 border-yellow-400">

        <div className="flex items-center gap-3">
          <img src="/logo.png" className="w-10 h-10" />
          <h1 className="font-bold text-lg">
            WORLD COLLEGE OF TECHNOLOGY & MANAGEMENT
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="font-bold">{management?.fullName}</div>
            <div className="text-sm text-gray-400">Transportation Head</div>
          </div>
          <img src="/profile.png" className="w-10 h-10 rounded-full" />
        </div>

      </div>

      <div className="flex flex-1">

        <div className="w-72 bg-gray-900 p-4 space-y-2">

          <button onClick={() => navigate("/management-dashboard")} className="w-full bg-gray-700 py-2 rounded-lg">
            Bus List
          </button>

          <button onClick={() => navigate("/attendance")} className="w-full bg-gray-700 py-2 rounded-lg">
            Attendance
          </button>

          <button className="w-full bg-yellow-400 text-black py-2 rounded-lg font-semibold">
            Reports
          </button>

          <button onClick={() => navigate("/drivers")} className="w-full bg-gray-700 py-2 rounded-lg">
            Drivers
          </button>

          <button onClick={() => navigate("/routes")} className="w-full bg-gray-700 py-2 rounded-lg">
            Routes
          </button>

        </div>

        <div className="flex-1 p-6">

          <div className="flex justify-between mb-6">
            <h2 className="text-2xl text-yellow-400 font-bold">
              Vehicles Reports
            </h2>
            <button className="bg-yellow-400 text-black px-4 py-1 rounded">
              Print Report
            </button>
          </div>

          <div className="grid grid-cols-4 border-b border-gray-600 pb-2 font-semibold">
            <div>Buses</div>
            <div>Route</div>
            <div>Name of Driver</div>
            <div>Detailed Attendance</div>
          </div>

          {drivers.map((driver, index) => (

            <div key={index} className="grid grid-cols-4 border-b border-gray-700 py-3">

              <div>Bus {driver.busNumber}</div>
              <div>{driver.route || "WCTM TO XYZ"}</div>
              <div>{driver.fullName}</div>

              <button
                onClick={() => navigate(`/vehicle-report/${driver.busNumber}`)}
                className="text-cyan-400"
              >
                Check Details
              </button>

            </div>

          ))}

        </div>

      </div>

      <div className="bg-black flex justify-around py-3 border-t border-gray-700">
        <button onClick={() => navigate("/management-dashboard")}>Dashboard</button>
        <button>Live Map</button>
        <button onClick={() => navigate("/attendance")}>Attendance</button>
        <button className="text-yellow-400">Reports</button>
        <button>Management</button>
      </div>

    </div>

  )
}

export default VehiclesReports