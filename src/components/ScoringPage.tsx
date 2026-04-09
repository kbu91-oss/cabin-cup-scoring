'use client'

import { Header } from './Header'
import { TeamScoreboard } from './TeamScoreboard'
import { MatchCard } from './MatchCard'
import { Legend } from './Legend'

// Mock data - replace with your actual data
const teamScores = {
  team1: { name: 'Team Kevin', score: 14.5, target: 'to win' },
  team2: { name: 'Team Danny', score: 12.5, target: 'to retain' }
}

const matches = [
  {
    id: 1,
    format: 'Friday Foursomes',
    players: { team1: 'Kevin & Mike', team2: 'Danny & Chris' },
    status: 'Final',
    result: '1UP',
    holes: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0], // Hole 10: team1 win
    winner: 'team1' as const
  },
  {
    id: 2,
    format: 'Friday Foursomes',
    players: { team1: 'Justin & Tommy', team2: 'Rory & Jon' },
    status: 'Final',
    result: '1UP',
    holes: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // Hole 18: team1 win
    winner: 'team1' as const
  },
  {
    id: 3,
    format: 'Saturday Four-ball',
    players: { team1: 'Bryson & Scottie', team2: 'Matt & Tyrrell' },
    status: 'Final',
    result: 'TIED',
    holes: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // All tied
    winner: null
  },
  {
    id: 4,
    format: 'Saturday Four-ball',
    players: { team1: 'Patrick & Xander', team2: 'Ludvig & Viktor' },
    status: 'Final',
    result: '2&1',
    holes: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1, 0], // Hole 17: team2 win
    winner: 'team2' as const
  },
  {
    id: 5,
    format: 'Sunday Singles',
    players: { team1: 'J.J. & Russell', team2: 'Sepp & Shane' },
    status: 'Final',
    result: '2&1',
    holes: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1, 0], // Hole 17: team2 win
    winner: 'team2' as const
  },
  {
    id: 6,
    format: 'Sunday Singles',
    players: { team1: 'Ben & Collin', team2: 'Rasmus & Robert' },
    status: 'In Progress',
    result: 'AS',
    holes: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Not started
    winner: null
  }
]

export function ScoringPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Team Scoreboard */}
        <TeamScoreboard scores={teamScores} />

        {/* Round Information */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">CABIN CUP 2025</h2>
          <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
            ROUND 2 OF 4
          </div>
        </div>

        {/* Matches */}
        <div className="space-y-6">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>

        {/* Legend */}
        <Legend />
      </main>
    </div>
  )
}
