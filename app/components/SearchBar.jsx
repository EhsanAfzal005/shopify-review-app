import { useState, useCallback, useRef, useEffect } from "react";

/**
 * SearchBar — Debounced search input using Polaris native s-text-field.
 *
 * Props:
 *   initialValue  {string}   Pre-filled value (e.g. from URL param)
 *   placeholder   {string}
 *   onSearch      {function} (query: string) => void  — fired after debounce
 *   debounceMs    {number}   Debounce delay in ms (default 400)
 */
export default function SearchBar({
    initialValue = "",
    placeholder = "Search...",
    onSearch,
    debounceMs = 400,
}) {
    const [query, setQuery] = useState(initialValue);
    const timerRef = useRef(null);

    const handleChange = useCallback((value) => {
        setQuery(value);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            onSearch(value.trim());
        }, debounceMs);
    }, [onSearch, debounceMs]);

    const handleClear = useCallback(() => {
        setQuery("");
        if (timerRef.current) clearTimeout(timerRef.current);
        onSearch("");
    }, [onSearch]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    return (
        <s-text-field
            type="search"
            label=""
            placeholder={placeholder}
            value={query}
            onInput={(e) => handleChange(e.target.value)}
            onClear={handleClear}
            clearButton={query ? true : undefined}
        >
            <s-icon slot="prefix" name="search"></s-icon>
        </s-text-field>
    );
}
