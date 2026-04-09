interface TeamScoreboardProps {
  scores: {
    team1: { name: string; score: number; target: string }
    team2: { name: string; score: number; target: string }
  }
}

export function TeamScoreboard({ scores }: TeamScoreboardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8 golf-card">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        {/* Team 1 */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-6 h-6 bg-blue-600 rounded-full shadow-sm"></div>
            <span className="text-xl font-bold text-gray-900">{scores.team1.name}</span>
          </div>
          <div className="text-7xl font-black text-blue-600 mb-3 tracking-tight">{scores.team1.score}</div>
          <div className="text-sm text-gray-600 uppercase tracking-wider font-semibold">{scores.team1.target}</div>
        </div>

        {/* Center - Trophy/Status */}
        <div className="text-center">
          <div className="text-3xl font-black text-gray-900 mb-3 tracking-tight">CABIN CUP TROPHY</div>
          <div className="text-lg text-gray-600 mb-2">Round 2 of 4</div>
          <div className="text-sm text-gray-500">Friday Foursomes • Saturday Four-ball • Sunday Singles</div>
        </div>

        {/* Team 2 */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="text-xl font-bold text-gray-900">{scores.team2.name}</span>
            <div className="w-6 h-6 bg-red-600 rounded-full shadow-sm"></div>
          </div>
          <div className="text-7xl font-black text-red-600 mb-3 tracking-tight">{scores.team2.score}</div>
          <div className="text-sm text-gray-600 uppercase tracking-wider font-semibold">{scores.team2.target}</div>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="mt-10 pt-8 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <span className="font-medium">28/28 Matches complete</span>
          <span className="font-medium">Points</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 h-3 rounded-full shadow-sm transition-all duration-500" style={{ width: '52%' }}></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Team Kevin: 14.5</span>
          <span>Team Danny: 12.5</span>
        </div>
      </div>
    </div>
  )
}
