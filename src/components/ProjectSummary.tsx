import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Users, Shield, Cloud, Code, Palette } from "lucide-react";

export const ProjectSummary = () => {
  const features = [
    {
      icon: Database,
      title: "Base de Datos Completa",
      description: "9 tablas con RLS policies para proyectos, análisis, componentes y más",
      status: "Implementado"
    },
    {
      icon: Users,
      title: "Autenticación",
      description: "Sistema completo de login/registro con Supabase Auth",
      status: "Implementado"
    },
    {
      icon: Shield,
      title: "Seguridad RLS",
      description: "Row Level Security para proteger datos por usuario",
      status: "Implementado"
    },
    {
      icon: Cloud,
      title: "Storage de Imágenes",
      description: "Bucket para screenshots con políticas de acceso",
      status: "Implementado"
    },
    {
      icon: Code,
      title: "Servicios de API",
      description: "Servicios TypeScript para proyectos, análisis y storage",
      status: "Preparado"
    },
    {
      icon: Palette,
      title: "UI Integrada",
      description: "Interfaz conectada con autenticación y base de datos",
      status: "Implementado"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
      {features.map((feature, index) => (
        <Card key={index} className="bg-card-gradient border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <feature.icon className="w-5 h-5 text-primary-glow" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-sm">{feature.title}</CardTitle>
                <Badge 
                  variant={feature.status === "Implementado" ? "default" : "secondary"}
                  className="mt-1 text-xs"
                >
                  {feature.status}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <CardDescription className="text-xs">
              {feature.description}
            </CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};