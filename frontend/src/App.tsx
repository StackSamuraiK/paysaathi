import { useEffect, useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  RefreshCcw, 
  TrendingUp,
  AlertCircle,
  CreditCard,
  Search,
  Filter,
  Plus
} from 'lucide-react';
import api from './lib/api';

type View = 'dashboard' | 'invoices' | 'customers' | 'payments';

interface ReceivableInsight {
  total_outstanding: string | number;
}

interface OverdueInvoice {
  id: number;
  external_id: string;
  customer_name: string;
  amount: string;
  due_date: string;
  status: string;
}

function App() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [receivables, setReceivables] = useState<number>(0);
  const [overdueInvoices, setOverdueInvoices] = useState<OverdueInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recRes, overdueRes] = await Promise.all([
        api.get<ReceivableInsight>('/insights/receivables'),
        api.get<OverdueInvoice[]>('/insights/overdue')
      ]);
      setReceivables(Number(recRes.data.total_outstanding));
      setOverdueInvoices(overdueRes.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await api.post('/sync');
      await fetchData();
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const chartData = [
    { name: 'Jan', amount: 4000 },
    { name: 'Feb', amount: 3000 },
    { name: 'Mar', amount: 2000 },
    { name: 'Apr', amount: 2780 },
    { name: 'May', amount: 1890 },
    { name: 'Jun', amount: 2390 },
  ];

  const renderDashboard = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Receivables</CardTitle>
            <div className="p-2 bg-blue-50 rounded-full">
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${receivables.toLocaleString()}</div>
            <p className="text-xs text-slate-400 mt-1">+12.5% from last month</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Overdue Amount</CardTitle>
            <div className="p-2 bg-red-50 rounded-full">
              <AlertCircle className="w-4 h-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${overdueInvoices.reduce((acc, inv) => acc + Number(inv.amount), 0).toLocaleString()}
            </div>
            <p className="text-xs text-slate-400 mt-1">{overdueInvoices.length} invoices pending</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Collection Efficiency</CardTitle>
            <div className="p-2 bg-green-50 rounded-full">
              <RefreshCcw className="w-4 h-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">94.2%</div>
            <p className="text-xs text-slate-400 mt-1">Excellent performance</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-800">Revenue Trends</CardTitle>
            <CardDescription>Monthly overview of incoming payments</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="amount" fill="#0f172a" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Overdue Table */}
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="text-slate-800">Urgent Attention</CardTitle>
            <CardDescription>Overdue invoices requiring immediate action</CardDescription>
          </CardHeader>
          <div className="px-6 pb-6">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-slate-100">
                  <TableHead className="text-xs uppercase font-semibold text-slate-400">Customer</TableHead>
                  <TableHead className="text-xs uppercase font-semibold text-slate-400 text-right">Amount</TableHead>
                  <TableHead className="text-xs uppercase font-semibold text-slate-400 text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={3} className="text-center py-8 text-slate-400">Loading...</TableCell></TableRow>
                ) : overdueInvoices.length === 0 ? (
                  <TableRow><TableCell colSpan={3} className="text-center py-8 text-slate-400">No overdue invoices found</TableCell></TableRow>
                ) : (
                  overdueInvoices.map((invoice) => (
                    <TableRow key={invoice.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <TableCell>
                        <div className="font-medium text-slate-700">{invoice.customer_name}</div>
                        <div className="text-xs text-slate-400">{invoice.external_id}</div>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-slate-700">
                        ${Number(invoice.amount).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="destructive" className="bg-red-50 text-red-600 hover:bg-red-50 border-none px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider">
                          Overdue
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderPlaceholder = (title: string, description: string) => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
          <p className="text-slate-500">{description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Search className="w-4 h-4" /> Search
          </Button>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" /> Filter
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> New {title.slice(0, -1)}
          </Button>
        </div>
      </div>
      
      <Card className="border-none shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700">No data found</h3>
          <p className="text-slate-400 max-w-xs mx-auto">
            Try adjusting your filters or adding a new {title.toLowerCase().slice(0, -1)} to get started.
          </p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 p-6 hidden lg:block">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <TrendingUp className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">PaySaathi</span>
        </div>
        
        <nav className="space-y-1">
          <Button 
            variant="ghost" 
            onClick={() => setActiveView('dashboard')}
            className={`w-full justify-start gap-3 transition-all duration-200 ${
              activeView === 'dashboard' ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => setActiveView('invoices')}
            className={`w-full justify-start gap-3 transition-all duration-200 ${
              activeView === 'invoices' ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" /> Invoices
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => setActiveView('customers')}
            className={`w-full justify-start gap-3 transition-all duration-200 ${
              activeView === 'customers' ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" /> Customers
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => setActiveView('payments')}
            className={`w-full justify-start gap-3 transition-all duration-200 ${
              activeView === 'payments' ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-4 h-4" /> Payments
          </Button>
        </nav>
      </div>

      {/* Main Content */}
      <main className="lg:pl-64">
        <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-10 px-8 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-800 capitalize">
            {activeView === 'dashboard' ? 'Financial Overview' : activeView}
          </h1>
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200" />
            <Button 
              onClick={handleSync} 
              disabled={isSyncing}
              className="gap-2"
              size="sm"
            >
              <RefreshCcw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Data'}
            </Button>
          </div>
        </header>

        <div className="p-8">
          {activeView === 'dashboard' && renderDashboard()}
          {activeView === 'invoices' && renderPlaceholder('Invoices', 'Manage and track your customer billing')}
          {activeView === 'customers' && renderPlaceholder('Customers', 'View and manage your client portfolio')}
          {activeView === 'payments' && renderPlaceholder('Payments', 'History of all incoming and outgoing transitions')}
        </div>
      </main>
    </div>
  );
}

export default App;
