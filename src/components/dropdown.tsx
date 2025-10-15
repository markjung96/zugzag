"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  label?: string;
  required?: boolean;
}

export function Dropdown({
  options,
  value,
  onChange,
  placeholder = "선택하세요",
  disabled = false,
  className = "",
  label,
  required = false,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 선택된 옵션 찾기
  const selectedOption = options.find((opt) => opt.value === value);

  // 키보드 네비게이션
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else if (selectedIndex >= 0 && selectedIndex < options.length) {
          onChange(options[selectedIndex].value);
          setIsOpen(false);
          setSelectedIndex(-1);
        }
        break;
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setSelectedIndex((prev) => (prev < options.length - 1 ? prev + 1 : prev));
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (isOpen) {
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
      case "Tab":
        if (isOpen) {
          setIsOpen(false);
          setSelectedIndex(-1);
        }
        break;
    }
  };

  // 옵션 선택
  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSelectedIndex(-1);
    buttonRef.current?.focus();
  };

  return (
    <div className={className}>
      {label && (
        <label className="mb-2 block text-sm font-medium text-zinc-300">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div ref={containerRef} className="relative w-full">
        {/* 선택 버튼 */}
        <button
          ref={buttonRef}
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={`flex w-full items-center justify-between rounded-lg border px-4 py-2 text-left transition-all ${
            disabled
              ? "cursor-not-allowed border-zinc-800 bg-zinc-900 opacity-50"
              : isOpen
                ? "border-orange-500 bg-zinc-900 ring-2 ring-orange-500/20"
                : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
          } `}
        >
          <span className={selectedOption ? "text-white" : "text-zinc-500"}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            className={`h-5 w-5 text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {/* 드롭다운 메뉴 */}
        <AnimatePresence>
          {isOpen && !disabled && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute z-[200] mt-2 w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl"
            >
              <div className="max-h-80 overflow-y-auto">
                {options.length === 0 ? (
                  <div className="p-4 text-center text-sm text-zinc-400">옵션이 없습니다</div>
                ) : (
                  options.map((option, idx) => {
                    const isSelected = option.value === value;
                    const isHighlighted = idx === selectedIndex;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleSelect(option.value)}
                        className={`flex w-full items-center justify-between border-b border-zinc-800 px-4 py-3 text-left transition-colors last:border-0 ${
                          isSelected
                            ? "bg-orange-500/10 text-orange-500"
                            : isHighlighted
                              ? "bg-zinc-800/50 text-white"
                              : "text-zinc-300 hover:bg-zinc-800/50 hover:text-white"
                        } `}
                      >
                        <span className="truncate">{option.label}</span>
                        {isSelected && <Check className="h-4 w-4 flex-shrink-0" />}
                      </button>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
