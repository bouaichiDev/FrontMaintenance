import { useState, ChangeEvent, FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketService, UpdateStatusRequest, AssignTicketRequest } from '../../services/ticketService';
import { orgUserService } from '../../services/orgUserService';
import { useAuthStore } from '../../store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { 
  Calendar, User, Clipboard, HardDrive, History, Upload, Image as ImageIcon, Loader2 
} from 'lucide-react';
import { toast } from 'sonner';

interface TicketDetailDialogProps {
  ticketId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TicketDetailDialog({ ticketId, open, onOpenChange }: TicketDetailDialogProps) {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();
  const isAdmin = currentUser?.role === 'ADMIN';
  const isTechOrAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'TECH';

  const [status, setStatus] = useState<'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'>('OPEN');
  const [resolutionComment, setResolutionComment] = useState('');
  const [techId, setTechId] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  // 1. Fetch ticket details
  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => ticketService.getById(ticketId!),
    enabled: !!ticketId && open,
  });

  // 2. Fetch ticket history logs
  const { data: logs } = useQuery({
    queryKey: ['ticket-logs', ticketId],
    queryFn: () => ticketService.getLogs(ticketId!),
    enabled: !!ticketId && open,
  });

  // 3. Fetch list of organization technicians (for assignment)
  const { data: techPage } = useQuery({
    queryKey: ['org-techs'],
    queryFn: () => orgUserService.getAll({ role: 'TECH', active: true }),
    enabled: isAdmin && open,
  });

  // Mutation: Update status
  const statusMutation = useMutation({
    mutationFn: (data: UpdateStatusRequest) => ticketService.updateStatus(ticketId!, data),
    onSuccess: () => {
      toast.success('Statut mis à jour avec succès.');
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
    onError: (err: any) => toast.error(err.errorMessage || 'Erreur lors de la mise à jour.')
  });

  // Mutation: Assign tech
  const assignMutation = useMutation({
    mutationFn: (data: AssignTicketRequest) => ticketService.assignTechnician(ticketId!, data),
    onSuccess: () => {
      toast.success('Technicien assigné avec succès.');
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
    onError: (err: any) => toast.error(err.errorMessage || 'Erreur lors de l\'assignation.')
  });

  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !ticketId) return;

    setUploading(true);
    try {
      await ticketService.uploadPhoto(ticketId, file);
      toast.success('Image importée avec succès.');
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    } catch (err: any) {
      toast.error(err.errorMessage || 'Erreur d\'importation d\'image.');
    } finally {
      setUploading(false);
    }
  };

  const handleStatusSubmit = (e: FormEvent) => {
    e.preventDefault();
    statusMutation.mutate({ status, resolutionComment: resolutionComment || undefined });
  };

  const handleAssignSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (techId) {
      assignMutation.mutate({ technicianId: Number(techId) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Détails du Ticket #{ticketId}</DialogTitle>
          <DialogDescription>Affichez l'historique et gérez les actions de maintenance.</DialogDescription>
        </DialogHeader>

        {isLoading || !ticket ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="space-y-6 pt-2">
            {/* Primary Details Card */}
            <div className="p-4 bg-gray-50 dark:bg-zinc-900/50 rounded-xl space-y-3.5 border border-gray-100 dark:border-zinc-800">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Description</span>
                <p className="text-sm font-medium leading-relaxed">{ticket.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-zinc-800 text-xs">
                <div className="space-y-1">
                  <span className="text-gray-400 font-semibold">Équipement</span>
                  <p className="font-semibold flex items-center space-x-1"><HardDrive className="h-3.5 w-3.5" /> <span>{ticket.equipmentName}</span></p>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-400 font-semibold">Chambre / Salle</span>
                  <p className="font-semibold">{ticket.equipmentRoom}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-400 font-semibold">Priorité</span>
                  <p className="font-bold uppercase text-[10px]" style={{ color: ticket.priority === 'HIGH' ? '#ef4444' : ticket.priority === 'MEDIUM' ? '#f59e0b' : '#10b981' }}>{ticket.priority}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-400 font-semibold">Statut</span>
                  <p className="font-semibold">{ticket.status}</p>
                </div>
              </div>
            </div>

            {/* Photo Attachment block */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block">Pièce Jointe</span>
              {ticket.photoUrl ? (
                <div className="relative group overflow-hidden rounded-xl border border-gray-200 dark:border-zinc-800 max-h-48 flex justify-center bg-zinc-100 dark:bg-zinc-900">
                  <img src={ticket.photoUrl} alt="Panne" className="object-contain h-full w-full" referrerPolicy="no-referrer" />
                </div>
              ) : (
                <div className="border border-dashed border-gray-200 dark:border-zinc-800 p-4 rounded-xl flex flex-col items-center justify-center space-y-2 bg-gray-50/50 dark:bg-zinc-900/30">
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                  <span className="text-xs text-gray-400">Aucun visuel de panne importé.</span>
                  <Label htmlFor="photo-upload" className="cursor-pointer">
                    <div className="flex items-center space-x-1.5 text-xs text-blue-600 font-medium hover:underline">
                      <Upload className="h-4 w-4" />
                      <span>{uploading ? 'Importation...' : 'Téléverser une photo'}</span>
                    </div>
                    <input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
                  </Label>
                </div>
              )}
            </div>

            {/* Admin Assign Technician Section */}
            {isAdmin && techPage && (
              <form onSubmit={handleAssignSubmit} className="pt-4 border-t border-gray-100 dark:border-zinc-800 space-y-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block">Assignation du Technicien</span>
                <div className="flex items-end gap-3">
                  <div className="flex-1 space-y-1.5">
                    <Select value={techId} onValueChange={setTechId}>
                      <SelectTrigger className="text-xs h-9">
                        <SelectValue placeholder="Sélectionner un technicien" />
                      </SelectTrigger>
                      <SelectContent>
                        {(techPage?.content || []).map((tech) => (
                          <SelectItem key={tech.id} value={String(tech.id)}>{tech.username}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" disabled={assignMutation.isPending} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white h-9">Assigner</Button>
                </div>
              </form>
            )}

            {/* Tech / Admin status updates */}
            {isTechOrAdmin && (
              <form onSubmit={handleStatusSubmit} className="pt-4 border-t border-gray-100 dark:border-zinc-800 space-y-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block">Mise à Jour de l'État</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="status-select" className="text-[11px] text-gray-400">Nouveau Statut</Label>
                    <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                      <SelectTrigger id="status-select" className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OPEN">Ouvert</SelectItem>
                        <SelectItem value="IN_PROGRESS">En cours</SelectItem>
                        <SelectItem value="RESOLVED">Résolu</SelectItem>
                        <SelectItem value="CLOSED">Fermé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="comment-input" className="text-[11px] text-gray-400">Commentaire de résolution</Label>
                    <Input id="comment-input" className="h-9" placeholder="Commentaire..." value={resolutionComment} onChange={(e) => setResolutionComment(e.target.value)} />
                  </div>
                </div>
                <Button type="submit" disabled={statusMutation.isPending} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white w-full">Enregistrer le Statut</Button>
              </form>
            )}

            {/* Ticket Logs / Audit timeline */}
            {logs && logs.length > 0 && (
              <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 space-y-3.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block">Timeline des Actions</span>
                <div className="space-y-3 font-medium text-xs">
                  {logs.map((log) => (
                    <div key={log.id} className="flex space-x-3 items-start">
                      <div className="p-1 bg-gray-100 dark:bg-zinc-800 rounded-full shrink-0 mt-0.5">
                        <History className="h-3 w-3 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-800 dark:text-zinc-200">
                          <span className="font-semibold text-blue-600">{log.username}</span>: {log.action}
                        </p>
                        {log.oldValue && log.newValue && (
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            De <span className="line-through">{log.oldValue}</span> à <span className="font-semibold">{log.newValue}</span>
                          </p>
                        )}
                        <span className="text-[9px] text-gray-400 block mt-0.5">
                          {new Date(log.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
