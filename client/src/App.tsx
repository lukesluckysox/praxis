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

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router hook={useHashLocation}>
          <AppRoutes />
        </Router>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
