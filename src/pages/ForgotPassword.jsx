import { useNavigate } from "react-router-dom"
import { useState } from "react"

function ForgotPassword() {

  const navigate = useNavigate()

  const [busId, setBusId] = useState("")
  const [contact, setContact] = useState("")
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")

  const handleCreatePassword = () => {
    if (!busId || !contact || !otp) {
      setError("Please fill in all fields")
    } else {
      setError("")
      navigate("/new-password")
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">

      {/* Background */}
      <div
        className="absolute inset-0 bg-yellow-400"
        style={{
          clipPath: "polygon(0 0, 65% 0, 45% 100%, 0% 100%)"
        }}
      />

      <div className="relative z-10 px-6 py-10 flex flex-col min-h-screen">

        {/* WCTM Logo */}
        <div className="flex justify-center mb-12">
          <img
            src="/wctm-logo.png"
            alt="WCTM Logo"
            className="w-40 h-40 object-contain"
          />
        </div>

        {/* Card */}
        <div className="bg-white border border-black rounded-2xl p-6 shadow-md max-w-md w-full mx-auto">

          <input
            type="text"
            placeholder="Bus ID"
            value={busId}
            onChange={(e) => setBusId(e.target.value)}
            className="w-full border border-black rounded-lg px-4 py-3 mb-4 outline-none"
          />

          <input
            type="text"
            placeholder="Contact Number / Email"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            className="w-full border border-black rounded-lg px-4 py-3 mb-4 outline-none"
          />

          <button className="w-full bg-cyan-500 text-white py-3 rounded-lg font-semibold mb-4">
            Send OTP
          </button>

          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full border border-black rounded-lg px-4 py-3 mb-4 outline-none"
          />

          {error && (
            <p className="text-red-500 text-sm mb-3 text-center">
              {error}
            </p>
          )}

          {/* Create New Password Button */}
          <button
            onClick={handleCreatePassword}
            className="w-full bg-cyan-500 text-white py-3 rounded-lg font-semibold"
          >
            Create New Password
          </button>

        </div>

      </div>

    </div>
  )
}

export default ForgotPassword