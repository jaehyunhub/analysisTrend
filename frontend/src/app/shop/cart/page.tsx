'use client';

import Link from 'next/link';
import Header from '@/widgets/Header/ui/Header';
import { useCartStore } from '@/shared/model/cartStore';

export default function CartPage() {
  const { items, totalPrice, updateQuantity, removeItem } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-2xl font-bold mb-2 dark:text-white">장바구니가 비어있습니다</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">담긴 상품이 없습니다. 쇼핑을 계속해보세요!</p>
          <Link href="/shop" className="inline-block px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
            쇼핑 계속하기
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0d0d0e]">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 dark:text-white">장바구니</h1>
        <div className="space-y-4 mb-8">
          {items.map((item) => (
            <div key={`${item.id}-${item.option}`} className="bg-white dark:bg-[#1A1A1B] rounded-2xl p-5 border border-gray-100 dark:border-[#343536] flex gap-4 items-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-[#272729] rounded-xl flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm dark:text-white truncate">{item.name}</p>
                {item.option && <p className="text-xs text-gray-400 mt-0.5">{item.option}</p>}
                <p className="text-sm font-bold text-blue-600 mt-1">{item.price.toLocaleString()}원</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1, item.option)}
                    className="px-2.5 py-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-bold"
                    aria-label="수량 감소"
                  >−</button>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => {
                      const v = parseInt(e.target.value);
                      if (!isNaN(v) && v > 0) updateQuantity(item.id, v, item.option);
                    }}
                    className="w-12 text-center text-sm font-bold border-x border-gray-300 dark:border-gray-600 py-1.5 bg-white dark:bg-[#1A1A1B] dark:text-white outline-none"
                    min={1}
                    aria-label="수량"
                  />
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1, item.option)}
                    className="px-2.5 py-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-bold"
                    aria-label="수량 증가"
                  >+</button>
                </div>
                <button
                  onClick={() => removeItem(item.id, item.option)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30 transition-colors"
                  aria-label="삭제"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white dark:bg-[#1A1A1B] rounded-2xl p-6 border border-gray-100 dark:border-[#343536]">
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold text-gray-700 dark:text-gray-300">합계</span>
            <span className="text-2xl font-black text-blue-600">{totalPrice.toLocaleString()}원</span>
          </div>
          <button className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors">
            주문하기
          </button>
        </div>
      </main>
    </div>
  );
}
