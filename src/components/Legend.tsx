export function Legend() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Legend</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Score Icons */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Score</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">●</span>
              </div>
              <span className="text-sm text-gray-700">Team Kevin scores</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">●</span>
              </div>
              <span className="text-sm text-gray-700">Team Danny scores</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 text-xs">○</span>
              </div>
              <span className="text-sm text-gray-700">Tied or not played</span>
            </div>
          </div>
        </div>

        {/* Abbreviations */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Abbreviations</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700">T</span>
              <span className="text-gray-600">Tied</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">AS</span>
              <span className="text-gray-600">All Square</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">1UP</span>
              <span className="text-gray-600">1 Up</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">2&1</span>
              <span className="text-gray-600">2 and 1</span>
            </div>
          </div>
        </div>

        {/* Match Types */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Match Types</h4>
          <div className="space-y-2 text-sm">
            <div>
              <div className="font-medium text-gray-900">Foursomes</div>
              <div className="text-gray-600">Better ball of partners</div>
            </div>
            <div>
              <div className="font-medium text-gray-900">Four-ball</div>
              <div className="text-gray-600">Better ball of partners</div>
            </div>
            <div>
              <div className="font-medium text-gray-900">Singles</div>
              <div className="text-gray-600">Individual matches</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}