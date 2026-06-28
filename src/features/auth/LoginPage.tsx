import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import { authService } from '../../services/authService';
import { useThemeStore } from '../../store/themeStore';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wrench, Shield, Lock, User, Eye, EyeOff, Loader2, Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { connectWebSocket } = useNotificationStore();
  const { theme, toggleTheme } = useThemeStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setLoading(true);
    setError(null);

    try {
      const response = await authService.login({ username, password });
      
      // Map Response to Profile DTO structure for the store
      const userProfile = {
        id: response.organizationId || 0, // Fallback placeholder if missing
        username: response.username,
        active: true,
        organizationId: response.organizationId,
        organizationName: response.organizationName,
        role: response.role,
      };

      setAuth(response.token, userProfile);

      // Connect to websocket if organizationId is present
      if (response.organizationId) {
        connectWebSocket(response.organizationId, response.token);
      }

      // Navigate based on role
      if (response.role === 'SUPER_ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.errorMessage || 'Identifiants invalides. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-zinc-950 p-4 transition-colors duration-200">
      <div className="absolute top-4 right-4">
        <Button variant="outline" size="icon" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
        </Button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
        id="login-container"
      >
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center text-white mb-3 shadow-md">
            <Wrench className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Maintenix</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Gestion de Maintenance Multi-Tenant & SaaS</p>
        </div>

        <Card className="border border-gray-200 dark:border-zinc-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Connexion</CardTitle>
            <CardDescription>Entrez vos identifiants pour accéder à votre espace.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-xs bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-lg">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="username">Nom d'utilisateur</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400" />
                  <Input 
                    id="username"
                    placeholder="ex. admin, tech, superadmin" 
                    className="pl-10"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mot de passe</Label>
                  <span className="text-xs text-blue-600 hover:underline cursor-pointer">Mot de passe oublié ?</span>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400" />
                  <Input 
                    id="password"
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="••••••••" 
                    className="pl-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  'Se connecter'
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2 text-center text-xs text-gray-500 dark:text-zinc-400 pt-0">
            <div>
              Vous n'avez pas de compte ?{' '}
              <Link to="/register" className="text-blue-600 hover:underline font-medium">
                Enregistrer une organisation
              </Link>
            </div>
            <div className="flex items-center justify-center space-x-1.5 pt-2 border-t border-gray-100 dark:border-zinc-800 w-full text-[10px]">
              <Shield className="h-3 w-3 text-gray-400" />
              <span>Données cryptées via protocole JWT</span>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
