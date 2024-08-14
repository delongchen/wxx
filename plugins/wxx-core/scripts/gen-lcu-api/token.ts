const enum TokenType {
  Semicolon,
  String,
  Returns,
  LeftBracket,
  RightBracket,
  Method,
  EOF,
}

interface Token {
  type: TokenType
  lexeme: string
  literal: string
  start: number
}

const tokenize = (source: string) => {
  let current = 0
  let start = current
  const tokens: Token[] = []
  const addToken = (type: TokenType, literal: string = '') => {
    const text = source.slice(start, current)
    tokens.push({
      type,
      lexeme: text,
      literal,
      start,
    })
  }

  const advance = () => source[current++]
  const isAtEnd = () => current >= source.length
  const match = (expected: string) => {
    if (isAtEnd()) return false
    if (source[current] !== expected) return false

    current += 1
    return true
  }

  const scanToken = () => {
    const c = advance()

    switch (c) {
      case '(': addToken(TokenType.LeftBracket); break
      case ')': addToken(TokenType.RightBracket); break
      case ';': addToken(TokenType.Semicolon); break
      case '>': addToken(TokenType.Returns); break

      case ' ':
      case '\r':
      case '\t':
      case '\n':
        break

      case '=':
        

      default:

    }
  }

  const scanTokens = () => {
    while (!isAtEnd()) {
      start = current
      scanToken()
    }
  }
}
