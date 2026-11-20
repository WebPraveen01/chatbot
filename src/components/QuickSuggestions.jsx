
const products = [
  {
    id: 1,
    name: 'Jeans',
    description: 'Get immediate AI generated response'
  },
  {
    id: 2,
    name: 'Smartphone',
    description: 'Get immediate AI generated response'
  },
  {
    id: 3,
    name: 'Laptop',
    description: 'Get immediate AI generated response'
  },
  {
    id: 4,
    name: 'T-Shirt',
    description: 'Get immediate AI generated response'
  }
]

function QuickSuggestions({ onSelectProduct }) {
  return (
    <div className="suggestions-grid">

      {products.map((product) => (
        <div
          className="suggestion-card"
          key={product.id}
          onClick={() => onSelectProduct(product.name)}
        >
          <h3>{product.name}</h3>

          <p>{product.description}</p>
        </div>
      ))}

    </div>
  )
}

export default QuickSuggestions
