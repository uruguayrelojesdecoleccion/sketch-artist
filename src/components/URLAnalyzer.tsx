import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Link, Loader2, Globe } from "lucide-react";
import { toast } from "sonner";

interface URLAnalyzerProps {
  onAnalysisStart: (type: 'url', data: string) => void;
  isLoading: boolean;
}

export const URLAnalyzer = ({ onAnalysisStart, isLoading }: URLAnalyzerProps) => {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast.error("Por favor ingresa una URL válida");
      return;
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      toast.error("La URL no tiene un formato válido");
      return;
    }

    onAnalysisStart('url', url);
  };

  return (
    <Card className="p-6 bg-card-gradient border-primary/20 hover:border-primary/40 transition-all duration-300">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
          <Globe className="w-5 h-5 text-primary-glow" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Análisis por URL</h3>
          <p className="text-sm text-muted-foreground">Extrae la interfaz directamente desde la web</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="url"
            placeholder="https://ejemplo.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="pl-10 bg-secondary/50 border-primary/20 focus:border-primary/40 focus:ring-primary/20"
            disabled={isLoading}
          />
        </div>
        
        <Button
          type="submit"
          disabled={isLoading || !url.trim()}
          className="w-full bg-ai-gradient hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-primary/25"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analizando página...
            </>
          ) : (
            <>
              <Globe className="w-4 h-4 mr-2" />
              Analizar Página Web
            </>
          )}
        </Button>
      </form>

      <div className="mt-4 text-xs text-muted-foreground">
        <p>• Se analizará la estructura HTML y CSS de la página</p>
        <p>• Se identificarán componentes y patrones de diseño</p>
        <p>• Se generará código reutilizable automáticamente</p>
      </div>
    </Card>
  );
};