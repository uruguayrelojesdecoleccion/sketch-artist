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
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock results - In real implementation, this would come from AI analysis
      const mockResults = {
        components: [
          {
            name: "Navigation Bar",
            type: "Header",
            description: "Barra de navegación principal con logo y menú",
            code: `<nav className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
  <div className="flex items-center gap-2">
    <img src="/logo.svg" alt="Logo" className="w-8 h-8" />
    <span className="font-bold text-xl">Brand</span>
  </div>
  <ul className="flex items-center gap-6">
    <li><a href="#" className="hover:text-blue-600">Inicio</a></li>
    <li><a href="#" className="hover:text-blue-600">Productos</a></li>
    <li><a href="#" className="hover:text-blue-600">Contacto</a></li>
  </ul>
</nav>`,
            styles: "height: 64px; background: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.1);"
          },
          {
            name: "Hero Section",
            type: "Section",
            description: "Sección principal con título y call-to-action",
            code: `<section className="py-20 px-6 text-center bg-gradient-to-r from-blue-50 to-indigo-50">
  <h1 className="text-5xl font-bold text-gray-900 mb-6">
    Título Principal
  </h1>
  <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
    Descripción del producto o servicio principal
  </p>
  <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700">
    Call to Action
  </button>
</section>`,
            styles: "padding: 80px 24px; background: linear-gradient(to right, #eff6ff, #eef2ff);"
          },
          {
            name: "Feature Card",
            type: "Card",
            description: "Tarjeta de característica con icono y descripción",
            code: `<div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
    <svg className="w-6 h-6 text-blue-600">...</svg>
  </div>
  <h3 className="text-lg font-semibold text-gray-900 mb-2">Título</h3>
  <p className="text-gray-600">Descripción de la característica</p>
</div>`,
            styles: "padding: 24px; background: #ffffff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);"
          }
        ],
        styles: {
          colors: [
            { name: "Primary", value: "#2563eb" },
            { name: "Secondary", value: "#64748b" },
            { name: "Background", value: "#ffffff" },
            { name: "Text Primary", value: "#111827" },
            { name: "Text Secondary", value: "#6b7280" },
            { name: "Accent", value: "#3b82f6" }
          ],
          fonts: [
            { name: "Heading", family: "Inter, sans-serif", size: "32px" },
            { name: "Body", family: "Inter, sans-serif", size: "16px" },
            { name: "Caption", family: "Inter, sans-serif", size: "14px" }
          ],
          spacing: [
            { name: "xs", value: "4px" },
            { name: "sm", value: "8px" },
            { name: "md", value: "16px" },
            { name: "lg", value: "24px" },
            { name: "xl", value: "32px" },
            { name: "2xl", value: "48px" }
          ]
        },
        layout: {
          structure: `<div className="min-h-screen">
  <header className="sticky top-0 z-50">
    <!-- Navigation -->
  </header>
  <main>
    <section className="hero">
      <!-- Hero content -->
    </section>
    <section className="features">
      <!-- Features grid -->
    </section>
  </main>
  <footer>
    <!-- Footer content -->
  </footer>
</div>`,
          grid: "CSS Grid with 3 columns on desktop, 1 on mobile",
          responsive: "Mobile-first approach with Tailwind breakpoints"
        },
        fullCode: {
          html: `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Página Analizada</title>
    <link href="https://cdn.tailwindcss.com" rel="stylesheet">
</head>
<body>
    <nav class="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
        <!-- Navigation content -->
    </nav>
    <main>
        <section class="py-20 px-6 text-center bg-gradient-to-r from-blue-50 to-indigo-50">
            <!-- Hero content -->
        </section>
    </main>
</body>
</html>`,
          css: `.navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.hero {
  padding: 80px 24px;
  text-align: center;
  background: linear-gradient(to right, #eff6ff, #eef2ff);
}

.hero h1 {
  font-size: 48px;
  font-weight: bold;
  color: #111827;
  margin-bottom: 24px;
}`,
          react: `import React from 'react';

const ExtractedComponent = () => {
  return (
    <div className="min-h-screen">
      <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="Logo" className="w-8 h-8" />
          <span className="font-bold text-xl">Brand</span>
        </div>
        <ul className="flex items-center gap-6">
          <li><a href="#" className="hover:text-blue-600">Inicio</a></li>
          <li><a href="#" className="hover:text-blue-600">Productos</a></li>
          <li><a href="#" className="hover:text-blue-600">Contacto</a></li>
        </ul>
      </nav>
      
      <main>
        <section className="py-20 px-6 text-center bg-gradient-to-r from-blue-50 to-indigo-50">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Título Principal
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Descripción del producto o servicio principal
          </p>
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700">
            Call to Action
          </button>
        </section>
      </main>
    </div>
  );
};

export default ExtractedComponent;`,
          tailwind: `// Configuración de Tailwind extraída
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        secondary: '#64748b',
        accent: '#3b82f6'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem'
      }
    }
  }
}`
        }
      };

      setResults(mockResults);
      
      // TODO: Save to database using analysisService
      console.log('Analysis completed for user:', user.email);
      
      toast.success(
        type === 'url' 
          ? "Página web analizada exitosamente" 
          : "Screenshot analizado exitosamente"
      );
      
      // Scroll to results
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 500);
      
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
