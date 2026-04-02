import { useState, useEffect } from "react"
import { Phone, AlertTriangle } from "lucide-react"
import BottomNav from "./BottomNav"

function SOS() {

  const [contactName, setContactName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")

  // Load saved contact
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("sos_contact"))
    if (saved) {
      setContactName(saved.name)
      setPhoneNumber(saved.phone)
    }
  }, [])

  // Save contact
  const handleSave = () => {
    if (!contactName || !phoneNumber) {
      alert("Please enter contact name and number.")
      return
    }

    localStorage.setItem(
      "sos_contact",
      JSON.stringify({ name: contactName, phone: phoneNumber })
    )

    alert("Emergency contact saved ✅")
  }

  const handleDial = () => {
    if (!phoneNumber) {
      alert("No phone number found.")
      return
    }

    window.location.href = `tel:${phoneNumber}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-500 to-black p-6 pb-24 text-white">

      {/* SOS ICON */}
      <div className="flex flex-col items-center mt-6">
        <div className="bg-white p-6 rounded-full shadow-2xl">
          <AlertTriangle size={60} className="text-red-600" />
        </div>

        <h1 className="text-3xl font-bold mt-4 tracking-wide">
          EMERGENCY SOS
        </h1>
      </div>

      {/* CONTACT SECTION */}
      <div className="mt-10 bg-white text-black rounded-3xl p-6 shadow-xl space-y-4">

        <h2 className="text-lg font-bold text-center">
          Priority Contact Information
        </h2>

        <input
          type="text"
          placeholder="Contact Name"
          value={contactName}
          onChange={(e) => setContactName(e.target.value)}
          className="w-full p-3 rounded-xl border"
        />

        <input
          type="tel"
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="w-full p-3 rounded-xl border"
        />

        <button
          onClick={handleSave}
          className="w-full bg-black text-white py-3 rounded-xl font-semibold"
        >
          Save Contact
        </button>

        <button
          onClick={handleDial}
          className="w-full bg-red-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
        >
          <Phone size={18} />
          Dial Priority Number
        </button>

      </div>

      <BottomNav />

    </div>
  )
}

export default SOS