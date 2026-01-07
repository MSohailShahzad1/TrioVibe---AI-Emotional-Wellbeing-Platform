import React from "react";
import { Link, useRouteError } from "react-router-dom";

const ErrorPage = () => {
    const error = useRouteError();
    console.error(error);

    return (
        <div className="min-h-screen bg-main flex items-center justify-center p-6 text-center">
            <div className="glass-panel p-12 max-w-lg w-full animate-fade-in-up">
                <div className="text-7xl mb-6 opacity-40">🚫</div>
                <h1 className="text-4xl font-black text-bright mb-4 tracking-tighter uppercase">
                    {error?.status === 404 ? "Route Not Found" : "Access Restricted"}
                </h1>
                <p className="text-dim mb-8 text-lg">
                    {error?.status === 404
                        ? "The requested neural pathway does not exist in our current matrix."
                        : "Unauthorized entry detected. Your current clearance level is insufficient for this sector."}
                </p>
                <Link
                    to="/home"
                    className="inline-block bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-bold px-10 py-4 rounded-2xl transition shadow-xl active:scale-95 shadow-cyan-500/20"
                >
                    Return to Secure Hub
                </Link>
                <p className="mt-8 text-[10px] text-gray-600 font-bold uppercase tracking-[0.3em] opacity-50">
                    Error Signature: {error?.status || "500"} / {error?.statusText || "Internal Core Failure"}
                </p>
            </div>
        </div>
    );
};

export default ErrorPage;
