"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useQuery } from "@tanstack/react-query"
import { MapPin, Search, Loader2, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

export type Place = {
  id: string
  name: string
  address: string
  category?: string
  phone?: string
  x: string
  y: string
  url?: string
}

type LocationSearchProps = {
  value: string
  onChange: (value: string, place?: Place) => void
  placeholder?: string
  className?: string
  priorityCategory?: string
}

async function searchPlaces(query: string, priorityCategory?: string): Promise<Place[]> {
  if (!query || query.trim().length < 2) return []

  const params = new URLSearchParams({ query })
  if (priorityCategory) {
    params.set("priorityCategory", priorityCategory)
  }

  const res = await fetch(`/api/places/search?${params.toString()}`)
  if (!res.ok) throw new Error("Failed to search places")

  const data = await res.json()
  return data.places
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

export function LocationSearch({
  value,
  onChange,
  placeholder = "장소를 검색하세요",
  className,
  priorityCategory,
}: LocationSearchProps) {
  const [inputValue, setInputValue] = useState(value)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const debouncedQuery = useDebounce(inputValue, 300)

  const { data: places = [], isFetching } = useQuery({
    queryKey: ["places", debouncedQuery, priorityCategory],
    queryFn: () => searchPlaces(debouncedQuery, priorityCategory),
    enabled: debouncedQuery.length >= 2,
    staleTime: 1000 * 60 * 5,
  })

  useEffect(() => {
    setInputValue(value)
  }, [value])

  useEffect(() => {
    setSelectedIndex(0)
  }, [places])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelect = useCallback(
    (place: Place) => {
      setInputValue(place.name)
      onChange(place.name, place)
      setIsOpen(false)
    },
    [onChange]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange(newValue)
    setIsOpen(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || places.length === 0) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) => (prev < places.length - 1 ? prev + 1 : prev))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev))
        break
      case "Enter":
        e.preventDefault()
        if (places[selectedIndex]) {
          handleSelect(places[selectedIndex])
        }
        break
      case "Escape":
        setIsOpen(false)
        break
    }
  }

  const handleClear = () => {
    setInputValue("")
    onChange("")
    inputRef.current?.focus()
  }

  const showResults = isOpen && (places.length > 0 || (debouncedQuery.length >= 2 && !isFetching))

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => inputValue.length >= 2 && setIsOpen(true)}
          placeholder={placeholder}
          className="border-0 bg-background pl-9 pr-8"
        />
        {isFetching && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
        {!isFetching && inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {showResults && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
          {places.length > 0 ? (
            <ScrollArea className="max-h-64">
              <div className="p-1">
                {places.map((place, index) => (
                  <button
                    key={place.id}
                    type="button"
                    onClick={() => handleSelect(place)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                      selectedIndex === index
                        ? "bg-accent"
                        : "hover:bg-muted/50"
                    )}
                  >
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{place.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {place.address}
                      </p>
                      {place.category && (
                        <span className="mt-1 inline-block rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          {place.category}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              검색 결과가 없습니다
            </div>
          )}
        </div>
      )}
    </div>
  )
}
