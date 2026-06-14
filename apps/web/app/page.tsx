import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-xxl h-20 bg-canvas border-b border-hairline-strong">
        <div className="flex items-center gap-xl">
          <span
            className="text-display-lg font-display-lg text-primary tracking-tighter"
            style={{ fontSize: 32 }}
          >
            Voca
          </span>
          <div className="hidden md:flex gap-lg items-center mt-2.5">
            <a
              href="#features"
              className="text-body-sm font-body-sm text-primary font-bold hover:opacity-80 transition-opacity"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-body-sm font-body-sm text-on-surface-variant hover:opacity-80 transition-opacity"
            >
              How it works
            </a>
            <a
              href="#intelligence"
              className="text-body-sm font-body-sm text-on-surface-variant hover:opacity-80 transition-opacity"
            >
              Intelligence
            </a>
          </div>
        </div>
        <div className="flex items-center gap-lg mt-2">
          <Link
            href="/upload"
            className="bg-primary text-canvas px-lg py-xs rounded-lg font-button-sm text-button-sm hover:opacity-90 transition-opacity active:scale-95 inline-block"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative pt-band pb-section px-xxl flex flex-col items-center justify-center text-center overflow-hidden min-h-screen">
        <div className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] atmospheric-blue pointer-events-none opacity-50 blur-[100px]" />
        <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] atmospheric-orange pointer-events-none opacity-30 blur-[120px]" />

        <div className="relative z-10 max-w-5xl mx-auto space-y-xxl">
          <h1 className="font-display-xxl text-display-xxl text-primary tracking-tighter leading-none">
            Intelligence for every meeting.
          </h1>
          <p className="text-subtitle font-subtitle text-charcoal max-w-2xl mx-auto leading-relaxed">
            Voca transforms your meetings into a searchable, actionable
            knowledge base with precision AI intelligence. Submit any YouTube
            video or audio file.
          </p>
          <div className="pt-lg">
            <Link
              href="/upload"
              className="inline-block bg-primary text-canvas px-xxxl py-md rounded-lg font-button-md text-button-md hover:opacity-90 transition-all duration-300 active:scale-95 shadow-xl"
            >
              Get started — it&apos;s free
            </Link>
          </div>
        </div>

        {/* Demo card */}
        <div className="relative z-10 mt-band w-full max-w-4xl mx-auto">
          <div className="bg-surface-deep border border-hairline-strong rounded-xl p-xxl shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-md border-b border-hairline pb-lg mb-lg">
              <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-primary"
                  style={{ fontSize: 20 }}
                >
                  auto_awesome
                </span>
              </div>
              <div className="text-left">
                <div className="text-body-sm font-bold text-primary">
                  Voca Intelligence
                </div>
                <div className="text-caption text-mute">
                  Meeting Summary: Q4 Product Strategy
                </div>
              </div>
              <div className="ml-auto text-caption text-mute">Just now</div>
            </div>
            <div className="text-left space-y-lg">
              <div className="space-y-sm">
                <h3 className="text-headline-sm font-headline-sm text-primary">
                  Executive Summary
                </h3>
                <p className="text-body-md text-charcoal leading-relaxed">
                  The team reached a consensus on the 2025 roadmap, prioritizing
                  the &quot;Semantic Index&quot; feature over legacy
                  maintenance. Global expansion for data residency is set for Q3
                  launch.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-xl">
                <div className="p-lg bg-surface-container-low border border-hairline rounded-xl">
                  <span className="text-caption text-accent-blue font-bold tracking-widest block mb-xs uppercase">
                    Key Decisions
                  </span>
                  <ul className="text-body-sm text-on-surface-variant space-y-xxs list-disc pl-lg">
                    <li>API-first architecture for the neural engine.</li>
                    <li>Migration to Voca-Core for all enterprise clients.</li>
                  </ul>
                </div>
                <div className="p-lg bg-surface-container-low border border-hairline rounded-xl">
                  <span className="text-caption text-accent-orange font-bold tracking-widest block mb-xs uppercase">
                    Action Items
                  </span>
                  <ul className="text-body-sm text-on-surface-variant space-y-xxs list-disc pl-lg">
                    <li>Sarah to draft technical spec for Semantic Index.</li>
                    <li>Liam to schedule the vendor security review.</li>
                  </ul>
                </div>
              </div>
              <div className="pt-md border-t border-hairline text-caption text-mute italic">
                Confidence Score: 98.4% — Verified by Voca Neural Engine
              </div>
            </div>
            <div className="absolute -right-10 top-20 w-40 h-40 bg-accent-blue opacity-10 blur-3xl rounded-full" />
          </div>
        </div>
      </header>

      {/* Features */}
      <section id="features" className="relative py-band px-xxl bg-canvas">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-xl">
            <div className="bg-surface-card border border-hairline-strong rounded-xl p-xxl surface-card-gradient hover:border-accent-blue transition-colors group">
              <div className="mb-xxl text-accent-blue">
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 32 }}
                >
                  hearing
                </span>
              </div>
              <h3 className="text-headline-md font-headline-md text-primary mb-md group-hover:translate-x-1 transition-transform">
                Neural Transcription
              </h3>
              <p className="text-body-md text-charcoal leading-relaxed">
                Industry-leading transcription with Whisper for English and
                Sarvam AI for Hinglish. Submit any YouTube URL or local audio
                file.
              </p>
            </div>
            <div className="bg-surface-card border border-hairline-strong rounded-xl p-xxl surface-card-gradient hover:border-accent-orange transition-colors group">
              <div className="mb-xxl text-accent-orange">
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 32 }}
                >
                  auto_stories
                </span>
              </div>
              <h3 className="text-headline-md font-headline-md text-primary mb-md group-hover:translate-x-1 transition-transform">
                Executive Summary
              </h3>
              <p className="text-body-md text-charcoal leading-relaxed">
                Mistral AI synthesizes hours of dialogue into concise, bulleted
                briefs that capture nuances, decisions, action items, and open
                questions.
              </p>
            </div>
            <div className="bg-surface-card border border-hairline-strong rounded-xl p-xxl surface-card-gradient hover:border-accent-green transition-colors group">
              <div className="mb-xxl text-accent-green">
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 32 }}
                >
                  database
                </span>
              </div>
              <h3 className="text-headline-md font-headline-md text-primary mb-md group-hover:translate-x-1 transition-transform">
                Semantic Index
              </h3>
              <p className="text-body-md text-charcoal leading-relaxed">
                Every spoken word is embedded into Qdrant, allowing you to ask
                natural language questions and receive precise, context-aware
                answers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works / Code section */}
      <section
        id="how-it-works"
        className="py-section px-xxl bg-canvas relative"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-band items-center">
          <div>
            <h2 className="text-display-lg font-display-lg text-primary tracking-tight mb-lg">
              Built for the modern stack.
            </h2>
            <p className="text-body-lg text-charcoal leading-relaxed mb-xxl">
              Submit a YouTube link or upload an audio file. Voca handles the
              entire pipeline — audio extraction, transcription, summarization,
              and RAG indexing — automatically.
            </p>
            <div className="flex gap-lg flex-wrap">
              <Link
                href="/upload"
                className="bg-primary text-canvas px-lg py-sm rounded-lg font-button-sm text-button-sm hover:opacity-90 transition-colors inline-block"
              >
                Try it now
              </Link>
              <button className="text-primary font-button-sm text-button-sm flex items-center gap-xs hover:gap-sm transition-all">
                View the pipeline
                <span className="material-symbols-outlined text-sm">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>
          <div className="bg-surface-deep border border-hairline-strong rounded-xl overflow-hidden shadow-2xl">
            <div className="bg-surface-container-lowest px-lg py-sm flex items-center gap-xs border-b border-hairline">
              <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
              <span className="ml-lg text-caption text-mute font-code-md">
                voca-pipeline --run
              </span>
            </div>
            <div className="p-xxl font-code-md text-code-md leading-relaxed text-on-surface-variant overflow-x-auto space-y-xs">
              <p>
                <span className="text-accent-green">✓</span>{" "}
                <span className="text-mute">[audio]</span> Downloaded from
                YouTube in 1.4s
              </p>
              <p>
                <span className="text-accent-green">✓</span>{" "}
                <span className="text-mute">[stt]</span> Whisper-large-v3-turbo
                transcribed 3 chunks
              </p>
              <p>
                <span className="text-accent-green">✓</span>{" "}
                <span className="text-mute">[llm]</span> Mistral summarized +
                extracted insights
              </p>
              <p className="animate-pulse">
                <span className="text-accent-blue">→</span>{" "}
                <span className="text-mute">[index]</span>{" "}
                <span className="text-accent-blue">
                  Indexing into Qdrant...
                </span>
              </p>
              <div className="mt-lg border-t border-hairline pt-lg">
                <pre className="text-accent-blue text-xs">
                  {`{
  "title": "Q4 Product Strategy",
  "summary": "• Prioritize Semantic Index...",
  "action_items": "1. Sarah to draft spec...",
  "decisions": "1. API-first architecture...",
  "questions": "1. Budget for Q3 expansion?"
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Intelligence CTA */}
      <section
        id="intelligence"
        className="py-band px-xxl bg-canvas relative text-center"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] atmospheric-blue opacity-30 blur-[100px] pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-display-lg font-display-lg text-primary tracking-tight mb-lg">
            Ask anything about your meeting.
          </h2>
          <p className="text-body-lg text-charcoal mb-xxl">
            After processing, Voca indexes your transcript into a vector
            database so you can ask natural language questions and get precise
            answers from the meeting context.
          </p>
          <div className="bg-surface-card border border-hairline-strong rounded-xl p-xxl text-left space-y-lg">
            <div className="flex justify-end">
              <div className="max-w-[70%] bg-surface-elevated border border-hairline-strong p-xl rounded-xl">
                <p className="text-body-md text-primary">
                  Who is responsible for the database setup and when is it due?
                </p>
              </div>
            </div>
            <div className="flex justify-start">
              <div className="max-w-[85%] bg-surface-elevated border border-hairline p-xl rounded-xl">
                <div className="flex items-center gap-sm mb-md text-accent-blue">
                  <span className="material-symbols-outlined text-md">
                    auto_awesome
                  </span>
                  <span className="text-caption font-bold uppercase tracking-widest">
                    Voca Intelligence
                  </span>
                </div>
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                  Based on the transcript, Sarah is responsible for setting up
                  the Qdrant database and writing the integration. Her deadline
                  is next Friday.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-xxl">
            <Link
              href="/upload"
              className="inline-block bg-primary text-canvas px-xxxl py-md rounded-lg font-button-md text-button-md hover:opacity-90 transition-all shadow-xl"
            >
              Start analyzing
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-canvas border-t border-hairline w-full pt-section pb-lg px-xxl">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-band mb-section">
            <div className="col-span-2 md:col-span-1">
              <span className="text-body-lg font-body-lg text-primary block mb-lg">
                Voca
              </span>
              <p className="text-caption text-charcoal max-w-xs">
                Precision intelligence for the modern enterprise. Capture every
                insight, forget nothing.
              </p>
            </div>
            <div>
              <h4 className="text-button-sm font-button-sm text-primary mb-lg uppercase tracking-widest">
                Platform
              </h4>
              <ul className="space-y-sm">
                {[
                  "Neural Transcription",
                  "Semantic Index",
                  "Executive Summary",
                  "RAG Chat",
                ].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-caption text-charcoal hover:text-primary transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-button-sm font-button-sm text-primary mb-lg uppercase tracking-widest">
                Company
              </h4>
              <ul className="space-y-sm">
                {["About Us", "Privacy", "Terms", "Support"].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-caption text-charcoal hover:text-primary transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-button-sm font-button-sm text-primary mb-lg uppercase tracking-widest">
                Social
              </h4>
              <ul className="space-y-sm">
                {["X (Twitter)", "LinkedIn", "GitHub"].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-caption text-charcoal hover:text-primary transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="pt-lg border-t border-hairline flex flex-col md:flex-row justify-between items-center gap-lg">
            <span className="text-caption text-charcoal">
              © 2025 Voca Platform. Precision Intelligence.
            </span>
            <div className="flex items-center gap-sm">
              <span className="w-2 h-2 rounded-full bg-accent-green inline-block" />
              <span className="text-caption text-mute font-code-md">
                Systems Operational
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
