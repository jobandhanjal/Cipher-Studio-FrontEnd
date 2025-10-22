import { useState, useCallback } from 'react';

export default function useToggle(initial = false) {
  const [on, setOn] = useState(initial);
  const toggle = useCallback(() => setOn(o => !o), []);
  return [on, toggle, setOn];
}
