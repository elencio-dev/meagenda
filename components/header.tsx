export function Header() {
  return (
    <header className="bg-card border-b border-ink-10">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-coral rounded-lg flex items-center justify-center">
            <span className="text-white font-serif text-lg">M</span>
          </div>
          <span className="font-serif text-xl text-ink">
            MeAgenda<span className="text-coral">.</span>
          </span>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <a href="#" className="text-sm text-ink-60 hover:text-coral transition-colors">
            Como funciona
          </a>
          <a href="#" className="text-sm text-ink-60 hover:text-coral transition-colors">
            Contato
          </a>
        </nav>
      </div>
    </header>
  )
}
