import { RouterProvider } from "react-router"
import { router } from "@/router/Router"
import { MaintenanceGate } from "./components/system/MaintenanceGate"

function App() {
  return (
    <MaintenanceGate>
      <RouterProvider router={router} />
    </MaintenanceGate>
  )
}

export default App
