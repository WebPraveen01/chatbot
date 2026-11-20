import { useState } from 'react'
import { Star } from 'lucide-react'

import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import QuickSuggestions from '../components/QuickSuggestions'
import ChatInput from '../components/ChatInput'
import ChatMessages from '../components/ChatMessages'

import productsData from '../data/products.json'

import {
  saveConversation,
  getConversations,
  saveConversationRating
} from '../services/storage'

function Chat() {
  const [darkMode, setDarkMode] = useState(false)
  const [messages, setMessages] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [awaitingBudget, setAwaitingBudget] = useState(false)

  const [conversationId, setConversationId] = useState(
    () => `${Date.now()}-${Math.random()}`
  )

  const [saveStatus, setSaveStatus] = useState('')

  // Overall rating states
  const [showOverallRating, setShowOverallRating] = useState(false)
  const [overallRating, setOverallRating] = useState(0)
  const [overallFeedback, setOverallFeedback] = useState('')

  // Add a normal message with timestamp
  const addMessage = (sender, text) => {
    const now = new Date()

    const newMessage = {
      id: `${Date.now()}-${Math.random()}`,
      sender,
      text,
      time: now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      timestamp: now.toISOString()
    }

    setMessages(prev => [...prev, newMessage])
  }

  // Save the complete conversation
  const handleSave = () => {
    if (messages.length === 0) {
      setSaveStatus('There is no conversation to save.')
      return
    }

    const now = new Date()

    // Preserve any previously submitted overall rating
    const existingConversation = getConversations().find(
      conversation => conversation.id === conversationId
    )

    const conversation = {
      id: conversationId,
      title:
        messages.find(message => message.sender === 'user')?.text ||
        'Product Recommendation',
      messages: messages,
      createdAt: existingConversation?.createdAt || now.toISOString(),
      updatedAt: now.toISOString(),
      rating: existingConversation?.rating ?? null,
      feedback: existingConversation?.feedback ?? ''
    }

    const savedConversations = saveConversation(conversation)

    if (savedConversations) {
      setSaveStatus('Conversation saved successfully!')
      setShowOverallRating(true)
    } else {
      setSaveStatus('Unable to save conversation. Please try again.')
    }
  }

  // Submit overall conversation rating
  const handleOverallRatingSubmit = (e) => {
    e.preventDefault()

    if (overallRating === 0) {
      setSaveStatus('Please select a star rating.')
      return
    }

    const result = saveConversationRating(
      conversationId,
      overallRating,
      overallFeedback.trim()
    )

    if (result !== null) {
      setSaveStatus('Your overall rating and feedback have been saved!')

      setShowOverallRating(false)
      setOverallRating(0)
      setOverallFeedback('')
    } else {
      setSaveStatus('Unable to save your rating. Please try again.')
    }
  }

  const getBudgetPrompt = (product) => {
    if (product === 'Smartphone') {
      return 'Please select your budget (5000 - 10000, 10000 - 20000, 20000 - 50000).'
    }

    if (product === 'Laptop') {
      return 'Please select your budget (25000 - 50000, 50000 - 80000, 80000 - 150000).'
    }

    if (product === 'T-Shirt') {
      return 'Please select your budget (300 - 700, 700 - 1200, 1200 - 2000).'
    }

    if (product === 'Jeans') {
      return 'Please select your budget (500 - 1000, 1000 - 1500, 1500 - 2000).'
    }

    return `What is your budget for ${product}? Please enter a range (for example: 500 - 1000).`
  }

  // Handle product selection
  const handleProductSelect = (product) => {
    setSaveStatus('')
    setShowOverallRating(false)
    setSelectedProduct(product)
    setAwaitingBudget(true)

    addMessage('user', product)

    addMessage('bot', getBudgetPrompt(product))
  }

  // Handle user messages
  const handleSendMessage = (message) => {
    setSaveStatus('')
    setShowOverallRating(false)

    addMessage('user', message)

    if (awaitingBudget) {
      const budgetPattern = /^\s*₹?\s*(\d+)\s*[-–]\s*₹?\s*(\d+)\s*$/
      const match = message.match(budgetPattern)

      if (!match) {
        addMessage(
          'bot',
          'Please enter a valid budget range, for example: 500 - 1000.'
        )
        return
      }

      const minBudget = Number(match[1])
      const maxBudget = Number(match[2])

      if (selectedProduct === 'Smartphone') {
        const smartphoneRanges = ['5000-10000', '10000-20000', '20000-50000']
        const selectedRange = `${minBudget}-${maxBudget}`

        if (!smartphoneRanges.includes(selectedRange)) {
          addMessage('bot', getBudgetPrompt('Smartphone'))
          return
        }
      }

      if (selectedProduct === 'Laptop') {
        const laptopRanges = ['25000-50000', '50000-80000', '80000-150000']
        const selectedRange = `${minBudget}-${maxBudget}`

        if (!laptopRanges.includes(selectedRange)) {
          addMessage('bot', getBudgetPrompt('Laptop'))
          return
        }
      }

      if (selectedProduct === 'T-Shirt') {
        const tshirtRanges = ['300-700', '700-1200', '1200-2000']
        const selectedRange = `${minBudget}-${maxBudget}`

        if (!tshirtRanges.includes(selectedRange)) {
          addMessage('bot', getBudgetPrompt('T-Shirt'))
          return
        }
      }

      if (selectedProduct === 'Jeans') {
        const jeansRanges = ['500-1000', '1000-1500', '1500-2000']
        const selectedRange = `${minBudget}-${maxBudget}`

        if (!jeansRanges.includes(selectedRange)) {
          addMessage('bot', getBudgetPrompt('Jeans'))
          return
        }
      }

      // Filter products based on the selected budget
      const matchingProducts = productsData[selectedProduct].filter(
        product => product.price >= minBudget && product.price <= maxBudget
      )

      // Add product recommendations
      if (matchingProducts.length > 0) {
        const now = new Date()

        setMessages(prev => [
          ...prev,
          {
            id: `${Date.now()}-${Math.random()}`,
            sender: 'bot',
            type: 'product',
            text: `Your budget is ₹${minBudget} - ₹${maxBudget}. Here are your ${selectedProduct} recommendations:`,
            products: matchingProducts,
            time: now.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            }),
            timestamp: now.toISOString()
          }
        ])
      } else {
        addMessage(
          'bot',
          `Sorry, no ${selectedProduct} products found within your budget range.`
        )
      }

      setAwaitingBudget(false)
      return
    }

    // Detect a product name in a typed message
    const products = ['Jeans', 'Smartphone', 'Laptop', 'T-Shirt']

    const selected = products.find(product =>
      message.toLowerCase().includes(product.toLowerCase())
    )

    if (selected) {
      setSelectedProduct(selected)
      setAwaitingBudget(true)

      addMessage(
        'bot',
        getBudgetPrompt(selected)
      )
    } else {
      addMessage(
        'bot',
        'Sorry, I did not understand your query!'
      )
    }
  }

  // Start a new chat and save the previous conversation
  const handleNewChat = () => {
    if (messages.length > 0) {
      handleSave()
    }

    setMessages([])
    setSelectedProduct(null)
    setAwaitingBudget(false)

    setConversationId(`${Date.now()}-${Math.random()}`)

    setSaveStatus('')
    setShowOverallRating(false)
    setOverallRating(0)
    setOverallFeedback('')
  }

  return (
    <div className={`app-layout ${darkMode ? 'dark-mode' : ''}`}>
      <Sidebar onNewChat={handleNewChat} />

      <main className="main-content">
        <Header darkMode={darkMode} setDarkMode={setDarkMode} />

        <section className="chat-container">
          {messages.length === 0 ? (
            <>
              <div className="welcome-section">
                <h2>Hi, Please tell me what you want?</h2>
                <div className="chatbot-avatar">🤖</div>
              </div>

              <QuickSuggestions onSelectProduct={handleProductSelect} />
            </>
          ) : (
            <ChatMessages messages={messages} />
          )}
        </section>

        <div className="chat-input-wrapper">

          {saveStatus && (
            <p className="save-status">
              {saveStatus}
            </p>
          )}

          {/* Overall Conversation Rating Form */}
          {showOverallRating && (
            <form
              className="overall-rating-form"
              onSubmit={handleOverallRatingSubmit}
            >
              <h3>Rate Your Overall Experience</h3>

              <p>How would you rate this conversation?</p>

              <div className="overall-rating-stars">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    className={`overall-star-button ${
                      overallRating >= star ? 'selected' : ''
                    }`}
                    onClick={() => setOverallRating(star)}
                    aria-label={`Rate ${star} out of 5`}
                  >
                    <Star
                      size={30}
                      fill={
                        overallRating >= star
                          ? 'currentColor'
                          : 'none'
                      }
                    />
                  </button>
                ))}
              </div>

              <label htmlFor="overall-feedback">
                Additional Feedback
              </label>

              <textarea
                id="overall-feedback"
                value={overallFeedback}
                onChange={e => setOverallFeedback(e.target.value)}
                placeholder="Share your experience..."
                rows={3}
              />

              <button
                type="submit"
                className="overall-rating-submit"
                disabled={overallRating === 0}
              >
                Submit
              </button>
            </form>
          )}

          <ChatInput
            onSendMessage={handleSendMessage}
            onSave={handleSave}
          />

        </div>
      </main>
    </div>
  )
}

export default Chat
