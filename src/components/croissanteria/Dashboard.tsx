
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, LogOut, Star, Award, RotateCcw, Shield, Camera } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User as UserType } from '@/pages/Index';
import QRCode from 'qrcode';

interface DashboardProps {
  user: UserType;
  onLogout: () => void;
  onUpdateUser?: (updatedUser: UserType) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, onUpdateUser }) => {
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [qrToken, setQrToken] = useState<string>('');
  const [qrExpiry, setQrExpiry] = useState<Date>(new Date());
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const generateQRToken = () => {
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).substring(2, 15);
    const token = `${user.id}:${timestamp}:${randomPart}`;
    setQrToken(token);
    setQrExpiry(new Date(timestamp + 5 * 60 * 1000)); // Expires in 5 minutes
    return token;
  };

  const generateQRCode = (token: string) => {
    if (qrCanvasRef.current) {
      const qrData = JSON.stringify({
        customer_id: user.id,
        token: token,
        timestamp: Date.now(),
        name: user.name
      });
      
      QRCode.toCanvas(qrCanvasRef.current, qrData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#92400e',
          light: '#ffffff'
        }
      });
    }
  };

  useEffect(() => {
    const token = generateQRToken();
    generateQRCode(token);
  }, [user.id]);

  // Auto-refresh QR code every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      const token = generateQRToken();
      generateQRCode(token);
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [user.id]);

  // Update countdown every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleRefreshQR = () => {
    const token = generateQRToken();
    generateQRCode(token);
  };

  const isQRExpired = () => {
    return new Date() > qrExpiry;
  };

  const getTimeUntilExpiry = () => {
    const now = currentTime.getTime();
    const expiry = qrExpiry.getTime();
    const diff = Math.max(0, expiry - now);
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bună dimineața';
    if (hour < 17) return 'Bună ziua';
    return 'Bună seara';
  };

  const getPointsLevel = (points: number) => {
    if (points >= 1000) return { level: 'Gold', color: 'from-yellow-400 to-yellow-600', icon: Award };
    if (points >= 500) return { level: 'Silver', color: 'from-gray-400 to-gray-600', icon: Star };
    return { level: 'Bronze', color: 'from-amber-600 to-amber-800', icon: User };
  };

  const pointsLevel = getPointsLevel(user.points);
  const IconComponent = pointsLevel.icon;

  const uploadAvatar = async (file: File) => {
    if (!file) return null;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast({
        title: "Eroare la încărcarea imaginii",
        description: "Nu am putut încărca imaginea. Încearcă din nou.",
        variant: "destructive"
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Fișier invalid",
        description: "Vă rugăm să selectați o imagine (PNG, JPG, GIF).",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Fișier prea mare",
        description: "Imaginea trebuie să aibă maximum 5MB.",
        variant: "destructive"
      });
      return;
    }

    const avatarUrl = await uploadAvatar(file);
    if (avatarUrl) {
      // Update user profile with new avatar
      const { error } = await supabase
        .from('customers')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating avatar:', error);
        toast({
          title: "Eroare",
          description: "Nu am putut actualiza profilul. Încearcă din nou.",
          variant: "destructive"
        });
      } else {
        if (onUpdateUser) {
          onUpdateUser({ ...user, avatar_url: avatarUrl });
        }
        toast({
          title: "Avatar actualizat!",
          description: "Poza de profil a fost actualizată cu succes.",
        });
      }
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen p-4 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="w-12 h-12 cursor-pointer hover:opacity-80 transition-opacity">
              <AvatarImage src={user.avatar_url} alt={user.name} />
              <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white font-semibold">
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              variant="ghost"
              size="sm"
              className="absolute -bottom-1 -right-1 h-6 w-6 p-0 bg-white rounded-full shadow-md hover:bg-gray-50 border"
            >
              {uploading ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-amber-600"></div>
              ) : (
                <Camera className="w-3 h-3 text-gray-600" />
              )}
            </Button>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {getGreeting()}, {user.name}!
            </h1>
            <p className="text-gray-600">Bun venit la Croissanteria</p>
          </div>
        </div>
        <Button
          onClick={onLogout}
          variant="ghost"
          size="sm"
          className="text-gray-600 hover:text-gray-800"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarUpload}
        className="hidden"
      />

      {/* Loyalty Card */}
      <Card className="mb-6 backdrop-blur-sm bg-gradient-to-br from-white/90 to-white/70 shadow-xl border-0 overflow-hidden">
        <CardContent className="p-6">
          <div className="text-center">
            {/* Points Display */}
            <div className="mb-6">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${pointsLevel.color} text-white text-sm font-semibold mb-3`}>
                <IconComponent className="w-4 h-4" />
                {pointsLevel.level} Member
              </div>
              <div className="text-6xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
                {user.points}
              </div>
              <p className="text-lg text-gray-600 font-medium">Puncte disponibile</p>
            </div>

            {/* QR Code with Security Features */}
            <div className="bg-white p-4 rounded-xl shadow-inner mb-4 inline-block relative">
              <canvas ref={qrCanvasRef} className="block" />
              {isQRExpired() && (
                <div className="absolute inset-0 bg-red-500/80 rounded-xl flex items-center justify-center">
                  <div className="text-white text-center">
                    <Shield className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm font-semibold">Expirat</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="text-sm text-gray-600">
                <Shield className="w-4 h-4 inline mr-1" />
                Cod securizat • Expiră în: {getTimeUntilExpiry()}
              </div>
              <Button
                onClick={handleRefreshQR}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
            
            {/* QR Data for Testing */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-2">Date QR pentru testare:</p>
              <div className="bg-white p-2 rounded border text-xs font-mono break-all">
                {JSON.stringify({
                  customer_id: user.id,
                  token: qrToken,
                  timestamp: Date.now(),
                  name: user.name
                })}
              </div>
              <Button
                onClick={() => {
                  const qrData = JSON.stringify({
                    customer_id: user.id,
                    token: qrToken,
                    timestamp: Date.now(),
                    name: user.name
                  });
                  navigator.clipboard.writeText(qrData);
                }}
                variant="outline"
                size="sm"
                className="w-full mt-2 text-xs"
              >
                Copiază datele QR
              </Button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Arătați acest cod QR pentru a câștiga și folosi puncte
            </p>

            {/* Progress to next level */}
            {user.points < 1000 && (
              <div className="bg-gray-100 rounded-full h-2 mb-2">
                <div 
                  className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min((user.points % 500) / 500 * 100, 100)}%` 
                  }}
                />
              </div>
            )}
            
            {user.points < 500 && (
              <p className="text-xs text-gray-500">
                {500 - user.points} puncte până la nivelul Silver
              </p>
            )}
            
            {user.points >= 500 && user.points < 1000 && (
              <p className="text-xs text-gray-500">
                {1000 - user.points} puncte până la nivelul Gold
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="backdrop-blur-sm bg-white/80 shadow-lg border-0">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-amber-600 mb-1">
              {Math.floor(user.points / 100)}
            </div>
            <p className="text-sm text-gray-600">Produse gratuite câștigate</p>
          </CardContent>
        </Card>
        
        <Card className="backdrop-blur-sm bg-white/80 shadow-lg border-0">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {user.points > 0 ? Math.floor(user.points / 25) : 0}
            </div>
            <p className="text-sm text-gray-600">Vizite luna aceasta</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
