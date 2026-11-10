import { Component, type ErrorInfo, type ReactNode } from 'react'
import { GenericErrorPage } from '@/pages/ErrorPages'

export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.error(error, info.componentStack)
  }

  render() {
    return this.state.failed ? <GenericErrorPage /> : this.props.children
  }
}
