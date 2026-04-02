import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import BottomNav from "./BottomNav"

function Account() {

    const [user, setUser] = useState(null)
    const [imagePreview, setImagePreview] = useState("/profile.png")
    const navigate = useNavigate()

    useEffect(() => {

        const storedUser = JSON.parse(localStorage.getItem("user"))

        if (!storedUser) {
            navigate("/")
        } else {
            setUser(storedUser)
            setImagePreview(storedUser.profileImage || "/profile.png")
        }

    }, [navigate])

    const handleChange = (e) => {

        const { name, value } = e.target

        setUser(prev => ({
            ...prev,
            [name]: value
        }))

    }

    const handleImageChange = (e) => {

        const file = e.target.files[0]
        if (!file) return

        const reader = new FileReader()

        reader.onloadend = () => {

            setImagePreview(reader.result)

            setUser(prev => ({
                ...prev,
                profileImage: reader.result
            }))

        }

        reader.readAsDataURL(file)

    }

    const handleSave = () => {

        localStorage.setItem("user", JSON.stringify(user))

        const users = JSON.parse(localStorage.getItem("users")) || []

        const updatedUsers = users.map(u =>
            u.email === user.email ? user : u
        )

        localStorage.setItem("users", JSON.stringify(updatedUsers))

        alert("Profile Updated Successfully ✅")

    }

    const handleLogout = () => {

        localStorage.removeItem("user")
        localStorage.removeItem("isLoggedIn")
        navigate("/")

    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-yellow-400 to-black text-white">
                Loading...
            </div>
        )
    }

    return (

        <div className="min-h-screen bg-gradient-to-b from-yellow-400 to-black p-6">

            <div className="flex flex-col items-center mb-6">

                <label className="cursor-pointer">
                    <img
                        src={imagePreview}
                        alt="profile"
                        className="w-28 h-28 rounded-full border-4 border-white shadow-lg object-cover"
                    />

                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                    />

                </label>

                <h2 className="text-xl font-bold mt-4 text-white">
                    Account Details
                </h2>

                <p className="text-white text-sm mt-1">
                    Tap image to change profile picture
                </p>

            </div>

            <div className="space-y-4">

                {[
                    { label: "Bus ID", name: "busId" },
                    { label: "Full Name", name: "fullName" },
                    { label: "Course", name: "course" },
                    { label: "Branch + Sem", name: "branchSem" },
                    { label: "Contact Number", name: "contact" },
                    { label: "Email ID", name: "email" },
                    { label: "Address", name: "address" }
                ].map((field, index) => (

                    <div key={index}>

                        <label className="text-white font-semibold">
                            {field.label}
                        </label>

                        <input
                            type="text"
                            name={field.name}
                            value={user[field.name] || ""}
                            onChange={handleChange}
                            className="w-full p-3 rounded-xl mt-1"
                        />

                    </div>

                ))}

                <button
                    onClick={handleSave}
                    className="w-full bg-green-500 text-white py-3 rounded-xl font-bold mt-4 active:scale-95 transition"
                >
                    Save Changes
                </button>

                <button
                    onClick={handleLogout}
                    className="w-full bg-red-500 text-white py-3 rounded-xl font-bold mt-2 active:scale-95 transition"
                >
                    Logout
                </button>

            </div>

            <BottomNav />

        </div>

    )
}

export default Account