import { useEffect, useState } from "react";

export function useLocalState<T>(
  key: string,
  initial: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    const cached = localStorage.getItem(key);
    return cached ? JSON.parse(cached) : initial;
  });
  useEffect(() => localStorage.setItem(key, JSON.stringify(state)), [key, state]);
  return [state, setState];
}