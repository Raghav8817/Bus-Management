import { useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"

function RouteReportDetails() {

  const navigate = useNavigate()
  const { busId } = useParams()

  const [routes, setRoutes] = useState([])

  useEffect(() => {

    const routeData = JSON.parse(localStorage.getItem("routes")) || []

    const busRoute = routeData.filter(
      r => String(r.busNumber) === String(busId)
    )

    setRoutes(busRoute)

  }, [busId])


  return (

    <div className="min-h-screen bg-black text-white flex flex-col">

      {/* HEADER */}

      <div className="bg-black px-6 py-4 border-b-4 border-yellow-400 text-center font-bold text-lg">
        WORLD COLLEGE OF TECHNOLOGY & MANAGEMENT
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
              {busId} Number Bus Route Report
            </h2>

            <button className="bg-yellow-400 text-black px-4 py-1 rounded">
              Print Report
            </button>

          </div>


          <div className="grid grid-cols-4 border-b border-gray-600 pb-2 font-semibold">

            <div>Bus Stop No.</div>
            <div>Bus Route</div>
            <div className="text-green-400">ADD STOP</div>
            <div className="text-red-400">REMOVE STOP</div>

          </div>


          {routes.map((route, index) => (

            <div
              key={index}
              className="grid grid-cols-4 border-b border-gray-700 py-3"
            >

              <div>{index + 1}</div>

              <div>{route.stop}</div>

              <button className="text-green-400">
                Add
              </button>

              <button className="text-red-400">
                Stop
              </button>

            </div>

          ))}

        </div>

      </div>


      {/* BOTTOM NAV */}

      <div className="bg-black flex justify-around py-3 border-t border-gray-700">

        <button onClick={() => navigate("/management-dashboard")}>
          Dashboard
        </button>

        <button>Live Map</button>

        <button onClick={() => navigate("/attendance")}>
          Attendance
        </button>

        <button className="text-yellow-400">
          Reports
        </button>

        <button>Management</button>

      </div>

    </div>

  )
}

export default RouteReportDetails