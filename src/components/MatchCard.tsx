interface Match {
  id: number
  format: string
  players: { team1: string; team2: string }
  status: string
  result: string
  holes: number[] // 1 = team1 win, -1 = team2 win, 0 = tie
  winner: 'team1' | 'team2' | null
}

interface MatchCardProps {
  match: Match
}

export function MatchCard({ match }: MatchCardProps) {
  const getHoleColor = (score: number) => {
    if (score === 1) return 'bg-blue-600' // Team 1 win
    if (score === -1) return 'bg-red-600' // Team 2 win
    return 'bg-gray-300' // Tie or not played
  }

  const getHoleText = (score: number) => {
    if (score === 1) return '●'
    if (score === -1) return '●'
    return '○'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 golf-card">
      {/* Match Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-600">{match.format}</span>
          <span className="text-sm text-gray-500">Match {match.id}</span>
        </div>
        <div className="flex items-center gap-3">
          {match.status === 'Final' && match.winner && (
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${match.winner === 'team1' ? 'bg-blue-600' : 'bg-red-600'}`}></div>
              <span className="text-sm font-bold text-gray-900">{match.result}</span>
            </div>
          )}
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            match.status === 'Final' ? 'bg-green-100 text-green-800' :
            match.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {match.status}
          </span>
        </div>
      </div>

      {/* Players */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-4 h-4 bg-blue-600 rounded"></div>
          <div>
            <div className="font-semibold text-gray-900">{match.players.team1}</div>
            <div className="text-sm text-gray-600">Team Kevin</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-4 h-4 bg-red-600 rounded"></div>
          <div>
            <div className="font-semibold text-gray-900">{match.players.team2}</div>
            <div className="text-sm text-gray-600">Team Danny</div>
          </div>
        </div>
      </div>

      {/* Hole-by-hole scoring */}
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-700 mb-3">Hole-by-Hole</div>
        <div className="grid grid-cols-9 gap-2">
          {Array.from({ length: 18 }, (_, i) => (
            <div key={i + 1} className="text-center">
              <div className="text-xs text-gray-500 mb-1">{i + 1}</div>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${getHoleColor(match.holes[i])}`}>
                {getHoleText(match.holes[i])}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Match Result */}
      {match.winner && (
        <div className="flex items-center justify-center gap-2 pt-4 border-t border-gray-200">
          <div className={`w-3 h-3 rounded-full ${match.winner === 'team1' ? 'bg-blue-600' : 'bg-red-600'}`}></div>
          <span className="text-sm font-medium text-gray-900">
            {match.winner === 'team1' ? match.players.team1 : match.players.team2} wins
          </span>
        </div>
      )}
    </div>
  )
}
