// src/App.jsx
import CyberPanel from "./CyberPanel"
import "./index.css"  // 꼭 import 되어 있어야 함

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100">
      <CyberPanel />
    </div>
  )
}
