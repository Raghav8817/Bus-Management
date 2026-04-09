import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import BottomNav from "./BottomNav"

function Account() {

    const [user, setUser] = useState(null)
    const [imagePreview, setImagePreview] = useState("/profile.png")
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch(`${BASE_URL}/user-data`, { credentials: "include" });
                if (res.ok) {
                    const data = await res.json();
                    
                    const mappedUser = {
                        ...data,
                        busId: data.bus_id || data.busId,
                        fullName: data.full_name || data.fullName,
                        course: data.course,
                        branchSem: data.branch_semester || data.branchSem,
                        contact: data.contact_number || data.contact,
                        email: data.email_id || data.email,
                        address: data.address,
                        profileImage: data.profile_image || data.profileImage
                    }
                    
                    setUser(mappedUser);
                    setImagePreview(mappedUser.profileImage || "/profile.png");
                } else {
                    navigate("/");
                }
            } catch (err) {
                console.error(err);
                navigate("/");
            }
        };
        fetchUser();
    }, [navigate, BASE_URL])

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

        if (file.size > 2 * 1024 * 1024) {
            alert("Image too large (Max 2MB)");
            return;
        }

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

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/api/user-data`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fullName: user.fullName,
                    busId: user.busId,
                    course: user.course,
                    branchSem: user.branchSem,
                    contact: user.contact,
                    address: user.address,
                    profileImage: user.profileImage
                }),
                credentials: "include"
            });

            if (res.ok) {
                alert("Profile Updated Successfully ✅");
            } else {
                const result = await res.json();
                alert(`Error: ${result.error || "Update failed"}`);
            }
        } catch (err) {
            console.error(err);
            alert("Connection failed ⚠️");
        } finally {
            setLoading(false);
        }
    }

    const handleLogout = async () => {
        try {
            await fetch(`${BASE_URL}/logout`, {
                method: "POST",
                credentials: "include"
            });
        } catch (err) {
            console.error(err);
        }
        navigate("/");
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-yellow-400 to-black text-white">
                Loading...
            </div>
        )
    }

    return (

        <div className="min-h-screen bg-gradient-to-b from-yellow-400 to-black p-6 pb-24">

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
                    { label: "Full Name", name: "fullName" },
                    { label: "Bus ID", name: "busId" },
                    ...(user.role === 'student' ? [
                        { label: "Course", name: "course" },
                        { label: "Branch + Sem", name: "branchSem" }
                    ] : []),
                    { label: "Contact Number", name: "contact" },
                    { label: "Email ID (Verified)", name: "email", disabled: true },
                    { label: "Address", name: "address" }
                ].map((field, index) => (

                    <div key={index}>

                        <label className="text-white font-semibold ml-1">
                            {field.label}
                        </label>

                        <input
                            type="text"
                            name={field.name}
                            value={user[field.name] || ""}
                            onChange={handleChange}
                            disabled={field.disabled}
                            className={`w-full p-4 rounded-xl mt-1 font-bold ${field.disabled ? 'bg-black/20 text-white/50 cursor-not-allowed' : 'bg-white text-gray-800'}`}
                        />

                    </div>

                ))}

                <button
                    onClick={handleSave}
                    disabled={loading}
                    className={`w-full bg-green-500 text-white py-4 rounded-xl font-bold mt-4 shadow-lg active:scale-95 transition flex justify-center items-center ${loading ? 'opacity-70' : ''}`}
                >
                    {loading ? 'Saving Changes...' : 'Save Changes'}
                </button>

                <button
                    onClick={handleLogout}
                    className="w-full bg-red-500 text-white py-4 rounded-xl font-bold mt-2 shadow-lg active:scale-95 transition"
                >
                    Logout
                </button>

            </div>

            <BottomNav />

        </div>

    )
}

export default Account