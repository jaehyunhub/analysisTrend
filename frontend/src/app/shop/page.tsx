'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Header from "@/widgets/Header/ui/Header";
import Footer from "@/widgets/Footer/ui/Footer";
import { getProducts } from '@/entities/product/api/productApi';
import type { Product } from '@/shared/types/shop';

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

const PAGE_SIZE = 6;

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(1);
    }, 300);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchInput]);

  useEffect(() => {
    setIsLoading(true);
    const category = activeCategory === 'ALL' ? undefined : activeCategory;
    getProducts(category, currentPage - 1, PAGE_SIZE)
      .then((res) => {
        setProducts(res.content);
        setTotalPages(Math.max(1, res.totalPages));
      })
      .catch(() => {
        setProducts([]);
      })
      .finally(() => setIsLoading(false));
  }, [activeCategory, currentPage]);

  const pagedProducts = searchQuery
    ? products.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : products;

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setCurrentPage(1);
  };

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

                {/* Search Bar */}
                <div className="flex justify-center mb-6">
                    <div className="relative w-full max-w-md">
                        <svg
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="상품 검색..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-[#1A1A1B] border border-gray-200 dark:border-[#343536] rounded-full text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 focus:ring-2 focus:ring-gray-400/20 transition-all"
                        />
                    </div>
                </div>

                {/* Category Filter */}
                <div className="flex justify-center gap-2 mb-10">
                    {CATEGORIES.map((cat) => (
                        <button
                          key={cat.key}
                          onClick={() => handleCategoryChange(cat.key)}
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
                {isLoading ? (
                  <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10">
                    {pagedProducts.map(product => (
                        <Link href={`/shop/${product.id}`} key={product.id} className="group block cursor-pointer">
                            <div className="relative aspect-[3/4] bg-gray-100 dark:bg-[#1A1A1B] mb-4 overflow-hidden rounded-xl">
                                <div className="w-full h-full flex items-center justify-center text-gray-400 group-hover:scale-105 transition-transform duration-500">
                                    {(product.imageUrl || product.image) ? (
                                      <img
                                        src={product.imageUrl ?? product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          const el = e.currentTarget;
                                          el.onerror = null;
                                          el.style.display = 'none';
                                        }}
                                      />
                                    ) : (
                                      <svg className="w-12 h-12 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                    )}
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
                                <p className="font-black text-base text-gray-900 dark:text-white">{product.price.toLocaleString()}원</p>
                            </div>
                        </Link>
                    ))}
                </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-16 gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-9 h-9 flex items-center justify-center text-sm font-bold rounded-lg transition-colors ${
                            page === currentPage
                              ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                              : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1A1A1B]'
                          }`}
                        >
                            {page}
                        </button>
                    ))}
                  </div>
                )}
            </div>
        </main>
        <Footer />
    </div>
  );
}
