import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { useThemeStore } from '../store/themeStore';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Bell, 
  Menu, 
  LogOut, 
  User as UserIcon, 
  Settings, 
  Sun, 
  Moon, 
  CheckCircle2, 
  CircleAlert,
  Signal,
  SignalHigh
} from 'lucide-react';

interface TopbarProps {
  onToggleSidebar: () => void;
  onOpenMobileSidebar: () => void;
}

export default function Topbar({ onToggleSidebar, onOpenMobileSidebar }: TopbarProps) {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const { notifications, connected, markAllAsRead, disconnectWebSocket } = useNotificationStore();
  const { theme, toggleTheme } = useThemeStore();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    disconnectWebSocket();
    clearAuth();
    navigate('/login');
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/40';
      case 'ADMIN': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/40';
      case 'TECH': return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/40';
      default: return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700';
    }
  };

  return (
    <header className="h-16 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between px-4 shrink-0 transition-colors duration-200">
      <div className="flex items-center space-x-3">
        {/* Desktop Collapse Button */}
        <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="hidden md:inline-flex">
          <Menu className="h-5 w-5 text-gray-600 dark:text-zinc-400" />
        </Button>
        {/* Mobile Open Sidebar Button */}
        <Button variant="ghost" size="icon" onClick={onOpenMobileSidebar} className="md:hidden">
          <Menu className="h-5 w-5 text-gray-600 dark:text-zinc-400" />
        </Button>
        
        {/* Dynamic platform indicators */}
        <div className="flex items-center space-x-2 text-xs font-medium text-gray-500 dark:text-zinc-400">
          <span className="hidden sm:inline">Statut WebSocket:</span>
          {connected ? (
            <span className="flex items-center space-x-1 text-green-600 dark:text-green-400">
              <SignalHigh className="h-4 w-4" />
              <span className="hidden sm:inline">Connecté</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1 text-gray-400 dark:text-zinc-500">
              <Signal className="h-4 w-4" />
              <span className="hidden sm:inline">Déconnecté</span>
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2.5">
        {/* Theme toggle button */}
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun className="h-5 w-5 text-zinc-400" /> : <Moon className="h-5 w-5 text-gray-600" />}
        </Button>

        {/* Notifications Dropdown */}
        <DropdownMenu onOpenChange={(open) => open && markAllAsRead()}>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5 text-gray-600 dark:text-zinc-400" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white font-bold text-[9px] rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </Button>
            }
          />
          <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto" align="end">
            <DropdownMenuLabel className="flex justify-between items-center">
              <span>Notifications Réseau</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-normal text-blue-600 hover:underline cursor-pointer" onClick={markAllAsRead}>
                  Marquer comme lu
                </span>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-400 dark:text-zinc-500">
                Aucune notification en temps réel.
              </div>
            ) : (
              notifications.map((notif) => (
                <DropdownMenuItem key={notif.id} className="flex flex-col items-start p-3 focus:bg-gray-50 dark:focus:bg-zinc-800/50 cursor-pointer">
                  <div className="flex items-center space-x-1.5 w-full">
                    {notif.type === 'TICKET_UPDATE' ? (
                      <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" />
                    ) : (
                      <CircleAlert className="h-4 w-4 text-amber-500 shrink-0" />
                    )}
                    <span className="font-semibold text-xs text-gray-900 dark:text-white truncate">
                      {notif.type === 'TICKET_UPDATE' ? 'Ticket mis à jour' : 'Actualisation système'}
                    </span>
                    <span className="text-[9px] text-gray-400 ml-auto shrink-0">
                      {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600 dark:text-zinc-400 mt-1 line-clamp-2 w-full leading-normal">
                    {notif.message}
                  </p>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User profile dropdown */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" className="relative h-9 rounded-full flex items-center space-x-2 px-1">
                  <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs uppercase shadow-inner">
                    {(user?.username || '').slice(0, 2)}
                  </div>
                  <div className="hidden sm:flex flex-col items-start text-left shrink-0">
                    <span className="text-xs font-semibold text-gray-800 dark:text-white truncate max-w-[120px]">
                      {user?.username || ''}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-zinc-500 capitalize leading-none mt-0.5">
                      {(user?.role || '').toLowerCase().replace('_', ' ')}
                    </span>
                  </div>
                </Button>
              }
            />
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none">{user?.username || ''}</p>
                  <p className="text-xs text-gray-400 dark:text-zinc-500 leading-none mt-1 truncate">
                    {user?.organizationName || 'Super Administrateur'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getRoleBadgeColor(user?.role || '')}`}>
                  {user?.role || ''}
                </span>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4 text-gray-400" />
                <span>Paramètres</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Se déconnecter</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
