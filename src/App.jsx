import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './app.css'
import Chat from './pages/Chat'
import History from './pages/History'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Chat />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App