import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AlertCircle } from "lucide-react";

export default function Unauthorized() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  
  const handleGoBack = () => {
    navigate(-1);
  };
  
  const handleGoHome = () => {
    navigate('/dashboard');
  };
  
  const handleLogout = () => {
    logout();
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <AlertCircle className="h-16 w-16 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold text-red-600 mb-4">Accès non autorisé</h1>
        <p className="text-gray-700 mb-2">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </p>
        {user && (
          <p className="text-gray-500 mb-8">
            Connecté en tant que: <span className="font-medium">{user.name}</span> ({user.role})
          </p>
        )}
        <div className="flex flex-col space-y-3">
          <Button onClick={handleGoBack} variant="outline" className="w-full">
            Retour
          </Button>
          <Button onClick={handleGoHome} className="w-full">
            Accueil
          </Button>
          <Button onClick={handleLogout} variant="destructive" className="w-full">
            Déconnexion
          </Button>
        </div>
      </div>
    </div>
  );
} 