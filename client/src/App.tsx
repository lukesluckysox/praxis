import React from "react";
import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Layout } from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Experiments from "@/pages/Experiments";
import ExperimentDetail from "@/pages/ExperimentDetail";
import NewExperiment from "@/pages/NewExperiment";
import Doctrines from "@/pages/Doctrines";
import Tensions from "@/pages/Tensions";
import NotFound from "@/pages/not-found";

function AppRoutes() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/experiments" component={Experiments} />
        <Route path="/experiments/new" component={NewExperiment} />
        <Route path="/experiments/:id" component={ExperimentDetail} />
        <Route path="/doctrines" component={Doctrines} />
        <Route path="/tensions" component={Tensions} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = React.useState<'loading' | 'authed' | 'unauthed'>('loading');

  React.useEffect(() => {
    fetch('/api/auth/me')
      .then(r => {
        if (r.ok) setStatus('authed');
        else setStatus('unauthed');
      })
      .catch(() => setStatus('unauthed'));
  }, []);

  if (status === 'loading') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#191b2a', color: '#8D99AE', fontFamily: 'sans-serif' }}>
        Loading…
      </div>
    );
  }

  if (status === 'unauthed') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#191b2a', color: '#F4F5F8', fontFamily: 'sans-serif', gap: '1rem' }}>
        <p style={{ color: '#8D99AE', fontSize: '0.9rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Authentication required</p>
        <p style={{ color: '#F4F5F8', fontSize: '1rem' }}>Open Praxis through <a href="https://lumen-os.up.railway.app" style={{ color: '#FFD166', textDecoration: 'none' }}>Lumen</a></p>
      </div>
    );
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthGate>
          <Router hook={useHashLocation}>
            <AppRoutes />
          </Router>
          <Toaster />
        </AuthGate>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
