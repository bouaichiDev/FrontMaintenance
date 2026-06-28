import { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { motion } from 'motion/react';

export default function DashboardLayout() {
  const { user, token } = useAuthStore();
  const { connectWebSocket, disconnectWebSocket } = useNotificationStore();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Auto-connect socket on layout load if possible
  useEffect(() => {
    if (user?.organizationId && token) {
      connectWebSocket(user.organizationId, token);
    }
    return () => {
      // Keep socket open unless user logs out explicitly to preserve real-time state
    };
  }, [user, token, connectWebSocket]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 transition-colors duration-200">
      
      {/* 1. Desktop Sidebar */}
      <div className="hidden md:block shrink-0">
        <Sidebar collapsed={sidebarCollapsed} />
      </div>

      {/* 2. Mobile Sidebar via shadcn Drawer/Sheet */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64 border-r border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <SheetTitle className="sr-only">Menu de Navigation</SheetTitle>
          <Sidebar collapsed={false} onCloseMobile={() => setMobileSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* 3. Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Control Bar */}
        <Topbar 
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        />

        {/* Inner dynamic view portal */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 dark:bg-zinc-950 transition-colors duration-200">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-7xl mx-auto h-full"
            id="page-content-wrapper"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
