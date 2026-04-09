'use client'

import { Header } from './Header'
import { TeamScoreboard } from './TeamScoreboard'
import { RoundSelector } from './RoundSelector'
import { MatchCard } from './MatchCard'

// Mock data - replace with your actual data
const teamScores = {
  team1: { name: 'Team Kevin', score: 90, target: 'NEEDS 108.5 TO WIN' },
  team2: { name: 'Team Danny', score: 80, target: 'NEEDS 108 TO RETAIN' }
}

const matches = [
  {
    id: 1,
    format: 'Mountain Front 9',
    players: { team1: 'Kevin & Mike', team2: 'Danny & Chris' },
    status: 'Final',
    holes: [1, -1, 1, 0, 1, -1, 1, 1, 0] // Kevin wins 1,3,5,7,8 | Danny wins 2,6 | Ties 4,9
  },
  {
    id: 2,
    format: 'Mountain Front 9',
    players: { team1: 'Justin & Tommy', team2: 'Rory & Jon' },
    status: 'Final',
    holes: [1, 0, -1, -1, 0, 1, 1, 0, -1] // Tied 4.5 - 4.5
  },
  {
    id: 3,
    format: 'Mountain Front 9',
    players: { team1: 'Bryson & Scottie', team2: 'Matt & Tyrrell' },
    status: 'In Progress',
    holes: [0, 1, -1, 0, 1, 0, 0, 0, 0] // In progress - only first 5 holes played
  }
]

export function ScoringPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Team Scoreboard */}
        <TeamScoreboard scores={teamScores} />

        {/* Round Selector - TODO: Connect to filter matches by round */}
        <RoundSelector />

        {/* Current Matches Header */}
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Matches</h2>

        {/* Matches */}
        <div className="space-y-6">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      </main>
    </div>
  )
}
