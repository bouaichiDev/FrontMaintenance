import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  Wrench, 
  LayoutDashboard, 
  Boxes, 
  ClipboardList, 
  Users, 
  History, 
  Settings, 
  Building2, 
  FileText,
  BarChart3
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({ collapsed, onCloseMobile }: SidebarProps) {
  const { user } = useAuthStore();
  if (!user) return null;

  const role = user.role;

  // Determine navigation menu items based on role
  const getNavItems = () => {
    if (role === 'SUPER_ADMIN') {
      return [
        { path: '/admin', label: 'Plateforme', icon: BarChart3 },
        { path: '/admin/organizations', label: 'Organisations', icon: Building2 },
      ];
    }

    const items = [
      { path: '/dashboard', label: 'Vue d\'ensemble', icon: LayoutDashboard },
      { path: '/equipments', label: 'Équipements', icon: Boxes },
      { path: '/tickets', label: 'Tickets de maintenance', icon: ClipboardList },
    ];

    if (role === 'ADMIN') {
      items.push({ path: '/users', label: 'Utilisateurs', icon: Users });
    }

    if (role === 'ADMIN' || role === 'TECH') {
      items.push({ path: '/activities', label: 'Logs d\'audit', icon: History });
    }

    items.push({ path: '/settings', label: 'Paramètres', icon: Settings });

    return items;
  };

  const navItems = getNavItems();

  return (
    <aside 
      className={`h-full bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand logo header */}
      <div className="h-16 flex items-center px-4 border-b border-gray-100 dark:border-zinc-800">
        <div className="flex items-center space-x-2.5 overflow-hidden">
          <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm">
            <Wrench className="h-5 w-5" />
          </div>
          {!collapsed && (
            <span className="font-bold text-gray-900 dark:text-white truncate">Maintenix</span>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50 hover:text-gray-950 dark:hover:text-white'
                }`
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Sidebar Footer Info */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-100 dark:border-zinc-800 text-[11px] text-gray-400 dark:text-zinc-500">
          <div>Organisation:</div>
          <div className="font-semibold text-gray-700 dark:text-zinc-400 truncate">
            {user.organizationName || 'Administration Platform'}
          </div>
        </div>
      )}
    </aside>
  );
}
