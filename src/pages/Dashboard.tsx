import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  BarChart3, 
  TrendingUp, 
  LogOut, 
  Download,
  Calendar,
  Filter,
  RefreshCw,
  Loader2,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  PieChart, 
  Pie, 
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';

interface SurveyResponse {
  id: string;
  survey_type: string;
  responses: Record<string, unknown>;
  created_at: string;
  completed: boolean;
  name: string | null;
  email: string | null;
  phone: string | null;
  source: string | null;
  location: string | null;
}

const COLORS = ['hsl(222, 47%, 30%)', 'hsl(45, 85%, 55%)', 'hsl(222, 40%, 50%)', 'hsl(40, 80%, 45%)'];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading, isAdmin } = useAuth();
  
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState<'all' | 'landlord' | 'tenant'>('all');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchResponses();
    }
  }, [user]);

  const fetchResponses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('survey_responses')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setResponses(data as SurveyResponse[]);
    }
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchResponses();
    setRefreshing(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const filteredResponses = selectedType === 'all' 
    ? responses 
    : responses.filter(r => r.survey_type === selectedType);

  const landlordCount = responses.filter(r => r.survey_type === 'landlord').length;
  const tenantCount = responses.filter(r => r.survey_type === 'tenant').length;
  const completedCount = responses.filter(r => r.completed).length;
  const todayCount = responses.filter(r => {
    const today = new Date().toDateString();
    return new Date(r.created_at).toDateString() === today;
  }).length;

  // Chart data
  const typeDistribution = [
    { name: 'Landlords', value: landlordCount, fill: COLORS[0] },
    { name: 'Tenants', value: tenantCount, fill: COLORS[1] },
  ];

  // Responses by day (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toDateString();
  });

  const responsesByDay = last7Days.map(day => {
    const count = responses.filter(r => 
      new Date(r.created_at).toDateString() === day
    ).length;
    return {
      date: new Date(day).toLocaleDateString('en-US', { weekday: 'short' }),
      responses: count,
    };
  });

  const chartConfig = {
    responses: {
      label: "Responses",
      color: "hsl(222, 47%, 30%)",
    },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="dashboard-nav">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <Building2 className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display text-lg font-bold text-foreground">TenantlyNG</h1>
                <p className="text-xs text-muted-foreground">Survey Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline ml-2">Refresh</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="stat-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Responses
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{responses.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {completedCount} completed
              </p>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Landlord Responses
              </CardTitle>
              <Building2 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{landlordCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Target: 200
              </p>
              <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${Math.min((landlordCount / 200) * 100, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tenant Responses
              </CardTitle>
              <Users className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{tenantCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Target: 500
              </p>
              <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                <div 
                  className="h-full gold-gradient rounded-full transition-all"
                  style={{ width: `${Math.min((tenantCount / 500) * 100, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Today's Responses
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{todayCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                New submissions today
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Response Distribution</CardTitle>
              <CardDescription>Breakdown by survey type</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px]">
                <PieChart>
                  <Pie
                    data={typeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {typeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display">Daily Responses</CardTitle>
              <CardDescription>Last 7 days activity</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px]">
                <BarChart data={responsesByDay}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar 
                    dataKey="responses" 
                    fill="hsl(222, 47%, 30%)" 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Responses Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="font-display">Recent Responses</CardTitle>
                <CardDescription>View and manage survey submissions</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Tabs value={selectedType} onValueChange={(v) => setSelectedType(v as typeof selectedType)}>
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="landlord">Landlords</TabsTrigger>
                    <TabsTrigger value="tenant">Tenants</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredResponses.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-medium text-foreground">No responses yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Survey responses will appear here
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Type</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Contact</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Location</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Date</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResponses.slice(0, 20).map((response) => (
                      <tr key={response.id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                            response.survey_type === 'landlord' 
                              ? 'bg-primary/10 text-primary' 
                              : 'bg-secondary/20 text-gold-dark'
                          }`}>
                            {response.survey_type === 'landlord' ? (
                              <Building2 className="h-3 w-3" />
                            ) : (
                              <Users className="h-3 w-3" />
                            )}
                            {response.survey_type}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-foreground">{response.name || 'Anonymous'}</div>
                          <div className="text-xs text-muted-foreground">{response.email || '-'}</div>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {response.location || '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {new Date(response.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            response.completed 
                              ? 'bg-success/10 text-success' 
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {response.completed ? 'Complete' : 'Partial'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
