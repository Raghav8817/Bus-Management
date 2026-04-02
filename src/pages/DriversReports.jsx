import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"

function DriverReports() {

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

      {/* HEADER */}

      <div className="bg-black px-6 py-4 flex justify-between items-center border-b-4 border-yellow-400">

        <h1 className="font-bold text-lg">
          WORLD COLLEGE OF TECHNOLOGY & MANAGEMENT
        </h1>

        <div className="text-right">
          <div className="font-bold">{management?.fullName}</div>
          <div className="text-sm text-gray-400">
            Transportation Head
          </div>
        </div>

      </div>


      <div className="flex flex-1">

        {/* SIDEBAR */}

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


        {/* TABLE */}

        <div className="flex-1 p-6">

          <div className="flex justify-between mb-6">

            <h2 className="text-2xl text-yellow-400 font-bold">
              Drivers Reports
            </h2>

            <button className="bg-yellow-400 text-black px-4 py-1 rounded">
              Print Report
            </button>

          </div>


          <div className="grid grid-cols-5 border-b border-gray-600 pb-2 font-semibold">

            <div>Name</div>
            <div>Bus</div>
            <div>Shift</div>
            <div>Salary</div>
            <div>Details</div>

          </div>


          {drivers.map((driver, index) => (

            <div
              key={index}
              className="grid grid-cols-5 border-b border-gray-700 py-3"
            >

              <div>{driver.fullName}</div>

              <div>Bus {driver.busNumber}</div>

              <div>{driver.shift}</div>

              <div>{driver.salary}</div>

              <button
                onClick={() => navigate(`/driver-report/${driver.id}`)}
                className="text-cyan-400"
              >
                Check Details
              </button>

            </div>

          ))}

        </div>

      </div>


      {/* BOTTOM NAV */}

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

export default DriverReports