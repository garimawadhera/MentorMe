
import React, { useState } from 'react';
import { Mentor, MentorId } from './types';
import { MENTORS } from './constants';
import MentorCard from './components/MentorCard';
import ChatSession from './components/ChatSession';
import LiveSession from './components/LiveSession';

const App: React.FC = () => {
  const [activeMentor, setActiveMentor] = useState<Mentor | null>(null);
  const [sessionType, setSessionType] = useState<'chat' | 'live' | null>(null);
  const [tab, setTab] = useState<'mentors' | 'progress'>('mentors');

  const openSession = (mentor: Mentor, type: 'chat' | 'live') => {
    setActiveMentor(mentor);
    setSessionType(type);
  };

  const closeSession = () => {
    setActiveMentor(null);
    setSessionType(null);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col bg-slate-50 relative pb-24 overflow-x-hidden">
      {/* Header */}
      <header className="px-6 pt-12 pb-6 bg-white border-b">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">MentorMe</h1>
          <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center text-sm font-bold text-slate-500">
            JD
          </div>
        </div>
        <p className="text-slate-500 text-sm font-medium">Empowering curious minds, one talk at a time.</p>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 space-y-8">
        {tab === 'mentors' ? (
          <>
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-800">Choose a Mentor</h2>
                <span className="text-indigo-600 text-xs font-bold uppercase tracking-widest">Ages 9-15</span>
              </div>
              <div className="space-y-4">
                {MENTORS.map(mentor => (
                  <div key={mentor.id} className="group">
                    <MentorCard 
                      mentor={mentor} 
                      onClick={(m) => openSession(m, 'chat')} 
                    />
                    <div className="mt-2 flex space-x-2 px-1">
                      <button 
                        onClick={() => openSession(mentor, 'chat')}
                        className="flex-1 text-xs font-bold py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 active:scale-95 transition-all"
                      >
                        Text Chat
                      </button>
                      <button 
                        onClick={() => openSession(mentor, 'live')}
                        className="flex-1 text-xs font-bold py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 active:scale-95 transition-all flex items-center justify-center space-x-1"
                      >
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        <span>Voice Live</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white p-6 rounded-3xl border border-indigo-50 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-2">Daily Inspiration</h3>
              <p className="text-slate-500 text-sm italic leading-relaxed">
                "The mind is not a vessel to be filled, but a fire to be kindled." 
                <span className="block mt-2 font-bold not-italic text-slate-400">— Dr. Cosmo</span>
              </p>
            </section>
          </>
        ) : (
          <section className="flex flex-col items-center justify-center pt-20 text-center space-y-4">
            <div className="text-6xl">🏆</div>
            <h2 className="text-2xl font-bold text-slate-800">Your Progress</h2>
            <p className="text-slate-500 max-w-xs mx-auto">
              Complete more mentor sessions to unlock badges and new topics!
            </p>
            <div className="grid grid-cols-2 gap-4 w-full mt-8">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="text-2xl mb-1">🌟</div>
                <div className="text-sm font-bold">12 Sessions</div>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="text-2xl mb-1">🔥</div>
                <div className="text-sm font-bold">3 Day Streak</div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Active Session Overlays */}
      {activeMentor && sessionType === 'chat' && (
        <ChatSession mentor={activeMentor} onClose={closeSession} />
      )}
      {activeMentor && sessionType === 'live' && (
        <LiveSession mentor={activeMentor} onClose={closeSession} />
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t flex justify-around items-center px-4 py-3 safe-area-bottom shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => setTab('mentors')}
          className={`flex flex-col items-center space-y-1 ${tab === 'mentors' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={tab === 'mentors' ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-[10px] font-bold">Mentors</span>
        </button>
        <button 
          onClick={() => setTab('progress')}
          className={`flex flex-col items-center space-y-1 ${tab === 'progress' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={tab === 'progress' ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="text-[10px] font-bold">Progress</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
