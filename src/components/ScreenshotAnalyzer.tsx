import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Image, Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface ScreenshotAnalyzerProps {
  onAnalysisStart: (type: 'screenshot', data: File) => void;
  isLoading: boolean;
}

export const ScreenshotAnalyzer = ({ onAnalysisStart, isLoading }: ScreenshotAnalyzerProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Por favor selecciona un archivo de imagen válido");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("El archivo es demasiado grande. Máximo 10MB");
      return;
    }

    setSelectedFile(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    toast.success("Imagen cargada correctamente");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = () => {
    if (selectedFile) {
      onAnalysisStart('screenshot', selectedFile);
    }
  };

  return (
    <Card className="p-6 bg-card-gradient border-primary/20 hover:border-primary/40 transition-all duration-300">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
          <Image className="w-5 h-5 text-primary-glow" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Análisis por Screenshot</h3>
          <p className="text-sm text-muted-foreground">Sube una imagen de la interfaz a analizar</p>
        </div>
      </div>

      <div className="space-y-4">
        {!selectedFile ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-12 h-12 text-primary-glow mx-auto mb-4" />
            <p className="text-foreground font-medium mb-2">
              Arrastra tu screenshot aquí o haz clic para seleccionar
            </p>
            <p className="text-sm text-muted-foreground">
              PNG, JPG, WEBP hasta 10MB
            </p>
          </div>
        ) : (
          <div className="relative">
            <div className="relative rounded-lg overflow-hidden border border-primary/20">
              <img
                src={previewUrl!}
                alt="Preview"
                className="w-full h-48 object-cover"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleRemoveFile}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2 truncate">
              {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />

        <Button
          onClick={handleAnalyze}
          disabled={!selectedFile || isLoading}
          className="w-full bg-ai-gradient hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-primary/25"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analizando imagen...
            </>
          ) : (
            <>
              <Image className="w-4 h-4 mr-2" />
              Analizar Screenshot
            </>
          )}
        </Button>
      </div>

      <div className="mt-4 text-xs text-muted-foreground">
        <p>• Se identificarán elementos UI y componentes visuales</p>
        <p>• Se extraerán colores, tipografías y espaciados</p>
        <p>• Se generará código HTML/CSS equivalente</p>
      </div>
    </Card>
  );
};