import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

function EditSOS() {

  const navigate = useNavigate()

  const [contacts, setContacts] = useState([
    { name: "", phone: "" },
    { name: "", phone: "" },
    { name: "", phone: "" }
  ])

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("sos_contacts"))
    if (saved) setContacts(saved)
  }, [])

  const handleChange = (index, field, value) => {
    const updated = [...contacts]
    updated[index][field] = value
    setContacts(updated)
  }

  const handleSave = () => {
    const validContacts = contacts.filter(c => c.name && c.phone)

    if (validContacts.length === 0) {
      alert("Please enter at least one valid contact")
      return
    }

    localStorage.setItem("sos_contacts", JSON.stringify(contacts))
    alert("Contacts saved ✅")
    navigate("/sos")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-500 to-black p-6 text-white">

      <h1 className="text-2xl font-bold text-center mb-6">
        Edit Emergency Contacts
      </h1>

      <div className="space-y-4">

        {contacts.map((contact, index) => (
          <div key={index} className="bg-white text-black p-4 rounded-2xl space-y-2 shadow-xl">

            <input
              type="text"
              placeholder={`Contact ${index + 1} Name`}
              value={contact.name}
              onChange={(e) =>
                handleChange(index, "name", e.target.value)
              }
              className="w-full p-3 rounded-xl border outline-none"
            />

            <input
              type="tel"
              placeholder="Phone Number"
              value={contact.phone}
              onChange={(e) =>
                handleChange(index, "phone", e.target.value)
              }
              className="w-full p-3 rounded-xl border outline-none"
            />

          </div>
        ))}

      </div>

      <button
        onClick={handleSave}
        className="w-full mt-6 bg-black text-white py-3 rounded-xl font-bold shadow-lg"
      >
        Save Contacts
      </button>

    </div>
  )
}

export default EditSOS