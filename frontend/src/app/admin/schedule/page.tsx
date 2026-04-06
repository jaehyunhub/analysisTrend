'use client';

import { useState, useEffect } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/shared/api/client';
import { SCHEDULES } from '@/shared/api/endpoints';

interface Schedule {
  id: number;
  title: string;
  scheduleDate: string;
  type: 'REGULAR' | 'SPECIAL' | 'NOTICE';
  description?: string;
}

const TYPE_LABELS = { REGULAR: '정규', SPECIAL: '특별', NOTICE: '공지' };
const TYPE_COLORS = {
  REGULAR: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30',
  SPECIAL: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  NOTICE: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30',
};

const EMPTY_FORM = { title: '', scheduleDate: '', type: 'REGULAR' as Schedule['type'], description: '' };

export default function ScheduleManagement() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Schedule | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    try {
      const data = await apiGet<Schedule[]>(SCHEDULES.ADMIN_LIST);
      setSchedules(data);
    } catch {
      // fallback: 기존 mock 데이터 유지
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setIsFormOpen(true);
  };

  const openEdit = (s: Schedule) => {
    setEditTarget(s);
    setForm({ title: s.title, scheduleDate: s.scheduleDate, type: s.type, description: s.description ?? '' });
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editTarget) {
        const updated = await apiPut<Schedule>(SCHEDULES.ADMIN_DETAIL(editTarget.id), form);
        setSchedules(prev => prev.map(s => s.id === editTarget.id ? updated : s));
      } else {
        const created = await apiPost<Schedule>(SCHEDULES.ADMIN_LIST, form);
        setSchedules(prev => [...prev, created].sort((a, b) => a.scheduleDate.localeCompare(b.scheduleDate)));
      }
      setIsFormOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('일정을 삭제하시겠습니까?')) return;
    try {
      await apiDelete(SCHEDULES.ADMIN_DETAIL(id));
      setSchedules(prev => prev.filter(s => s.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">방송 일정 관리</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">월별 일정 및 이벤트를 관리합니다.</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20"
        >
          + 일정 추가
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white dark:bg-[#1A1A1B] p-6 rounded-2xl border border-gray-200 dark:border-[#343536] shadow-sm">
          <h3 className="font-bold mb-4 text-gray-900 dark:text-white">{editTarget ? '일정 수정' : '일정 추가'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">제목 *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full bg-gray-50 dark:bg-[#272729] border border-gray-200 dark:border-[#343536] rounded-lg p-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">날짜 *</label>
              <input
                type="date"
                value={form.scheduleDate}
                onChange={e => setForm(f => ({ ...f, scheduleDate: e.target.value }))}
                className="w-full bg-gray-50 dark:bg-[#272729] border border-gray-200 dark:border-[#343536] rounded-lg p-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">유형</label>
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value as Schedule['type'] }))}
                className="w-full bg-gray-50 dark:bg-[#272729] border border-gray-200 dark:border-[#343536] rounded-lg p-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {Object.entries(TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">설명</label>
              <textarea
                rows={4}
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full bg-gray-50 dark:bg-[#272729] border border-gray-200 dark:border-[#343536] rounded-lg p-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white">취소</button>
            <button onClick={handleSave} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold">저장</button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-[#1A1A1B] p-6 rounded-2xl border border-gray-200 dark:border-[#343536] shadow-sm min-h-[300px]">
        {isLoading ? (
          <div className="text-center py-8 text-gray-400">불러오는 중...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-[#343536] text-gray-400">
                  <th className="pb-3 pl-2">날짜</th>
                  <th className="pb-3">제목</th>
                  <th className="pb-3">유형</th>
                  <th className="pb-3 text-right pr-2">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#343536]">
                {schedules.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-[#272729] transition-colors">
                    <td className="py-3 pl-2 font-mono text-gray-600 dark:text-gray-300">{item.scheduleDate}</td>
                    <td className="py-3 font-medium text-gray-900 dark:text-white">{item.title}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${TYPE_COLORS[item.type]}`}>
                        {TYPE_LABELS[item.type]}
                      </span>
                    </td>
                    <td className="py-3 text-right pr-2">
                      <button onClick={() => openEdit(item)} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors mr-2">수정</button>
                      <button onClick={() => handleDelete(item.id)} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors">삭제</button>
                    </td>
                  </tr>
                ))}
                {schedules.length === 0 && (
                  <tr><td colSpan={4} className="py-8 text-center text-gray-400">등록된 일정이 없습니다.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
