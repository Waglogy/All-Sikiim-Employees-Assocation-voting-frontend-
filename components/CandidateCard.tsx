
import React from 'react';
import { Candidate } from '../lib/mockData';

interface CandidateCardProps {
    candidate: Candidate;
    isSelected: boolean;
    onSelect: () => void;
    name: string; // Group name for radio input
}

export default function CandidateCard({ candidate, isSelected, onSelect, name }: CandidateCardProps) {
    return (
        <label
            className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${isSelected
                    ? 'border-blue-700 bg-blue-50 ring-1 ring-blue-700'
                    : 'border-gray-200'
                }`}
        >
            <input
                type="radio"
                name={name}
                className="h-5 w-5 text-blue-900 border-gray-300 focus:ring-blue-500"
                checked={isSelected}
                onChange={onSelect}
            />
            <div className="ml-4">
                <h3 className="font-semibold text-gray-900">{candidate.name}</h3>
                {candidate.department && (
                    <p className="text-sm text-gray-500">{candidate.department}</p>
                )}
            </div>
            {isSelected && (
                <div className="absolute right-4 text-blue-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            )}
        </label>
    );
}
