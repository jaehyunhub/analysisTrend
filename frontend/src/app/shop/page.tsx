'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from "@/widgets/Header/ui/Header";
import Footer from "@/widgets/Footer/ui/Footer";

const ALL_PRODUCTS = [
    {
        id: 1,
        name: 'AnalysisTrend 공식 후드티',
        price: '55,000',
        image: 'bg-gray-300',
        badge: 'NEW',
        isSoldOut: false,
        category: 'GOODS'
    },
    {
        id: 2,
        name: '제주 흑돼지 특선 세트 (500g)',
        price: '45,000',
        image: 'bg-red-200',
        badge: 'BEST',
        isSoldOut: false,
        category: 'FOOD'
    },
    {
        id: 3,
        name: 'AnalysisTrend 한정판 후드티',
        price: '65,000',
        image: 'bg-blue-200',
        badge: 'HOT',
        isSoldOut: true,
        category: 'FASHION'
    },
    {
        id: 4,
        name: 'AnalysisTrend 로고 캡',
        price: '25,000',
        image: 'bg-green-200',
        badge: '',
        isSoldOut: false,
        category: 'FASHION'
    },
    {
        id: 5,
        name: '커스텀 키캡 세트',
        price: '39,000',
        image: 'bg-purple-200',
        badge: '',
        isSoldOut: false,
        category: 'DIGITAL'
    },
    {
        id: 6,
        name: '채널 공식 머그컵',
        price: '18,000',
        image: 'bg-yellow-200',
        badge: 'NEW',
        isSoldOut: false,
        category: 'GOODS'
    },
    {
        id: 7,
        name: '프리미엄 마우스패드',
        price: '29,000',
        image: 'bg-indigo-200',
        badge: '',
        isSoldOut: false,
        category: 'DIGITAL'
    },
    {
        id: 8,
        name: '유기농 꿀 선물세트',
        price: '35,000',
        image: 'bg-orange-200',
        badge: 'BEST',
        isSoldOut: false,
        category: 'FOOD'
    },
];

const CATEGORIES = [
  { key: 'ALL', label: '전체' },
  { key: 'GOODS', label: '굿즈' },
  { key: 'FOOD', label: '식품' },
  { key: 'FASHION', label: '패션' },
  { key: 'DIGITAL', label: '디지털' },
];

const BADGE_COLORS: Record<string, string> = {
  'NEW': 'bg-blue-600',
  'BEST': 'bg-red-600',
  'HOT': 'bg-orange-500',
};

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState('ALL');

  const filteredProducts = activeCategory === 'ALL'
    ? ALL_PRODUCTS
    : ALL_PRODUCTS.filter(p => p.category === activeCategory);

  return (
    <div className="bg-white dark:bg-black min-h-screen">
        <Header />

        <main className="pb-20">
            {/* Shop Hero */}
            <section className="w-full h-[280px] bg-gradient-to-br from-gray-900 to-gray-700 dark:from-gray-950 dark:to-gray-800 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{backgroundImage: "repeating-linear-gradient(45deg, white 0px, white 1px, transparent 1px, transparent 50%)", backgroundSize: "20px 20px"}}></div>
                <div className="text-center z-10 text-white">
                  <p className="text-sm font-medium text-gray-400 mb-2 tracking-widest uppercase">Official Store</p>
                  <h1 className="text-4xl font-black tracking-tight mb-2">공식 쇼핑몰</h1>
                  <p className="text-gray-400 text-sm">채널 공식 굿즈 및 파트너 상품</p>
                </div>
            </section>

            <div className="max-w-[1200px] mx-auto px-6 mt-10">

                {/* Category Filter */}
                <div className="flex justify-center gap-2 mb-10">
                    {CATEGORIES.map((cat) => (
                        <button
                          key={cat.key}
                          onClick={() => setActiveCategory(cat.key)}
                          className={`px-5 py-2 rounded-full text-sm font-bold transition-colors ${
                            activeCategory === cat.key
                              ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                              : 'bg-gray-100 dark:bg-[#1A1A1B] text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#272729]'
                          }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10">
                    {filteredProducts.map(product => (
                        <Link href={`/shop/${product.id}`} key={product.id} className="group block cursor-pointer">
                            <div className="relative aspect-[3/4] bg-gray-100 dark:bg-[#1A1A1B] mb-4 overflow-hidden rounded-xl">
                                <div className={`w-full h-full ${product.image} flex items-center justify-center text-gray-400 group-hover:scale-105 transition-transform duration-500`}>
                                    <svg className="w-12 h-12 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>

                                {/* Badge */}
                                <div className="absolute top-2 left-2 flex flex-col items-start gap-1">
                                    {product.badge && (
                                        <span className={`${BADGE_COLORS[product.badge] || 'bg-gray-700'} text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider`}>
                                          {product.badge}
                                        </span>
                                    )}
                                </div>

                                {/* Sold Out Overlay */}
                                {product.isSoldOut && (
                                    <div className="absolute inset-0 bg-white/70 dark:bg-black/70 flex items-center justify-center rounded-xl">
                                        <span className="text-gray-600 dark:text-gray-300 font-bold border border-gray-500 px-4 py-2 rounded-lg text-sm tracking-wider">품절</span>
                                    </div>
                                )}

                                {/* Quick Buy */}
                                {!product.isSoldOut && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-gray-900/90 text-white text-center py-2.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 font-bold text-sm rounded-b-xl">
                                        바로 구매
                                    </div>
                                )}
                            </div>

                            <div className="text-center px-1">
                                <h3 className="text-sm text-gray-800 dark:text-gray-200 mb-1.5 leading-snug line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-medium">
                                    {product.name}
                                </h3>
                                <p className="font-black text-base text-gray-900 dark:text-white">{product.price}원</p>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Pagination */}
                <div className="flex justify-center mt-16 gap-1">
                    {[1, 2, 3].map(page => (
                        <button key={page} className={`w-9 h-9 flex items-center justify-center text-sm font-bold rounded-lg transition-colors ${
                          page === 1
                            ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                            : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1A1A1B]'
                        }`}>
                            {page}
                        </button>
                    ))}
                </div>
            </div>
        </main>
        <Footer />
    </div>
  );
}
