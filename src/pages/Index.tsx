import { useState } from "react";
import { HeroSection } from "@/components/HeroSection";
import { URLAnalyzer } from "@/components/URLAnalyzer";
import { ScreenshotAnalyzer } from "@/components/ScreenshotAnalyzer";
import { AnalysisResults } from "@/components/AnalysisResults";
import { AuthModal } from "@/components/AuthModal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";
import { User, LogOut, FolderOpen } from "lucide-react";
import { analysisService } from "@/services/analysisService";

type AnalysisType = 'url' | 'screenshot';

const Index = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Check if user is authenticated before analysis
  const performAnalysis = async (type: AnalysisType, data: string | File) => {
    if (!user) {
      setShowAuthModal(true);
      toast.error("Inicia sesión para guardar tus análisis");
      return;
    }

    setIsLoading(true);
    
    try {
      toast.success("Iniciando análisis con IA...");
      
      // Create analysis record
      const analysisData = {
        type: type,
        source_url: type === 'url' ? data as string : undefined,
        metadata: { 
          started_at: new Date().toISOString(),
          type: type
        }
      };

      const analysis = await analysisService.createAnalysis(analysisData);
      
      // Process based on type
      if (type === 'screenshot') {
        await analysisService.processScreenshot(analysis.id, data as File);
      } else {
        await analysisService.processUrl(analysis.id, data as string);
      }

      // Poll for completion
      let completed = false;
      let attempts = 0;
      const maxAttempts = 60; // 5 minutes max

      toast.success("Procesando con OpenAI y Firecrawl...");

      while (!completed && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
        
        const currentAnalysis = await analysisService.getAnalysis(analysis.id);
        
        if (currentAnalysis.status === 'completed') {
          completed = true;
          
          // Get full results
          const fullResults = await analysisService.getAnalysisWithResults(analysis.id);
          
          // Transform to expected format
          const transformedResults = {
            components: fullResults.components.map(comp => ({
              name: comp.name,
              type: comp.type,
              description: comp.description,
              code: comp.html_code
            })),
            styles: {
              colors: fullResults.designSystem?.colors?.map((c: any) => ({ name: c.name, value: c.value })) || [],
              fonts: fullResults.designSystem?.fonts?.map((f: any) => ({ name: f.family, family: f.family, size: f.sizes?.[0] || '16px' })) || [],
              spacing: fullResults.designSystem?.spacing?.map((s: any) => ({ name: s.name, value: s.value })) || []
            },
            layout: {
              structure: "Estructura detectada automáticamente",
              grid: "Sistema de grid identificado",
              responsive: "Diseño responsive detectado"
            },
            fullCode: {
              html: fullResults.generatedCode.find((c: any) => c.format === 'html')?.code || '',
              css: fullResults.generatedCode.find((c: any) => c.format === 'css')?.code || '',
              react: fullResults.generatedCode.find((c: any) => c.format === 'react')?.code || '',
              tailwind: fullResults.generatedCode.find((c: any) => c.format === 'tailwind')?.code || ''
            }
          };

          setResults(transformedResults);
          toast.success("¡Análisis completado exitosamente!");
          
          // Scroll to results
          setTimeout(() => {
            document.getElementById('results')?.scrollIntoView({ 
              behavior: 'smooth',
              block: 'start'
            });
          }, 500);
          
        } else if (currentAnalysis.status === 'failed') {
          throw new Error('El análisis falló');
        }
        
        attempts++;
      }

      if (!completed) {
        throw new Error('El análisis tomó demasiado tiempo');
      }
      
    } catch (error) {
      toast.error("Error durante el análisis. Por favor intenta de nuevo.");
      console.error('Analysis error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Sesión cerrada correctamente");
    } catch (error) {
      toast.error("Error al cerrar sesión");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-primary/20 rounded-full mx-auto mb-4 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary-glow border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Auth/User Section */}
      <div className="fixed top-4 right-4 z-50">
        {user ? (
          <div className="flex items-center gap-2 bg-card/90 backdrop-blur-sm rounded-lg px-4 py-2 border">
            <User className="w-4 h-4 text-primary" />
            <span className="text-sm text-foreground">{user.email}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="ml-2 h-auto p-1"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => setShowAuthModal(true)}
            className="bg-primary/90 backdrop-blur-sm hover:bg-primary"
          >
            <User className="w-4 h-4 mr-2" />
            Iniciar Sesión
          </Button>
        )}
      </div>

      <HeroSection />
      
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Comienza tu Análisis
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Elige el método de análisis que prefieras. Puedes analizar cualquier página web mediante su URL 
              o subir un screenshot de la interfaz que quieras replicar.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <URLAnalyzer onAnalysisStart={performAnalysis} isLoading={isLoading} />
            
            <div className="flex flex-col">
              <ScreenshotAnalyzer onAnalysisStart={performAnalysis} isLoading={isLoading} />
            </div>
          </div>

          {(isLoading || results) && (
            <>
              <Separator className="my-12 bg-primary/20" />
              
              <div id="results" className="scroll-mt-8">
                {isLoading && (
                  <Card className="p-8 bg-card-gradient border-primary/20 text-center">
                    <div className="animate-pulse">
                      <div className="w-16 h-16 bg-primary/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-primary-glow border-t-transparent rounded-full animate-spin" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        Analizando con IA...
                      </h3>
                      <p className="text-muted-foreground">
                        Estamos procesando la interfaz y extrayendo todos los componentes y estilos
                      </p>
                    </div>
                  </Card>
                )}
                
                {results && !isLoading && (
                  <AnalysisResults results={results} />
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
};

export default Index;
