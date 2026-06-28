import { FormEvent } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  User, Shield, Building2, Eye, Sun, Moon, Bell, BellOff, HelpCircle 
} from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  const handleSavePassword = (e: FormEvent) => {
    e.preventDefault();
    toast.success('Paramètres mis à jour (simulation).');
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Paramètres d'Utilisateur</h1>
        <p className="text-sm text-gray-500 mt-1">Configurez vos préférences individuelles et visualisez vos droits d'accès.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Card */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-gray-200 dark:border-zinc-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Profil Collaborateur</CardTitle>
              <CardDescription>Vos coordonnées d'identification de compte.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 font-semibold text-xs text-gray-500 dark:text-zinc-400">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 border border-gray-100 dark:border-zinc-800/80 rounded-xl space-y-1.5 bg-gray-50/50 dark:bg-zinc-900/30">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 flex items-center"><User className="h-3 w-3 mr-1" /> Nom d'utilisateur</span>
                  <span className="text-sm font-bold text-gray-800 dark:text-white">{user.username}</span>
                </div>

                <div className="p-3.5 border border-gray-100 dark:border-zinc-800/80 rounded-xl space-y-1.5 bg-gray-50/50 dark:bg-zinc-900/30">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 flex items-center"><Building2 className="h-3 w-3 mr-1" /> Organisation</span>
                  <span className="text-sm font-bold text-gray-800 dark:text-white">{user.organizationName || 'Administration Platform'}</span>
                </div>
              </div>

              <div className="p-4 border border-gray-100 dark:border-zinc-800/80 rounded-xl space-y-1.5 bg-gray-50/50 dark:bg-zinc-900/30">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 flex items-center"><Shield className="h-3 w-3 mr-1" /> Rôle de sécurité & Habilitations</span>
                <span className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider">{user.role}</span>
                <p className="text-[10px] text-gray-400 font-normal leading-normal pt-1">
                  {user.role === 'ADMIN' ? 'Habilitation Administrateur : Vous possédez le contrôle complet sur la configuration de votre parc d\'équipements et la gestion des utilisateurs de l\'organisation.' :
                   user.role === 'TECH' ? 'Habilitation Technicien : Vous pouvez actualiser les statuts des tickets et consulter l\'inventaire complet des équipements.' :
                   'Habilitation Standard : Vous êtes autorisé à déclarer de nouveaux incidents de maintenance et suivre l\'état de vos demandes.'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Simulate Password Change Form */}
          <Card className="border border-gray-200 dark:border-zinc-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Changement de Mot de passe</CardTitle>
              <CardDescription>Mettez à jour vos identifiants d'accès de manière sécurisée.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSavePassword} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="old-pwd">Mot de passe actuel</Label>
                    <Input id="old-pwd" type="password" placeholder="••••••••" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="new-pwd">Nouveau mot de passe</Label>
                    <Input id="new-pwd" type="password" placeholder="••••••••" />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Changer le mot de passe</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Global Options Card */}
        <div className="space-y-6">
          <Card className="border border-gray-200 dark:border-zinc-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Préférences de l'application</CardTitle>
              <CardDescription>Ajustez vos options visuelles et d'alertes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              
              {/* Theme Selector option */}
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-zinc-800 pb-4">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-gray-800 dark:text-zinc-200">Thème Visuel</span>
                  <p className="text-[10px] text-gray-400">Basculez entre le mode clair et sombre.</p>
                </div>
                <Button variant="outline" size="sm" onClick={toggleTheme} className="flex items-center space-x-1.5">
                  {theme === 'dark' ? (
                    <>
                      <Sun className="h-4 w-4" />
                      <span>Mode Clair</span>
                    </>
                  ) : (
                    <>
                      <Moon className="h-4 w-4" />
                      <span>Mode Sombre</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Notification toggle preferences simulation */}
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-zinc-800 pb-4">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-gray-800 dark:text-zinc-200">Alertes Sonores WebSocket</span>
                  <p className="text-[10px] text-gray-400">Jouer un bip lors d'un nouveau ticket.</p>
                </div>
                <Button variant="outline" size="sm" className="flex items-center space-x-1.5">
                  <Bell className="h-4 w-4" />
                  <span>Activer</span>
                </Button>
              </div>

              {/* Legal SaaS details */}
              <div className="p-3 bg-blue-50/30 dark:bg-blue-950/5 border border-blue-100 dark:border-blue-900/30 rounded-xl flex space-x-3 items-start">
                <HelpCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-blue-800 dark:text-blue-400">Normes SaaS Multi-Tenant</span>
                  <p className="text-[9px] text-gray-400 leading-relaxed font-semibold">
                    Vos données d'organisation sont stockées de manière strictement isolée par rapport aux autres tenances sous l'ID tenant unique de votre structure.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
