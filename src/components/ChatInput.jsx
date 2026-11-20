
import { useState } from 'react'
import { Send, Save } from 'lucide-react'

function ChatInput({ onSendMessage, onSave }) {

  const [input, setInput] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!input.trim()) return

    onSendMessage(input)

    setInput('')
  }

  const handleSave = () => {
    onSave()
  }

  return (
    <form className="chat-input-container" onSubmit={handleSubmit}>

      <input type="text" placeholder="Please tell me about your query!" value={input} onChange={(e) => setInput(e.target.value)} />

      <button type="submit" className="ask-button">
        <Send size={18} />
        Ask
      </button>

      <button type="button" className="save-button" onClick={handleSave}>
        <Save size={18} />
        Save
      </button>

    </form>
  )
}

export default ChatInput
