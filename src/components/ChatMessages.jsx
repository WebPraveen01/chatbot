import { useEffect, useRef, useState } from 'react'
import {
  User,
  ThumbsUp,
  ThumbsDown,
  Star,
  MessageSquareWarning,
  X
} from 'lucide-react'

import botImage from '../assets/bot.png'

import {
  getFeedback,
  saveFeedback
} from '../services/storage'

function ChatMessages({ messages }) {
  const messagesEndRef = useRef(null)

  // Load saved feedback from localStorage
  const [feedbackData, setFeedbackData] = useState(getFeedback)

  // Modal state
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [selectedMessageId, setSelectedMessageId] = useState(null)
  const [feedbackText, setFeedbackText] = useState('')

  // Automatically scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end'
    })
  }, [messages])

  // Save and update feedback
  const updateFeedback = (messageId, feedback) => {
    const updatedFeedback = {
      ...feedbackData[messageId],
      ...feedback
    }

    setFeedbackData(prev => ({
      ...prev,
      [messageId]: updatedFeedback
    }))

    saveFeedback(messageId, feedback)
  }

  // Handle thumbs-up click
  const handleThumbsUp = (messageId) => {
    updateFeedback(messageId, {
      thumbsUp: true
    })
  }

  // Handle star selection
  const handleStarRating = (messageId, rating) => {
    updateFeedback(messageId, {
      thumbsUp: true,
      rating
    })
  }

  // Open thumbs-down feedback modal
  const handleThumbsDown = (messageId) => {
    setSelectedMessageId(messageId)
    setFeedbackText('')
    setShowFeedbackModal(true)
  }

  // Close feedback modal
  const handleCloseModal = () => {
    setShowFeedbackModal(false)
    setSelectedMessageId(null)
    setFeedbackText('')
  }

  // Submit thumbs-down feedback
  const handleSubmitFeedback = () => {
    if (!feedbackText.trim() || !selectedMessageId) {
      return
    }

    updateFeedback(selectedMessageId, {
      thumbsDown: true,
      feedback: feedbackText.trim()
    })

    handleCloseModal()
  }

  return (
    <div className="messages-container">

      {messages.map((message) => {

        const isUser = message.sender === 'user'
        const isProduct = message.type === 'product'

        const messageFeedback = feedbackData[message.id]

        return (
          <div
            className="message-card"
            key={message.id}
          >

            <div className="message-avatar">
              {isUser ? (
                <User size={25} />
              ) : (
                <img
                  className="bot-message-avatar"
                  src={botImage}
                  alt="Bot"
                />
              )}
            </div>

            <div className="message-content">

              <h4>
                {isUser ? 'You' : 'Product Recommendation AI'}
              </h4>

              {isProduct ? (
                <>
                  <p className="message-text">
                    {message.text}
                  </p>

                  <div className="recommendations-list">
                    {message.products.map((product, index) => (
                      <div
                        className="recommendation-item"
                        key={product.id}
                      >
                        <p className="recommendation-name">
                          {index + 1}. {product.name}
                        </p>

                        <p>
                          <strong>Brand:</strong> {product.brand}
                        </p>

                        <p>
                          <strong>Price:</strong> ₹{product.price}
                        </p>

                        <p>
                          <strong>Description:</strong> {product.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="message-text">
                  {message.text}
                </p>
              )}

              {!isUser ? (
                <div className="message-meta-row">
                  <span className="message-time">
                    {message.time}
                  </span>

                  <div className="message-feedback">
                    <button
                      type="button"
                      className={`feedback-button ${
                        messageFeedback?.thumbsUp ? 'selected' : ''
                      }`}
                      title="Good response"
                      aria-label="Good response"
                      onClick={() => handleThumbsUp(message.id)}
                    >
                      <ThumbsUp
                        size={18}
                        fill={
                          messageFeedback?.thumbsUp
                            ? 'currentColor'
                            : 'none'
                        }
                      />
                    </button>

                    <button
                      type="button"
                      className={`feedback-button ${
                        messageFeedback?.thumbsDown ? 'active' : ''
                      }`}
                      title="Bad response"
                      aria-label="Bad response"
                      onClick={() => handleThumbsDown(message.id)}
                    >
                      <ThumbsDown
                        size={18}
                        fill={
                          messageFeedback?.thumbsDown
                            ? 'currentColor'
                            : 'none'
                        }
                      />
                    </button>
                  </div>
                </div>
              ) : (
                <span className="message-time">
                  {message.time}
                </span>
              )}

              {/* Feedback with no star rating appears below the timestamp */}
              {messageFeedback?.feedback && !messageFeedback?.rating && (
                <p className="submitted-feedback">
                  <strong>Your feedback:</strong> {messageFeedback.feedback}
                </p>
              )}

              {/* Display five-star rating */}
              {!isUser && messageFeedback?.thumbsUp && (
                <div className="star-rating">
                  <p>Rate this response:</p>

                  <div className="rating-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`star-button ${
                          messageFeedback.rating >= star ? 'selected' : ''
                        }`}
                        onClick={() => handleStarRating(message.id, star)}
                        aria-label={`Rate ${star} out of 5`}
                      >
                        <Star
                          size={23}
                          fill={
                            messageFeedback.rating >= star
                              ? 'currentColor'
                              : 'none'
                          }
                        />
                      </button>
                    ))}
                  </div>

                  {messageFeedback.rating && (
                    <p className="rating-result">
                      You rated this response {messageFeedback.rating} out of 5.
                    </p>
                  )}

                  {/* Feedback below star rating when a rating exists */}
                  {messageFeedback.feedback && (
                    <p className="submitted-feedback">
                      <strong>Your feedback:</strong> {messageFeedback.feedback}
                    </p>
                  )}
                </div>
              )}

            </div>

          </div>
        )
      })}

      <div ref={messagesEndRef} />

      {/* Thumbs-down feedback modal */}
      {showFeedbackModal && (
        <div className="feedback-modal-overlay">

          <div
            className="feedback-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-modal-title"
          >

            <div className="feedback-modal-header">

              <div className="feedback-modal-title">
                <MessageSquareWarning size={25} />

                <h2 id="feedback-modal-title">
                  Provide Additional Feedback
                </h2>
              </div>

              <button
                type="button"
                className="feedback-modal-close"
                onClick={handleCloseModal}
                aria-label="Close feedback modal"
              >
                <X size={25} />
              </button>

            </div>

            <textarea
              className="feedback-textarea"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              aria-label="Additional feedback"
            />

            <div className="feedback-modal-footer">
              <button
                type="button"
                className="feedback-submit-button"
                onClick={handleSubmitFeedback}
                disabled={!feedbackText.trim()}
              >
                Submit
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  )
}

export default ChatMessages
