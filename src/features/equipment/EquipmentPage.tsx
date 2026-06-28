import { useState, FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { equipmentService, CreateEquipmentRequest } from '../../services/equipmentService';
import { useAuthStore } from '../../store/authStore';
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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { 
  Plus, Search, Edit2, Trash2, Filter, ChevronLeft, ChevronRight, HardDrive 
} from 'lucide-react';
import { toast } from 'sonner';

export default function EquipmentPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  // Filters state
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [roomFilter, setRoomFilter] = useState<string>('');
  const [page, setPage] = useState<number>(0);

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState<'OPERATIONAL' | 'UNDER_MAINTENANCE' | 'OUT_OF_SERVICE'>('OPERATIONAL');

  // React Query: Fetch Equipments
  const { data: equipPage, isLoading } = useQuery({
    queryKey: ['equipments', statusFilter, roomFilter, page],
    queryFn: () => equipmentService.getAll({
      status: statusFilter === 'ALL' ? undefined : statusFilter,
      room: roomFilter || undefined,
      page,
      size: 10
    }),
  });

  // Mutation: Create Equipment
  const createMutation = useMutation({
    mutationFn: equipmentService.create,
    onSuccess: () => {
      toast.success('Équipement ajouté avec succès.');
      queryClient.invalidateQueries({ queryKey: ['equipments'] });
      setIsAddOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      toast.error(err.errorMessage || 'Erreur lors de la création de l\'équipement.');
    }
  });

  // Mutation: Update Equipment
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateEquipmentRequest> }) => 
      equipmentService.update(id, data),
    onSuccess: () => {
      toast.success('Équipement modifié avec succès.');
      queryClient.invalidateQueries({ queryKey: ['equipments'] });
      setIsEditOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      toast.error(err.errorMessage || 'Erreur lors de la modification de l\'équipement.');
    }
  });

  // Mutation: Delete Equipment
  const deleteMutation = useMutation({
    mutationFn: equipmentService.delete,
    onSuccess: () => {
      toast.success('Équipement supprimé avec succès.');
      queryClient.invalidateQueries({ queryKey: ['equipments'] });
      setIsDeleteOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.errorMessage || 'Erreur lors de la suppression.');
    }
  });

  const resetForm = () => {
    setName('');
    setRoom('');
    setType('');
    setStatus('OPERATIONAL');
    setSelectedId(null);
  };

  const handleAddSubmit = (e: FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ name, room, type, status });
  };

  const handleEditOpen = (equip: any) => {
    setSelectedId(equip.id);
    setName(equip.name);
    setRoom(equip.room);
    setType(equip.type);
    setStatus(equip.status);
    setIsEditOpen(true);
  };

  const handleEditSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (selectedId) {
      updateMutation.mutate({ id: selectedId, data: { name, room, type, status } });
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedId) {
      deleteMutation.mutate(selectedId);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPERATIONAL':
        return <span className="bg-green-50 border border-green-200 text-green-700 px-2 py-0.5 rounded-full text-[10px] font-semibold dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/40">Opérationnel</span>;
      case 'UNDER_MAINTENANCE':
        return <span className="bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-semibold dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/40">En maintenance</span>;
      default:
        return <span className="bg-red-50 border border-red-200 text-red-700 px-2 py-0.5 rounded-full text-[10px] font-semibold dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/40">Hors-service</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Équipements</h1>
          <p className="text-sm text-gray-500 mt-1">Gérez le parc d'équipements de votre établissement.</p>
        </div>
        {isAdmin && (
          <Button onClick={() => { resetForm(); setIsAddOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white shrink-0 flex items-center space-x-1.5">
            <Plus className="h-4 w-4" />
            <span>Ajouter Équipement</span>
          </Button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <Card className="border border-gray-200 dark:border-zinc-800 shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400" />
            <Input 
              placeholder="Rechercher par chambre (ex. Room 102)..." 
              className="pl-10"
              value={roomFilter}
              onChange={(e) => { setRoomFilter(e.target.value); setPage(0); }}
            />
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-xs font-semibold text-gray-500">Statut:</span>
            <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(0); }}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tous les statuts</SelectItem>
                <SelectItem value="OPERATIONAL">Opérationnel</SelectItem>
                <SelectItem value="UNDER_MAINTENANCE">En maintenance</SelectItem>
                <SelectItem value="OUT_OF_SERVICE">Hors-service</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Equipment Table card */}
      <Card className="border border-gray-200 dark:border-zinc-800 shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-12 text-sm text-gray-400">Chargement du parc d'équipements...</div>
          ) : !equipPage || !equipPage.content || equipPage.content.length === 0 ? (
            <div className="text-center py-12 text-sm text-gray-400">Aucun équipement trouvé.</div>
          ) : (
            <div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 text-center">ID</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Chambre / Localisation</TableHead>
                    <TableHead>Statut</TableHead>
                    {isAdmin && <TableHead className="text-right pr-6">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(equipPage?.content || []).map((equip) => (
                    <TableRow key={equip.id}>
                      <TableCell className="text-center font-mono text-xs">{equip.id}</TableCell>
                      <TableCell className="font-semibold">{equip.name}</TableCell>
                      <TableCell className="text-xs text-gray-500 dark:text-zinc-400">{equip.type}</TableCell>
                      <TableCell className="text-sm font-medium">{equip.room}</TableCell>
                      <TableCell>{getStatusBadge(equip.status)}</TableCell>
                      {isAdmin && (
                        <TableCell className="text-right pr-6 space-x-1.5">
                          <Button variant="ghost" size="icon" onClick={() => handleEditOpen(equip)} className="h-8 w-8 text-gray-500 hover:text-blue-600">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => { setSelectedId(equip.id); setIsDeleteOpen(true); }} className="h-8 w-8 text-gray-500 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination block */}
              {equipPage.totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-gray-100 dark:border-zinc-800/80">
                  <div className="text-xs text-gray-500">
                    Page {equipPage.number + 1} sur {equipPage.totalPages} ({equipPage.totalElements} équipements)
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(equipPage.totalPages - 1, p + 1))} disabled={page === equipPage.totalPages - 1}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Equipment Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ajouter un équipement</DialogTitle>
            <DialogDescription>Enregistrez un nouvel équipement dans l'inventaire de maintenance.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="add-name">Nom de l'équipement</Label>
              <Input id="add-name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="ex. Climatiseur Samsung Split" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="add-type">Type de matériel</Label>
              <Input id="add-type" required value={type} onChange={(e) => setType(e.target.value)} placeholder="ex. HVAC, Électricité, Réseau" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="add-room">Chambre / Salle</Label>
              <Input id="add-room" required value={room} onChange={(e) => setRoom(e.target.value)} placeholder="ex. Room 104, Hall principal" />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={createMutation.isPending} className="bg-blue-600 hover:bg-blue-700 text-white">Ajouter</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Equipment Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifier l'équipement</DialogTitle>
            <DialogDescription>Ajustez les détails de cet équipement de maintenance.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name">Nom de l'équipement</Label>
              <Input id="edit-name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-type">Type de matériel</Label>
              <Input id="edit-type" required value={type} onChange={(e) => setType(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-room">Chambre / Salle</Label>
              <Input id="edit-room" required value={room} onChange={(e) => setRoom(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-status">État actuel</Label>
              <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                <SelectTrigger id="edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPERATIONAL">Opérationnel</SelectItem>
                  <SelectItem value="UNDER_MAINTENANCE">En maintenance</SelectItem>
                  <SelectItem value="OUT_OF_SERVICE">Hors-service</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={updateMutation.isPending} className="bg-blue-600 hover:bg-blue-700 text-white">Sauvegarder</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-red-600">Supprimer l'équipement ?</DialogTitle>
            <DialogDescription>Cette action est irréversible. L'équipement sera retiré de l'inventaire.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => setIsDeleteOpen(false)}>Annuler</Button>
            <Button type="button" onClick={handleDeleteConfirm} disabled={deleteMutation.isPending} className="bg-red-600 hover:bg-red-700 text-white">Supprimer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
