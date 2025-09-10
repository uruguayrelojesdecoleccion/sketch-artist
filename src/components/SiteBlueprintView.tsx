import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, ExternalLink, Globe, Palette, Component, Image, Eye, Accessibility, BarChart3 } from "lucide-react";
import { toast } from "sonner";

interface SiteBlueprintViewProps {
  siteBlueprint: {
    domain: string;
    sitemap: Array<{ url: string; title: string; type: string }>;
    pages: Array<{ url: string; title: string; description: string; components: string[] }>;
    design_tokens: {
      colors: Array<{ name: string; value: string; usage: string }>;
      fonts: Array<{ family: string; sizes: string[]; weights: string[]; source: string }>;
      spacing: Array<{ name: string; value: string }>;
      borderRadius: Array<{ name: string; value: string }>;
      shadows: Array<{ name: string; value: string }>;
      breakpoints: Array<{ name: string; value: string }>;
    };
    component_library: Array<{
      name: string;
      type: string;
      description: string;
      variants: string[];
      props: string[];
      html: string;
      css: string;
      react: string;
      tailwind: string;
    }>;
    assets: {
      images: Array<{ src: string; alt: string; type: string }>;
      fonts: Array<{ family: string; source: string }>;
      icons: Array<{ name: string; library: string }>;
    };
    seo_structure: {
      title: string;
      description: string;
      keywords: string[];
      ogTags: Array<{ property: string; content: string }>;
      structuredData: Array<{ type: string; data: any }>;
    };
    third_party_integrations: Array<{ name: string; type: string; details: string }>;
    accessibility_features: {
      hasAltTexts: boolean;
      hasAriaLabels: boolean;
      hasSkipLinks: boolean;
      colorContrast: string;
    };
    robots_txt: string;
  };
}

export const SiteBlueprintView = ({ siteBlueprint }: SiteBlueprintViewProps) => {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado al portapapeles`);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-card-gradient border-primary/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
            <Globe className="w-5 h-5 text-primary-glow" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground">Site Blueprint</h3>
            <p className="text-sm text-muted-foreground">{siteBlueprint.domain}</p>
          </div>
        </div>

        <Tabs defaultValue="pages" className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-secondary/50">
            <TabsTrigger value="pages" className="flex items-center gap-1">
              <Globe className="w-3 h-3" />
              Páginas
            </TabsTrigger>
            <TabsTrigger value="tokens" className="flex items-center gap-1">
              <Palette className="w-3 h-3" />
              Tokens
            </TabsTrigger>
            <TabsTrigger value="components" className="flex items-center gap-1">
              <Component className="w-3 h-3" />
              Componentes
            </TabsTrigger>
            <TabsTrigger value="assets" className="flex items-center gap-1">
              <Image className="w-3 h-3" />
              Assets
            </TabsTrigger>
            <TabsTrigger value="seo" className="flex items-center gap-1">
              <BarChart3 className="w-3 h-3" />
              SEO
            </TabsTrigger>
            <TabsTrigger value="accessibility" className="flex items-center gap-1">
              <Accessibility className="w-3 h-3" />
              A11y
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pages" className="space-y-4 mt-6">
            <div className="grid gap-4">
              <Card className="p-4 bg-secondary/20 border-primary/10">
                <h4 className="font-semibold text-foreground mb-3">Sitemap ({siteBlueprint.sitemap?.length || 0} URLs)</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {siteBlueprint.sitemap?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-background/50 rounded">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {item.type}
                        </Badge>
                        <span className="text-sm text-foreground">{item.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(item.url, '_blank')}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(item.url, 'URL')}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )) || <p className="text-sm text-muted-foreground">No sitemap data available</p>}
                </div>
              </Card>

              <Card className="p-4 bg-secondary/20 border-primary/10">
                <h4 className="font-semibold text-foreground mb-3">Páginas Analizadas ({siteBlueprint.pages?.length || 0})</h4>
                <div className="space-y-3">
                  {siteBlueprint.pages?.map((page, index) => (
                    <div key={index} className="p-3 bg-background/50 rounded">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-foreground">{page.title}</h5>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(page.url, '_blank')}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{page.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {page.components?.map((component, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {component}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )) || <p className="text-sm text-muted-foreground">No page data available</p>}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tokens" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="p-4 bg-secondary/20 border-primary/10">
                <h4 className="font-semibold text-foreground mb-3">Colores</h4>
                <div className="space-y-2">
                  {siteBlueprint.design_tokens?.colors?.map((color, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: color.value }}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{color.name}</p>
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
                  )) || <p className="text-sm text-muted-foreground">No color tokens found</p>}
                </div>
              </Card>

              <Card className="p-4 bg-secondary/20 border-primary/10">
                <h4 className="font-semibold text-foreground mb-3">Tipografías</h4>
                <div className="space-y-2">
                  {siteBlueprint.design_tokens?.fonts?.map((font, index) => (
                    <div key={index} className="p-2 bg-background/50 rounded">
                      <p className="text-sm font-medium">{font.family}</p>
                      <p className="text-xs text-muted-foreground">
                        Tamaños: {font.sizes?.join(', ')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Pesos: {font.weights?.join(', ')}
                      </p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {font.source}
                      </Badge>
                    </div>
                  )) || <p className="text-sm text-muted-foreground">No font tokens found</p>}
                </div>
              </Card>

              <Card className="p-4 bg-secondary/20 border-primary/10">
                <h4 className="font-semibold text-foreground mb-3">Espaciado</h4>
                <div className="space-y-2">
                  {siteBlueprint.design_tokens?.spacing?.map((spacing, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{spacing.name}</span>
                      <span className="text-xs text-muted-foreground">{spacing.value}</span>
                    </div>
                  )) || <p className="text-sm text-muted-foreground">No spacing tokens found</p>}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="components" className="space-y-4 mt-6">
            <div className="grid gap-4">
              {siteBlueprint.component_library?.map((component, index) => (
                <Card key={index} className="p-4 bg-secondary/20 border-primary/10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{component.type}</Badge>
                      <h4 className="font-semibold text-foreground">{component.name}</h4>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(component.react, 'Componente React')}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{component.description}</p>
                  {component.variants?.length > 0 && (
                    <div className="mb-3">
                      <span className="text-xs font-medium text-foreground">Variantes: </span>
                      {component.variants.map((variant, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs mr-1">
                          {variant}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="bg-background/50 rounded p-3">
                    <pre className="text-xs text-foreground overflow-x-auto">
                      <code>{component.react}</code>
                    </pre>
                  </div>
                </Card>
              )) || <p className="text-sm text-muted-foreground">No component library found</p>}
            </div>
          </TabsContent>

          <TabsContent value="assets" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4 bg-secondary/20 border-primary/10">
                <h4 className="font-semibold text-foreground mb-3">Imágenes</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {siteBlueprint.assets?.images?.map((image, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-background/50 rounded">
                      <div>
                        <p className="text-sm font-medium">{image.alt || 'Sin descripción'}</p>
                        <Badge variant="outline" className="text-xs">{image.type}</Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(image.src, '_blank')}
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                    </div>
                  )) || <p className="text-sm text-muted-foreground">No images found</p>}
                </div>
              </Card>

              <Card className="p-4 bg-secondary/20 border-primary/10">
                <h4 className="font-semibold text-foreground mb-3">Integraciones</h4>
                <div className="space-y-2">
                  {siteBlueprint.third_party_integrations?.map((integration, index) => (
                    <div key={index} className="p-2 bg-background/50 rounded">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{integration.name}</span>
                        <Badge variant="outline" className="text-xs">{integration.type}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{integration.details}</p>
                    </div>
                  )) || <p className="text-sm text-muted-foreground">No integrations found</p>}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="seo" className="space-y-4 mt-6">
            <Card className="p-4 bg-secondary/20 border-primary/10">
              <h4 className="font-semibold text-foreground mb-3">SEO Metadata</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-foreground">Título:</label>
                  <p className="text-sm text-muted-foreground">{siteBlueprint.seo_structure?.title || 'No encontrado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Descripción:</label>
                  <p className="text-sm text-muted-foreground">{siteBlueprint.seo_structure?.description || 'No encontrada'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Keywords:</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {siteBlueprint.seo_structure?.keywords?.map((keyword, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {keyword}
                      </Badge>
                    )) || <span className="text-sm text-muted-foreground">No keywords found</span>}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="accessibility" className="space-y-4 mt-6">
            <Card className="p-4 bg-secondary/20 border-primary/10">
              <h4 className="font-semibold text-foreground mb-3">Características de Accesibilidad</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Alt texts</span>
                  <Badge variant={siteBlueprint.accessibility_features?.hasAltTexts ? "default" : "destructive"}>
                    {siteBlueprint.accessibility_features?.hasAltTexts ? "Sí" : "No"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">ARIA labels</span>
                  <Badge variant={siteBlueprint.accessibility_features?.hasAriaLabels ? "default" : "destructive"}>
                    {siteBlueprint.accessibility_features?.hasAriaLabels ? "Sí" : "No"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Skip links</span>
                  <Badge variant={siteBlueprint.accessibility_features?.hasSkipLinks ? "default" : "destructive"}>
                    {siteBlueprint.accessibility_features?.hasSkipLinks ? "Sí" : "No"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Contraste</span>
                  <Badge variant={siteBlueprint.accessibility_features?.colorContrast === 'good' ? "default" : "secondary"}>
                    {siteBlueprint.accessibility_features?.colorContrast || "No evaluado"}
                  </Badge>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};