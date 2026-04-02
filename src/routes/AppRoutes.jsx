import { BrowserRouter, Routes, Route } from "react-router-dom"
import StudentLogin from "../pages/student/StudentLogin"

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StudentLogin />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes