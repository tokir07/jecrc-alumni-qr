import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check, X } from 'lucide-react';

interface SearchableSelectProps {
  id?: string;
  name?: string;
  label: string;
  value: string;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  onChange: (value: string) => void;
  helperText?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  id,
  name,
  label,
  value,
  options,
  placeholder = 'Select an option...',
  disabled = false,
  required = false,
  onChange,
  helperText,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative w-full space-y-1" ref={containerRef}>
      <label
        htmlFor={id}
        className="block text-xs font-semibold text-[#172033]"
      >
        {label} {required && <span className="text-[#E31827]">*</span>}
      </label>

      {/* Main Trigger Button */}
      <button
        id={id}
        name={name}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) setIsOpen((prev) => !prev);
        }}
        className={`w-full px-3.5 py-2.5 sm:py-2 text-sm sm:text-xs min-h-[44px] rounded-xl border text-left flex items-center justify-between gap-2 transition-colors touch-manipulation cursor-pointer ${
          disabled
            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
            : isOpen
            ? 'bg-white border-[#E31827] ring-1 ring-[#E31827]/20 text-[#172033]'
            : 'bg-white border-[#E5E7EB] hover:border-gray-300 text-[#172033]'
        }`}
      >
        <span className={`truncate ${!value ? 'text-gray-400' : 'font-medium'}`}>
          {value || placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-[#64748B] shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#E31827]' : ''
          }`}
        />
      </button>

      {helperText && (
        <p className="text-[11px] text-[#64748B]">{helperText}</p>
      )}

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-xl border border-[#E5E7EB] shadow-lg overflow-hidden animate-fadeIn max-h-72 flex flex-col">
          {/* Search Input Bar */}
          <div className="p-2 border-b border-[#E5E7EB] bg-[#FAFAFB] sticky top-0 z-10">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type to search..."
                className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg border border-[#E5E7EB] bg-white outline-none focus:border-[#E31827] text-[#172033]"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="overflow-y-auto max-h-56 divide-y divide-gray-50 py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = value === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelect(opt)}
                    className={`w-full px-3.5 py-2.5 text-left text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer touch-manipulation min-h-[40px] ${
                      isSelected
                        ? 'bg-[#FEF2F2] text-[#E31827] font-bold'
                        : 'text-[#172033] hover:bg-gray-50'
                    }`}
                  >
                    <span className="truncate">{opt}</span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-[#E31827] shrink-0" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-[#64748B]">
                No matching options found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
