'use client'

import { useState } from 'react'

interface Match {
  id: number
  format: string
  players: { team1: string; team2: string }
  status: string
  holes: number[] // 0 = not played, 1 = team1 win, -1 = team2 win, 2 = tie
}

interface MatchCardProps {
  match: Match
  holesPerRound?: number
  onHoleScore?: (matchId: number, holeIndex: number, score: number) => void
  onFinalize?: (matchId: number) => void
  onEdit?: (matchId: number) => void
}

export function MatchCard({ match, holesPerRound = 9, onHoleScore, onFinalize, onEdit }: MatchCardProps) {
  const [selectedHole, setSelectedHole] = useState<number | null>(null)
  const displayHoles = match.holes.slice(0, holesPerRound)

  // Calculate scores to determine leader
  // 0 = not played, 1 = team1 win, -1 = team2 win, 2 = tie
  const ties = match.holes.filter(h => h === 2).length
  const team1Score = match.holes.filter(h => h === 1).length + (ties * 0.5)
  const team2Score = match.holes.filter(h => h === -1).length + (ties * 0.5)

  // Determine gradient background based on who's leading
  const gradientBackground = team1Score > team2Score
    ? 'bg-gradient-to-r from-blue-200 via-blue-100 to-white'
    : team2Score > team1Score
    ? 'bg-gradient-to-l from-red-200 via-red-100 to-white'
    : 'bg-white'

  return (
    <div className="rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Top Section - Teams & Score with Gradient */}
      <div className={`${gradientBackground} p-4 md:p-6`}>
        {/* Match Header */}
        <div className="text-center text-lg md:text-2xl font-bold text-gray-700 mb-4 md:mb-6">
          Match {match.id} - {match.status}
        </div>

        {/* Same layout for all screens - Teams on sides, Score in center */}
        <div className="flex items-start justify-between">
          {/* Team 1 Player */}
          <div className="flex-1 flex flex-col justify-start items-start">
            <div className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 mb-1 md:mb-2">{match.players.team1}</div>
            <div className="text-xs sm:text-sm md:text-lg text-blue-600 font-bold">Team Kevin</div>
          </div>

          {/* Center - Score */}
          <div className="flex-1 text-center flex flex-col items-center justify-center">
            <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-blue-600">
              {team1Score % 1 === 0 ? team1Score : team1Score.toFixed(1)}
              <span className="text-gray-400 mx-1 md:mx-2">-</span>
              <span className="text-red-600">{team2Score % 1 === 0 ? team2Score : team2Score.toFixed(1)}</span>
            </div>
          </div>

          {/* Team 2 Player */}
          <div className="flex-1 flex flex-col justify-start items-end">
            <div className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 mb-1 md:mb-2 text-right">{match.players.team2}</div>
            <div className="text-xs sm:text-sm md:text-lg text-red-600 font-bold">Team Danny</div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Holes with Neutral Background */}
      <div className="bg-gray-50 p-4 md:p-6">
        {/* Hole-by-hole scoring */}
        <div className="mb-4 flex justify-center">
          <div className="flex justify-between gap-1 sm:gap-2 md:gap-3 w-full md:w-2/3">
            {displayHoles.map((score, i) => (
              <button
                key={i + 1}
                onClick={() => match.status !== 'Final' && setSelectedHole(i)}
                disabled={match.status === 'Final'}
                className={`w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center text-sm sm:text-base md:text-lg font-bold transition-all ${
                  match.status === 'Final'
                    ? 'cursor-default'
                    : 'hover:scale-110 hover:shadow-lg cursor-pointer'
                } ${
                  score === 1
                    ? `bg-blue-600 text-white ${match.status !== 'Final' && 'hover:bg-blue-700'}`
                    : score === -1
                    ? `bg-red-600 text-white ${match.status !== 'Final' && 'hover:bg-red-700'}`
                    : score === 2
                    ? `bg-yellow-400 text-gray-800 ${match.status !== 'Final' && 'hover:bg-yellow-500'}`
                    : `bg-gray-200 text-gray-700 ${match.status !== 'Final' && 'hover:bg-gray-300'}`
                }`}
              >
                {i + 1}
              </button>
            ))}

            {/* Score Selection Popup */}
            {selectedHole !== null && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedHole(null)}>
                <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full shadow-xl" onClick={e => e.stopPropagation()}>
                  <h3 className="text-xl font-bold text-center text-gray-800 mb-6">
                    Hole {selectedHole + 1} Winner
                  </h3>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => {
                        onHoleScore?.(match.id, selectedHole, 1)
                        setSelectedHole(null)
                      }}
                      className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all"
                    >
                      {match.players.team1} Wins
                    </button>
                    <button
                      onClick={() => {
                        onHoleScore?.(match.id, selectedHole, 2)
                        setSelectedHole(null)
                      }}
                      className="w-full py-4 bg-yellow-400 text-gray-800 font-bold rounded-xl hover:bg-yellow-500 transition-all"
                    >
                      Tie
                    </button>
                    <button
                      onClick={() => {
                        onHoleScore?.(match.id, selectedHole, -1)
                        setSelectedHole(null)
                      }}
                      className="w-full py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all"
                    >
                      {match.players.team2} Wins
                    </button>
                    <button
                      onClick={() => {
                        onHoleScore?.(match.id, selectedHole, 0)
                        setSelectedHole(null)
                      }}
                      className="w-full py-3 bg-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-300 transition-all mt-2"
                    >
                      Clear / Not Played
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Winner Text & Finalize Button */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center justify-center gap-2">
            {team1Score === 0 && team2Score === 0 ? (
              <span className="text-xs sm:text-sm text-gray-400">No scores yet</span>
            ) : team1Score > team2Score ? (
              <>
                <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                <span className="text-xs sm:text-sm text-gray-600">{match.players.team1} {match.status === 'Final' ? 'wins' : 'leading'}</span>
              </>
            ) : team2Score > team1Score ? (
              <>
                <div className="w-2 h-2 rounded-full bg-red-600"></div>
                <span className="text-xs sm:text-sm text-gray-600">{match.players.team2} {match.status === 'Final' ? 'wins' : 'leading'}</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                <span className="text-xs sm:text-sm text-gray-600">Match Tied</span>
              </>
            )}
          </div>

          {/* Finalize button - shows when all holes are played and match is not final */}
          {match.status !== 'Final' && displayHoles.every(h => h !== 0) && (
            <button
              onClick={() => onFinalize?.(match.id)}
              className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-full hover:bg-emerald-700 transition-all"
            >
              Finalize Match
            </button>
          )}

          {/* Edit button - shows when match is finalized */}
          {match.status === 'Final' && (
            <button
              onClick={() => onEdit?.(match.id)}
              className="px-4 py-2 bg-gray-500 text-white text-sm font-semibold rounded-full hover:bg-gray-600 transition-all"
            >
              Edit Match
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
