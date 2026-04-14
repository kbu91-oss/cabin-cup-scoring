interface TeamScoreboardProps {
  scores: {
    team1: { name: string; score: number; target: string }
    team2: { name: string; score: number; target: string }
  }
  totalPoints?: number
}

export function TeamScoreboard({ scores, totalPoints = 216 }: TeamScoreboardProps) {
  // Cap percentages to prevent overflow (max 50% each to meet at center)
  const team1Percentage = Math.min((scores.team1.score / totalPoints) * 100, 50)
  const team2Percentage = Math.min((scores.team2.score / totalPoints) * 100, 50)

  // Determine who's leading
  const leader = scores.team1.score > scores.team2.score ? 'team1' : scores.team2.score > scores.team1.score ? 'team2' : 'tied'

  // Background gradient based on leader (Navy and Gold)
  const barBackground = leader === 'team1'
    ? 'bg-gradient-to-r from-[#0A2240]/20 via-[#0A2240]/10 to-gray-200'
    : leader === 'team2'
    ? 'bg-gradient-to-l from-[#FFB81E]/30 via-[#FFB81E]/15 to-gray-200'
    : 'bg-gray-200'

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 md:p-8 mb-6 md:mb-8 golf-card">
      <div className="grid grid-cols-3 gap-2 md:gap-8 items-center">
        {/* Team 1 - Navy */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 md:gap-3 mb-2 md:mb-6">
            <div className="w-4 h-4 md:w-6 md:h-6 bg-[#0A2240] rounded-full shadow-sm"></div>
            <span className="text-xs md:text-xl font-bold text-gray-900">{scores.team1.name}</span>
          </div>
          <div className="text-4xl md:text-7xl font-black text-[#0A2240] mb-1 md:mb-3 tracking-tight">{scores.team1.score % 1 === 0 ? scores.team1.score : scores.team1.score.toFixed(1)}</div>
          <div className="text-[10px] md:text-sm text-gray-600 uppercase tracking-wider font-semibold leading-tight">{scores.team1.target}</div>
        </div>

        {/* Center - Logo & Trophy */}
        <div className="text-center flex flex-col items-center">
          <img
            src="/cabin-cup-logo.png"
            alt="Bobcats Cup Logo"
            className="w-16 h-16 md:w-28 md:h-28 object-contain mb-1 md:mb-2"
          />
          <div className="text-xs md:text-2xl font-black text-[#0A2240] tracking-tight">BOBCATS CUP</div>
        </div>

        {/* Team 2 - Gold */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 md:gap-3 mb-2 md:mb-6">
            <span className="text-xs md:text-xl font-bold text-gray-900">{scores.team2.name}</span>
            <div className="w-4 h-4 md:w-6 md:h-6 bg-[#FFB81E] rounded-full shadow-sm border border-amber-600"></div>
          </div>
          <div className="text-4xl md:text-7xl font-black text-[#B8860B] mb-1 md:mb-3 tracking-tight">{scores.team2.score % 1 === 0 ? scores.team2.score : scores.team2.score.toFixed(1)}</div>
          <div className="text-[10px] md:text-sm text-gray-600 uppercase tracking-wider font-semibold leading-tight">{scores.team2.target}</div>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="mt-4 md:mt-10 pt-4 md:pt-8 border-t border-gray-200">
        <div className="flex items-center justify-center text-xs md:text-sm text-gray-600 mb-2 md:mb-3">
          <span className="font-medium">{totalPoints} Total Points</span>
        </div>
        {/* Dual-fill progress bar */}
        <div className={`relative w-full rounded-xl h-8 md:h-16 shadow-inner overflow-hidden ${barBackground}`}>
          {/* Navy fill from left */}
          <div
            className="absolute left-0 top-0 bottom-0 bg-gradient-to-b from-[#0A2240] to-[#0A2240]/80 rounded-l-xl transition-all duration-500"
            style={{ width: `${team1Percentage}%` }}
          ></div>
          {/* Gold fill from right */}
          <div
            className="absolute right-0 top-0 bottom-0 bg-gradient-to-b from-[#FFB81E] to-[#B8860B] rounded-r-xl transition-all duration-500"
            style={{ width: `${team2Percentage}%` }}
          ></div>
          {/* White win line at center */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 md:w-2 bg-white -translate-x-1/2 rounded-full shadow-md border border-gray-300" style={{ height: 'calc(100% + 8px)', top: '-4px' }}></div>
        </div>
        <div className="flex justify-between text-xs md:text-sm text-gray-600 mt-2 md:mt-3">
          <span className="font-medium">Team Kevin: {scores.team1.score % 1 === 0 ? scores.team1.score : scores.team1.score.toFixed(1)}</span>
          <span className="font-medium">Team Danny: {scores.team2.score % 1 === 0 ? scores.team2.score : scores.team2.score.toFixed(1)}</span>
        </div>
      </div>
    </div>
  )
}
