export default function AppHeader() {
  return (
    <div className="bg-safety-blue text-white px-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">SafePathAI</h1>
          <p className="text-blue-100 text-sm">Your safety companion</p>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-trust-green rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">ACTIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
