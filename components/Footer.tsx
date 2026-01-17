
import React from 'react';

export default function Footer() {
    return (
        <footer className="bg-gray-100 text-gray-600 border-t border-gray-300 mt-auto">
            <div className="container mx-auto px-4 py-6 text-center text-sm">
                <p>&copy; {new Date().getFullYear()} ASGEA. All rights reserved.</p>
                <p className="mt-1">
                    Authorized by Government of Sikkim Employees Association.
                </p>
                <p className="mt-2 text-xs text-gray-500">
                    Secure Voting System v1.0
                </p>
            </div>
        </footer>
    );
}
