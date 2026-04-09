export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-xl">CC</span>
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">CABIN CUP</h1>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Golf Championship</div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-10">
            <a href="#" className="text-blue-600 font-bold text-sm uppercase tracking-wide hover:text-blue-700 transition-colors">Scoreboard</a>
            <a href="#" className="text-gray-600 font-medium text-sm uppercase tracking-wide hover:text-gray-900 transition-colors">Teams</a>
            <a href="#" className="text-gray-600 font-medium text-sm uppercase tracking-wide hover:text-gray-900 transition-colors">Schedule</a>
            <a href="#" className="text-gray-600 font-medium text-sm uppercase tracking-wide hover:text-gray-900 transition-colors">Matches</a>
          </nav>

          {/* Live Indicator */}
          <div className="flex items-center gap-3 bg-red-50 text-red-700 px-4 py-2 rounded-full text-sm font-bold border border-red-200">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-sm"></div>
            <span className="uppercase tracking-wide">LIVE</span>
          </div>
        </div>
      </div>
    </header>
  )
}
