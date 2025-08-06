import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { VideoProvider } from "./contexts/VideoContext";
import Layout from "./components/layout";
import Home from "./pages/home";
import Library from "./pages/library";
import Changelog from "./pages/changelog";
import Help from "./pages/help";
import Feedback from "./pages/feedback";

import NotFound from "./pages/not-found";

function Router() {
  return (
    <VideoProvider>
      <Layout>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/library" component={Library} />
          <Route path="/changelog" component={Changelog} />
          <Route path="/help" component={Help} />
          <Route path="/feedback" component={Feedback} />

          <Route component={NotFound} />
        </Switch>
      </Layout>
    </VideoProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
