import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { activityService } from '../../services/activityService';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell 
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { History, RefreshCw, ChevronLeft, ChevronRight, User } from 'lucide-react';

export default function ActivityPage() {
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [page, setPage] = useState<number>(0);

  // React Query: Fetch Org activity logs
  const { data: activityPage, isLoading, refetch } = useQuery({
    queryKey: ['activities', typeFilter, page],
    queryFn: () => activityService.getOrgActivity({
      type: typeFilter === 'ALL' ? undefined : typeFilter,
      page,
      size: 20
    }),
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Logs d'Audit & Activités</h1>
          <p className="text-sm text-gray-500 mt-1">Consultez l'historique complet des actions effectuées au sein de votre organisation.</p>
        </div>
        <Button variant="outline" size="icon" onClick={() => refetch()} className="h-9 w-9">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Filters bar */}
      <Card className="border border-gray-200 dark:border-zinc-800 shadow-sm">
        <CardContent className="p-4 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-xs font-semibold text-gray-500">
            <History className="h-4 w-4 text-gray-400" />
            <span>Type d'entité :</span>
            <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(0); }}>
              <SelectTrigger className="w-44 h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Toutes les activités</SelectItem>
                <SelectItem value="USER">Utilisateurs (USER)</SelectItem>
                <SelectItem value="EQUIPMENT">Équipements (EQUIPMENT)</SelectItem>
                <SelectItem value="TICKET">Tickets (TICKET)</SelectItem>
                <SelectItem value="AUTH">Authentification (AUTH)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Activities Table */}
      <Card className="border border-gray-200 dark:border-zinc-800 shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-12 text-sm text-gray-400">Chargement de l'audit trail...</div>
          ) : !activityPage || !activityPage.content || activityPage.content.length === 0 ? (
            <div className="text-center py-12 text-sm text-gray-400">Aucun log d'activité enregistré.</div>
          ) : (
            <div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 text-center">ID</TableHead>
                    <TableHead>Collaborateur</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Type d'entité</TableHead>
                    <TableHead>ID d'entité</TableHead>
                    <TableHead>Détails supplémentaires</TableHead>
                    <TableHead className="text-right pr-6">Date et Heure</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(activityPage?.content || []).map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-center font-mono text-xs">{log.id}</TableCell>
                      <TableCell className="font-semibold text-blue-600 flex items-center space-x-1.5 py-4">
                        <User className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        <span>{log.username || 'Système'}</span>
                      </TableCell>
                      <TableCell className="text-xs font-semibold">{log.action}</TableCell>
                      <TableCell>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700">
                          {log.entityType}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-gray-500">{log.entityId || '-'}</TableCell>
                      <TableCell className="text-xs text-gray-600 dark:text-zinc-400 max-w-xs truncate">{log.details || '-'}</TableCell>
                      <TableCell className="text-right pr-6 font-mono text-xs text-gray-400">
                        {new Date(log.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination controls */}
              {activityPage.totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-gray-100 dark:border-zinc-800/80">
                  <div className="text-xs text-gray-500">
                    Page {activityPage.number + 1} sur {activityPage.totalPages} ({activityPage.totalElements} événements)
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(activityPage.totalPages - 1, p + 1))} disabled={page === activityPage.totalPages - 1}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
