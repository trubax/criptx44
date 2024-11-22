import { useState, useEffect } from 'react';
import { Camera, Plus } from 'lucide-react';
import ServiceModal from '../profile/ServiceModal';
import { useAuth } from '../../hooks/useAuth';

interface ProfileSetupProps {
  initialData: {
    displayName: string;
    photoURL: string;
    bio: string;
  };
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack?: () => void;
  showBack?: boolean;
}

export function ProfileSetup({ initialData, onUpdate, onNext, onBack, showBack }: ProfileSetupProps) {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    displayName: initialData.displayName || currentUser?.displayName || '',
    photoURL: initialData.photoURL || '',
    bio: initialData.bio || ''
  });

  const isGoogleUser = currentUser?.providerData[0]?.providerId === 'google.com';
  const [isGooglePhoto, setIsGooglePhoto] = useState(false);

  useEffect(() => {
    if (currentUser?.photoURL?.includes('googleusercontent.com')) {
      const originalPhotoURL = currentUser.photoURL.split('=')[0];
      
      setFormData(prev => ({
        ...prev,
        photoURL: originalPhotoURL
      }));
      
      onUpdate({
        ...formData,
        photoURL: originalPhotoURL
      });
      
      setIsGooglePhoto(true);
    }
  }, [currentUser]);

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      if (file.size > 5 * 1024 * 1024) {
        alert('La foto non può superare i 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData(prev => ({
          ...prev,
          photoURL: base64String
        }));
        setIsGooglePhoto(false);
        onUpdate({
          ...formData,
          photoURL: base64String
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Errore durante il caricamento della foto:', error);
      alert('Errore durante il caricamento della foto. Riprova.');
    }
  };

  const handleSubmit = () => {
    if (!formData.displayName.trim()) {
      alert('Inserisci un nome visualizzato');
      return;
    }
    onUpdate(formData);
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold theme-text mb-2">Personalizza il tuo profilo</h2>
        <p className="theme-text-secondary">
          Personalizza come gli altri utenti ti vedranno su CriptX
        </p>
      </div>

      <div className="flex flex-col items-center space-y-6">
        <label className="relative cursor-pointer group">
          <img
            src={formData.photoURL || initialData.photoURL}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-2 theme-border"
          />
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity">
            {isGooglePhoto ? (
              <div className="text-white text-xs text-center px-2">
                <Camera className="w-6 h-6 mx-auto mb-1" />
                Sostituisci foto Google
              </div>
            ) : (
              <Camera className="w-8 h-8 text-white" />
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
        </label>

        <div className="w-full max-w-md space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium theme-text">
              Nome utente *
            </label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
              className="w-full p-3 rounded-lg theme-bg-secondary theme-text border theme-border focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Inserisci il tuo nome utente"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium theme-text">
              Biografia
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              className="w-full p-3 rounded-lg theme-bg-secondary theme-text border theme-border focus:outline-none focus:ring-2 focus:ring-accent min-h-[100px] resize-none"
              placeholder="Scrivi qualcosa su di te (opzionale)"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        {showBack && (
          <button
            onClick={onBack}
            className="px-6 py-2 rounded-lg theme-bg-secondary theme-text hover:opacity-90"
          >
            Indietro
          </button>
        )}
        <button
          onClick={handleSubmit}
          className="px-6 py-2 rounded-lg bg-accent text-white hover:opacity-90 ml-auto"
        >
          Continua
        </button>
      </div>
    </div>
  );
} 