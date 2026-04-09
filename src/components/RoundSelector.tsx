'use client'

// TODO: Connect onRoundChange to parent component to filter matches by selected round
import { useState } from 'react'

const rounds = [
  { id: 'mountain-front', label: 'Mountain Front 9' },
  { id: 'mountain-back', label: 'Mountain Back 9' },
  { id: 'links-front', label: 'Links Front 9' },
  { id: 'links-back', label: 'Links Back 9' },
]

interface RoundSelectorProps {
  selectedRound?: string
  onRoundChange?: (roundId: string) => void
}

export function RoundSelector({ selectedRound, onRoundChange }: RoundSelectorProps) {
  const [selected, setSelected] = useState(selectedRound || 'mountain-front')

  const handleSelect = (roundId: string) => {
    setSelected(roundId)
    onRoundChange?.(roundId)
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-8 w-full">
      {rounds.map((round) => (
        <button
          key={round.id}
          onClick={() => handleSelect(round.id)}
          className={`py-2 md:py-3 px-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
            selected === round.id
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {round.label}
        </button>
      ))}
    </div>
  )
}
