'use client';

import { useState } from 'react';

export default function MemberManagement() {
  const [members, setMembers] = useState([
    { id: 1, username: 'trend_master', email: 'master@trend.com', joinDate: '2025-12-01', status: 'Active' },
    { id: 2, username: 'spammer_bot', email: 'bot@spam.com', joinDate: '2026-02-08', status: 'Banned' },
    { id: 3, username: 'toxic_user', email: 'toxic@chat.com', joinDate: '2026-01-15', status: 'Active' },
  ]);
  const [banTarget, setBanTarget] = useState<{ id: number; username: string; action: 'ban' | 'unban' } | null>(null);

  const toggleBan = (id: number) => {
      setMembers(members.map(m => {
          if (m.id === id) {
              return { ...m, status: m.status === 'Active' ? 'Banned' : 'Active' };
          }
          return m;
      }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Member Management</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Manage community members and bans.</p>
        </div>
        <div className="relative">
            <input type="text" placeholder="Search users..." className="pl-10 pr-4 py-2 border border-gray-200 dark:border-[#343536] rounded-lg bg-white dark:bg-[#1A1A1B] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1A1A1B] rounded-xl border border-gray-200 dark:border-[#343536] overflow-hidden">
          <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-[#272729] text-gray-600 dark:text-gray-300 font-bold border-b border-gray-100 dark:border-[#343536]">
                  <tr>
                      <th className="p-4">User</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Joined</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#343536]">
                  {members.map(member => (
                      <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-[#272729]">
                          <td className="p-4 font-bold text-gray-900 dark:text-white">
                              <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                                  {member.username}
                              </div>
                          </td>
                          <td className="p-4 text-gray-700 dark:text-gray-300">{member.email}</td>
                          <td className="p-4 text-gray-700 dark:text-gray-300">{member.joinDate}</td>
                          <td className="p-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                  member.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                              }`}>
                                  {member.status}
                              </span>
                          </td>
                          <td className="p-4 text-right">
                              <button
                                onClick={() => setBanTarget({ id: member.id, username: member.username, action: member.status === 'Active' ? 'ban' : 'unban' })}
                                className={`px-3 py-1 rounded text-xs font-bold text-white transition-colors ${
                                    member.status === 'Active' ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-500 hover:bg-gray-600'
                                }`}
                              >
                                  {member.status === 'Active' ? 'Ban User' : 'Unban'}
                              </button>
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>

      {banTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1A1A1B] rounded-2xl shadow-2xl p-6 w-80 flex flex-col gap-4 border border-gray-200 dark:border-[#343536]">
            <h3 className="text-base font-bold text-gray-900 dark:text-white text-center">
              {banTarget.action === 'ban' ? `${banTarget.username} 님을 정말 밴 하시겠습니까?` : `${banTarget.username} 님의 밴을 해제하시겠습니까?`}
            </h3>
            <div className="flex gap-3">
              <button
                onClick={() => setBanTarget(null)}
                className="flex-1 py-2 rounded-xl border border-gray-300 dark:border-[#343536] text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#272729] transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => { toggleBan(banTarget.id); setBanTarget(null); }}
                className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-sm font-semibold text-white transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
