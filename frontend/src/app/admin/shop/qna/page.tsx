'use client';

import { useState } from 'react';
import { useShopQnaStore, QnaItem } from '@/shared/model/shopQnaStore';
import { useToastStore } from '@/shared/model/toastStore';

type FilterType = 'all' | 'pending' | 'answered';

export default function QnaManagement() {
  const { qnaList, answerQna, deleteQna } = useShopQnaStore();
  const addToast = useToastStore((s) => s.addToast);

  const [filter, setFilter] = useState<FilterType>('all');
  const [answerTarget, setAnswerTarget] = useState<QnaItem | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [productFilter, setProductFilter] = useState<string>('all');

  const pendingCount = qnaList.filter((q) => q.status === 'pending').length;
  const productNames = [...new Set(qnaList.map((q) => q.productName))];

  const filtered = [...qnaList]
    .sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .filter((q) => filter === 'all' || q.status === filter)
    .filter((q) => productFilter === 'all' || q.productName === productFilter);

  const openAnswer = (q: QnaItem) => {
    setAnswerTarget(q);
    setAnswerText(q.answer);
  };

  const handleAnswer = () => {
    if (!answerTarget) return;
    if (!answerText.trim()) {
      addToast('답변 내용을 입력해주세요.', 'error');
      return;
    }
    answerQna(answerTarget.id, answerText.trim());
    addToast('답변이 등록되었습니다.', 'success');
    setAnswerTarget(null);
    setAnswerText('');
  };

  const handleDelete = (id: string) => {
    if (!confirm('Q&A를 삭제하시겠습니까?')) return;
    deleteQna(id);
    addToast('Q&A가 삭제되었습니다.', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Q&A 관리</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            쇼핑몰 상품 Q&A를 관리합니다.
            <span className="ml-2 font-semibold text-blue-600 dark:text-blue-400">총 {qnaList.length}건</span>
            {pendingCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                미답변 {pendingCount}건
              </span>
            )}
          </p>
        </div>
      </div>

      {/* 상품 필터 */}
      {productNames.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setProductFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              productFilter === 'all'
                ? 'bg-gray-800 text-white dark:bg-white dark:text-gray-900'
                : 'bg-white dark:bg-[#1A1A1B] text-gray-500 border border-gray-200 dark:border-[#343536]'
            }`}
          >
            전체 상품
          </button>
          {productNames.map((name) => (
            <button
              key={name}
              onClick={() => setProductFilter(name)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                productFilter === name
                  ? 'bg-gray-800 text-white dark:bg-white dark:text-gray-900'
                  : 'bg-white dark:bg-[#1A1A1B] text-gray-500 border border-gray-200 dark:border-[#343536]'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      {/* 필터 탭 */}
      <div className="flex gap-2">
        {([['all', '전체'], ['pending', '미답변'], ['answered', '답변완료']] as [FilterType, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              filter === key
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-[#1A1A1B] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-[#343536] hover:bg-gray-50 dark:hover:bg-[#272729]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 답변 모달 */}
      {answerTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-[#1A1A1B] rounded-2xl p-6 w-full max-w-lg shadow-xl border border-gray-200 dark:border-[#343536]">
            <h3 className="font-bold text-lg mb-4 dark:text-white">답변 작성</h3>
            <div className="mb-3 p-3 bg-gray-50 dark:bg-[#272729] rounded-lg">
              <p className="text-xs text-gray-400 mb-1">{answerTarget.productName} · {answerTarget.authorName}</p>
              <p className="text-sm dark:text-gray-200">{answerTarget.question}</p>
            </div>
            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="답변을 입력하세요"
              rows={4}
              className="w-full bg-gray-50 dark:bg-[#272729] border border-gray-200 dark:border-[#343536] rounded-lg p-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none resize-none mb-4"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setAnswerTarget(null)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white">취소</button>
              <button onClick={handleAnswer} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold">답변 등록</button>
            </div>
          </div>
        </div>
      )}

      {/* Q&A 목록 */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-[#1A1A1B] rounded-2xl border border-gray-200 dark:border-[#343536] p-8 text-center text-gray-400">
            {filter === 'all' ? 'Q&A가 없습니다.' : filter === 'pending' ? '미답변 Q&A가 없습니다.' : '답변 완료된 Q&A가 없습니다.'}
          </div>
        ) : (
          filtered.map((q) => (
            <div key={q.id} className="bg-white dark:bg-[#1A1A1B] rounded-xl border border-gray-200 dark:border-[#343536] p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                      q.status === 'pending'
                        ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                      {q.status === 'pending' ? '미답변' : '답변완료'}
                    </span>
                    <span className="text-xs text-gray-700 dark:text-gray-300">{q.productName}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">·</span>
                    <span className="text-xs text-gray-700 dark:text-gray-300">{q.authorName}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">·</span>
                    <span className="text-xs text-gray-700 dark:text-gray-300">{new Date(q.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Q. {q.question}</p>
                  {q.answer && (
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-2 pl-3 border-l-2 border-blue-400">A. {q.answer}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => openAnswer(q)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    {q.status === 'pending' ? '답변' : '수정'}
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
