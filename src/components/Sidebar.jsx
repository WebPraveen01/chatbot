import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import messagelogo from '../assets/newchat.png'

function Sidebar({ onNewChat }) {
  return (
    <aside className="sidebar">

      <div className="sidebar-header">

        <div className="chatbot-logo">
            <img src= {messagelogo}/>
        </div>

        <Link
          to="/"
          className="new-chat-button"
          onClick={onNewChat}
        >
          <span>Want new suggestion?</span>
          <Plus size={22} aria-hidden="true" />
        </Link>

      </div>

      <div className="sidebar-content">

        <Link to="/history" className="history-link">
          Previous Suggestions
        </Link>

      </div>

    </aside>
  )
}

export default Sidebar
