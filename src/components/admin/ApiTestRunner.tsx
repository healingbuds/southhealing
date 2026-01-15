import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Zap,
  Server,
  Database,
  Shield,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'skip';
  duration: number;
  message?: string;
  details?: Record<string, unknown>;
}

interface TestSuiteResult {
  suite: string;
  timestamp: string;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  results: TestResult[];
}

const testIcons: Record<string, React.ElementType> = {
  '1. Health Check': Server,
  '2. API Key Configuration': Shield,
  '3. Signature Generation': Zap,
  '4. Strains API Endpoint': Globe,
  '5. Local Strain Database': Database,
  '6. Client Payload Validation': Shield,
  '7. Local Client Database': Database,
  '8. Error Response Format': AlertCircle,
  '9. CORS Headers': Globe,
  '10. Response Time': Clock,
};

export function ApiTestRunner() {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestSuiteResult | null>(null);
  const [expandedTests, setExpandedTests] = useState<Set<string>>(new Set());
  const [lastRun, setLastRun] = useState<Date | null>(null);

  const runTests = async () => {
    setIsRunning(true);
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke('drgreen-api-tests', {
        body: {},
      });

      if (error) {
        throw new Error(error.message);
      }

      setResults(data as TestSuiteResult);
      setLastRun(new Date());

      const passed = (data as TestSuiteResult).passed;
      const total = (data as TestSuiteResult).totalTests;

      toast({
        title: passed === total ? "All Tests Passed! ✓" : "Tests Complete",
        description: `${passed}/${total} tests passed in ${(data as TestSuiteResult).duration}ms`,
        variant: passed === total ? "default" : "destructive",
      });
    } catch (error) {
      console.error('Test runner error:', error);
      toast({
        title: "Test Runner Error",
        description: error instanceof Error ? error.message : "Failed to run tests",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const toggleExpand = (testName: string) => {
    const newExpanded = new Set(expandedTests);
    if (newExpanded.has(testName)) {
      newExpanded.delete(testName);
    } else {
      newExpanded.add(testName);
    }
    setExpandedTests(newExpanded);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'skip':
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
      case 'fail':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
      case 'skip':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    }
  };

  const passRate = results ? Math.round((results.passed / results.totalTests) * 100) : 0;

  return (
    <Card className="border-2 border-dashed border-muted-foreground/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">API Test Runner</CardTitle>
              <CardDescription>
                Automated tests for Dr. Green API proxy
              </CardDescription>
            </div>
          </div>
          <Button
            onClick={runTests}
            disabled={isRunning}
            className="gap-2"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run Tests
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Summary Stats */}
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Pass Rate</span>
              <span className={`font-semibold ${passRate === 100 ? 'text-green-500' : passRate >= 70 ? 'text-amber-500' : 'text-red-500'}`}>
                {passRate}%
              </span>
            </div>
            <Progress 
              value={passRate} 
              className={`h-2 ${passRate === 100 ? '[&>div]:bg-green-500' : passRate >= 70 ? '[&>div]:bg-amber-500' : '[&>div]:bg-red-500'}`}
            />

            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-foreground">{results.totalTests}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-green-500/10">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{results.passed}</p>
                <p className="text-xs text-green-600/80 dark:text-green-400/80">Passed</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-red-500/10">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{results.failed}</p>
                <p className="text-xs text-red-600/80 dark:text-red-400/80">Failed</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-foreground">{results.duration}ms</p>
                <p className="text-xs text-muted-foreground">Duration</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Test Results List */}
        {results && (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-foreground">Test Results</h4>
              {lastRun && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {lastRun.toLocaleTimeString()}
                </span>
              )}
            </div>

            <AnimatePresence mode="popLayout">
              {results.results.map((test, index) => {
                const TestIcon = testIcons[test.name] || Server;
                const isExpanded = expandedTests.has(test.name);

                return (
                  <motion.div
                    key={test.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Collapsible open={isExpanded} onOpenChange={() => toggleExpand(test.name)}>
                      <div className={`border rounded-lg transition-colors ${
                        test.status === 'pass' ? 'border-green-500/20 hover:border-green-500/40' :
                        test.status === 'fail' ? 'border-red-500/20 hover:border-red-500/40' :
                        'border-amber-500/20 hover:border-amber-500/40'
                      }`}>
                        <CollapsibleTrigger asChild>
                          <button className="w-full p-3 flex items-center justify-between text-left hover:bg-muted/50 rounded-lg transition-colors">
                            <div className="flex items-center gap-3">
                              {getStatusIcon(test.status)}
                              <div className="p-1.5 rounded bg-muted/50">
                                <TestIcon className="w-4 h-4 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="font-medium text-foreground text-sm">{test.name}</p>
                                {test.message && (
                                  <p className="text-xs text-muted-foreground mt-0.5">{test.message}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className={getStatusColor(test.status)}>
                                {test.duration}ms
                              </Badge>
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                              )}
                            </div>
                          </button>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                          <div className="px-3 pb-3">
                            <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                              <p className="text-xs font-mono text-muted-foreground mb-2">Details:</p>
                              <pre className="text-xs overflow-x-auto text-foreground/80">
                                {JSON.stringify(test.details, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Empty State */}
        {!results && !isRunning && (
          <div className="text-center py-8 text-muted-foreground">
            <Server className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Click "Run Tests" to verify API connectivity</p>
            <p className="text-xs mt-1 opacity-70">
              Tests: health check, signing, strains, clients, CORS, performance
            </p>
          </div>
        )}

        {/* Loading State */}
        {isRunning && (
          <div className="text-center py-12">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <Loader2 className="w-16 h-16 animate-spin text-primary/20" />
              <Loader2 className="w-16 h-16 animate-spin text-primary absolute inset-0" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            </div>
            <p className="text-sm text-muted-foreground">Running 10 API tests...</p>
            <p className="text-xs text-muted-foreground/70 mt-1">This may take a few seconds</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
