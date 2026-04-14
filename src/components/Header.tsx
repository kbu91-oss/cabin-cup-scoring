export function Header() {
  return (
    <header className="bg-[#0A2240] border-b border-[#0A2240] shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FFB81E] to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-[#0A2240] font-black text-xl">QU</span>
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">BOBCATS CUP</h1>
              <div className="text-xs text-[#FFB81E] uppercase tracking-wider">Golf Championship</div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-10">
            <a href="#" className="text-[#FFB81E] font-bold text-sm uppercase tracking-wide hover:text-amber-300 transition-colors">Scoreboard</a>
            <a href="#" className="text-gray-300 font-medium text-sm uppercase tracking-wide hover:text-white transition-colors">Teams</a>
            <a href="#" className="text-gray-300 font-medium text-sm uppercase tracking-wide hover:text-white transition-colors">Schedule</a>
            <a href="#" className="text-gray-300 font-medium text-sm uppercase tracking-wide hover:text-white transition-colors">Matches</a>
          </nav>

          {/* Live Indicator */}
          <div className="flex items-center gap-3 bg-[#FFB81E] text-[#0A2240] px-4 py-2 rounded-full text-sm font-bold">
            <div className="w-3 h-3 bg-[#0A2240] rounded-full animate-pulse shadow-sm"></div>
            <span className="uppercase tracking-wide">LIVE</span>
          </div>
        </div>
      </div>
    </header>
  )
}
