import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Upload, Camera, Save, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User as UserType } from '@/pages/Index';

interface ProfileScreenProps {
  user: UserType;
  onUpdateUser: (updatedUser: UserType) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onUpdateUser }) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || '',
    birthday: user.birthday || ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
        onUpdateUser({ ...user, avatar_url: avatarUrl });
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

  const handleSaveProfile = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Câmp obligatoriu",
        description: "Numele este obligatoriu.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('customers')
        .update({
          name: formData.name,
          birthday: formData.birthday || null
        })
        .eq('id', user.id);

      if (error) throw error;

      onUpdateUser({
        ...user,
        name: formData.name,
        birthday: formData.birthday || undefined
      });

      toast({
        title: "Profil actualizat!",
        description: "Informațiile au fost salvate cu succes.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Eroare",
        description: "Nu am putut actualiza profilul. Încearcă din nou.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 pb-20">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Profilul meu</h1>

        {/* Avatar Section */}
        <Card className="mb-6 backdrop-blur-sm bg-white/90 shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-center">Poza de profil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user.avatar_url} alt={user.name} />
                <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white text-2xl">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  variant="outline"
                  size="sm"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600 mr-2"></div>
                      Se încarcă...
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4 mr-2" />
                      Schimbă poza
                    </>
                  )}
                </Button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>

        {/* Profile Info */}
        <Card className="backdrop-blur-sm bg-white/90 shadow-lg border-0">
          <CardHeader>
            <CardTitle>Informații personale</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nume complet</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Introduceți numele complet"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user.email}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500">
                Email-ul nu poate fi modificat
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthday">Ziua de naștere</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="birthday"
                  type="date"
                  value={formData.birthday}
                  onChange={(e) => handleInputChange('birthday', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Button
              onClick={handleSaveProfile}
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Se salvează...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvează modificările
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Points Summary */}
        <Card className="mt-6 backdrop-blur-sm bg-white/90 shadow-lg border-0">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600 mb-2">
                {user.points}
              </div>
              <p className="text-sm text-gray-600">Puncte disponibile</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};