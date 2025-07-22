import { Brain, Eye, Code2, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-ai-analysis.jpg";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-hero-gradient">
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(263_70%_50%/0.1),transparent_70%)]" />
      
      {/* Floating elements */}
      <div className="absolute top-20 left-20 opacity-20">
        <Brain className="w-16 h-16 text-primary animate-float" />
      </div>
      <div className="absolute bottom-20 right-20 opacity-20">
        <Code2 className="w-12 h-12 text-primary-glow animate-float" style={{ animationDelay: '2s' }} />
      </div>
      <div className="absolute top-40 right-40 opacity-20">
        <Eye className="w-14 h-14 text-primary animate-float" style={{ animationDelay: '1s' }} />
      </div>
      
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <div className="animate-slide-up">
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="w-8 h-8 text-primary-glow mr-3 animate-glow" />
            <span className="text-primary-glow font-semibold text-lg">AI-Powered Design Extraction</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary-glow to-foreground bg-clip-text text-transparent leading-tight">
            Extrae Interfaces Web
            <br />
            <span className="text-primary-glow">con Inteligencia Artificial</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
            Analiza cualquier página web mediante <span className="text-primary-glow font-semibold">URL</span> o 
            <span className="text-primary-glow font-semibold"> screenshot</span>. 
            Extrae componentes, estilos y genera código reutilizable automáticamente.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-card-gradient p-6 rounded-xl border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Eye className="w-6 h-6 text-primary-glow" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">Análisis Visual</h3>
              <p className="text-muted-foreground text-sm">Identifica componentes UI, layouts y patrones de diseño</p>
            </div>
            
            <div className="bg-card-gradient p-6 rounded-xl border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Brain className="w-6 h-6 text-primary-glow" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">IA Avanzada</h3>
              <p className="text-muted-foreground text-sm">Comprende estructuras complejas y genera código optimizado</p>
            </div>
            
            <div className="bg-card-gradient p-6 rounded-xl border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Code2 className="w-6 h-6 text-primary-glow" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">Código Listo</h3>
              <p className="text-muted-foreground text-sm">Genera React, HTML/CSS y Tailwind automáticamente</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};