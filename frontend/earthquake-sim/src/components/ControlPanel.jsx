export default function ControlPanel({
  epicenter,
  onStart,
  onReset,
  simulationStarted,
  onDistributionStart,
  distributionStarted
}) {
  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 p-4 bg-white bg-opacity-70 rounded-xl shadow-lg flex gap-4 z-50">
      {/* Always show Reset button */}
      <button
        className="px-4 py-2 rounded-lg font-bold bg-red-500 text-white hover:bg-red-600"
        onClick={onReset}
      >
        Reset
      </button>

      {!simulationStarted ? (
        // Start Simulation Button
        <button
          disabled={!epicenter}
          className={`px-4 py-2 rounded-lg font-bold ${
            epicenter ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-300 text-gray-600 cursor-not-allowed'
          }`}
          onClick={onStart}
        >
          Start Simulation
        </button>
      ) : (
        // Start Distribution Button (shown after simulation starts)
        <button
          disabled={distributionStarted}
          className={`px-4 py-2 rounded-lg font-bold ${
            !distributionStarted ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-300 text-gray-600 cursor-not-allowed'
          }`}
          onClick={onDistributionStart}
        >
          {distributionStarted ? 'Distribution Started' : 'Start Distribution'}
        </button>
      )}
    </div>
  );
}
