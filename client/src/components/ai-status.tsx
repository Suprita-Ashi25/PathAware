import { Bot, CheckCircle } from "lucide-react";

export default function AIStatus() {
  return (
    <div className="px-6 py-4 space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">AI Monitoring</h2>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-800">PathAI Assistant</p>
              <p className="text-sm text-trust-green">Online & Monitoring</p>
            </div>
          </div>
          <div className="w-3 h-3 bg-trust-green rounded-full animate-pulse"></div>
        </div>
        
        <div className="text-sm text-gray-600 space-y-1">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-trust-green" />
            <span>Voice pattern analysis: Normal</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-trust-green" />
            <span>Movement detection: Active</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-trust-green" />
            <span>Environment monitoring: Safe</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-trust-green" />
            <span>Threat assessment: Low risk</span>
          </div>
        </div>
      </div>
    </div>
  );
}
