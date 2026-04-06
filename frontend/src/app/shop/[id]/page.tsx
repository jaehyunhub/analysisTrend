'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Header from "@/widgets/Header/ui/Header";
import Footer from "@/widgets/Footer/ui/Footer";
import { useCartStore } from '@/shared/model/cartStore';
import { useToastStore } from '@/shared/model/toastStore';
import { getProductById } from '@/entities/product/api/productApi';
import type { Product, DetailBlock } from '@/shared/types/shop';

interface SelectedItem {
  option: string;
  quantity: number;
}

function parseThumbnails(product: Product): string[] {
  const urls: string[] = [];
  if (product.imageUrl) urls.push(product.imageUrl);
  else if (product.image) urls.push(product.image);
  try {
    if (product.thumbnailImages) {
      const extra: string[] = JSON.parse(product.thumbnailImages);
      extra.forEach((url) => { if (!urls.includes(url)) urls.push(url); });
    }
  } catch { /* ignore */ }
  return urls;
}

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('detail');
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const { addItem } = useCartStore();
  const { addToast } = useToastStore();

  useEffect(() => {
    const id = Number(params.id);
    if (!id) return;
    getProductById(id)
      .then((data) => setProduct(data))
      .catch(() => addToast('상품 정보를 불러오지 못했습니다.', 'error'))
      .finally(() => setIsLoading(false));
  }, [params.id]);

  const detailBlocks: DetailBlock[] = (() => {
    if (!product?.detailContent) return [];
    try { return JSON.parse(product.detailContent); } catch { return []; }
  })();

  const options = ['기본 구성', '선물 포장 (+3,000원)', '대용량 (+추가금)'];

  const handleOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (!value) return;
    const existing = selectedItems.find(item => item.option === value);
    if (existing) {
      setSelectedItems(prev => prev.map(item => item.option === value ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setSelectedItems(prev => [...prev, { option: value, quantity: 1 }]);
    }
    e.target.value = '';
  };

  const removeItem = (option: string) => {
    setSelectedItems(prev => prev.filter(item => item.option !== option));
  };

  const updateQuantity = (option: string, delta: number) => {
    setSelectedItems(prev =>
      prev.map(item => item.option === option ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item)
    );
  };

  const totalQty = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = product ? selectedItems.reduce((sum, item) => sum + product.price * item.quantity, 0) : 0;

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveTab(id);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-black min-h-screen">
        <Header />
        <div className="flex justify-center items-center h-96">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-white dark:bg-black min-h-screen">
        <Header />
        <div className="flex flex-col justify-center items-center h-96 gap-4">
          <p className="text-gray-400 text-lg">상품을 찾을 수 없습니다.</p>
          <Link href="/shop" className="text-blue-600 hover:underline text-sm">쇼핑몰로 돌아가기</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const isSoldOut = product.isSoldOut || product.soldOut;
  const discountPct = product.discount ?? product.discountRate;
  const thumbnails = parseThumbnails(product);
  const activeImage = thumbnails[activeImageIdx] ?? null;

  return (
    <div className="bg-white dark:bg-black min-h-screen">
      <Header />

      <main className="pb-20 pt-10">
        <div className="max-w-[1200px] mx-auto px-6">

          {/* Breadcrumb */}
          <div className="text-xs text-gray-500 mb-8 flex items-center gap-1.5">
            <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">홈</Link>
            <span className="text-gray-300 dark:text-gray-600">›</span>
            <Link href="/shop" className="hover:text-black dark:hover:text-white transition-colors">쇼핑</Link>
            <span className="text-gray-300 dark:text-gray-600">›</span>
            <span className="font-bold text-black dark:text-white">{product.category}</span>
          </div>

          {/* Top Section */}
          <div className="flex flex-col md:flex-row gap-12 mb-20">

            {/* Left: Image Slider */}
            <div className="flex-1">
              {/* Main Image */}
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden mb-3 bg-gray-100 dark:bg-[#1A1A1B]">
                {activeImage ? (
                  <img
                    src={activeImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                {/* Prev/Next arrows */}
                {thumbnails.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImageIdx((i) => (i - 1 + thumbnails.length) % thumbnails.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 dark:bg-black/60 flex items-center justify-center shadow hover:bg-white dark:hover:bg-black transition-colors text-gray-700 dark:text-gray-200 text-lg"
                      aria-label="이전 이미지"
                    >‹</button>
                    <button
                      onClick={() => setActiveImageIdx((i) => (i + 1) % thumbnails.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 dark:bg-black/60 flex items-center justify-center shadow hover:bg-white dark:hover:bg-black transition-colors text-gray-700 dark:text-gray-200 text-lg"
                      aria-label="다음 이미지"
                    >›</button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {thumbnails.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImageIdx(i)}
                          className={`w-2 h-2 rounded-full transition-colors ${i === activeImageIdx ? 'bg-white' : 'bg-white/50'}`}
                        />
                      ))}
                    </div>
                  </>
                )}
                {isSoldOut && (
                  <div className="absolute inset-0 bg-white/70 dark:bg-black/70 flex items-center justify-center">
                    <span className="text-gray-600 dark:text-gray-300 font-bold border border-gray-500 px-6 py-3 rounded-xl text-lg tracking-wider">품절</span>
                  </div>
                )}
              </div>

              {/* Thumbnail Strip */}
              {thumbnails.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {thumbnails.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImageIdx(i)}
                      className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${
                        i === activeImageIdx
                          ? 'border-blue-600'
                          : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <img src={url} alt={`썸네일 ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Info */}
            <div className="flex-1 flex flex-col">
              <div className="border-b border-gray-200 dark:border-gray-800 pb-6 mb-6">
                {discountPct && discountPct > 0 ? (
                  <span className="inline-block bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full mb-2">{discountPct}% 할인</span>
                ) : null}
                <h2 className="text-2xl font-bold mb-2 text-black dark:text-white">{product.name}</h2>
                {product.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-5 leading-relaxed">{product.description}</p>
                )}
                <div className="flex items-end gap-3">
                  <span className="text-3xl font-black text-black dark:text-white">{product.price.toLocaleString()}원</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-lg text-gray-400 line-through">{product.originalPrice.toLocaleString()}원</span>
                  )}
                </div>
              </div>

              <div className="flex-1 space-y-5">
                {/* Option Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-black dark:text-gray-300">옵션 선택</label>
                  <div className="relative">
                    <select
                      disabled={isSoldOut}
                      className="w-full border border-gray-300 dark:border-gray-700 p-3 pr-10 text-sm rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-black dark:bg-[#1A1A1B] dark:text-white transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      onChange={handleOptionChange}
                      defaultValue=""
                    >
                      <option value="" disabled>— 옵션을 선택해주세요 —</option>
                      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    <div className="absolute right-3 top-3.5 pointer-events-none text-gray-400 text-xs">▼</div>
                  </div>
                </div>

                {/* Selected Items */}
                {selectedItems.length > 0 && (
                  <div className="space-y-2 rounded-xl border border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-[#111]">
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">선택된 옵션</p>
                    {selectedItems.map(item => (
                      <div key={item.option} className="bg-white dark:bg-[#1A1A1B] border border-gray-200 dark:border-gray-700 p-3 rounded-xl flex justify-between items-center gap-3">
                        <span className="text-sm font-medium text-black dark:text-white flex-1 min-w-0 truncate">{item.option}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                            <button className="px-2.5 py-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-bold transition-colors" onClick={() => updateQuantity(item.option, -1)}>−</button>
                            <span className="px-3 text-sm font-bold text-black dark:text-white min-w-[2rem] text-center">{item.quantity}</span>
                            <button className="px-2.5 py-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-bold transition-colors" onClick={() => updateQuantity(item.option, 1)}>+</button>
                          </div>
                          <span className="text-sm font-bold text-blue-600 w-24 text-right">{(product.price * item.quantity).toLocaleString()}원</span>
                          <button onClick={() => removeItem(item.option)} className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30 transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Total Price */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-800">
                  <span className="font-bold text-black dark:text-gray-300">총 주문금액 <span className="text-sm font-normal">({totalQty}개)</span></span>
                  <span className="font-black text-2xl text-blue-600">{totalPrice.toLocaleString()}원</span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 h-14">
                  <button
                    disabled={selectedItems.length === 0 || !!isSoldOut}
                    onClick={() => {
                      selectedItems.forEach(item => {
                        addItem({ id: product.id, name: `${product.name} - ${item.option}`, price: product.price, quantity: item.quantity, option: item.option });
                      });
                      addToast('장바구니에 담겼습니다!', 'success');
                    }}
                    className="flex-1 border-2 border-blue-600 text-blue-600 font-bold rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                  >
                    장바구니 담기
                  </button>
                  <button
                    disabled={selectedItems.length === 0 || !!isSoldOut}
                    className="flex-1 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                  >
                    바로 구매
                  </button>
                </div>
                <p className="text-xs text-center text-gray-400">옵션을 선택하면 구매 버튼이 활성화됩니다</p>
              </div>
            </div>
          </div>

          {/* Sticky Tabs */}
          <div className="sticky top-[52px] z-40 bg-white dark:bg-black border-y border-gray-200 dark:border-gray-800 mb-10">
            <div className="flex">
              {[
                { key: 'detail', label: '상품 상세' },
                { key: 'review', label: '구매 후기' },
                { key: 'qna', label: 'Q&A' },
                { key: 'info', label: '구매 정보' },
              ].map(tab => (
                <button
                  key={tab.key}
                  className={`flex-1 py-4 text-sm font-bold transition-colors border-b-2 ${
                    activeTab === tab.key
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-black hover:text-gray-700 dark:text-gray-300 dark:hover:text-white'
                  }`}
                  onClick={() => scrollToSection(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sections */}
          <div className="flex flex-col gap-20 pb-20">

            {/* 상품 상세 */}
            <div id="detail" className="scroll-mt-[120px]">
              {detailBlocks.length > 0 ? (
                <div className="flex flex-col items-center gap-8">
                  {detailBlocks.map((block, idx) =>
                    block.type === 'image' ? (
                      <img
                        key={idx}
                        src={block.url}
                        alt={`상세 이미지 ${idx + 1}`}
                        className="w-full max-w-[800px] rounded-2xl object-contain"
                      />
                    ) : (
                      <p key={idx} className="max-w-[800px] w-full text-black dark:text-gray-200 leading-relaxed text-base whitespace-pre-wrap">
                        {block.content}
                      </p>
                    )
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-8 text-center pt-10">
                  <div className="w-full max-w-[800px] aspect-[3/2] bg-gray-100 dark:bg-gray-900 rounded-2xl flex items-center justify-center text-gray-400 text-sm">
                    상세 이미지가 준비 중입니다.
                  </div>
                  {product.description && (
                    <p className="max-w-[800px] text-black dark:text-gray-200 leading-relaxed text-base">
                      {product.description}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Reviews */}
            <div id="review" className="scroll-mt-[120px] border-t border-gray-200 dark:border-gray-800 pt-20">
              <div className="max-w-[1000px] mx-auto">
                <h3 className="text-2xl font-bold text-black dark:text-white mb-8">구매 후기</h3>
                <div className="text-center text-gray-400 py-12">아직 등록된 후기가 없습니다.</div>
              </div>
            </div>

            {/* Q&A */}
            <div id="qna" className="scroll-mt-[120px] border-t border-gray-200 dark:border-gray-800 pt-20">
              <div className="max-w-[1000px] mx-auto">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-bold text-black dark:text-white">Q&A</h3>
                  <button className="bg-blue-600 text-white px-6 py-2 text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors">문의하기</button>
                </div>
                <div className="text-center text-gray-400 py-12">등록된 문의가 없습니다.</div>
              </div>
            </div>

            {/* Purchase Info */}
            <div id="info" className="scroll-mt-[120px] border-t border-gray-200 dark:border-gray-800 pt-20">
              <div className="max-w-[1000px] mx-auto bg-gray-50 dark:bg-[#1A1A1B] p-10 rounded-2xl">
                <h3 className="text-xl font-bold mb-6 text-black dark:text-white">구매 및 배송 안내</h3>
                <div className="space-y-5 text-sm text-black dark:text-gray-200 leading-7">
                  <div>
                    <strong className="block text-black dark:text-white mb-1">배송 안내</strong>
                    <p>일반 배송은 2~3 영업일 소요됩니다. 50,000원 이상 구매 시 무료배송.</p>
                  </div>
                  <hr className="border-gray-200 dark:border-gray-700" />
                  <div>
                    <strong className="block text-black dark:text-white mb-1">교환 및 반품</strong>
                    <p>상품 수령 후 7일 이내, 상품 손상 시에만 반품 가능합니다. 고객센터로 문의해 주세요.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
