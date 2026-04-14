'use client'

import { useState, useEffect } from 'react'
import { Header } from './Header'
import { TeamScoreboard } from './TeamScoreboard'
import { RoundSelector } from './RoundSelector'
import { MatchCard } from './MatchCard'

// Initial match data organized by round
const initialMatches = [
  // Mountain Front 9 (Holes 1-9)
  {
    id: 1,
    round: 'mountain-front',
    holeStart: 1,
    players: { team1: 'Kevin & Mike', team2: 'Danny & Chris' },
    status: 'In Progress',
    holes: [0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    id: 2,
    round: 'mountain-front',
    holeStart: 1,
    players: { team1: 'Justin & Tommy', team2: 'Rory & Jon' },
    status: 'In Progress',
    holes: [0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    id: 3,
    round: 'mountain-front',
    holeStart: 1,
    players: { team1: 'Bryson & Scottie', team2: 'Matt & Tyrrell' },
    status: 'In Progress',
    holes: [0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  // Mountain Back 9 (Holes 10-18)
  {
    id: 4,
    round: 'mountain-back',
    holeStart: 10,
    players: { team1: 'Kevin & Justin', team2: 'Danny & Rory' },
    status: 'In Progress',
    holes: [0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    id: 5,
    round: 'mountain-back',
    holeStart: 10,
    players: { team1: 'Mike & Tommy', team2: 'Chris & Jon' },
    status: 'In Progress',
    holes: [0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    id: 6,
    round: 'mountain-back',
    holeStart: 10,
    players: { team1: 'Bryson & Scottie', team2: 'Matt & Tyrrell' },
    status: 'In Progress',
    holes: [0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  // Links Front 9 (Holes 1-9)
  {
    id: 7,
    round: 'links-front',
    holeStart: 1,
    players: { team1: 'Kevin & Bryson', team2: 'Danny & Matt' },
    status: 'In Progress',
    holes: [0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    id: 8,
    round: 'links-front',
    holeStart: 1,
    players: { team1: 'Mike & Scottie', team2: 'Chris & Tyrrell' },
    status: 'In Progress',
    holes: [0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    id: 9,
    round: 'links-front',
    holeStart: 1,
    players: { team1: 'Justin & Tommy', team2: 'Rory & Jon' },
    status: 'In Progress',
    holes: [0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  // Links Back 9 (Holes 10-18)
  {
    id: 10,
    round: 'links-back',
    holeStart: 10,
    players: { team1: 'Kevin & Mike', team2: 'Danny & Chris' },
    status: 'In Progress',
    holes: [0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    id: 11,
    round: 'links-back',
    holeStart: 10,
    players: { team1: 'Justin & Bryson', team2: 'Rory & Matt' },
    status: 'In Progress',
    holes: [0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    id: 12,
    round: 'links-back',
    holeStart: 10,
    players: { team1: 'Tommy & Scottie', team2: 'Jon & Tyrrell' },
    status: 'In Progress',
    holes: [0, 0, 0, 0, 0, 0, 0, 0, 0]
  }
]

const STORAGE_KEY = 'cabin-cup-matches-v2'

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
      name: 'Team Navy',
      score: team1Total,
      target: team1Total >= 108.5 ? 'WINNER!' : `NEEDS ${108.5 - team1Total} TO WIN`
    },
    team2: {
      name: 'Team Gold',
      score: team2Total,
      target: team2Total >= 108 ? 'RETAINS!' : `NEEDS ${108 - team2Total} TO RETAIN`
    }
  }
}

export function ScoringPage() {
  const [matches, setMatches] = useState(initialMatches)
  const [isLoaded, setIsLoaded] = useState(false)
  const [selectedRound, setSelectedRound] = useState('mountain-front')

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

        {/* Round Selector */}
        <RoundSelector selectedRound={selectedRound} onRoundChange={setSelectedRound} />

        {/* Current Matches Header */}
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Matches</h2>

        {/* Matches */}
        <div className="space-y-6">
          {matches
            .filter(match => match.round === selectedRound)
            .map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                holeStart={match.holeStart}
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
