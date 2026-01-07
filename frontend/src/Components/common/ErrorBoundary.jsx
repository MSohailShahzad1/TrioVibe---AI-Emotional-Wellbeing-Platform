import React from "react";
import { Link } from "react-router-dom";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-main flex items-center justify-center p-6 text-center">
                    <div className="glass-panel p-12 max-w-lg w-full animate-fade-in-up">
                        <div className="text-7xl mb-6">⚠️</div>
                        <h1 className="text-3xl font-black text-bright mb-4 tracking-tighter uppercase">Interface Exception</h1>
                        <p className="text-dim mb-8">
                            A synchronization error occurred within the neural interface. Our systems are attempting to stabilize the environment.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="flex-1 bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-bold px-6 py-4 rounded-2xl transition shadow-lg active:scale-95"
                            >
                                Reload Interface
                            </button>
                            <Link
                                to="/home"
                                onClick={() => this.setState({ hasError: false })}
                                className="flex-1 bg-white/5 border border-white/10 text-bright font-bold px-6 py-4 rounded-2xl transition hover:bg-white/10 flex items-center justify-center"
                            >
                                Return to Home
                            </Link>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
