import { useCallback, useEffect, useState } from "react";

// localStorage에 JSON으로 영속되는 상태 훅. 새로고침해도 값이 유지된다.
export function useLocalStorage<T>(
  key: string,
  initial: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // 저장 실패는 데모에서 무시
    }
  }, [key, value]);

  const set = useCallback(
    (next: T | ((prev: T) => T)) => setValue(next),
    []
  );

  return [value, set];
}
