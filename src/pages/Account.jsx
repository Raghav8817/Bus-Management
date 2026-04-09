import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import BottomNav from "./BottomNav"

function Account() {
    const [user, setUser] = useState(null)
    const [imagePreview, setImagePreview] = useState("/profile.png")
    const [loading, setLoading] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
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
        setUser(prev => ({ ...prev, [name]: value }))
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
            setUser(prev => ({ ...prev, profileImage: reader.result }))
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
                setIsEditing(false);
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
            await fetch(`${BASE_URL}/logout`, { method: "POST", credentials: "include" });
        } catch (err) { console.error(err); }
        navigate("/");
    }

    if (!user) return (
        <div className="min-h-screen bg-[#262626] flex items-center justify-center text-yellow-400 font-black uppercase text-2xl tracking-widest">
            Loading...
        </div>
    )

    const profileFields = [
        { label: "Bus I'D", name: "busId", value: user.busId },
        { label: "Full Name", name: "fullName", value: user.fullName },
        ...(user.role === 'student' ? [
            { label: "Course", name: "course", value: user.course },
            { label: "Branch + Sem", name: "branchSem", value: user.branchSem }
        ] : []),
        { label: "Contact Number", name: "contact", value: user.contact },
        { label: "GMail I'd", name: "email", value: user.email, disabled: true },
        { label: "Address", name: "address", value: user.address }
    ]

    return (
        <div className="min-h-screen relative overflow-hidden bg-[#262626] font-sans pb-28 text-white">
            {/* Soft Gradient Background Split */}
            <div
                className="absolute inset-0"
                style={{
                    background: "linear-gradient(115deg, #facc15 0%, #facc15 40%, rgba(0,0,0,0.2) 42%, #262626 45%, #262626 100%)"
                }}
            />

            <div className="relative z-10 px-6 py-10 flex flex-col items-center">
                
                {/* Avatar Section */}
                <div className="relative mb-6">
                    <label className={isEditing ? "cursor-pointer group" : ""}>
                        <div className="w-36 h-36 rounded-full border-[6px] border-[#262626] shadow-2xl overflow-hidden bg-white">
                            <img src={imagePreview} alt="profile" className="w-full h-full object-cover group-hover:opacity-75 transition-opacity" />
                        </div>
                        {isEditing && (
                            <div className="absolute bottom-1 right-1 bg-cyan-400 p-2 rounded-full shadow-lg border-2 border-[#262626]">
                                <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                            </div>
                        )}
                    </label>
                </div>

                {/* Header Pill */}
                <div className="bg-cyan-400 text-black px-12 py-3 rounded-full font-black text-xl uppercase mb-10 shadow-xl border-2 border-white/10 tracking-wider">
                    My Account
                </div>

                {/* Profile Fields */}
                <div className="w-full max-w-md space-y-4">
                    {profileFields.map((field, idx) => (
                        <div key={idx} className="relative">
                            {isEditing && !field.disabled ? (
                                <div className="space-y-1">
                                    <span className="text-white text-[10px] font-black uppercase ml-4 tracking-widest">{field.label}</span>
                                    <input
                                        type="text"
                                        name={field.name}
                                        value={user[field.name] || ""}
                                        onChange={handleChange}
                                        placeholder={field.label}
                                        className="w-full bg-yellow-400 text-black border-none rounded-[20px] px-8 py-4 outline-none font-black text-lg placeholder:text-black/40 shadow-lg"
                                    />
                                </div>
                            ) : (
                                <div className="w-full bg-yellow-400 text-black rounded-[20px] px-8 py-4 shadow-lg flex flex-col items-start transition-all hover:scale-[1.02]">
                                    <span className="text-[10px] opacity-40 font-black uppercase tracking-tighter mb-0.5">{field.label}</span>
                                    <span className="font-black text-lg truncate w-full">{field.value || "---"}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Buttons */}
                <div className="w-full max-w-md mt-10 space-y-4">
                    {!isEditing ? (
                        <>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="w-full bg-cyan-400 hover:bg-cyan-500 text-black py-4 rounded-[22px] font-black text-xl uppercase tracking-widest shadow-xl active:scale-95 transition-all border-2 border-white/5"
                            >
                                Edit Profile
                            </button>
                            <button
                                onClick={handleLogout}
                                className="w-full bg-[#1a1a1a] hover:bg-black text-red-500 py-4 rounded-[22px] font-black text-xl uppercase tracking-widest shadow-xl active:scale-95 transition-all border-2 border-red-500/20"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <div className="flex gap-4">
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="flex-1 bg-cyan-400 hover:bg-cyan-500 text-black py-4 rounded-[22px] font-black text-xl uppercase tracking-widest shadow-xl active:scale-95 transition-all border-2 border-white/5"
                            >
                                {loading ? "..." : "Save"}
                            </button>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="flex-1 bg-red-500/10 text-red-500 py-4 rounded-[22px] font-black text-xl uppercase tracking-widest shadow-xl active:scale-95 transition-all border-2 border-red-500/20"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <BottomNav />
        </div>
    )
}

export default Account