import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, Eye, Code2, Palette, Layout } from "lucide-react";
import { toast } from "sonner";

interface AnalysisResultsProps {
  results: {
    components: Array<{
      name: string;
      type: string;
      description: string;
      code: string;
      styles: string;
    }>;
    styles: {
      colors: Array<{ name: string; value: string }>;
      fonts: Array<{ name: string; family: string; size: string }>;
      spacing: Array<{ name: string; value: string }>;
    };
    layout: {
      structure: string;
      grid: string;
      responsive: string;
    };
    fullCode: {
      html: string;
      css: string;
      react: string;
      tailwind: string;
    };
  };
}

export const AnalysisResults = ({ results }: AnalysisResultsProps) => {
  const [activeTab, setActiveTab] = useState("components");

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado al portapapeles`);
  };

  const downloadCode = (code: string, filename: string) => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`${filename} descargado`);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <Card className="p-6 bg-card-gradient border-primary/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-primary-glow" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground">Análisis Completado</h3>
              <p className="text-sm text-muted-foreground">
                Se encontraron {results.components.length} componentes
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-primary/20 text-primary-glow border-primary/30">
            IA Análisis ✨
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-secondary/50">
            <TabsTrigger value="components" className="flex items-center gap-2">
              <Layout className="w-4 h-4" />
              Componentes
            </TabsTrigger>
            <TabsTrigger value="styles" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Estilos
            </TabsTrigger>
            <TabsTrigger value="layout" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Layout
            </TabsTrigger>
            <TabsTrigger value="code" className="flex items-center gap-2">
              <Code2 className="w-4 h-4" />
              Código
            </TabsTrigger>
          </TabsList>

          <TabsContent value="components" className="space-y-4 mt-6">
            {results.components.map((component, index) => (
              <Card key={index} className="p-4 bg-secondary/20 border-primary/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-primary-glow border-primary/30">
                      {component.type}
                    </Badge>
                    <h4 className="font-semibold text-foreground">{component.name}</h4>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(component.code, 'Código del componente')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{component.description}</p>
                <div className="bg-background/50 rounded p-3">
                  <pre className="text-xs text-foreground overflow-x-auto">
                    <code>{component.code}</code>
                  </pre>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="styles" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-4 bg-secondary/20 border-primary/10">
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-primary-glow" />
                  Colores
                </h4>
                <div className="space-y-2">
                  {results.styles.colors.map((color, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div
                        className="w-6 h-6 rounded border border-primary/20"
                        style={{ backgroundColor: color.value }}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{color.name}</p>
                        <p className="text-xs text-muted-foreground">{color.value}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(color.value, 'Color')}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4 bg-secondary/20 border-primary/10">
                <h4 className="font-semibold text-foreground mb-3">Tipografías</h4>
                <div className="space-y-2">
                  {results.styles.fonts.map((font, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">{font.name}</p>
                        <p className="text-xs text-muted-foreground">{font.family} - {font.size}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(`${font.family}`, 'Fuente')}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4 bg-secondary/20 border-primary/10">
                <h4 className="font-semibold text-foreground mb-3">Espaciados</h4>
                <div className="space-y-2">
                  {results.styles.spacing.map((spacing, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">{spacing.name}</p>
                        <p className="text-xs text-muted-foreground">{spacing.value}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(spacing.value, 'Espaciado')}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="layout" className="space-y-4 mt-6">
            <Card className="p-4 bg-secondary/20 border-primary/10">
              <h4 className="font-semibold text-foreground mb-3">Estructura de Layout</h4>
              <div className="bg-background/50 rounded p-3">
                <pre className="text-xs text-foreground overflow-x-auto">
                  <code>{results.layout.structure}</code>
                </pre>
              </div>
              <div className="flex gap-2 mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(results.layout.structure, 'Estructura')}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="code" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(results.fullCode).map(([type, code]) => (
                <Card key={type} className="p-4 bg-secondary/20 border-primary/10">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-foreground capitalize">{type}</h4>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(code, `Código ${type}`)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadCode(code, `component.${type === 'react' ? 'tsx' : type}`)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="bg-background/50 rounded p-3 max-h-60 overflow-y-auto">
                    <pre className="text-xs text-foreground">
                      <code>{code}</code>
                    </pre>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};