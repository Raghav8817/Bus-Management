import { useState } from "react"
import { useNavigate } from "react-router-dom"
import BottomNav from "./BottomNav"

function Complaint() {

    const navigate = useNavigate()
    const [selectedType, setSelectedType] = useState("")
    const [complaintText, setComplaintText] = useState("")

    const complaintTypes = [
        "Driver Behaviour",
        "Bus Delay",
        "Overcrowding",
        "Route Issue",
        "Other"
    ]

    const handleSubmit = () => {
        if (!selectedType || !complaintText) {
            alert("Please select complaint type and write your complaint")
            return
        }

        alert("Complaint Submitted Successfully ✅")

        setSelectedType("")
        setComplaintText("")
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-yellow-400 to-black p-6">

            <h2 className="text-2xl font-bold text-center mb-6">
                Complaint Section
            </h2>

            {/* Complaint Type Buttons */}
            <div className="space-y-3 mb-6">

                {complaintTypes.map((type, index) => (
                    <button
                        key={index}
                        onClick={() => setSelectedType(type)}
                        className={`w-full py-3 rounded-xl font-semibold transition active:scale-95 
                            ${selectedType === type
                                ? "bg-red-600 text-white"
                                : "bg-white text-black"
                            }`}
                    >
                        {type}
                    </button>
                ))}

            </div>

            {/* Complaint Box */}
            <div className="mb-6">
                
                <textarea
                    value={complaintText}
                    onChange={(e) => setComplaintText(e.target.value)}
                    placeholder="Write your complaint here..."
                    rows="5"
                    className="w-full p-4 rounded-xl outline-none"
                />
            </div>

            {/* Submit Button */}
            <button
                onClick={handleSubmit}
                className="w-full bg-green-500 text-white py-3 rounded-xl font-bold active:scale-95 transition"
            >
                Submit Complaint
            </button>

            <BottomNav />

        </div>
    )
}

export default Complaint