
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Star } from 'lucide-react'

import Sidebar from '../components/Sidebar'

import {
  getConversations,
  getFeedback
} from '../services/storage'

import botImage from '../assets/bot.png'

// Get message date
const getMessageDate = (message, conversation) => {
  return new Date(
    message.timestamp || message.createdAt || conversation.createdAt
  )
}

// Get date heading
const getDateHeading = (date) => {
  const today = new Date()
  const yesterday = new Date()

  yesterday.setDate(today.getDate() - 1)

  const isSameDay = (date1, date2) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    )
  }

  if (isSameDay(date, today)) {
    return "Today's chats"
  }

  if (isSameDay(date, yesterday)) {
    return "Yesterday's chats"
  }

  return `${date.toLocaleDateString([], {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })} chats`
}

function History() {
  const navigate = useNavigate()

  const [conversations, setConversations] = useState([])
  const [feedbackData, setFeedbackData] = useState({})
  const [selectedRating, setSelectedRating] = useState('all')

  // Load conversations and feedback
  useEffect(() => {
    setConversations(getConversations())
    setFeedbackData(getFeedback())
  }, [])

  // Filter conversations based on message ratings
  const filteredConversations = conversations.filter((conversation) => {
    if (selectedRating === 'all') {
      return true
    }

    return (conversation.messages || []).some((message) => {
      const messageFeedback = feedbackData[message.id]

      return (
        message.sender === 'bot' &&
        Number(messageFeedback?.rating) === Number(selectedRating)
      )
    })
  })

  // Collect messages from filtered conversations
  const allMessages = filteredConversations.flatMap((conversation) =>
    (conversation.messages || []).map((message) => ({
      ...message,
      conversationDate: getMessageDate(message, conversation)
    }))
  )

  // Sort messages by latest date
  allMessages.sort(
    (a, b) => b.conversationDate - a.conversationDate
  )

  // Group messages by date
  const groupedMessages = allMessages.reduce((groups, message) => {
    const dateKey = message.conversationDate.toLocaleDateString()

    if (!groups[dateKey]) {
      groups[dateKey] = {
        heading: getDateHeading(message.conversationDate),
        messages: []
      }
    }

    groups[dateKey].messages.push(message)

    return groups
  }, {})

  return (
    <div className="app-layout history-layout">

      <Sidebar onNewChat={() => navigate('/')} />

      <main className="history-main">

        <section className="history-content">

          {/* Rating Filter */}
          <div className="history-filter">

            <label htmlFor="rating-filter">
              Filter by rating
            </label>

            <select
              id="rating-filter"
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
            >
              <option value="all">All Ratings</option>
              <option value="1">1 Star</option>
              <option value="2">2 Stars</option>
              <option value="3">3 Stars</option>
              <option value="4">4 Stars</option>
              <option value="5">5 Stars</option>
            </select>

          </div>

          {/* History Messages */}
          {allMessages.length === 0 ? (
            <div className="history-empty">
              <h2>Past Conversations</h2>

              <p>
                {selectedRating === 'all'
                  ? 'Your previous conversations will appear here.'
                  : `No conversations found with a ${selectedRating}-star rating.`}
              </p>
            </div>
          ) : (
            Object.entries(groupedMessages).map(([dateKey, group]) => (
              <div
                className="history-date-group"
                key={dateKey}
              >

                <h3 className="history-date-heading">
                  {group.heading}
                </h3>

                <div className="history-message-list">

                  {group.messages.map((message) => {
                    const isUser = message.sender === 'user'

                    const messageFeedback = feedbackData[message.id]

                    return (
                      <div
                        className="history-message-card"
                        key={message.id}
                      >

                        <div className="history-message-avatar">

                          {isUser ? (
                            <User size={30} />
                          ) : (
                            <img
                              src={botImage}
                              alt="Bot"
                              className="bot-message-avatar"
                            />
                          )}

                        </div>

                        <div className="history-message-content">

                          <h4>
                            {isUser
                              ? 'You'
                              : 'Product Recommendation AI'}
                          </h4>

                          <p className="history-message-text">
                            {message.text}
                          </p>

                          {/* Product Recommendations */}
                          {message.type === 'product' &&
                            message.products && (
                              <div className="history-products-list">

                                {message.products.map((product) => (
                                  <div
                                    className="history-product-item"
                                    key={product.id}
                                  >
                                    <p>
                                      <strong>{product.name}</strong>
                                    </p>

                                    <p>Brand: {product.brand}</p>

                                    <p>Price: ₹{product.price}</p>

                                    <p>{product.description}</p>
                                  </div>
                                ))}

                              </div>
                            )}

                          <span className="history-message-time">
                            {message.time ||
                              message.conversationDate.toLocaleTimeString(
                                [],
                                {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: true
                                }
                              )}
                          </span>

                          {/* Display Saved Rating */}
                          {!isUser && messageFeedback?.rating && (
                            <div className="history-rating">

                              <p>Rating:</p>

                              <div className="history-rating-stars">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    size={23}
                                    fill={
                                      messageFeedback.rating >= star
                                        ? '#ffb400'
                                        : 'none'
                                    }
                                    color={
                                      messageFeedback.rating >= star
                                        ? '#ffb400'
                                        : '#999'
                                    }
                                  />
                                ))}
                              </div>

                            </div>
                          )}

                          {/* Display Written Feedback */}
                          {!isUser && messageFeedback?.feedback && (
                            <p className="history-feedback-text">
                              <strong>Feedback:</strong>{' '}
                              {messageFeedback.feedback}
                            </p>
                          )}

                        </div>

                      </div>
                    )
                  })}

                </div>

              </div>
            ))
          )}

        </section>

      </main>

    </div>
  )
}

export default History
