import { useState, FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketService, CreateTicketRequest } from '../../services/ticketService';
import { equipmentService } from '../../services/equipmentService';
import { useAuthStore } from '../../store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Plus, Search, Filter, ChevronLeft, ChevronRight, AlertCircle, Clock, CheckCircle, HelpCircle, Eye 
} from 'lucide-react';
import { toast } from 'sonner';
import TicketDetailDialog from './TicketDetailDialog';

export default function TicketPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(0);

  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [detailTicketId, setDetailTicketId] = useState<number | null>(null);

  // Form States for ticket creation
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('LOW');
  const [equipId, setEquipId] = useState<string>('');
  const [dueDate, setDueDate] = useState('');

  // 1. Fetch tickets list
  const { data: ticketPage, isLoading } = useQuery({
    queryKey: ['tickets', statusFilter, priorityFilter, search, page],
    queryFn: () => ticketService.getAll({
      status: statusFilter === 'ALL' ? undefined : statusFilter,
      priority: priorityFilter === 'ALL' ? undefined : priorityFilter,
      search: search || undefined,
      page,
      size: 10
    }),
  });

  // 2. Fetch list of equipments for creation selection
  const { data: equipments } = useQuery({
    queryKey: ['available-equipments'],
    queryFn: () => equipmentService.getAll({ size: 100 }),
    enabled: isAddOpen,
  });

  // Mutation: Create ticket
  const createMutation = useMutation({
    mutationFn: ticketService.create,
    onSuccess: () => {
      toast.success('Ticket de maintenance ouvert avec succès.');
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      setIsAddOpen(false);
      resetForm();
    },
    onError: (err: any) => toast.error(err.errorMessage || 'Erreur de création.')
  });

  const resetForm = () => {
    setDescription('');
    setPriority('LOW');
    setEquipId('');
    setDueDate('');
  };

  const handleAddSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!description || !equipId) return;
    createMutation.mutate({
      description,
      priority,
      equipmentId: Number(equipId),
      dueDate: dueDate || undefined
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN': return <AlertCircle className="h-4 w-4 text-blue-500 shrink-0" />;
      case 'IN_PROGRESS': return <Clock className="h-4 w-4 text-amber-500 shrink-0" />;
      case 'RESOLVED': return <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />;
      default: return <HelpCircle className="h-4 w-4 text-gray-400 shrink-0" />;
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'HIGH': return <span className="text-red-600 bg-red-50 dark:bg-red-950/20 px-1.5 py-0.5 rounded text-[9px] font-bold border border-red-200 dark:border-red-900/30">Haut</span>;
      case 'MEDIUM': return <span className="text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-1.5 py-0.5 rounded text-[9px] font-bold border border-amber-200 dark:border-amber-900/30">Moyen</span>;
      default: return <span className="text-green-600 bg-green-50 dark:bg-green-950/20 px-1.5 py-0.5 rounded text-[9px] font-bold border border-green-200 dark:border-green-900/30">Faible</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Tickets de Maintenance</h1>
          <p className="text-sm text-gray-500 mt-1">Gérez le cycle de vie de vos incidents et interventions techniques.</p>
        </div>
        <Button onClick={() => { resetForm(); setIsAddOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white shrink-0 flex items-center space-x-1.5">
          <Plus className="h-4 w-4" />
          <span>Déclarer un Incident</span>
        </Button>
      </div>

      {/* Filters and search panel */}
      <Card className="border border-gray-200 dark:border-zinc-800 shadow-sm">
        <CardContent className="p-4 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400" />
            <Input 
              placeholder="Rechercher par description, technicien, équipement..." 
              className="pl-10 text-xs"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-3 items-center">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-semibold text-gray-500">Statut:</span>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
                <SelectTrigger className="w-32 h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tous</SelectItem>
                  <SelectItem value="OPEN">Ouvert</SelectItem>
                  <SelectItem value="IN_PROGRESS">En cours</SelectItem>
                  <SelectItem value="RESOLVED">Résolu</SelectItem>
                  <SelectItem value="CLOSED">Fermé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-semibold text-gray-500">Priorité:</span>
              <Select value={priorityFilter} onValueChange={(v) => { setPriorityFilter(v); setPage(0); }}>
                <SelectTrigger className="w-32 h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Toutes</SelectItem>
                  <SelectItem value="LOW">Faible</SelectItem>
                  <SelectItem value="MEDIUM">Moyen</SelectItem>
                  <SelectItem value="HIGH">Élevée</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ticket Table */}
      <Card className="border border-gray-200 dark:border-zinc-800 shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-12 text-sm text-gray-400">Chargement des tickets...</div>
          ) : !ticketPage || !ticketPage.content || ticketPage.content.length === 0 ? (
            <div className="text-center py-12 text-sm text-gray-400">Aucun incident de maintenance enregistré.</div>
          ) : (
            <div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 text-center">ID</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Équipement</TableHead>
                    <TableHead>Priorité</TableHead>
                    <TableHead>Assignation</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right pr-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(ticketPage?.content || []).map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="text-center font-mono text-xs">{ticket.id}</TableCell>
                      <TableCell className="font-semibold max-w-xs truncate">{ticket.description}</TableCell>
                      <TableCell className="text-xs">{ticket.equipmentName} <span className="text-gray-400 block sm:inlinesm:ml-1 font-mono text-[10px]">Ch.{ticket.equipmentRoom}</span></TableCell>
                      <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                      <TableCell className="text-xs font-semibold text-gray-600 dark:text-zinc-300">
                        {ticket.technicianUsername ? `@${ticket.technicianUsername}` : <span className="text-gray-400 italic font-normal">Non assigné</span>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1.5 text-xs font-semibold">
                          {getStatusIcon(ticket.status)}
                          <span className="capitalize text-gray-700 dark:text-zinc-200">{ticket.status.toLowerCase()}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button variant="outline" size="sm" onClick={() => setDetailTicketId(ticket.id)} className="h-8 text-xs font-semibold">
                          <Eye className="mr-1 h-3.5 w-3.5" /> Voir
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination controls */}
              {ticketPage.totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-gray-100 dark:border-zinc-800/80">
                  <div className="text-xs text-gray-500">
                    Page {ticketPage.number + 1} sur {ticketPage.totalPages} ({ticketPage.totalElements} incidents)
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(ticketPage.totalPages - 1, p + 1))} disabled={page === ticketPage.totalPages - 1}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ticket details dialog modal */}
      <TicketDetailDialog ticketId={detailTicketId} open={detailTicketId !== null} onOpenChange={(open) => !open && setDetailTicketId(null)} />

      {/* Declare Incident dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Déclarer un Incident</DialogTitle>
            <DialogDescription>Ouvrez un nouveau ticket de panne ou anomalie sur un équipement.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="add-desc">Description de la Panne</Label>
              <Textarea id="add-desc" required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Décrivez l'anomalie de manière précise (ex. Fuite d'eau, bruit anormal, écran noir...)" rows={3} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="add-equip">Équipement Affecté</Label>
              <Select value={equipId} onValueChange={setEquipId}>
                <SelectTrigger id="add-equip">
                  <SelectValue placeholder="Sélectionner l'équipement concerné" />
                </SelectTrigger>
                <SelectContent>
                  {(equipments?.content || []).map((equip) => (
                    <SelectItem key={equip.id} value={String(equip.id)}>{equip.name} (Chambre {equip.room})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="add-priority">Niveau de Priorité</Label>
                <Select value={priority} onValueChange={(val: any) => setPriority(val)}>
                  <SelectTrigger id="add-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Faible</SelectItem>
                    <SelectItem value="MEDIUM">Moyen</SelectItem>
                    <SelectItem value="HIGH">Élevée</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="add-duedate">Date Limite Souhaitée</Label>
                <Input id="add-duedate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={createMutation.isPending} className="bg-blue-600 hover:bg-blue-700 text-white">Déclarer l'incident</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
