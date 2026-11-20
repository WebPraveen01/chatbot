
const FEEDBACK_KEY = 'chatbot_message_feedback'
const CONVERSATIONS_KEY = 'chatbot_conversations'

// Get all saved feedback
export const getFeedback = () => {
  try {
    const savedFeedback = localStorage.getItem(FEEDBACK_KEY)
    return savedFeedback ? JSON.parse(savedFeedback) : {}
  } catch (error) {
    console.error('Error reading feedback:', error)
    return {}
  }
}

// Save feedback for a particular message
export const saveFeedback = (messageId, feedback) => {
  try {
    const allFeedback = getFeedback()

    allFeedback[messageId] = {
      ...allFeedback[messageId],
      ...feedback
    }

    localStorage.setItem(
      FEEDBACK_KEY,
      JSON.stringify(allFeedback)
    )

    return allFeedback
  } catch (error) {
    console.error('Error saving feedback:', error)
    return null
  }
}

// Get all saved conversations
export const getConversations = () => {
  try {
    const savedConversations = localStorage.getItem(CONVERSATIONS_KEY)

    return savedConversations
      ? JSON.parse(savedConversations)
      : []
  } catch (error) {
    console.error('Error reading conversations:', error)
    return []
  }
}

// Save a new conversation or update an existing one
export const saveConversation = (conversation) => {
  try {
    const allConversations = getConversations()

    const existingIndex = allConversations.findIndex(
      (item) => item.id === conversation.id
    )

    if (existingIndex !== -1) {
      allConversations[existingIndex] = conversation
    } else {
      allConversations.push(conversation)
    }

    localStorage.setItem(
      CONVERSATIONS_KEY,
      JSON.stringify(allConversations)
    )

    return allConversations
  } catch (error) {
    console.error('Error saving conversation:', error)
    return null
  }
}

// Save overall conversation rating and feedback
export const saveConversationRating = (
  conversationId,
  rating,
  feedback
) => {
  try {
    const allConversations = getConversations()

    const conversationIndex = allConversations.findIndex(
      (item) => item.id === conversationId
    )

    if (conversationIndex === -1) {
      console.error('Conversation not found.')
      return null
    }

    allConversations[conversationIndex] = {
      ...allConversations[conversationIndex],
      rating,
      feedback,
      updatedAt: new Date().toISOString()
    }

    localStorage.setItem(
      CONVERSATIONS_KEY,
      JSON.stringify(allConversations)
    )

    return allConversations
  } catch (error) {
    console.error('Error saving conversation rating:', error)
    return null
  }
}
