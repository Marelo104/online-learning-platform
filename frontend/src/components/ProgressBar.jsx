const ProgressBar = ({ progress = 0, showLabel = true, height = "h-1.5" }) => {
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
      )}
      <div className={`w-full ${height} bg-gray-800 rounded-full overflow-hidden`}>
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;