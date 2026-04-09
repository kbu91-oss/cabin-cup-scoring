interface Match {
  id: number
  format: string
  players: { team1: string; team2: string }
  status: string
  holes: number[] // 1 = team1 win, -1 = team2 win, 0 = tie
}

interface MatchCardProps {
  match: Match
  holesPerRound?: number
}

export function MatchCard({ match, holesPerRound = 9 }: MatchCardProps) {
  const displayHoles = match.holes.slice(0, holesPerRound)

  // Calculate scores to determine leader
  const ties = match.holes.filter(h => h === 0).length
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
              <div
                key={i + 1}
                className={`w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center text-sm sm:text-base md:text-lg font-bold ${
                  score === 1
                    ? 'bg-blue-600 text-white'
                    : score === -1
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Winner Text */}
        <div className="flex items-center justify-center gap-2">
          {team1Score > team2Score ? (
            <>
              <div className="w-2 h-2 rounded-full bg-blue-600"></div>
              <span className="text-xs sm:text-sm text-gray-600">{match.players.team1} wins</span>
            </>
          ) : team2Score > team1Score ? (
            <>
              <div className="w-2 h-2 rounded-full bg-red-600"></div>
              <span className="text-xs sm:text-sm text-gray-600">{match.players.team2} wins</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-gray-400"></div>
              <span className="text-xs sm:text-sm text-gray-600">Match Tied</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
