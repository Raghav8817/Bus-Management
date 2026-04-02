import { useEffect, useState } from "react"

function InfoPage() {

    const [info, setInfo] = useState({
        student: {
            fullName: "",
            course: "",
            contact: ""
        },
        management: {
            hodName: "",
            contact: ""
        },
        driver: {
            name: "",
            contact: ""
        },
        conductor: {
            name: "",
            contact: ""
        }
    })

    useEffect(() => {

        const storedInfo = JSON.parse(localStorage.getItem("contactInfo"))

        if (storedInfo) {
            setInfo(storedInfo)
        }

    }, [])

    return (

        <div className="min-h-screen bg-gray-800 p-4">

            <div className="bg-cyan-400 text-center font-bold text-lg py-3 rounded-xl mb-6">
                INFO PAGE ℹ️
            </div>

            <div className="space-y-6">

                <div className="bg-cyan-400 rounded-2xl p-4">
                    <h2 className="text-center font-bold text-lg mb-3">
                        STUDENT
                    </h2>

                    <div className="bg-yellow-400 rounded-xl p-3 mb-3">
                        {info.student.fullName || "Full Name"}
                    </div>

                    <div className="bg-yellow-400 rounded-xl p-3 mb-3">
                        {info.student.course || "Course + Branch + sem"}
                    </div>

                    <div className="bg-yellow-400 rounded-xl p-3">
                        {info.student.contact || "Contact"}
                    </div>
                </div>

                <div className="bg-cyan-400 rounded-2xl p-4">
                    <h2 className="text-center font-bold text-lg mb-3">
                        MANAGEMENT
                    </h2>

                    <div className="bg-yellow-400 rounded-xl p-3 mb-3">
                        {info.management.hodName || "H.O.D Name"}
                    </div>

                    <div className="bg-yellow-400 rounded-xl p-3">
                        {info.management.contact || "Contact"}
                    </div>
                </div>

                <div className="bg-cyan-400 rounded-2xl p-4">
                    <h2 className="text-center font-bold text-lg mb-3">
                        DRIVER
                    </h2>

                    <div className="bg-yellow-400 rounded-xl p-3 mb-3">
                        {info.driver.name || "Name"}
                    </div>

                    <div className="bg-yellow-400 rounded-xl p-3">
                        {info.driver.contact || "Contact"}
                    </div>
                </div>

                <div className="bg-cyan-400 rounded-2xl p-4">
                    <h2 className="text-center font-bold text-lg mb-3">
                        CONDUCTOR
                    </h2>

                    <div className="bg-yellow-400 rounded-xl p-3 mb-3">
                        {info.conductor.name || "Name"}
                    </div>

                    <div className="bg-yellow-400 rounded-xl p-3">
                        {info.conductor.contact || "Contact"}
                    </div>
                </div>

            </div>

        </div>

    )
}

export default InfoPage