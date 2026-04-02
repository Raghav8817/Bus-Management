import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import BottomNav from "./BottomNav"

function BusFeeStatus() {

    const navigate = useNavigate()
    const [user, setUser] = useState(null)

    useEffect(() => {

        const storedUser = JSON.parse(localStorage.getItem("user"))

        if (!storedUser) {
            navigate("/")
        } else {
            setUser(storedUser)
        }

    }, [navigate])

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-yellow-400 to-black text-white">
                Loading...
            </div>
        )
    }

    const totalFee = 100000
    const paidAmount = 60000
    const fine = 10000
    const pendingAmount = totalFee - paidAmount + fine

    return (
        <div className="min-h-screen bg-gradient-to-b from-yellow-400 to-black p-6">

            <div className="flex justify-center mb-6">
                <img src="/wctm-logo.png" alt="logo" className="w-40" />
            </div>

            <button className="w-full bg-red-500 text-white py-3 rounded-xl font-bold mb-6">
                BUS FEE STATUS
            </button>

            <div className="bg-gray-700 text-white rounded-xl overflow-hidden shadow-lg">

                {[
                    ["BUS ID", user.busId],
                    ["NAME", user.fullName],
                    ["COURSE", user.course],
                    ["BRANCH + SEM", user.branchSem],
                    ["CONTACT", user.contact],
                    ["TOTAL FEE", `₹ ${totalFee.toLocaleString()}`],
                    ["PAID", `₹ ${paidAmount.toLocaleString()}`],
                    ["FINE", `₹ ${fine.toLocaleString()}`],
                    ["PENDING", `₹ ${pendingAmount.toLocaleString()}`],
                ].map(([label, value], i) => (
                    <div
                        key={i}
                        className="flex justify-between border-b border-gray-500 px-4 py-3"
                    >
                        <span className="font-semibold">{label}</span>
                        <span>{value || "-"}</span>
                    </div>
                ))}

            </div>

            <button
                className="w-full bg-cyan-400 text-black py-3 rounded-xl font-bold mt-6 active:scale-95 transition"
                onClick={() => alert("Receipt Downloaded ✅")}
            >
                DOWNLOAD RECEIPT
            </button>

            <BottomNav />

        </div>
    )
}

export default BusFeeStatus