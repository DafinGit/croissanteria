import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Cookie, 
  Settings, 
  CheckCircle, 
  XCircle, 
  Shield
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface CookiePreferences {
  essential: boolean;
  functional: boolean;
}

export const CookieConsent: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always true and disabled
    functional: false
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('gdpr-cookie-consent');
    if (!consent) {
      setShowBanner(true);
    } else {
      const savedPreferences = JSON.parse(consent);
      setPreferences(savedPreferences);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      essential: true,
      functional: true
    };
    
    setPreferences(allAccepted);
    localStorage.setItem('gdpr-cookie-consent', JSON.stringify(allAccepted));
    localStorage.setItem('gdpr-consent-timestamp', new Date().toISOString());
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    const onlyEssential = {
      essential: true,
      functional: false
    };
    
    setPreferences(onlyEssential);
    localStorage.setItem('gdpr-cookie-consent', JSON.stringify(onlyEssential));
    localStorage.setItem('gdpr-consent-timestamp', new Date().toISOString());
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('gdpr-cookie-consent', JSON.stringify(preferences));
    localStorage.setItem('gdpr-consent-timestamp', new Date().toISOString());
    setShowBanner(false);
    setShowSettings(false);
  };

  const updatePreference = (key: keyof CookiePreferences, value: boolean) => {
    if (key === 'essential') return; // Essential cookies can't be disabled
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-black/10 backdrop-blur-sm">
      <Card className="max-w-4xl mx-auto shadow-2xl border-2 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Cookie className="w-6 h-6 text-primary" />
            </div>
            
            <div className="flex-1">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  🍪 Utilizăm Cookie-uri pentru o Experiență Mai Bună
                </h3>
                <p className="text-sm text-muted-foreground">
                  Aplicația noastră folosește cookie-uri pentru autentificare și funcționalitățile de bază. 
                  Cookie-urile esențiale sunt necesare pentru funcționarea aplicației.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Shield className="w-3 h-3 mr-1" />
                  Esențiale (necesare)
                </Badge>
                <Badge variant="outline">
                  <Settings className="w-3 h-3 mr-1" />
                  Funcționale
                </Badge>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={handleAcceptAll}
                  className="bg-primary hover:bg-primary/90"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Acceptă Toate
                </Button>
                
                <Button 
                  onClick={handleRejectAll}
                  variant="outline"
                  className="border-red-200 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Doar Esențiale
                </Button>

                <Dialog open={showSettings} onOpenChange={setShowSettings}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Settings className="w-4 h-4 mr-2" />
                      Personalizează
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Setări Cookie-uri
                      </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-6">
                      {/* Essential Cookies */}
                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                        <div className="flex-1">
                          <Label className="text-sm font-medium flex items-center gap-2">
                            <Shield className="w-4 h-4 text-green-600" />
                            Cookie-uri Esențiale
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Necesare pentru autentificare, securitate și funcționarea aplicației
                          </p>
                        </div>
                        <Switch 
                          checked={preferences.essential} 
                          disabled={true}
                          className="data-[state=checked]:bg-green-600"
                        />
                      </div>

                      {/* Functional Cookies */}
                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                        <div className="flex-1">
                          <Label className="text-sm font-medium flex items-center gap-2">
                            <Settings className="w-4 h-4 text-blue-600" />
                            Cookie-uri Funcționale
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Pentru preferințe locale și personalizarea interfeței
                          </p>
                        </div>
                        <Switch 
                          checked={preferences.functional}
                          onCheckedChange={(checked) => updatePreference('functional', checked)}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                      <Button onClick={handleSavePreferences}>
                        Salvează Preferințele
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};