import { useState, FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService, CreateOrganizationRequest } from '../../services/adminService';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell 
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  Plus, Search, Building2, HardDrive, ClipboardList, Users, ShieldAlert, ShieldCheck, RefreshCw, Key
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form states
  const [orgName, setOrgName] = useState('');
  const [adminUser, setAdminUser] = useState('');
  const [adminPwd, setAdminPwd] = useState('');

  // 1. Fetch Platform general stats
  const { data: stats, isLoading: isStatsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminService.getPlatformStats(),
  });

  // 2. Fetch Organizations list
  const { data: organizations, isLoading: isOrgLoading, refetch: refetchOrgs } = useQuery({
    queryKey: ['admin-organizations'],
    queryFn: () => adminService.getOrganizations(),
  });

  // Mutation: Create Organization
  const createMutation = useMutation({
    mutationFn: (data: CreateOrganizationRequest) => adminService.createOrganization(data),
    onSuccess: () => {
      toast.success('Nouvelle organisation créée.');
      queryClient.invalidateQueries({ queryKey: ['admin-organizations'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setIsAddOpen(false);
      resetForm();
    },
    onError: (err: any) => toast.error(err.errorMessage || 'Erreur lors de la création.')
  });

  // Mutation: Toggle Organization active state
  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) => 
      adminService.toggleOrganizationStatus(id, { active }),
    onSuccess: (_, variables) => {
      toast.success(variables.active ? 'Organisation activée.' : 'Organisation suspendue.');
      queryClient.invalidateQueries({ queryKey: ['admin-organizations'] });
    },
    onError: (err: any) => toast.error(err.errorMessage || 'Erreur lors du changement de statut.')
  });

  const resetForm = () => {
    setOrgName('');
    setAdminUser('');
    setAdminPwd('');
  };

  const handleCreateSubmit = (e: FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      organizationName: orgName,
      adminUsername: adminUser,
      adminPassword: adminPwd
    });
  };

  const handleToggleActive = (org: any) => {
    toggleMutation.mutate({ id: org.id, active: !org.active });
  };

  const filteredOrgs = organizations?.content?.filter(org => 
    org.name.toLowerCase().includes(search.toLowerCase()) ||
    ((org as any).adminUsername || '').toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleRefresh = () => {
    refetchStats();
    refetchOrgs();
  };

  const isLoading = isStatsLoading || isOrgLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
        <p className="text-sm text-gray-500">Chargement de la console d'administration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Console Super Admin</h1>
          <p className="text-sm text-gray-500 mt-1">Supervision globale et provisioning des locataires SaaS.</p>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          <Button variant="outline" size="icon" onClick={handleRefresh} className="h-9 w-9">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={() => { resetForm(); setIsAddOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-1.5">
            <Plus className="h-4 w-4" />
            <span>Créer Tenant</span>
          </Button>
        </div>
      </div>

      {/* KPI stats bar */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border border-gray-200 dark:border-zinc-800 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Organisations</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalOrganizations}</p>
                </div>
                <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
                  <Building2 className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 dark:border-zinc-800 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Organisations Actives</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.activeOrganizations}</p>
                </div>
                <div className="p-2.5 bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 rounded-xl">
                  <Building2 className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 dark:border-zinc-800 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Tickets</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalTickets}</p>
                </div>
                <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl">
                  <ClipboardList className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 dark:border-zinc-800 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateurs Globaux</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
                </div>
                <div className="p-2.5 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-xl">
                  <Users className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bar Chart section */}
      {stats && (
        <Card className="border border-gray-200 dark:border-zinc-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Volume d'Infrastructure SaaS</CardTitle>
            <CardDescription>Visualisation comparative des ressources provisionnées à travers l'ensemble des tenances.</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: 'Org. Actives', total: stats.activeOrganizations },
                  { name: 'Tickets d\'incident', total: stats.totalTickets },
                  { name: 'Utilisateurs', total: stats.totalUsers },
                ]}
                margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} allowDecimals={false} />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Organizations management table */}
      <Card className="border border-gray-200 dark:border-zinc-800 shadow-sm">
        <CardHeader className="pb-3 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <CardTitle className="text-base font-semibold">Locataires / Organisations</CardTitle>
            <CardDescription>Liste de l'ensemble des bases d'entreprises isolées.</CardDescription>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Rechercher par nom..." 
              className="pl-9 h-8 text-xs" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!filteredOrgs || filteredOrgs.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-400">Aucun tenant configuré ou trouvé.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center font-bold">ID</TableHead>
                  <TableHead>Nom de l'organisation</TableHead>
                  <TableHead>Nom de l'admin</TableHead>
                  <TableHead>Date d'enregistrement</TableHead>
                  <TableHead>Statut d'isolation</TableHead>
                  <TableHead className="text-right pr-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrgs.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell className="text-center font-mono text-xs">{org.id}</TableCell>
                    <TableCell className="font-semibold">{org.name}</TableCell>
                    <TableCell className="font-medium text-gray-500">{(org as any).adminUsername ? `@${(org as any).adminUsername}` : '-'}</TableCell>
                    <TableCell className="text-xs text-gray-400">
                      {new Date(org.createdAt).toLocaleString([], { dateStyle: 'short' })}
                    </TableCell>
                    <TableCell>
                      {org.active ? (
                        <span className="text-green-600 dark:text-green-400 text-xs font-semibold flex items-center space-x-1.5">
                          <ShieldCheck className="h-4 w-4 shrink-0" />
                          <span>Opérationnel (Actif)</span>
                        </span>
                      ) : (
                        <span className="text-red-500 text-xs font-medium flex items-center space-x-1.5">
                          <ShieldAlert className="h-4 w-4 shrink-0" />
                          <span>Suspendu (Inactif)</span>
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button 
                        variant={org.active ? 'destructive' : 'default'} 
                        size="sm" 
                        onClick={() => handleToggleActive(org)}
                        className="h-8 text-xs font-semibold"
                      >
                        {org.active ? 'Suspendre' : 'Réactiver'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Provision New SaaS Tenant Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Provisioner un locataire SaaS</DialogTitle>
            <DialogDescription>Créez instantanément un espace isolé et provisionnez le compte administrateur initial.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="org-name-in">Nom de l'organisation</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400" />
                <Input id="org-name-in" required placeholder="ex. Université de Marrakech" className="pl-10" value={orgName} onChange={(e) => setOrgName(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="admin-name-in">Identifiant Admin Initial</Label>
              <div className="relative">
                <Users className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400" />
                <Input id="admin-name-in" required placeholder="ex. admin_univ" className="pl-10" value={adminUser} onChange={(e) => setAdminUser(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="admin-pwd-in">Mot de passe de l'admin</Label>
              <div className="relative">
                <Key className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400" />
                <Input id="admin-pwd-in" required type="password" placeholder="••••••••" className="pl-10" value={adminPwd} onChange={(e) => setAdminPwd(e.target.value)} />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={createMutation.isPending} className="bg-blue-600 hover:bg-blue-700 text-white">Provisioner Tenant</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
