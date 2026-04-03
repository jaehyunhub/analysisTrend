'use client';

import { useState, useEffect } from 'react';
import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from '@/shared/api/client';
import { useToastStore } from '@/shared/model/toastStore';

type ProductCategory = 'GOODS' | 'FOOD' | 'FASHION' | 'DIGITAL' | 'ALL';
type DetailBlock = { type: 'image'; url: string } | { type: 'text'; content: string };

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  discountRate?: number;
  category: ProductCategory;
  soldOut: boolean;
  imageUrl?: string;
  description?: string;
  detailContent?: string;
}

const CATEGORY_LABELS: Record<ProductCategory, string> = {
  GOODS: '굿즈',
  FOOD: '식품',
  FASHION: '패션',
  DIGITAL: '디지털',
  ALL: '전체',
};

const EMPTY_FORM = {
  name: '',
  price: 0,
  originalPrice: 0,
  discountRate: 0,
  category: 'GOODS' as ProductCategory,
  soldOut: false,
  imageUrl: '',
  description: '',
};

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formTab, setFormTab] = useState<'basic' | 'detail'>('basic');
  const [blocks, setBlocks] = useState<DetailBlock[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const addToast = useToastStore((s) => s.addToast);

  const load = async () => {
    setIsLoading(true);
    try {
      const data = await apiGet<{ content: Product[] } | Product[]>('/api/v1/products?page=0&size=100');
      setProducts(Array.isArray(data) ? data : (data as { content: Product[] }).content ?? []);
    } catch {
      addToast('상품 목록을 불러오지 못했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setBlocks([]);
    setFormTab('basic');
    setIsFormOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditTarget(p);
    setForm({
      name: p.name,
      price: p.price,
      originalPrice: p.originalPrice ?? 0,
      discountRate: p.discountRate ?? 0,
      category: p.category,
      soldOut: p.soldOut,
      imageUrl: p.imageUrl ?? '',
      description: p.description ?? '',
    });
    try {
      setBlocks(p.detailContent ? JSON.parse(p.detailContent) : []);
    } catch {
      setBlocks([]);
    }
    setFormTab('basic');
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      addToast('상품명을 입력해주세요.', 'error');
      return;
    }
    const payload = { ...form, detailContent: JSON.stringify(blocks) };
    try {
      if (editTarget) {
        const updated = await apiPut<Product>(`/api/v1/admin/products/${editTarget.id}`, payload);
        setProducts((prev) => prev.map((p) => (p.id === editTarget.id ? updated : p)));
        addToast('상품이 수정되었습니다.', 'success');
      } else {
        const created = await apiPost<Product>('/api/v1/admin/products', payload);
        setProducts((prev) => [...prev, created]);
        addToast('상품이 추가되었습니다.', 'success');
      }
      setIsFormOpen(false);
    } catch (e) {
      console.error(e);
      addToast('저장에 실패했습니다.', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('상품을 삭제하시겠습니까?')) return;
    try {
      await apiDelete(`/api/v1/admin/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      addToast('상품이 삭제되었습니다.', 'success');
    } catch (e) {
      console.error(e);
      addToast('삭제에 실패했습니다.', 'error');
    }
  };

  const handleToggleSoldOut = async (id: number) => {
    try {
      const updated = await apiPatch<Product>(`/api/v1/admin/products/${id}/sold-out`, {});
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    } catch (e) {
      console.error(e);
      addToast('품절 상태 변경에 실패했습니다.', 'error');
    }
  };

  // 블록 조작
  const addImageBlock = () => {
    if (!newImageUrl.trim()) { addToast('이미지 URL을 입력해주세요.', 'error'); return; }
    setBlocks((prev) => [...prev, { type: 'image', url: newImageUrl.trim() }]);
    setNewImageUrl('');
  };

  const addTextBlock = () => {
    setBlocks((prev) => [...prev, { type: 'text', content: '' }]);
  };

  const updateBlock = (idx: number, value: string) => {
    setBlocks((prev) => prev.map((b, i) => {
      if (i !== idx) return b;
      return b.type === 'image' ? { ...b, url: value } : { ...b, content: value };
    }));
  };

  const removeBlock = (idx: number) => {
    setBlocks((prev) => prev.filter((_, i) => i !== idx));
  };

  const moveBlock = (idx: number, dir: -1 | 1) => {
    const next = idx + dir;
    if (next < 0 || next >= blocks.length) return;
    setBlocks((prev) => {
      const arr = [...prev];
      [arr[idx], arr[next]] = [arr[next], arr[idx]];
      return arr;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">상품 관리</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">쇼핑몰 상품을 관리합니다.</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-blue-500/30 transition-colors"
        >
          + 상품 추가
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white dark:bg-[#1A1A1B] p-6 rounded-2xl border border-gray-200 dark:border-[#343536] shadow-sm">
          <h3 className="font-bold mb-4 dark:text-white">{editTarget ? '상품 수정' : '상품 추가'}</h3>

          {/* 탭 */}
          <div className="flex gap-1 mb-5 border-b border-gray-200 dark:border-[#343536]">
            {([['basic', '기본 정보'], ['detail', '상세 페이지']] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFormTab(key)}
                className={`px-5 py-2.5 text-sm font-bold border-b-2 transition-colors ${
                  formTab === key
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-white'
                }`}
              >
                {label}
                {key === 'detail' && blocks.length > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] bg-blue-100 text-blue-600 dark:bg-blue-900/40">
                    {blocks.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* 기본 정보 탭 */}
          {formTab === 'basic' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-400 mb-1">상품명 *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="상품명을 입력하세요"
                  className="w-full bg-gray-50 dark:bg-[#272729] border border-gray-200 dark:border-[#343536] rounded-lg p-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">판매가 *</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
                  className="w-full bg-gray-50 dark:bg-[#272729] border border-gray-200 dark:border-[#343536] rounded-lg p-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">원가</label>
                <input
                  type="number"
                  value={form.originalPrice}
                  onChange={(e) => setForm((f) => ({ ...f, originalPrice: Number(e.target.value) }))}
                  className="w-full bg-gray-50 dark:bg-[#272729] border border-gray-200 dark:border-[#343536] rounded-lg p-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">할인율 (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.discountRate}
                  onChange={(e) => setForm((f) => ({ ...f, discountRate: Number(e.target.value) }))}
                  className="w-full bg-gray-50 dark:bg-[#272729] border border-gray-200 dark:border-[#343536] rounded-lg p-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">카테고리</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ProductCategory }))}
                  className="w-full bg-gray-50 dark:bg-[#272729] border border-gray-200 dark:border-[#343536] rounded-lg p-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {(['GOODS', 'FOOD', 'FASHION', 'DIGITAL'] as ProductCategory[]).map((cat) => (
                    <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">대표 이미지 URL</label>
                <input
                  type="text"
                  value={form.imageUrl}
                  onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                  placeholder="https://..."
                  className="w-full bg-gray-50 dark:bg-[#272729] border border-gray-200 dark:border-[#343536] rounded-lg p-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              {form.imageUrl && (
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">이미지 미리보기</label>
                  <img
                    src={form.imageUrl}
                    alt="상품 이미지 미리보기"
                    className="w-24 h-24 rounded-lg object-cover border border-gray-200 dark:border-[#343536]"
                  />
                </div>
              )}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-400 mb-1">한 줄 설명</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="상품 목록에 표시되는 짧은 설명"
                  rows={2}
                  className="w-full bg-gray-50 dark:bg-[#272729] border border-gray-200 dark:border-[#343536] rounded-lg p-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="soldOut"
                  checked={form.soldOut}
                  onChange={(e) => setForm((f) => ({ ...f, soldOut: e.target.checked }))}
                  className="w-4 h-4"
                />
                <label htmlFor="soldOut" className="text-sm font-medium dark:text-gray-300">품절 처리</label>
              </div>
            </div>
          )}

          {/* 상세 페이지 탭 */}
          {formTab === 'detail' && (
            <div className="space-y-4 mb-4">
              <p className="text-xs text-gray-400">이미지와 텍스트 블록을 추가해 상품 상세 페이지 내용을 구성합니다.</p>

              {/* 블록 목록 */}
              {blocks.length === 0 && (
                <div className="border-2 border-dashed border-gray-200 dark:border-[#343536] rounded-xl p-8 text-center text-gray-400 text-sm">
                  아래 버튼으로 이미지 또는 텍스트 블록을 추가하세요.
                </div>
              )}
              <div className="space-y-3">
                {blocks.map((block, idx) => (
                  <div key={idx} className="bg-gray-50 dark:bg-[#272729] border border-gray-200 dark:border-[#343536] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        block.type === 'image'
                          ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                          : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        {block.type === 'image' ? '🖼 이미지' : '📝 텍스트'}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => moveBlock(idx, -1)}
                          disabled={idx === 0}
                          className="px-2 py-1 text-xs text-gray-400 hover:text-gray-700 dark:hover:text-white disabled:opacity-30 transition-colors"
                          title="위로"
                        >▲</button>
                        <button
                          onClick={() => moveBlock(idx, 1)}
                          disabled={idx === blocks.length - 1}
                          className="px-2 py-1 text-xs text-gray-400 hover:text-gray-700 dark:hover:text-white disabled:opacity-30 transition-colors"
                          title="아래로"
                        >▼</button>
                        <button
                          onClick={() => removeBlock(idx)}
                          className="px-2 py-1 text-xs text-red-400 hover:text-red-600 transition-colors ml-1"
                          title="삭제"
                        >✕</button>
                      </div>
                    </div>
                    {block.type === 'image' ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={block.url}
                          onChange={(e) => updateBlock(idx, e.target.value)}
                          placeholder="이미지 URL"
                          className="w-full bg-white dark:bg-[#1A1A1B] border border-gray-200 dark:border-[#343536] rounded-lg p-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        {block.url && (
                          <img
                            src={block.url}
                            alt="미리보기"
                            className="w-full max-h-48 object-cover rounded-lg border border-gray-200 dark:border-[#343536]"
                          />
                        )}
                      </div>
                    ) : (
                      <textarea
                        value={block.content}
                        onChange={(e) => updateBlock(idx, e.target.value)}
                        placeholder="텍스트 내용을 입력하세요"
                        rows={4}
                        className="w-full bg-white dark:bg-[#1A1A1B] border border-gray-200 dark:border-[#343536] rounded-lg p-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* 이미지 추가 */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addImageBlock()}
                  placeholder="이미지 URL 입력 후 추가"
                  className="flex-1 bg-gray-50 dark:bg-[#272729] border border-gray-200 dark:border-[#343536] rounded-lg p-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  onClick={addImageBlock}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-bold transition-colors whitespace-nowrap"
                >
                  + 이미지 블록
                </button>
                <button
                  onClick={addTextBlock}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold transition-colors whitespace-nowrap"
                >
                  + 텍스트 블록
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-[#343536]">
            <button onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white">취소</button>
            <button onClick={handleSave} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold">저장</button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-[#1A1A1B] rounded-2xl border border-gray-200 dark:border-[#343536] overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">불러오는 중...</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-[#272729] border-b border-gray-200 dark:border-[#343536]">
              <tr>
                <th className="px-4 py-4 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">상품</th>
                <th className="px-4 py-4 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">카테고리</th>
                <th className="px-4 py-4 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">가격</th>
                <th className="px-4 py-4 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">상태</th>
                <th className="px-4 py-4 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#343536]">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-[#212124] transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover border border-gray-200 dark:border-[#343536] flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-[#343536] flex items-center justify-center text-gray-400 flex-shrink-0 text-xs">없음</div>
                      )}
                      <div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{product.name}</p>
                        {product.description && (
                          <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{product.description}</p>
                        )}
                        {product.detailContent && (() => {
                          try {
                            const blocks = JSON.parse(product.detailContent);
                            return Array.isArray(blocks) && blocks.length > 0 ? (
                              <span className="text-[10px] text-blue-500 font-medium mt-0.5 block">상세페이지 {blocks.length}개 블록</span>
                            ) : null;
                          } catch { return null; }
                        })()}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      {CATEGORY_LABELS[product.category] ?? product.category}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      <p className="font-bold">{product.price.toLocaleString()}원</p>
                      {product.originalPrice ? (
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-through">{product.originalPrice.toLocaleString()}원</p>
                      ) : null}
                      {product.discountRate ? (
                        <p className="text-xs text-red-500 font-bold">{product.discountRate}% 할인</p>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => handleToggleSoldOut(product.id)}
                      className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                        product.soldOut
                          ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 hover:bg-green-100 hover:text-green-600'
                          : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 hover:bg-red-100 hover:text-red-600'
                      }`}
                    >
                      {product.soldOut ? '품절' : '판매중'}
                    </button>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(product)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors"
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">등록된 상품이 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
