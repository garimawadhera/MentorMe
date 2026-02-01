
import React from 'react';
import { Mentor } from '../types';

interface MentorCardProps {
  mentor: Mentor;
  onClick: (mentor: Mentor) => void;
}

const MentorCard: React.FC<MentorCardProps> = ({ mentor, onClick }) => {
  return (
    <button
      onClick={() => onClick(mentor)}
      className="w-full bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center space-x-4 active:scale-95 transition-transform text-left"
    >
      <div className={`${mentor.bgColor} w-16 h-16 rounded-full flex items-center justify-center text-3xl`}>
        {mentor.avatar}
      </div>
      <div className="flex-1">
        <h3 className={`text-lg font-bold ${mentor.color}`}>{mentor.name}</h3>
        <p className="text-sm font-semibold text-slate-600">{mentor.role}</p>
        <p className="text-xs text-slate-400 mt-1 line-clamp-1">{mentor.specialty}</p>
      </div>
      <div className="text-slate-300">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
};

export default MentorCard;
