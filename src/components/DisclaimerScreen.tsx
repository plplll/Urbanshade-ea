import { useState } from "react";
import { Shield, Github, Info, CheckCircle, HardDrive } from "lucide-react";

interface DisclaimerScreenProps {
  onAccept: () => void;
}

export const DisclaimerScreen = ({ onAccept }: DisclaimerScreenProps) => {
  const [understood, setUnderstood] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8 animate-fade-in">
          <Shield className="w-24 h-24 mx-auto mb-6 text-primary animate-pulse" />
          <h1 className="text-5xl font-bold mb-4 text-primary">UrbanShade OS</h1>
          <p className="text-xl text-muted-foreground">Deep-Sea Facility Management System</p>
          <p className="text-sm text-muted-foreground mt-2">Version 2.2 • Build 2024.12</p>
        </div>

        <div className="glass-panel p-8 space-y-6 border border-white/10">
          <div className="flex items-start gap-4 p-5 rounded-lg bg-yellow-500/10 border-2 border-yellow-500/40">
            <Info className="w-7 h-7 text-yellow-500 flex-shrink-0 mt-1" />
            <div className="space-y-3">
              <h3 className="font-bold text-yellow-500 text-xl">⚠️ IMPORTANT DISCLAIMER</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                This is a <strong className="text-white">completely fictional operating system</strong> designed for entertainment purposes only.
                UrbanShade OS simulates a retro-futuristic facility management interface and does not interact with your actual 
                computer hardware, files, or system settings.
              </p>
              <p className="text-sm text-yellow-400 italic">
                (Yes, this means all those "system errors" and "containment breaches" aren't real. Sorry to disappoint.)
              </p>
            </div>
          </div>

          <div className="space-y-4 text-sm text-muted-foreground">
            <div className="p-5 rounded-lg bg-black/60 border-2 border-primary/30">
              <h4 className="font-bold text-primary mb-3 text-base flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                🎮 What This Actually Is:
              </h4>
              <ul className="space-y-2 ml-6">
                <li>• A web-based simulation of a <strong>fictional</strong> underwater research facility OS</li>
                <li>• Inspired by the game "Pressure" and the lore of Urbanshade Corporation</li>
                <li>• All features are simulated client-side in your browser using React</li>
                <li>• No real files, no real processes, no real containment units (the monsters aren't real either)</li>
                <li>• Think of it as an interactive desktop environment... for make-believe 🐙</li>
              </ul>
            </div>

            <div className="p-5 rounded-lg bg-black/60 border-2 border-blue-500/30">
              <h4 className="font-bold text-blue-400 mb-3 text-base flex items-center gap-2">
                <HardDrive className="w-5 h-5" />
                💾 How Data Storage Works:
              </h4>
              <ul className="space-y-2 ml-6">
                <li>• All your settings, "files", and progress are stored in your browser's <code className="bg-black/70 px-2 py-0.5 rounded text-blue-300">localStorage</code></li>
                <li>• <strong className="text-white">Nothing</strong> is sent to external servers or the cloud</li>
                <li>• Your data never leaves your device (we literally can't access it even if we wanted to)</li>
                <li>• <strong className="text-yellow-400">Important:</strong> Clearing your browser data will reset everything</li>
                <li>• Using incognito/private mode? Your progress won't be saved after closing the tab</li>
              </ul>
            </div>

            <div className="p-5 rounded-lg bg-black/60 border-2 border-red-500/30">
              <h4 className="font-bold text-red-400 mb-3 text-base flex items-center gap-2">
                <Shield className="w-5 h-5" />
                🔐 Privacy & Security (The Serious Part):
              </h4>
              <ul className="space-y-2 ml-6">
                <li>• <strong className="text-red-300">DO NOT</strong> enter real passwords or sensitive information anywhere in this system</li>
                <li>• All "authentication" is purely simulated - it's about as secure as a screen door on a submarine</li>
                <li>• This is <strong className="text-white">NOT</strong> secure software - it's a browser toy for fun</li>
                <li>• The hardcoded passwords (like "admin") are intentional easter eggs, not security vulnerabilities</li>
                <li>• Treat any password you enter here like it's written on a sticky note on your monitor</li>
              </ul>
            </div>

            <div className="p-5 rounded-lg bg-gradient-to-r from-primary/20 to-purple-500/20 border-2 border-primary/40">
              <h4 className="font-bold text-primary mb-3 text-base flex items-center gap-2">
                <Github className="w-5 h-5" />
                💻 Open Source Project
              </h4>
              <p className="mb-3 text-base">
                This project is <strong className="text-white">open source</strong> and available on GitHub. 
                Made with ❤️ (and way too much coffee) by aswdbatch.
              </p>
              <a
                href="https://github.com/aswdBatch/urbanshade-7e993958"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-primary/30 border-2 border-primary/50 hover:bg-primary/40 transition-colors font-semibold"
              >
                <Github className="w-5 h-5" />
                View Source Code on GitHub
              </a>
              <p className="mt-3 text-xs text-muted-foreground">
                (Feel free to fork it, break it, or make it even more ridiculous)
              </p>
            </div>
          </div>

        <div className="border-t-2 border-white/10 pt-6 space-y-4">
            <div className="p-4 rounded-lg bg-primary/10 border-2 border-primary/40 text-center">
              <p className="text-base text-muted-foreground">
                📚 New here? Check out the{" "}
                <a 
                  href="/docs" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-bold"
                >
                  User Documentation
                </a>
                {" "}for guides, tips, and probably too many underwater puns.
              </p>
            </div>

            <label className="flex items-start gap-4 cursor-pointer p-5 rounded-lg bg-black/60 border-2 border-white/20 hover:border-primary/40 transition-colors group">
              <input
                type="checkbox"
                checked={understood}
                onChange={(e) => setUnderstood(e.target.checked)}
                className="w-6 h-6 mt-1 cursor-pointer accent-primary"
              />
              <div className="flex-1">
                <div className="font-bold text-primary mb-2 text-lg group-hover:text-primary/80 transition-colors">
                  ✓ I Understand and Consent
                </div>
                <div className="text-sm text-muted-foreground leading-relaxed">
                  I understand this is a fictional simulation created for entertainment. I consent to the use of 
                  localStorage for storing my settings and progress locally in my browser. I will not enter real 
                  sensitive information. I acknowledge that this is not real software and no actual deep-sea 
                  facilities are involved (unfortunately).
                </div>
              </div>
            </label>
          </div>

          <button
            onClick={onAccept}
            disabled={!understood}
            className="w-full px-8 py-4 rounded-lg bg-primary hover:bg-primary/80 text-black font-bold text-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
          >
            {understood ? (
              <>
                <CheckCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
                Dive Into UrbanShade OS
              </>
            ) : (
              <>
                <Info className="w-5 h-5" />
                Please read and accept to continue
              </>
            )}
          </button>

          <p className="text-xs text-center text-muted-foreground">
            By proceeding, you agree to use this simulation for entertainment purposes only. 
            Also, you agree that we warned you about the simulated containment breaches. 🦑
          </p>
        </div>
      </div>
    </div>
  );
};
