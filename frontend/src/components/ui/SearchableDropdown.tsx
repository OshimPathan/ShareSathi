import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { getAllStocks } from '../../services/db';
import type { Stock } from '../../types';

interface SearchableDropdownProps {
    value: string;
    onChange: (symbol: string) => void;
    placeholder?: string;
}

export const SearchableDropdown = ({ value, onChange, placeholder = "Search companies..." }: SearchableDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(value);
    const [companies, setCompanies] = useState<Stock[]>([]);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchCompanies = async () => {
            const stocks = await getAllStocks();
            setCompanies(stocks);
        };
        fetchCompanies();
    }, []);

    useEffect(() => {
        setSearchQuery(value);
    }, [value]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredCompanies = companies.filter(c =>
        c.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.company_name.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 50);

    return (
        <div ref={wrapperRef} className="relative w-full">
            <div className="relative">
                <input
                    type="text"
                    required
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setIsOpen(true);
                        if (e.target.value === "") onChange("");
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder}
                    className="w-full bg-white border border-slate-300 rounded-md p-3 pl-10 text-sm text-slate-800 focus:ring-2 focus:ring-mero-teal outline-none uppercase placeholder:normal-case placeholder:text-slate-400"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>

            {isOpen && searchQuery && (
                <ul className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-md shadow-xl">
                    {filteredCompanies.length === 0 ? (
                        <li className="p-3 text-sm text-slate-500 text-center">No companies found.</li>
                    ) : (
                        filteredCompanies.map((c) => (
                            <li
                                key={c.symbol}
                                onClick={() => {
                                    setSearchQuery(c.symbol);
                                    onChange(c.symbol);
                                    setIsOpen(false);
                                }}
                                className="px-4 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 flex justify-between items-center"
                            >
                                <div>
                                    <p className="font-bold text-blue-600 text-sm">{c.symbol}</p>
                                    <p className="text-xs text-slate-500 truncate max-w-[200px]">{c.company_name}</p>
                                </div>
                                <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500 font-medium">{(c.sector || '').slice(0, 15)}</span>
                            </li>
                        ))
                    )}
                </ul>
            )}
        </div>
    );
};
