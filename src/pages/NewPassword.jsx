import { useNavigate } from "react-router-dom"
import { useState } from "react"

function NewPassword() {

  const navigate = useNavigate()

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = () => {
    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields")
    } else if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
    } else {
      setError("")
      navigate("/")
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">

      {/* bg */}
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
            type="password"
            placeholder="Enter New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border border-black rounded-lg px-4 py-3 mb-4 outline-none"
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border border-black rounded-lg px-4 py-3 mb-4 outline-none"
          />

          {error && (
            <p className="text-red-500 text-sm mb-3 text-center">
              {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            className="w-full bg-cyan-500 text-white py-3 rounded-lg font-semibold"
          >
            Back to Login Page
          </button>

        </div>

      </div>

    </div>
  )
}

export default NewPassword