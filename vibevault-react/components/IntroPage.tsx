import React from 'react';
import { Gamepad2, Upload, Cloud, Zap, Lock, Share2 } from 'lucide-react';

interface IntroPageProps {
  onGetStarted: () => void;
  gameCount: number;
}

const IntroPage: React.FC<IntroPageProps> = ({ onGetStarted, gameCount }) => {
  return (
    <div className="flex flex-col min-h-screen bg-[#1b2838] text-gray-300 font-sans overflow-y-auto">
      {/* Animated Wallpaper Background */}
      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes float-1 {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(20px) translateX(-15px); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        .intro-wallpaper {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 0;
          pointer-events: none;
          background: linear-gradient(-45deg, #1b2838, #2d3e50, #0f1419, #1b2838);
          background-size: 400% 400%;
          animation: gradient-shift 15s ease infinite;
        }
        .intro-orb {
          position: absolute;
          border-radius: 50%;
          mix-blend-mode: screen;
          filter: blur(80px);
        }
        .orb-1 {
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(102, 192, 244, 0.3), transparent);
          top: 10%;
          left: 10%;
          animation: float-1 8s ease-in-out infinite;
        }
        .orb-2 {
          width: 250px;
          height: 250px;
          background: radial-gradient(circle, rgba(156, 39, 176, 0.2), transparent);
          bottom: 10%;
          right: 15%;
          animation: float-2 10s ease-in-out infinite;
        }
        .orb-3 {
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(25, 118, 210, 0.25), transparent);
          top: 40%;
          right: 10%;
          animation: float-1 12s ease-in-out infinite;
        }
        .intro-content {
          position: relative;
          z-index: 10;
        }
      `}</style>
      <div className="intro-wallpaper">
        <div className="orb-1"></div>
        <div className="orb-2"></div>
        <div className="orb-3"></div>
      </div>

      <div className="intro-content flex flex-col items-center justify-center min-h-screen px-4 py-12">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#66c0f4] to-purple-500 rounded-full blur-2xl opacity-50"></div>
              <div className="relative bg-[#1b2838] p-6 rounded-full border border-[#66c0f4]/30">
                <Gamepad2 size={64} className="text-[#66c0f4]" />
              </div>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white">
            Welcome to <span className="text-[#66c0f4]">VibeVault</span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-6 leading-relaxed">
            Your personal arcade of HTML games and interactive experiences. Store, organize, and play your favorite mini-games all in one place.
          </p>

          <button
            onClick={onGetStarted}
            className="bg-gradient-to-r from-[#66c0f4] to-blue-600 hover:from-blue-400 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-[0_0_25px_rgba(102,192,244,0.4)]"
          >
            {gameCount > 0 ? 'Enter Vault' : 'Get Started'}
          </button>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mb-12">
          {/* Feature 1 */}
          <div className="group bg-[#2a475e]/40 backdrop-blur-sm border border-white/10 rounded-lg p-6 hover:border-[#66c0f4]/50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#66c0f4]/20 p-3 rounded-lg">
                <Upload size={24} className="text-[#66c0f4]" />
              </div>
              <h3 className="text-lg font-bold text-white">Easy Upload</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Upload HTML files, React components, or JavaScript games. Supports .html, .jsx, and .tsx files.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group bg-[#2a475e]/40 backdrop-blur-sm border border-white/10 rounded-lg p-6 hover:border-[#66c0f4]/50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <Cloud size={24} className="text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Local Storage</h3>
            </div>
            <p className="text-gray-400 text-sm">
              All games are stored locally in your browser. No cloud needed, complete privacy and control.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group bg-[#2a475e]/40 backdrop-blur-sm border border-white/10 rounded-lg p-6 hover:border-[#66c0f4]/50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-500/20 p-3 rounded-lg">
                <Zap size={24} className="text-green-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Instant Launch</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Play your games instantly with a single click. No loading times, no external dependencies.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="group bg-[#2a475e]/40 backdrop-blur-sm border border-white/10 rounded-lg p-6 hover:border-[#66c0f4]/50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-yellow-500/20 p-3 rounded-lg">
                <Lock size={24} className="text-yellow-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Organize</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Create custom folders and organize your games the way you like. Full drag-and-drop support.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="group bg-[#2a475e]/40 backdrop-blur-sm border border-white/10 rounded-lg p-6 hover:border-[#66c0f4]/50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-500/20 p-3 rounded-lg">
                <Share2 size={24} className="text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Backup & Share</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Export your games as JSON or ZIP archives. Import them anytime or share with friends.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="group bg-[#2a475e]/40 backdrop-blur-sm border border-white/10 rounded-lg p-6 hover:border-[#66c0f4]/50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-pink-500/20 p-3 rounded-lg">
                <Gamepad2 size={24} className="text-pink-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Online Arcade</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Share your creations to the community arcade and discover games from other creators.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="max-w-3xl bg-[#2a475e]/40 backdrop-blur-sm border border-white/10 rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">How It Works</h2>
          <ol className="space-y-4 text-gray-400">
            <li className="flex gap-4">
              <span className="text-[#66c0f4] font-bold min-w-8">1.</span>
              <span><strong>Upload</strong> your HTML games or React components using the ADD GAME button.</span>
            </li>
            <li className="flex gap-4">
              <span className="text-[#66c0f4] font-bold min-w-8">2.</span>
              <span><strong>Organize</strong> your collection into folders for easy navigation.</span>
            </li>
            <li className="flex gap-4">
              <span className="text-[#66c0f4] font-bold min-w-8">3.</span>
              <span><strong>Play</strong> any game instantly with a single click from the vault.</span>
            </li>
            <li className="flex gap-4">
              <span className="text-[#66c0f4] font-bold min-w-8">4.</span>
              <span><strong>Export</strong> your collection anytime or share specific games with others.</span>
            </li>
          </ol>
        </div>

        {/* Footer */}
        <button
          onClick={onGetStarted}
          className="bg-gradient-to-r from-[#66c0f4] to-blue-600 hover:from-blue-400 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-[0_0_25px_rgba(102,192,244,0.4)]"
        >
          {gameCount > 0 ? 'Enter Vault' : 'Get Started'}
        </button>
      </div>
    </div>
  );
};

export default IntroPage;
