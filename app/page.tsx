import CreateTournamentForm from '@/components/tournament/CreateTournamentForm';
import ContinueTournamentForm from '@/components/tournament/ContinueTournamentForm';

export default function Home() {
  return (
    <div className="min-h-screen bg-muted">
      {/* Hero Section */}
      <div className="bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Ultimate Tiebreak
          </h1>
          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto">
            Random pairings, live updates, and elimination tracking all in one place.
          </p>
        </div>
      </div>

      {/* Forms Section */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <CreateTournamentForm />
          </div>
          <div>
            <ContinueTournamentForm />
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-12 sm:mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-semibold mb-2">Register Players</h3>
              <p className="text-sm text-gray-500">
                Add players individually or import a list. No teams required - pairings are random!
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="font-semibold mb-2">Play Matches</h3>
              <p className="text-sm text-gray-500">
                Each round, players are shuffled into random doubles teams. Losers are eliminated.
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="font-semibold mb-2">Crown Champions</h3>
              <p className="text-sm text-gray-500">
                The last players remaining are declared champions!
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-border text-center text-sm text-gray-500">
          <p>Ultimate Tiebreak Tournament Manager</p>
        </footer>
      </main>
    </div>
  );
}
