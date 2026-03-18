import { useToastStore } from '@/shared/model/toastStore';

beforeEach(() => {
  useToastStore.setState({ toasts: [] });
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('toastStore', () => {
  test('addToast: 토스트 추가', () => {
    useToastStore.getState().addToast('메시지', 'info', 3000);
    const { toasts } = useToastStore.getState();
    expect(toasts).toHaveLength(1);
    expect(toasts[0].message).toBe('메시지');
    expect(toasts[0].type).toBe('info');
  });

  test('addToast: 기본 타입은 info', () => {
    useToastStore.getState().addToast('테스트');
    expect(useToastStore.getState().toasts[0].type).toBe('info');
  });

  test('addToast: 지정 시간 후 자동 제거', () => {
    useToastStore.getState().addToast('임시', 'info', 1000);
    expect(useToastStore.getState().toasts).toHaveLength(1);
    jest.advanceTimersByTime(1000);
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  test('removeToast: ID로 제거', () => {
    useToastStore.getState().addToast('토스트1');
    useToastStore.getState().addToast('토스트2');
    const id = useToastStore.getState().toasts[0].id;
    useToastStore.getState().removeToast(id);
    expect(useToastStore.getState().toasts).toHaveLength(1);
    expect(useToastStore.getState().toasts[0].message).toBe('토스트2');
  });

  test('success: success 타입으로 추가', () => {
    useToastStore.getState().success('성공!');
    expect(useToastStore.getState().toasts[0].type).toBe('success');
    expect(useToastStore.getState().toasts[0].message).toBe('성공!');
  });

  test('error: error 타입으로 추가', () => {
    useToastStore.getState().error('에러!');
    expect(useToastStore.getState().toasts[0].type).toBe('error');
  });

  test('warning: warning 타입으로 추가', () => {
    useToastStore.getState().warning('경고!');
    expect(useToastStore.getState().toasts[0].type).toBe('warning');
  });

  test('복수 토스트 스택', () => {
    useToastStore.getState().success('s');
    useToastStore.getState().error('e');
    useToastStore.getState().info('i');
    expect(useToastStore.getState().toasts).toHaveLength(3);
  });
});
