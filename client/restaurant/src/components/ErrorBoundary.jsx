import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    console.error('Application error boundary:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-charcoal px-6 text-center">
          <div>
            <p className="font-serif text-5xl text-ivory">Atelier Noir</p>
            <p className="mt-4 text-sm text-ivory/75">
              Something went wrong. Refresh the page to continue.
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
