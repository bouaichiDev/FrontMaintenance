import { useState, FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orgUserService, CreateUserRequest } from '../../services/orgUserService';
import { useAuthStore } from '../../store/authStore';
import { Card, CardContent } from '@/components/ui/card';
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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { 
  Plus, Search, Shield, UserX, UserCheck, ChevronLeft, ChevronRight, UserCog 
} from 'lucide-react';
import { toast } from 'sonner';

export default function UserPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();
  const isAdmin = currentUser?.role === 'ADMIN';

  // Filters state
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(0);

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'TECH' | 'USER'>('USER');

  // React Query: Fetch Org Users
  const { data: userPage, isLoading } = useQuery({
    queryKey: ['org-users', roleFilter, search, page],
    queryFn: () => orgUserService.getAll({
      role: roleFilter === 'ALL' ? undefined : roleFilter,
      search: search || undefined,
      page,
      size: 10
    }),
  });

  // Mutation: Create user in org
  const createMutation = useMutation({
    mutationFn: orgUserService.create,
    onSuccess: () => {
      toast.success('Collaborateur ajouté à l\'organisation.');
      queryClient.invalidateQueries({ queryKey: ['org-users'] });
      setIsAddOpen(false);
      resetForm();
    },
    onError: (err: any) => toast.error(err.errorMessage || 'Erreur lors de la création.')
  });

  // Mutation: Edit User Role
  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: number; role: 'ADMIN' | 'TECH' | 'USER' }) => 
      orgUserService.updateRole(id, { role }),
    onSuccess: () => {
      toast.success('Rôle mis à jour avec succès.');
      queryClient.invalidateQueries({ queryKey: ['org-users'] });
      setIsRoleOpen(false);
    },
    onError: (err: any) => toast.error(err.errorMessage || 'Erreur lors du changement de rôle.')
  });

  // Mutation: Activate/Deactivate User
  const statusMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) => 
      orgUserService.updateStatus(id, { active }),
    onSuccess: (_, variables) => {
      toast.success(variables.active ? 'Collaborateur réactivé.' : 'Collaborateur désactivé.');
      queryClient.invalidateQueries({ queryKey: ['org-users'] });
    },
    onError: (err: any) => toast.error(err.errorMessage || 'Erreur lors de la mise à jour.')
  });

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setRole('USER');
    setSelectedUser(null);
  };

  const handleAddSubmit = (e: FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ username, password, role });
  };

  const handleRoleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (selectedUser) {
      roleMutation.mutate({ id: selectedUser.id, role });
    }
  };

  const toggleStatus = (user: any) => {
    statusMutation.mutate({ id: user.id, active: !user.active });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Collaborateurs de l'Organisation</h1>
          <p className="text-sm text-gray-500 mt-1">Gérez l'ensemble des techniciens, administrateurs et utilisateurs de votre structure.</p>
        </div>
        {isAdmin && (
          <Button onClick={() => { resetForm(); setIsAddOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white shrink-0 flex items-center space-x-1.5">
            <Plus className="h-4 w-4" />
            <span>Ajouter un Collaborateur</span>
          </Button>
        )}
      </div>

      {/* Filters card */}
      <Card className="border border-gray-200 dark:border-zinc-800 shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400" />
            <Input 
              placeholder="Rechercher par nom d'utilisateur..." 
              className="pl-10 text-xs"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            />
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-xs font-semibold text-gray-500">Filtrer par rôle:</span>
            <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(0); }}>
              <SelectTrigger className="w-36 h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tous les rôles</SelectItem>
                <SelectItem value="ADMIN">ADMIN</SelectItem>
                <SelectItem value="TECH">TECH</SelectItem>
                <SelectItem value="USER">USER</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Collaborators Table */}
      <Card className="border border-gray-200 dark:border-zinc-800 shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-12 text-sm text-gray-400">Chargement des utilisateurs de l'organisation...</div>
          ) : !userPage || !userPage.content || userPage.content.length === 0 ? (
            <div className="text-center py-12 text-sm text-gray-400">Aucun collaborateur trouvé.</div>
          ) : (
            <div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 text-center">ID</TableHead>
                    <TableHead>Nom d'utilisateur</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Statut</TableHead>
                    {isAdmin && <TableHead className="text-right pr-6">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(userPage?.content || []).map((usr) => (
                    <TableRow key={usr.id}>
                      <TableCell className="text-center font-mono text-xs">{usr.id}</TableCell>
                      <TableCell className="font-semibold">{usr.username}</TableCell>
                      <TableCell>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded border dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700">
                          {usr.role}
                        </span>
                      </TableCell>
                      <TableCell>
                        {usr.active ? (
                          <span className="text-green-600 dark:text-green-400 font-semibold text-xs flex items-center space-x-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1" /> Actif
                          </span>
                        ) : (
                          <span className="text-gray-400 dark:text-zinc-500 font-medium text-xs flex items-center space-x-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-gray-300 mr-1" /> Suspendu
                          </span>
                        )}
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-right pr-6 space-x-1.5">
                          <Button variant="ghost" size="icon" onClick={() => { setSelectedUser(usr); setRole(usr.role); setIsRoleOpen(true); }} className="h-8 w-8 text-gray-500 hover:text-blue-600">
                            <UserCog className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => toggleStatus(usr)} className={`h-8 w-8 ${usr.active ? 'text-gray-400 hover:text-red-500' : 'text-gray-400 hover:text-green-500'}`}>
                            {usr.active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination block */}
              {userPage.totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-gray-100 dark:border-zinc-800/80">
                  <div className="text-xs text-gray-500">
                    Page {userPage.number + 1} sur {userPage.totalPages} ({userPage.totalElements} utilisateurs)
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(userPage.totalPages - 1, p + 1))} disabled={page === userPage.totalPages - 1}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Créer un collaborateur</DialogTitle>
            <DialogDescription>Ajoutez un nouveau membre au sein de votre organisation.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="add-usr">Nom d'utilisateur</Label>
              <Input id="add-usr" required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="ex. m.marrackechi" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="add-pwd">Mot de passe de départ</Label>
              <Input id="add-pwd" required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="add-role">Rôle de l'utilisateur</Label>
              <Select value={role} onValueChange={(val: any) => setRole(val)}>
                <SelectTrigger id="add-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">USER (Lecteur, déclarant d'incident)</SelectItem>
                  <SelectItem value="TECH">TECH (Technicien de maintenance)</SelectItem>
                  <SelectItem value="ADMIN">ADMIN (Gestionnaire d'organisation)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={createMutation.isPending} className="bg-blue-600 hover:bg-blue-700 text-white">Ajouter</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog open={isRoleOpen} onOpenChange={setIsRoleOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifier le rôle</DialogTitle>
            <DialogDescription>Ajustez les privilèges d'accès pour @{selectedUser?.username}.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRoleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-role">Niveau d'habilitation</Label>
              <Select value={role} onValueChange={(val: any) => setRole(val)}>
                <SelectTrigger id="edit-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">USER (Lecteur, déclarant d'incident)</SelectItem>
                  <SelectItem value="TECH">TECH (Technicien de maintenance)</SelectItem>
                  <SelectItem value="ADMIN">ADMIN (Gestionnaire d'organisation)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsRoleOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={roleMutation.isPending} className="bg-blue-600 hover:bg-blue-700 text-white">Sauvegarder</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
