import { useState } from "react"
import BottomNav from "./BottomNav"

function Suggestions() {

  const [suggestion, setSuggestion] = useState("")
  const [message, setMessage] = useState("")

  const handleSubmit = () => {
    if (!suggestion.trim()) {
      setMessage("Please write a suggestion before submitting")
    } else {
      setMessage("Suggestion submitted successfully ✅")
      setSuggestion("")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-400 to-black p-6">

      <button className="w-full bg-green-500 text-black py-3 rounded-xl font-bold mb-6">
        SUGGESTIONS
      </button>

      <textarea
        value={suggestion}
        onChange={(e) => setSuggestion(e.target.value)}
        placeholder="Write your suggestion here..."
        className="w-full h-64 rounded-xl p-4 mb-4"
      />

      {message && (
        <p className="text-white text-center mb-4 font-semibold">
          {message}
        </p>
      )}

      <button
        onClick={handleSubmit}
        className="w-full bg-cyan-500 text-white py-3 rounded-xl font-bold active:scale-95 transition"
      >
        Submit
      </button>

      <BottomNav />

    </div>
  )
}

export default Suggestions