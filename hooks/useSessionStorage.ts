import { useEffect, useState } from "react";
import pkg from "../package.json";

const prefix = `transform:${pkg.version}:`;

export function useSessionStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(initialValue);

  useEffect(() => {
    try {
      const item = window.sessionStorage.getItem(prefix + key);
      if (item !== null) {
        setStoredValue(key.startsWith("data:") ? item : JSON.parse(item));
      }
    } catch (error) {
      console.log(error);
    }
  }, [key]);

  const setValue = value => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      if (typeof window !== "undefined")
        window.sessionStorage.setItem(
          prefix + key,
          key.startsWith("data:") ? valueToStore : JSON.stringify(valueToStore)
        );
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.log(error);
    }
  };

  return [storedValue, setValue];
}
