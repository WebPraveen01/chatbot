
import { Sun, Moon } from 'lucide-react'

function Header({ darkMode, setDarkMode }) {
  return (
    <header className="main-header">

      <h1>Product Recommendation AI</h1>

      <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
     <span>{darkMode ? 'Dark' : 'Light'}</span>
     {darkMode ? ( <Moon size={25} />) : ( <Sun size={25} />)}
      </button>

    </header>
  )
}

export default Header
