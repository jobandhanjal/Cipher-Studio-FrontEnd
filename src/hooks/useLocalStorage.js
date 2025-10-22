import { useState, useEffect } from "react";

// Usage: const [value, setValue] = useLocalStorage(key, initialValue)
// Essential file model for File Explorer
const defaultFileModel = [
  {
    path: "/App.js",
    type: "file",
    meta: { size: 0, modifiedAt: Date.now() },
    children: undefined,
  },
  {
    path: "/index.js",
    type: "file",
    meta: { size: 0, modifiedAt: Date.now() },
    children: undefined,
  },
];

export default function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      const parsed = item ? JSON.parse(item) : initialValue;
      // Validate file model: must be array of objects with path/type
      if (
        Array.isArray(parsed) &&
        parsed.every(
          (f) =>
            typeof f.path === "string" &&
            typeof f.type === "string" &&
            (f.type === "file" || f.type === "folder")
        )
      ) {
        return parsed;
      }
      return defaultFileModel;
    } catch (error) {
      return defaultFileModel;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {}
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
