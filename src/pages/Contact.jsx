import { useEffect, useState } from "react"
import BottomNav from "./BottomNav"

function Contact() {

    const [contacts, setContacts] = useState([])

    useEffect(() => {

        const storedContacts = JSON.parse(localStorage.getItem("transportContacts"))

        if (storedContacts) {
            setContacts(storedContacts)
        } else {

            const defaultContacts = [
                { role: "Bus Driver", name: "Rajesh Kumar", phone: "+91 9876543210" },
                { role: "Bus Conductor", name: "Amit Sharma", phone: "+91 9123456780" },
                { role: "Transport Incharge", name: "Mr. S. Verma", phone: "+91 9012345678" },
                { role: "Transport Office", name: "WCTM Transport Dept.", phone: "+91 9988776655" },
                { role: "College Management", name: "Management Office", phone: "+91 9090909090" },
                { role: "Principal", name: "Dr. A. K. Singh", phone: "+91 9871234567" }
            ]

            localStorage.setItem("transportContacts", JSON.stringify(defaultContacts))
            setContacts(defaultContacts)
        }

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