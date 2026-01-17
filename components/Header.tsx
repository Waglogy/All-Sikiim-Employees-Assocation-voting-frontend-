
import React from 'react';

export default function Header() {
    return (
        <header className="bg-blue-900 text-white shadow-md">
            <div className="container mx-auto px-4 py-4 md:py-6 text-center">
                <h1 className="text-xl md:text-2xl font-bold uppercase tracking-wide">
                    All Sikkim Govt. Employees Association
                </h1>
                <h2 className="text-sm md:text-base font-medium mt-1 text-blue-100">
                    (C & D Grade)
                </h2>
                <div className="mt-2 text-xs md:text-sm bg-blue-800 inline-block px-3 py-1 rounded-full border border-blue-700">
                    Official Electronic Voting Platform
                </div>
            </div>
            <div className="bg-yellow-500 h-1 w-full"></div> {/* Decorative strip */}
        </header>
    );
}
