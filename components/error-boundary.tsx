/**
 * Error Boundary Component
 * Catches and displays errors gracefully
 */

'use client'

import React, { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
    children: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
    error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Error Boundary caught an error:', error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <div className="flex items-center justify-center min-h-screen p-4 bg-background">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <div className="flex items-center gap-2 text-destructive">
                                <AlertCircle className="w-5 h-5" />
                                <CardTitle>Something went wrong</CardTitle>
                            </div>
                            <CardDescription>
                                An unexpected error occurred. Please try refreshing the page.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {this.state.error && (
                                <div className="p-3 bg-muted rounded-lg">
                                    <p className="text-sm font-mono text-muted-foreground break-words">
                                        {this.state.error.message}
                                    </p>
                                </div>
                            )}
                            <Button
                                onClick={() => {
                                    this.setState({ hasError: false, error: undefined })
                                    window.location.reload()
                                }}
                                className="w-full gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Refresh Page
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )
        }

        return this.props.children
    }
}
