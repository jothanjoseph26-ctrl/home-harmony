import { Building2, Users, Gift, ArrowRight, Shield, Clock, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptNiA2djZoNnYtNmgtNnptLTEyIDBoLTZ2Nmg2di02em0tNi02aC02djZoNnYtNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        
        <div className="container relative z-10 py-16 md:py-24 lg:py-32">
          <nav className="mb-12 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                <Building2 className="h-6 w-6 text-secondary-foreground" />
              </div>
              <span className="font-display text-xl font-bold text-primary-foreground">TenantlyNG</span>
            </div>
            <div className="hidden items-center gap-4 md:flex">
              <span className="text-sm text-primary-foreground/80">Research Survey 2025</span>
            </div>
          </nav>

          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-secondary/20 px-4 py-2 text-sm text-primary-foreground backdrop-blur-sm">
              <Gift className="h-4 w-4" />
              <span>Win up to ₦50,000 • Free Market Report</span>
            </div>
            
            <h1 className="font-display text-4xl font-bold tracking-tight text-primary-foreground md:text-5xl lg:text-6xl">
              Help Shape the Future of
              <span className="block text-secondary">Nigerian Rentals</span>
            </h1>
            
            <p className="mx-auto mt-6 max-w-2xl text-lg text-primary-foreground/80 md:text-xl">
              We're researching how to make rent payment easier for everyone. Your insights will help millions of Nigerians access better housing.
            </p>
          </div>
        </div>

        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 50L60 45C120 40 240 30 360 35C480 40 600 60 720 65C840 70 960 60 1080 50C1200 40 1320 30 1380 25L1440 20V100H1380C1320 100 1200 100 1080 100C960 100 840 100 720 100C600 100 480 100 360 100C240 100 120 100 60 100H0V50Z" fill="hsl(140 20% 98%)"/>
          </svg>
        </div>
      </header>

      {/* Survey Selection */}
      <section className="container py-16 md:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              Choose Your Survey
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Select the survey that best describes you
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Landlord Survey Card */}
            <Link to="/survey/landlord" className="group">
              <div className="survey-card h-full">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground">
                  Landlord Survey
                </h3>
                <p className="mt-3 text-muted-foreground">
                  For property owners and investors. Share your experiences with rent collection and tenant management.
                </p>
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>8-10 minutes</span>
                  </div>
                  <div className="gold-gradient rounded-full px-3 py-1 text-sm font-semibold text-secondary-foreground">
                    Win ₦50,000
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-2 text-primary font-medium group-hover:gap-3 transition-all">
                  <span>Start Survey</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>

            {/* Tenant Survey Card */}
            <Link to="/survey/tenant" className="group">
              <div className="survey-card h-full">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/30">
                  <Users className="h-8 w-8 text-gold-dark" />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground">
                  Tenant Survey
                </h3>
                <p className="mt-3 text-muted-foreground">
                  For renters and tenants. Help us understand the challenges of paying rent in Nigeria.
                </p>
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>10-12 minutes</span>
                  </div>
                  <div className="gold-gradient rounded-full px-3 py-1 text-sm font-semibold text-secondary-foreground">
                    Win ₦20,000
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-2 text-primary font-medium group-hover:gap-3 transition-all">
                  <span>Start Survey</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Participate */}
      <section className="border-t border-border bg-muted/30 py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-12 text-center font-display text-3xl font-bold text-foreground">
              Why Participate?
            </h2>
            
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/20">
                  <Gift className="h-7 w-7 text-gold-dark" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground">Win Cash Prizes</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  ₦50,000 for landlords • ₦20,000 for tenants
                </p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                  <TrendingUp className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground">Free Market Report</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Receive exclusive Nigeria Rental Market Insights 2025
                </p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent">
                  <Shield className="h-7 w-7 text-accent-foreground" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground">100% Confidential</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  All responses are anonymous and aggregated
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Building2 className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display font-semibold text-foreground">TenantlyNG</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 TenantlyNG. Making rent easier for everyone.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="mailto:hello@tenantlyng.com" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
