import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  BarChart3, 
  TrendingUp, 
  LogOut, 
  RefreshCw,
  Loader2,
  Eye,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  CartesianGrid,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';

import { ResponseDetailModal } from '@/components/dashboard/ResponseDetailModal';
import { ExportButton } from '@/components/dashboard/ExportButton';
import { LocationChart } from '@/components/dashboard/LocationChart';
import { SourceChart } from '@/components/dashboard/SourceChart';
import { SearchFilters } from '@/components/dashboard/SearchFilters';
import { AdminManagement } from '@/components/dashboard/AdminManagement';
import logo from '@/assets/tenantly-logo.png';

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
  const { user, signOut, loading: authLoading } = useAuth();
  
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState<'all' | 'landlord' | 'tenant'>('all');
  
  // New state for enhanced features
  const [selectedResponse, setSelectedResponse] = useState<SurveyResponse | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

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

  const handleViewResponse = (response: SurveyResponse) => {
    setSelectedResponse(response);
    setDetailModalOpen(true);
  };

  // Filtered responses based on search and date range
  const filteredResponses = useMemo(() => {
    let result = responses;

    // Filter by type
    if (selectedType !== 'all') {
      result = result.filter(r => r.survey_type === selectedType);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.name?.toLowerCase().includes(query) ||
        r.email?.toLowerCase().includes(query) ||
        r.phone?.includes(query)
      );
    }

    // Filter by date range
    if (dateRange.from) {
      result = result.filter(r => new Date(r.created_at) >= dateRange.from!);
    }
    if (dateRange.to) {
      const endOfDay = new Date(dateRange.to);
      endOfDay.setHours(23, 59, 59, 999);
      result = result.filter(r => new Date(r.created_at) <= endOfDay);
    }

    return result;
  }, [responses, selectedType, searchQuery, dateRange]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const landlordCount = responses.filter(r => r.survey_type === 'landlord').length;
  const tenantCount = responses.filter(r => r.survey_type === 'tenant').length;
  const completedCount = responses.filter(r => r.completed).length;
  const partialCount = responses.filter(r => !r.completed).length;
  const todayCount = responses.filter(r => {
    const today = new Date().toDateString();
    return new Date(r.created_at).toDateString() === today;
  }).length;
  const thisWeekCount = responses.filter(r => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return new Date(r.created_at) >= weekAgo;
  }).length;

  // Chart data
  const typeDistribution = [
    { name: 'Landlords', value: landlordCount, fill: COLORS[0] },
    { name: 'Tenants', value: tenantCount, fill: COLORS[1] },
  ];

  const completionData = [
    { name: 'Completed', value: completedCount, fill: 'hsl(142, 76%, 36%)' },
    { name: 'Partial', value: partialCount, fill: 'hsl(38, 92%, 50%)' },
  ];

  // Responses trend (last 14 days)
  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - i));
    return date.toDateString();
  });

  const responsesTrend = last14Days.map(day => {
    const landlords = responses.filter(r => 
      new Date(r.created_at).toDateString() === day && r.survey_type === 'landlord'
    ).length;
    const tenants = responses.filter(r => 
      new Date(r.created_at).toDateString() === day && r.survey_type === 'tenant'
    ).length;
    return {
      date: new Date(day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      landlords,
      tenants,
      total: landlords + tenants,
    };
  });

  const chartConfig = {
    landlords: {
      label: "Landlords",
      color: "hsl(222, 47%, 30%)",
    },
    tenants: {
      label: "Tenants",
      color: "hsl(45, 85%, 55%)",
    },
    total: {
      label: "Total",
      color: "hsl(222, 47%, 40%)",
    },
    count: {
      label: "Responses",
      color: "hsl(222, 47%, 30%)",
    },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Tenantly" className="h-10 w-auto" />
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 mb-8">
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
                {thisWeekCount} this week
              </p>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Landlords
              </CardTitle>
              <Building2 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{landlordCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Target: 200 ({Math.round((landlordCount / 200) * 100)}%)
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
                Tenants
              </CardTitle>
              <Users className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{tenantCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Target: 500 ({Math.round((tenantCount / 500) * 100)}%)
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
                Today
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{todayCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                New submissions
              </p>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{completedCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {responses.length > 0 ? Math.round((completedCount / responses.length) * 100) : 0}% completion rate
              </p>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Partial
              </CardTitle>
              <XCircle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{partialCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Incomplete surveys
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section - Row 1 */}
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Response Trend</CardTitle>
              <CardDescription>Daily submissions over the last 2 weeks</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px]">
                <AreaChart data={responsesTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 10 }} />
                  <YAxis className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area 
                    type="monotone"
                    dataKey="landlords" 
                    stackId="1"
                    stroke="hsl(222, 47%, 30%)" 
                    fill="hsl(222, 47%, 30%)" 
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone"
                    dataKey="tenants" 
                    stackId="1"
                    stroke="hsl(45, 85%, 55%)" 
                    fill="hsl(45, 85%, 55%)" 
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

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
        </div>

        {/* Charts Section - Row 2 */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <LocationChart responses={responses} />
          <SourceChart responses={responses} />
        </div>

        {/* Admin Management */}
        <div className="mb-8">
          <AdminManagement />
        </div>

        {/* Responses Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="font-display">Survey Responses</CardTitle>
                  <CardDescription>
                    Showing {filteredResponses.length} of {responses.length} responses
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <ExportButton responses={filteredResponses} selectedType={selectedType} />
                  <Tabs value={selectedType} onValueChange={(v) => setSelectedType(v as typeof selectedType)}>
                    <TabsList>
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="landlord">Landlords</TabsTrigger>
                      <TabsTrigger value="tenant">Tenants</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
              <SearchFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />
            </div>
          </CardHeader>
          <CardContent>
            {filteredResponses.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-medium text-foreground">No responses found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchQuery || dateRange.from || dateRange.to 
                    ? 'Try adjusting your filters'
                    : 'Survey responses will appear here'}
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
                      <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Source</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Date</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResponses.slice(0, 50).map((response) => (
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
                          <div className="text-sm text-foreground font-medium">{response.name || 'Anonymous'}</div>
                          <div className="text-xs text-muted-foreground">{response.email || '-'}</div>
                          {response.phone && (
                            <div className="text-xs text-muted-foreground">{response.phone}</div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {response.location || '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {response.source || '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          <div>{new Date(response.created_at).toLocaleDateString()}</div>
                          <div className="text-xs">{new Date(response.created_at).toLocaleTimeString()}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                            response.completed 
                              ? 'bg-success/10 text-success' 
                              : 'bg-warning/10 text-warning'
                          }`}>
                            {response.completed ? (
                              <><CheckCircle className="h-3 w-3" /> Complete</>
                            ) : (
                              <><XCircle className="h-3 w-3" /> Partial</>
                            )}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewResponse(response)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredResponses.length > 50 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Showing first 50 of {filteredResponses.length} responses. Use filters to narrow down.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Response Detail Modal */}
      <ResponseDetailModal
        response={selectedResponse}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
      />
    </div>
  );
}
