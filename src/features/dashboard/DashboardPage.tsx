import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { dashboardService } from '../../services/dashboardService';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  AlertCircle, CheckCircle2, ClipboardList, Clock, RefreshCw, 
  ArrowUpRight, HardDrive, ShieldCheck, ShieldAlert 
} from 'lucide-react';

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444'];
const PRIORITY_COLORS = { LOW: '#10b981', MEDIUM: '#f59e0b', HIGH: '#ef4444' };

export default function DashboardPage() {
  const { user } = useAuthStore();
  const isAdminOrTech = user?.role === 'ADMIN' || user?.role === 'TECH';

  // React Query for Org-wide statistics (ADMIN / TECH)
  const { data: orgStats, isLoading: isOrgLoading, refetch: refetchOrg } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardService.getOrgStats,
    enabled: isAdminOrTech,
  });

  // React Query for personal statistics (USER or general fallback)
  const { data: myStats, isLoading: isMyLoading, refetch: refetchMy } = useQuery({
    queryKey: ['dashboard-my'],
    queryFn: dashboardService.getMyStats,
    enabled: !!user,
  });

  const handleRefresh = () => {
    if (isAdminOrTech) refetchOrg();
    refetchMy();
  };

  const isLoading = isAdminOrTech ? isOrgLoading : isMyLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
        <p className="text-sm text-gray-500">Chargement des données en temps réel...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Tableau de Bord
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isAdminOrTech 
              ? `Aperçu global de l'infrastructure pour ${user?.organizationName}`
              : `Bienvenue, ${user?.username} - Vos demandes de maintenance`
            }
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh} className="flex items-center space-x-1.5 shrink-0">
          <RefreshCw className="h-4 w-4" />
          <span>Actualiser</span>
        </Button>
      </div>

      {/* 1. ADMIN & TECH VIEW */}
      {isAdminOrTech && orgStats && (
        <div className="space-y-6">
          {/* Key KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border border-gray-200 dark:border-zinc-800">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Équipements</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{orgStats.equipmentCount}</p>
                  </div>
                  <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
                    <HardDrive className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 dark:border-zinc-800">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tickets Ouverts</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {(orgStats.ticketCountsByStatus.OPEN || 0) + (orgStats.ticketCountsByStatus.IN_PROGRESS || 0)}
                    </p>
                  </div>
                  <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 dark:border-zinc-800">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tickets Résolus</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {(orgStats.ticketCountsByStatus.RESOLVED || 0) + (orgStats.ticketCountsByStatus.CLOSED || 0)}
                    </p>
                  </div>
                  <div className="p-2.5 bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 rounded-xl">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-red-200 dark:border-red-900/40 bg-red-50/10 dark:bg-red-950/5">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-red-600 dark:text-red-400 uppercase tracking-wider">Tickets en Retard</p>
                    <p className="text-3xl font-bold text-red-700 dark:text-red-400">{orgStats.overdueTicketsCount}</p>
                  </div>
                  <div className="p-2.5 bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl">
                    <Clock className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Graphical Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Status Breakdown Bar Chart */}
            <Card className="lg:col-span-2 border border-gray-200 dark:border-zinc-800">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Répartition des Tickets par Statut</CardTitle>
                <CardDescription>Nombre total de tickets classés par étape du cycle de vie.</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'Ouvert', count: orgStats.ticketCountsByStatus.OPEN || 0 },
                      { name: 'En cours', count: orgStats.ticketCountsByStatus.IN_PROGRESS || 0 },
                      { name: 'Résolu', count: orgStats.ticketCountsByStatus.RESOLVED || 0 },
                      { name: 'Fermé', count: orgStats.ticketCountsByStatus.CLOSED || 0 },
                    ]}
                    margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={11} stroke="#888888" />
                    <YAxis fontSize={11} stroke="#888888" allowDecimals={false} />
                    <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {['Ouvert', 'En cours', 'Résolu', 'Fermé'].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Priorities Breakdown Pie Chart */}
            <Card className="border border-gray-200 dark:border-zinc-800">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Priorité des Incidents</CardTitle>
                <CardDescription>Répartition du niveau d'urgence.</CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex flex-col justify-between">
                <div className="flex-1 min-h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Faible', value: orgStats.ticketCountsByPriority.LOW || 0, color: PRIORITY_COLORS.LOW },
                          { name: 'Moyen', value: orgStats.ticketCountsByPriority.MEDIUM || 0, color: PRIORITY_COLORS.MEDIUM },
                          { name: 'Élevé', value: orgStats.ticketCountsByPriority.HIGH || 0, color: PRIORITY_COLORS.HIGH },
                        ].filter(p => p.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        { [
                          { name: 'Faible', value: orgStats.ticketCountsByPriority.LOW || 0, color: PRIORITY_COLORS.LOW },
                          { name: 'Moyen', value: orgStats.ticketCountsByPriority.MEDIUM || 0, color: PRIORITY_COLORS.MEDIUM },
                          { name: 'Élevé', value: orgStats.ticketCountsByPriority.HIGH || 0, color: PRIORITY_COLORS.HIGH },
                        ].filter(p => p.value > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center space-x-4 text-xs font-semibold pt-2 border-t border-gray-100 dark:border-zinc-800">
                  <span className="flex items-center space-x-1"><span className="h-3.5 w-3.5 rounded bg-green-500" /> <span>Faible ({orgStats.ticketCountsByPriority.LOW || 0})</span></span>
                  <span className="flex items-center space-x-1"><span className="h-3.5 w-3.5 rounded bg-amber-500" /> <span>Moyen ({orgStats.ticketCountsByPriority.MEDIUM || 0})</span></span>
                  <span className="flex items-center space-x-1"><span className="h-3.5 w-3.5 rounded bg-red-500" /> <span>Élevé ({orgStats.ticketCountsByPriority.HIGH || 0})</span></span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Equipments with most issues */}
          <Card className="border border-gray-200 dark:border-zinc-800">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Top 5 Équipements à Fort Taux de Panne</CardTitle>
              <CardDescription>Équipements enregistrant le plus de tickets de maintenance.</CardDescription>
            </CardHeader>
            <CardContent>
              {!orgStats?.topEquipmentsWithMostTickets || orgStats.topEquipmentsWithMostTickets.length === 0 ? (
                <div className="text-center py-6 text-xs text-gray-400">Aucune panne enregistrée.</div>
              ) : (
                <div className="space-y-4">
                  {orgStats.topEquipmentsWithMostTickets.map((equip, idx) => (
                    <div key={idx} className="flex justify-between items-center border-b border-gray-50 dark:border-zinc-800/50 pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center space-x-3">
                        <span className="text-xs font-mono font-semibold text-gray-400 w-5">0{idx + 1}</span>
                        <span className="text-sm font-medium text-gray-800 dark:text-zinc-200">{equip.equipmentName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30 px-2 py-0.5 rounded font-semibold">
                          {equip.ticketCount} tickets
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* 2. STANDARD USER / REPORTER VIEW */}
      {!isAdminOrTech && myStats && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border border-gray-200 dark:border-zinc-800">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Mes Demandes Créées</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{myStats.createdTicketsCount}</p>
                  </div>
                  <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
                    <ClipboardList className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 dark:border-zinc-800">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Mes Retards</p>
                    <p className="text-3xl font-bold text-red-600 dark:text-red-400">{myStats.overdueTicketsCount}</p>
                  </div>
                  <div className="p-2.5 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl">
                    <Clock className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 dark:border-zinc-800">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Mes Assignations (Tech)</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">{myStats.assignedTicketsCount}</p>
                  </div>
                  <div className="p-2.5 bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 rounded-xl">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent User Tickets list */}
          <Card className="border border-gray-200 dark:border-zinc-800">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Mes Activités Récentes</CardTitle>
              <CardDescription>Liste de vos tickets de maintenance les plus récents.</CardDescription>
            </CardHeader>
            <CardContent>
              {!myStats?.myRecentTickets || myStats.myRecentTickets.length === 0 ? (
                <div className="text-center py-8 text-xs text-gray-400">Vous n'avez créé aucun ticket récent.</div>
              ) : (
                <div className="space-y-4">
                  {myStats.myRecentTickets.map((ticket) => (
                    <div key={ticket.id} className="flex justify-between items-center border-b border-gray-50 dark:border-zinc-800/50 pb-3 last:border-0 last:pb-0">
                      <div className="space-y-1 pr-4">
                        <div className="text-sm font-semibold text-gray-800 dark:text-zinc-200 line-clamp-1">{ticket.description}</div>
                        <div className="text-xs text-gray-400 dark:text-zinc-500 flex items-center space-x-2">
                          <span className="font-semibold uppercase text-[10px]">Équipement:</span>
                          <span className="text-gray-600 dark:text-zinc-400">{ticket.equipmentName}</span>
                          <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                          <span>Chambre {ticket.equipmentRoom}</span>
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center space-x-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border capitalize ${
                          ticket.status === 'OPEN' ? 'bg-blue-50 border-blue-200 text-blue-600' :
                          ticket.status === 'IN_PROGRESS' ? 'bg-amber-50 border-amber-200 text-amber-600' :
                          ticket.status === 'RESOLVED' ? 'bg-green-50 border-green-200 text-green-600' :
                          'bg-gray-100 border-gray-200 text-gray-600'
                        }`}>
                          {ticket.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
