'use client';

import { useState } from 'react';
import { useShopReviewStore } from '@/shared/model/shopReviewStore';
import { useToastStore } from '@/shared/model/toastStore';

type RatingFilter = 'all' | '5' | '4' | '3' | '2' | '1';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function ReviewManagement() {
  const { reviews, hideReview, showReview, deleteReview } = useShopReviewStore();
  const addToast = useToastStore((s) => s.addToast);
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all');
  const [productFilter, setProductFilter] = useState<string>('all');
  const productNames = [...new Set(reviews.map((r) => r.productName))];

  const filtered = reviews
    .filter((r) => ratingFilter === 'all' || r.rating === Number(ratingFilter))
    .filter((r) => productFilter === 'all' || r.productName === productFilter);

  const handleToggleVisibility = (id: string, isHidden: boolean) => {
    if (isHidden) {
      showReview(id);
      addToast('리뷰가 표시됩니다.', 'success');
    } else {
      hideReview(id);
      addToast('리뷰가 숨겨졌습니다.', 'info');
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm('리뷰를 삭제하시겠습니까?')) return;
    deleteReview(id);
    addToast('리뷰가 삭제되었습니다.', 'success');
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '-';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">리뷰 관리</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            쇼핑몰 상품 리뷰를 관리합니다.
            <span className="ml-2 font-semibold text-blue-600 dark:text-blue-400">총 {reviews.length}건</span>
            {reviews.length > 0 && (
              <span className="ml-2 text-yellow-500 font-semibold">평균 ★ {avgRating}</span>
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

      {/* 별점 필터 */}
      <div className="flex gap-2 flex-wrap">
        {(['all', '5', '4', '3', '2', '1'] as RatingFilter[]).map((key) => (
          <button
            key={key}
            onClick={() => setRatingFilter(key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              ratingFilter === key
                ? 'bg-yellow-500 text-white'
                : 'bg-white dark:bg-[#1A1A1B] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-[#343536] hover:bg-gray-50 dark:hover:bg-[#272729]'
            }`}
          >
            {key === 'all' ? '전체' : `★ ${key}점`}
          </button>
        ))}
      </div>

      {/* 리뷰 목록 */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-[#1A1A1B] rounded-2xl border border-gray-200 dark:border-[#343536] p-8 text-center text-gray-400">
            {ratingFilter === 'all' ? '등록된 리뷰가 없습니다.' : `${ratingFilter}점 리뷰가 없습니다.`}
          </div>
        ) : (
          filtered.map((review) => (
            <div
              key={review.id}
              className={`bg-white dark:bg-[#1A1A1B] rounded-xl border border-gray-200 dark:border-[#343536] p-5 transition-opacity ${
                review.isHidden ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <StarRating rating={review.rating} />
                    <span className="text-xs text-gray-700 dark:text-gray-300">{review.productName}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">·</span>
                    <span className="text-xs text-gray-700 dark:text-gray-300">{review.authorName}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">·</span>
                    <span className="text-xs text-gray-700 dark:text-gray-300">{new Date(review.createdAt).toLocaleDateString()}</span>
                    {review.isHidden && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                        숨김
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-900 dark:text-white">{review.content}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleToggleVisibility(review.id, review.isHidden)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      review.isHidden
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200'
                        : 'bg-gray-100 dark:bg-[#343536] text-gray-700 dark:text-gray-300 hover:bg-yellow-50 hover:text-yellow-600'
                    }`}
                  >
                    {review.isHidden ? '표시' : '숨기기'}
                  </button>
                  <button
                    onClick={() => handleDelete(review.id)}
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
