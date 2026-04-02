import { useEffect, useState } from "react"
import BottomNav from "./BottomNav"

function Contact() {

    const [contacts, setContacts] = useState([])

    useEffect(() => {
        const fetchContacts = async () => {
            const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
            try {
                const res = await fetch(`${BASE_URL}/api/reports?type=transport_contacts`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.length > 0) {
                        setContacts(data[0].data);
                        return;
                    }
                }
                
                // If not found, use default and optionally post them to backend
                const defaultContacts = [
                    { role: "Bus Driver", name: "Rajesh Kumar", phone: "+91 9876543210" },
                    { role: "Bus Conductor", name: "Amit Sharma", phone: "+91 9123456780" },
                    { role: "Transport Incharge", name: "Mr. S. Verma", phone: "+91 9012345678" },
                    { role: "Transport Office", name: "WCTM Transport Dept.", phone: "+91 9988776655" },
                    { role: "College Management", name: "Management Office", phone: "+91 9090909090" },
                    { role: "Principal", name: "Dr. A. K. Singh", phone: "+91 9871234567" }
                ];
                
                setContacts(defaultContacts);
                
                // Seed them to the database
                fetch(`${BASE_URL}/api/reports`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        type: "transport_contacts",
                        referenceId: "default",
                        data: defaultContacts
                    })
                }).catch(console.error);

            } catch (err) {
                console.error(err);
            }
        };

        fetchContacts();
    }, [])

    return (

        <div className="min-h-screen bg-gradient-to-b from-yellow-400 to-black p-6">

            <div className="flex justify-center mb-6">
                <img src="/wctm-logo.png" alt="logo" className="w-40" />
            </div>

            <h1 className="text-2xl font-bold text-center text-white mb-6">
                Important Contacts
            </h1>

            <div className="bg-gray-700 text-white rounded-xl overflow-hidden shadow-lg">

                {contacts.map((contact, index) => (

                    <div
                        key={index}
                        className="flex flex-col border-b border-gray-500 px-4 py-4"
                    >

                        <span className="font-semibold text-yellow-300">
                            {contact.role}
                        </span>

                        <span className="text-lg font-bold">
                            {contact.name}
                        </span>

                        <div className="flex justify-between items-center mt-1">

                            <span>
                                {contact.phone}
                            </span>

                            <button
                                onClick={() => window.location.href = `tel:${contact.phone}`}
                                className="bg-green-500 px-3 py-1 rounded-lg text-sm font-semibold"
                            >
                                Call
                            </button>

                        </div>

                    </div>

                ))}

            </div>

            <BottomNav />

        </div>
    )
}

export default Contact