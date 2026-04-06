'use client';

import { useState, useEffect } from 'react';

const PIN = '1234';
const STORAGE_KEY = 'pin_unlocked';

export default function PinGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [input, setInput] = useState('');
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY) === 'true') {
      setUnlocked(true);
    }
    setHydrated(true);
  }, []);

  const handleKey = (digit: string) => {
    if (digit === 'del') {
      setInput(prev => prev.slice(0, -1));
      return;
    }
    const next = input + digit;
    setInput(next);

    if (next.length === 4) {
      if (next === PIN) {
        sessionStorage.setItem(STORAGE_KEY, 'true');
        setUnlocked(true);
      } else {
        setShake(true);
        setTimeout(() => {
          setInput('');
          setShake(false);
        }, 600);
      }
    }
  };

  if (!hydrated) return null;
  if (unlocked) return <>{children}</>;

  const keys = ['1','2','3','4','5','6','7','8','9','','0','del'];

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gray-950">
      <div className="flex flex-col items-center gap-8 select-none">
        {/* 로고/타이틀 */}
        <div className="text-center">
          <div className="text-3xl font-bold text-white tracking-tight">SyukaUniverse</div>
          <div className="mt-1 text-sm text-gray-500">PIN을 입력하세요</div>
        </div>

        {/* 도트 인디케이터 */}
        <div className={`flex gap-4 transition-all ${shake ? 'animate-shake' : ''}`}>
          {[0,1,2,3].map(i => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                input.length > i
                  ? 'bg-blue-500 border-blue-500'
                  : 'bg-transparent border-gray-600'
              }`}
            />
          ))}
        </div>

        {/* 키패드 */}
        <div className="grid grid-cols-3 gap-3">
          {keys.map((k, i) => {
            if (k === '') return <div key={i} />;
            return (
              <button
                key={i}
                onClick={() => handleKey(k)}
                className={`w-20 h-20 rounded-full text-white font-semibold text-xl transition-all
                  ${k === 'del'
                    ? 'bg-transparent text-gray-400 hover:text-white text-base'
                    : 'bg-gray-800 hover:bg-gray-700 active:scale-95'
                  }`}
              >
                {k === 'del' ? '⌫' : k}
              </button>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
        .animate-shake { animation: shake 0.5s ease; }
      `}</style>
    </div>
  );
}
