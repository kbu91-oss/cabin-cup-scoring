'use client'

import { useState, useEffect } from 'react'
import { Header } from './Header'
import { TeamScoreboard } from './TeamScoreboard'
import { RoundSelector } from './RoundSelector'
import { MatchCard } from './MatchCard'

// Initial match data
const initialMatches = [
  {
    id: 1,
    format: 'Mountain Front 9',
    players: { team1: 'Kevin & Mike', team2: 'Danny & Chris' },
    status: 'In Progress',
    holes: [0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    id: 2,
    format: 'Mountain Front 9',
    players: { team1: 'Justin & Tommy', team2: 'Rory & Jon' },
    status: 'In Progress',
    holes: [0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    id: 3,
    format: 'Mountain Front 9',
    players: { team1: 'Bryson & Scottie', team2: 'Matt & Tyrrell' },
    status: 'In Progress',
    holes: [0, 0, 0, 0, 0, 0, 0, 0, 0]
  }
]

const STORAGE_KEY = 'cabin-cup-matches'

// Calculate team scores from all matches
// 0 = not played, 1 = team1 win, -1 = team2 win, 2 = tie
function calculateTeamScores(matches: typeof initialMatches) {
  let team1Total = 0
  let team2Total = 0

  matches.forEach(match => {
    const ties = match.holes.filter(h => h === 2).length
    team1Total += match.holes.filter(h => h === 1).length + (ties * 0.5)
    team2Total += match.holes.filter(h => h === -1).length + (ties * 0.5)
  })

  return {
    team1: {
      name: 'Team Kevin',
      score: team1Total,
      target: team1Total >= 108.5 ? 'WINNER!' : `NEEDS ${108.5 - team1Total} TO WIN`
    },
    team2: {
      name: 'Team Danny',
      score: team2Total,
      target: team2Total >= 108 ? 'RETAINS!' : `NEEDS ${108 - team2Total} TO RETAIN`
    }
  }
}

export function ScoringPage() {
  const [matches, setMatches] = useState(initialMatches)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setMatches(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load saved matches:', e)
      }
    }
    setIsLoaded(true)
  }, [])

  // Save to local storage when matches change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(matches))
    }
  }, [matches, isLoaded])

  // Handle hole score selection from popup
  const handleHoleScore = (matchId: number, holeIndex: number, score: number) => {
    setMatches(prev => prev.map(match => {
      if (match.id !== matchId) return match
      // Don't allow edits on finalized matches
      if (match.status === 'Final') return match

      const newHoles = [...match.holes]
      newHoles[holeIndex] = score

      return { ...match, holes: newHoles }
    }))
  }

  // Handle finalizing a match
  const handleFinalize = (matchId: number) => {
    setMatches(prev => prev.map(match => {
      if (match.id !== matchId) return match
      return { ...match, status: 'Final' }
    }))
  }

  // Handle editing a finalized match
  const handleEdit = (matchId: number) => {
    setMatches(prev => prev.map(match => {
      if (match.id !== matchId) return match
      return { ...match, status: 'In Progress' }
    }))
  }

  const teamScores = calculateTeamScores(matches)

  // Don't render until loaded to prevent hydration mismatch
  if (!isLoaded) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>
  }

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
            <MatchCard
              key={match.id}
              match={match}
              onHoleScore={handleHoleScore}
              onFinalize={handleFinalize}
              onEdit={handleEdit}
            />
          ))}
        </div>
      </main>
    </div>
  )
}
