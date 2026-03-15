'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Header from "@/widgets/Header/ui/Header";
import Footer from "@/widgets/Footer/ui/Footer";

interface SelectedItem {
  option: string;
  quantity: number;
}

const PRODUCT_IMAGES = [
  'bg-gradient-to-br from-pink-100 to-red-200',
  'bg-gradient-to-br from-blue-100 to-indigo-200',
  'bg-gradient-to-br from-green-100 to-emerald-200',
];

export default function ProductDetailPage() {
  const params = useParams();
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState('detail');
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  const product = {
    id: params.id,
    name: '제주 흑돼지 특선 세트 (500g)',
    price: 45000,
    originalPrice: 50000,
    discount: 10,
    description: '제주 현지 농장에서 직접 공수한 프리미엄 제주 흑돼지입니다. 특유의 마블링과 식감이 일품이며, BBQ 파티에 완벽합니다.',
    options: ['기본 패키지 (500g)', '선물 패키지 (+5,000원)', '대용량 패키지 (1kg) (+40,000원)'],
  };

  const handleOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (!value) return;
    const existing = selectedItems.find(item => item.option === value);
    if (existing) {
      setSelectedItems(prev =>
        prev.map(item => item.option === value ? { ...item, quantity: item.quantity + 1 } : item)
      );
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
      prev.map(item =>
        item.option === option ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    );
  };

  const totalQty = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = selectedItems.reduce((sum, item) => sum + product.price * item.quantity, 0);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveTab(id);
    }
  };

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
            <span className="font-bold text-black dark:text-white">식품</span>
          </div>

          {/* Top Section */}
          <div className="flex flex-col md:flex-row gap-12 mb-20">

            {/* Left: Image Slider */}
            <div className="flex-1">
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden mb-4 group">
                <div className={`w-full h-full ${PRODUCT_IMAGES[activeImage]} flex items-center justify-center transition-all duration-300`}>
                  <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>

                {/* Prev Button */}
                <button
                  onClick={() => setActiveImage(prev => (prev - 1 + PRODUCT_IMAGES.length) % PRODUCT_IMAGES.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 dark:bg-black/70 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 hover:bg-white dark:hover:bg-black transition-all"
                  aria-label="이전 이미지"
                >
                  <svg className="w-5 h-5 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Next Button */}
                <button
                  onClick={() => setActiveImage(prev => (prev + 1) % PRODUCT_IMAGES.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 dark:bg-black/70 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 hover:bg-white dark:hover:bg-black transition-all"
                  aria-label="다음 이미지"
                >
                  <svg className="w-5 h-5 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {PRODUCT_IMAGES.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`h-2 rounded-full transition-all ${i === activeImage ? 'bg-blue-600 w-5' : 'bg-white/70 w-2 hover:bg-white'}`}
                      aria-label={`이미지 ${i + 1}`}
                    />
                  ))}
                </div>

                {/* Image counter */}
                <div className="absolute top-3 right-3 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {activeImage + 1} / {PRODUCT_IMAGES.length}
                </div>
              </div>

              {/* Thumbnails */}
              <div className="flex gap-2">
                {PRODUCT_IMAGES.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-20 h-20 ${img} rounded-xl border-2 transition-all ${i === activeImage ? 'border-blue-600 shadow-md scale-105' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'}`}
                    aria-label={`썸네일 ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Right: Info */}
            <div className="flex-1 flex flex-col">
              <div className="border-b border-gray-200 dark:border-gray-800 pb-6 mb-6">
                {product.discount > 0 && (
                  <span className="inline-block bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full mb-2">{product.discount}% 할인</span>
                )}
                <h2 className="text-2xl font-bold mb-2 dark:text-white">{product.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">{product.description}</p>
                <div className="flex items-end gap-3">
                  <span className="text-3xl font-black dark:text-white">{product.price.toLocaleString()}원</span>
                  {product.discount > 0 && (
                    <span className="text-lg text-gray-400 line-through">{product.originalPrice.toLocaleString()}원</span>
                  )}
                </div>
              </div>

              <div className="flex-1 space-y-5">
                {/* Option Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300">옵션 선택</label>
                  <div className="relative">
                    <select
                      className="w-full border border-gray-300 dark:border-gray-700 p-3 pr-10 text-sm rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-[#1A1A1B] dark:text-white transition-all appearance-none cursor-pointer"
                      onChange={handleOptionChange}
                      defaultValue=""
                    >
                      <option value="" disabled>— 옵션을 선택해주세요 —</option>
                      {product.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    <div className="absolute right-3 top-3.5 pointer-events-none text-gray-400 text-xs">▼</div>
                  </div>
                  <p className="text-xs text-gray-400">* 같은 옵션 선택 시 수량이 증가합니다</p>
                </div>

                {/* Selected Items */}
                {selectedItems.length > 0 && (
                  <div className="space-y-2 rounded-xl border border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-[#111]">
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">선택된 옵션</p>
                    {selectedItems.map(item => (
                      <div
                        key={item.option}
                        className="bg-white dark:bg-[#1A1A1B] border border-gray-200 dark:border-gray-700 p-3 rounded-xl flex justify-between items-center gap-3"
                      >
                        <span className="text-sm font-medium dark:text-white flex-1 min-w-0 truncate">{item.option}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Quantity controls */}
                          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                            <button
                              className="px-2.5 py-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-bold transition-colors"
                              onClick={() => updateQuantity(item.option, -1)}
                              aria-label="수량 감소"
                            >−</button>
                            <span className="px-3 text-sm font-bold dark:text-white min-w-[2rem] text-center">{item.quantity}</span>
                            <button
                              className="px-2.5 py-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-bold transition-colors"
                              onClick={() => updateQuantity(item.option, 1)}
                              aria-label="수량 증가"
                            >+</button>
                          </div>
                          {/* Item price */}
                          <span className="text-sm font-bold text-blue-600 w-24 text-right">
                            {(product.price * item.quantity).toLocaleString()}원
                          </span>
                          {/* Remove button */}
                          <button
                            onClick={() => removeItem(item.option)}
                            className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30 transition-colors"
                            aria-label="옵션 삭제"
                          >
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
                  <span className="font-bold text-gray-700 dark:text-gray-300">
                    총 주문금액 <span className="text-gray-400 text-sm font-normal">({totalQty}개)</span>
                  </span>
                  <span className="font-black text-2xl text-blue-600">{totalPrice.toLocaleString()}원</span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 h-14">
                  <button
                    disabled={selectedItems.length === 0}
                    className="flex-1 border-2 border-blue-600 text-blue-600 font-bold rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                  >
                    장바구니 담기
                  </button>
                  <button
                    disabled={selectedItems.length === 0}
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
                { key: 'review', label: '구매 후기 (23)' },
                { key: 'qna', label: 'Q&A' },
                { key: 'info', label: '구매 정보' },
              ].map(tab => (
                <button
                  key={tab.key}
                  className={`flex-1 py-4 text-sm font-bold transition-colors border-b-2 ${
                    activeTab === tab.key
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                  }`}
                  onClick={() => scrollToSection(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scrolling Sections */}
          <div className="flex flex-col gap-20 pb-20">
            {/* Detail */}
            <div id="detail" className="scroll-mt-[120px] flex flex-col items-center gap-8 text-center pt-10">
              <div className="w-full max-w-[800px] aspect-[3/4] bg-gray-100 dark:bg-gray-900 rounded-2xl flex items-center justify-center text-gray-400 text-sm">
                상세 이미지 01
              </div>
              <p className="max-w-[800px] text-gray-600 dark:text-gray-300 leading-relaxed text-justify text-base">
                제주 흑돼지의 풍부한 맛을 즐겨보세요. 독특한 마블링과 식감으로 유명한 이 고기는 어떤 특별한 날에도 완벽합니다.
                제주도 최고의 농장에서 직접 공수하여 신선도와 품질을 보장합니다.<br /><br />
                쫄깃하면서도 부드러운 식감, 기름기가 많지 않고 고소한 맛이 일품입니다.
                김치, 마늘 등 전통 한국 반찬과 완벽하게 어울립니다.
              </p>
              <div className="w-full max-w-[800px] aspect-video bg-gray-100 dark:bg-gray-900 rounded-2xl flex items-center justify-center text-gray-400 text-sm">
                상세 이미지 02
              </div>
            </div>

            {/* Reviews */}
            <div id="review" className="scroll-mt-[120px] border-t border-gray-200 dark:border-gray-800 pt-20">
              <div className="max-w-[1000px] mx-auto">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-bold dark:text-white">구매 후기 <span className="text-gray-400 font-normal text-xl">(23)</span></h3>
                  <div className="text-right">
                    <div className="text-3xl font-black text-yellow-500">4.8</div>
                    <div className="text-xs text-gray-400">평균 별점</div>
                  </div>
                </div>
                <div className="space-y-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="border-b border-gray-100 dark:border-gray-800 pb-6">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-yellow-500 text-sm">★★★★★</span>
                        <span className="text-xs text-gray-400">2026-02-0{i}</span>
                      </div>
                      <p className="text-base dark:text-gray-300 mb-2 font-medium">맛있어요! 또 구매할게요.</p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="font-bold text-gray-600 dark:text-gray-400">user***</span>
                        <span>• 옵션: 기본 패키지 (500g)</span>
                      </div>
                    </div>
                  ))}
                  <button className="w-full py-4 border border-gray-300 dark:border-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors dark:text-white">
                    전체 후기 보기
                  </button>
                </div>
              </div>
            </div>

            {/* Q&A */}
            <div id="qna" className="scroll-mt-[120px] border-t border-gray-200 dark:border-gray-800 pt-20">
              <div className="max-w-[1000px] mx-auto">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-bold dark:text-white">Q&A</h3>
                  <button className="bg-blue-600 text-white px-6 py-2 text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors">문의하기</button>
                </div>
                <div className="space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="bg-gray-50 dark:bg-[#1A1A1B] p-6 rounded-2xl">
                      <div className="flex items-start gap-3 mb-3">
                        <span className="shrink-0 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] font-bold px-2 py-0.5 rounded-md">Q</span>
                        <p className="text-sm font-bold dark:text-white">재입고는 언제 되나요?</p>
                      </div>
                      <div className="flex items-start gap-3 pl-4 border-l-2 border-blue-200 dark:border-blue-800">
                        <span className="shrink-0 text-blue-600 text-[10px] font-bold px-2 py-0.5">A</span>
                        <p className="text-sm text-gray-600 dark:text-gray-400">다음 주 중으로 재입고 예정입니다!</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Purchase Info */}
            <div id="info" className="scroll-mt-[120px] border-t border-gray-200 dark:border-gray-800 pt-20">
              <div className="max-w-[1000px] mx-auto bg-gray-50 dark:bg-[#1A1A1B] p-10 rounded-2xl">
                <h3 className="text-xl font-bold mb-6 dark:text-white">구매 및 배송 안내</h3>
                <div className="space-y-5 text-sm text-gray-600 dark:text-gray-400 leading-7">
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
