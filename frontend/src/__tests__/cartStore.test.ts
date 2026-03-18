import { useCartStore } from '@/shared/model/cartStore';

beforeEach(() => {
  useCartStore.setState({ items: [], totalPrice: 0 });
});

describe('cartStore', () => {
  const item1 = { id: 1, name: '상품A', price: 10000 };
  const item2 = { id: 2, name: '상품B', price: 25000 };

  test('addItem: 새 아이템 추가', () => {
    useCartStore.getState().addItem(item1);
    const { items, totalPrice } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(1);
    expect(totalPrice).toBe(10000);
  });

  test('addItem: 동일 아이템 수량 증가', () => {
    useCartStore.getState().addItem(item1);
    useCartStore.getState().addItem(item1);
    const { items, totalPrice } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(2);
    expect(totalPrice).toBe(20000);
  });

  test('addItem: 수량 지정 추가', () => {
    useCartStore.getState().addItem({ ...item1, quantity: 3 });
    expect(useCartStore.getState().items[0].quantity).toBe(3);
    expect(useCartStore.getState().totalPrice).toBe(30000);
  });

  test('addItem: 다른 옵션은 별도 아이템', () => {
    useCartStore.getState().addItem({ ...item1, option: '레드' });
    useCartStore.getState().addItem({ ...item1, option: '블루' });
    expect(useCartStore.getState().items).toHaveLength(2);
  });

  test('removeItem: 아이템 제거', () => {
    useCartStore.getState().addItem(item1);
    useCartStore.getState().addItem(item2);
    useCartStore.getState().removeItem(1);
    const { items, totalPrice } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe(2);
    expect(totalPrice).toBe(25000);
  });

  test('updateQuantity: 수량 변경', () => {
    useCartStore.getState().addItem(item1);
    useCartStore.getState().updateQuantity(1, 5);
    expect(useCartStore.getState().items[0].quantity).toBe(5);
    expect(useCartStore.getState().totalPrice).toBe(50000);
  });

  test('updateQuantity: 수량 0 이하로 설정 시 제거', () => {
    useCartStore.getState().addItem(item1);
    useCartStore.getState().updateQuantity(1, 0);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  test('clearCart: 전체 비우기', () => {
    useCartStore.getState().addItem(item1);
    useCartStore.getState().addItem(item2);
    useCartStore.getState().clearCart();
    expect(useCartStore.getState().items).toHaveLength(0);
    expect(useCartStore.getState().totalPrice).toBe(0);
  });

  test('totalPrice: 복수 아이템 합산', () => {
    useCartStore.getState().addItem({ ...item1, quantity: 2 });
    useCartStore.getState().addItem(item2);
    expect(useCartStore.getState().totalPrice).toBe(45000); // 10000*2 + 25000
  });
});
