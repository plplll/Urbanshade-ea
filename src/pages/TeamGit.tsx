import { ArrowLeft, Github, GitCommit, Users, Star, Code, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Contributor {
  name: string;
  role: string;
  contributions: string[];
  github?: string;
  joinedAt?: string;
}

// Everyone who has ever contributed, big or small
const allContributors: Contributor[] = [
  {
    name: "Aswd_LV",
    role: "Founder & Lead Developer",
    contributions: ["Core architecture", "95% of codebase", "Vision & direction"],
    github: "Aswd-LV",
    joinedAt: "January 2025"
  },
  {
    name: "plplll",
    role: "Developer & Tester",
    contributions: ["Cloud features", "Testing", "Ideas & feedback"],
    joinedAt: "Early 2025"
  },
  {
    name: "Kombainis_yehaw",
    role: "QA Tester",
    contributions: ["Bug hunting", "Quality assurance"],
    joinedAt: "2025"
  },
  // Add more contributors here as they join!
];

const TeamGit = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <h1 className="text-xl font-bold text-primary flex items-center gap-2">
            <GitCommit className="w-5 h-5" />
            All Contributors
          </h1>
          <div className="flex items-center gap-3">
            <a 
              href="https://github.com/Urbanshade-Team" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10 transition-colors text-sm"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
            <Link 
              to="/team" 
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Team
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        {/* Hero */}
        <section className="text-center space-y-6">
          <div className="relative inline-block">
            <Users className="w-16 h-16 mx-auto text-primary" />
            <div className="absolute -inset-4 bg-primary/20 blur-xl rounded-full -z-10" />
          </div>
          
          <h2 className="text-4xl font-bold">
            Every Single <span className="text-primary">Contributor</span>
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            This is a hall of fame for everyone who has ever contributed to Urbanshade OS. 
            Big or small, every contribution matters. You helped make this happen.
          </p>

          <div className="flex justify-center gap-4 text-sm">
            <span className="px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-primary font-medium">
              <Star className="w-4 h-4 inline mr-2" />
              {allContributors.length} Contributors
            </span>
          </div>
        </section>

        {/* Contributors Grid */}
        <section className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {allContributors.map((contributor) => (
              <div 
                key={contributor.name}
                className="p-5 rounded-xl bg-white/5 border border-white/10 hover:border-primary/30 hover:bg-white/10 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                      {contributor.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{contributor.role}</p>
                  </div>
                  {contributor.github && (
                    <a 
                      href={`https://github.com/${contributor.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <Github className="w-4 h-4 text-muted-foreground" />
                    </a>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {contributor.contributions.map((contrib, idx) => (
                    <span 
                      key={idx}
                      className="px-2 py-1 rounded text-xs bg-primary/10 text-primary/80 border border-primary/20"
                    >
                      {contrib}
                    </span>
                  ))}
                </div>
                
                {contributor.joinedAt && (
                  <p className="text-xs text-muted-foreground">
                    Contributing since {contributor.joinedAt}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Add Yourself Section */}
        <section className="p-8 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 text-center">
          <Code className="w-10 h-10 mx-auto text-green-500 mb-4" />
          <h3 className="text-xl font-bold mb-3">Want to See Your Name Here?</h3>
          <p className="text-muted-foreground max-w-lg mx-auto mb-6">
            Contribute to Urbanshade OS and get added to this list! Every bug report, 
            code contribution, idea, or feedback counts.
          </p>
          <a 
            href="https://github.com/Urbanshade-Team" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 transition-colors font-medium"
          >
            <Github className="w-5 h-5" />
            Start Contributing
          </a>
        </section>

        {/* Footer */}
        <footer className="text-center pt-8 border-t border-white/10">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
            Made with <Heart className="w-4 h-4 text-red-500" /> by the Urbanshade community
          </p>
          <Link to="/team" className="inline-block text-primary hover:underline text-sm font-semibold mt-4">
            ← Back to Main Team Page
          </Link>
        </footer>
      </main>
    </div>
  );
};

export default TeamGit;
