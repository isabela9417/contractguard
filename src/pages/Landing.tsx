import { Link } from 'react-router-dom';
import { Shield, FileSearch, AlertTriangle, CheckCircle, ArrowRight, Lock, Clock, Zap, FileText, Bot, Eye, Target, Headphones, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TestimonialCarousel } from '@/components/TestimonialCarousel';
import heroImage from '@/assets/hero-contract.jpg';
import workspaceImage from '@/assets/workspace.jpg';
import aiShieldImage from '@/assets/ai-shield.jpg';

export default function Landing() {
  const features = [
    {
      icon: FileSearch,
      title: 'Deep Contract Analysis',
      description: 'Every clause examined with precision. No more hidden surprises in fine print.',
    },
    {
      icon: AlertTriangle,
      title: 'Clear Risk Scoring',
      description: 'Understand exactly what you\'re signing with 0-10 risk ratings and plain explanations.',
    },
    {
      icon: CheckCircle,
      title: 'Negotiation Guidance',
      description: 'Get specific advice on what to push back on and how to protect your interests.',
    },
    {
      icon: Lock,
      title: 'Bank-Level Security',
      description: 'Your documents are encrypted, analyzed, and never stored beyond what you need.',
    },
    {
      icon: Eye,
      title: 'Advanced OCR',
      description: 'Scanned contracts? No problem. We extract text from any document format.',
    },
    {
      icon: Headphones,
      title: 'Voice Accessibility',
      description: 'Listen to analysis results with premium voice synthesis. Built for everyone.',
    },
  ];

  const contractTypes = [
    'Employment Contracts',
    'Rental Agreements',
    'Service Agreements',
    'NDAs & Confidentiality',
    'Sales Contracts',
    'Partnership Deals',
    'Freelance Agreements',
    'Licensing Terms',
  ];

  const stats = [
    { value: '50,000+', label: 'Contracts Protected' },
    { value: '98%', label: 'User Satisfaction' },
    { value: '< 30s', label: 'Analysis Time' },
    { value: '24/7', label: 'Always Available' },
  ];

  const capabilities = [
    { icon: Bot, title: 'Multi-Modal AI', description: 'Vision, language, and specialized legal models working together' },
    { icon: BarChart3, title: 'Analytics Dashboard', description: 'Track trends across all your contracts over time' },
    { icon: FileText, title: 'PDF Export', description: 'Download professional reports with full analysis' },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-serif text-xl font-semibold tracking-tight text-foreground">
                ContractGuard
              </h1>
            </div>
          </div>

          <nav className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className="gap-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Contract review" 
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/80" />
        </div>

        <div className="container relative z-10 py-20 lg:py-32">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary backdrop-blur-sm border border-primary/20">
              <Shield className="h-4 w-4" />
              Contract Protection Made Simple
            </div>
            <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Know What You're Signing{' '}
              <span className="text-primary relative">
                Before You Sign
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/30" viewBox="0 0 200 10">
                  <path d="M0,5 Q50,0 100,5 T200,5" fill="none" stroke="currentColor" strokeWidth="3" />
                </svg>
              </span>
            </h1>
            <p className="mt-8 text-lg text-muted-foreground sm:text-xl">
              Upload any contract. Get instant analysis of risky clauses, unfair terms, 
              and hidden obligations—all explained in plain language with actionable advice.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link to="/signup">
                <Button size="lg" className="w-full gap-2 sm:w-auto shadow-lg shadow-primary/25">
                  Analyze Your First Contract <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative border-y border-border bg-muted/30 py-12">
        <div className="container relative z-10">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center group">
                <div className="relative inline-block">
                  <div className="text-3xl font-bold text-primary sm:text-4xl transition-transform group-hover:scale-110">{stat.value}</div>
                  <div className="absolute -inset-4 rounded-full bg-primary/5 -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 lg:py-28">
        <div className="container relative z-10">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm font-medium text-muted-foreground mb-4">
              <Target className="h-4 w-4" />
              Complete Protection
            </div>
            <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Everything You Need to Stay Protected
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Built with the same rigor a legal team would bring, 
              but accessible to everyone.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card 
                key={feature.title} 
                className="relative border-border/50 bg-card shadow-elegant transition-all hover:shadow-xl hover:-translate-y-1 group overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <CardContent className="p-6 relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-4 font-serif text-lg font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI Technology Section */}
      <section className="relative py-20 border-y border-border bg-gradient-to-b from-muted/20 to-background">
        <div className="container">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="relative">
              <img 
                src={aiShieldImage} 
                alt="Contract Protection" 
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -top-4 -left-4 w-24 h-24 rounded-full bg-primary/20 blur-xl" />
              <div className="absolute -bottom-4 -right-4 w-32 h-32 rounded-full bg-secondary/20 blur-xl" />
              
              <div className="absolute -bottom-6 -right-6 rounded-xl bg-card p-4 shadow-xl border border-border">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Multi-Modal AI</p>
                    <p className="text-xs text-muted-foreground">Vision + Language + Legal</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-4">
                <Bot className="h-4 w-4" />
                Advanced Technology
              </div>
              <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Context-Aware Analysis
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Our system combines language understanding, document vision, and specialized legal models 
                to analyze contracts the way a seasoned attorney would—but in seconds.
              </p>
              
              <div className="mt-8 space-y-4">
                {capabilities.map((cap) => (
                  <div key={cap.title} className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <cap.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{cap.title}</h4>
                      <p className="text-sm text-muted-foreground">{cap.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-20">
        <div className="container relative z-10">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Three Steps to Clarity
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Get professional-grade contract analysis without the complexity.
              </p>
              
              <div className="mt-10 space-y-8">
                <div className="flex gap-4 group">
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-lg shadow-primary/25">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">Upload Your Contract</h3>
                    <p className="mt-1 text-muted-foreground">
                      Drop your PDF, Word doc, or even a scanned image. We handle all formats.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4 group">
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-lg shadow-primary/25">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">AI Analyzes Everything</h3>
                    <p className="mt-1 text-muted-foreground">
                      Multi-modal AI examines every clause, identifies risks, and explains the impact.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4 group">
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-lg shadow-primary/25">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">Take Action</h3>
                    <p className="mt-1 text-muted-foreground">
                      Get clear next steps, negotiation tips, and export reports to share with others.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src={workspaceImage} 
                alt="Contract analysis dashboard" 
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -inset-4 border-2 border-primary/20 rounded-3xl -z-10" />
              
              <div className="absolute -bottom-6 -left-6 rounded-xl bg-card p-4 shadow-xl border border-border">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                    <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Analysis Complete</p>
                    <p className="text-xs text-muted-foreground">5 clauses flagged</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contract Types Section */}
      <section className="relative py-20 bg-muted/20">
        <div className="container relative z-10">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm font-medium text-muted-foreground mb-4">
              <FileText className="h-4 w-4" />
              Universal Compatibility
            </div>
            <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground">
              Works With Any Contract
            </h2>
            <p className="mt-4 text-muted-foreground">
              From job offers to lease agreements—we've got you covered.
            </p>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-3">
            {contractTypes.map((type) => (
              <span
                key={type}
                className="rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-lg hover:shadow-primary/20 cursor-default"
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <TestimonialCarousel />

      {/* Final CTA - Simple */}
      <section className="relative py-20 lg:py-24 border-t border-border">
        <div className="container text-center">
          <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Ready to Protect Yourself?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            Start analyzing contracts in seconds. No credit card required.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="gap-2 shadow-lg shadow-primary/25">
                Start Free <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">ContractGuard</span>
          </div>
          <p>Empowering you to understand your contracts</p>
          <p className="mt-2 text-xs">
            This tool provides informational analysis only and is not a substitute for legal advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
