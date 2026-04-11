import { useState, useEffect } from "react"
import { Phone, AlertTriangle } from "lucide-react"
import { useNavigate } from "react-router-dom"
import BottomNav from "./BottomNav"

function SOS() {

  const navigate = useNavigate()

  const [contacts, setContacts] = useState([])
  const [timer, setTimer] = useState(15)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("sos_contacts")) || []
    setContacts(saved)
  }, [])

  useEffect(() => {
    if (!active) return

    if (timer === 0) {
      handleEmergencyCall()
      return
    }

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [active, timer])

  const startSOS = () => {
    const validContacts = contacts.filter(c => c.name && c.phone)
    if (validContacts.length === 0) {
      alert("Add Contact Information first")
      return
    }
    setActive(true)
    setTimer(15)
  }

  const handleSafe = () => {
    setActive(false)
    setTimer(15)
  }

  const handleEmergencyCall = () => {
    const validContacts = contacts.filter(c => c.name && c.phone)
    if (validContacts.length === 0) {
      alert("Add Contact Information first")
      return
    }

    const firstContact = validContacts[0]
    window.location.href = `tel:${firstContact.phone}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-500 to-black p-6 pb-24 text-white">

      <div className="flex flex-col items-center mt-6">
        <div className="bg-white p-6 rounded-full shadow-2xl">
          <AlertTriangle size={60} className="text-red-600" />
        </div>

        <h1 className="text-3xl font-bold mt-4 tracking-wide">
          EMERGENCY SOS
        </h1>
      </div>

      {!active ? (
        <div className="mt-10 text-center">
          <button
            onClick={startSOS}
            className="bg-red-600 px-10 py-4 rounded-full text-lg font-bold shadow-xl animate-pulse"
          >
            ACTIVATE SOS
          </button>
        </div>
      ) : (
        <div className="mt-10 bg-white text-black rounded-3xl p-6 shadow-xl text-center space-y-6">

          <h2 className="text-xl font-bold">
            Emergency Triggered
          </h2>

          <p className="text-lg font-semibold text-red-600">
            Calling in {timer} seconds...
          </p>

          <div className="flex flex-col gap-4">

            <button
              onClick={handleSafe}
              className="bg-green-500 text-white py-3 rounded-xl font-bold"
            >
              I am Safe
            </button>

            <button
              onClick={handleEmergencyCall}
              className="bg-red-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <Phone size={18} />
              I am in Danger
            </button>

          </div>

        </div>
      )}

      <div className="mt-6 text-center">
        <button
          onClick={() => navigate("/edit-sos")}
          className="underline text-sm text-white/80"
        >
          Edit Emergency Contacts
        </button>
      </div>

      <BottomNav />

    </div>
  )
}

export default SOS