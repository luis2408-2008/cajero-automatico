import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { X, AlertTriangle } from "lucide-react";

interface WheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function WheelModal({ isOpen, onClose, onSuccess }: WheelModalProps) {
  const { toast } = useToast();
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<any>(null);

  const wheelMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/games/wheel", {});
      return response.json();
    },
    onSuccess: (data) => {
      setResult(data);
      setIsSpinning(false);
      onSuccess();
      
      toast({
        title: data.result > 0 ? "¡Felicidades!" : data.result < 0 ? "¡Mala suerte!" : "¡Inténtalo otra vez!",
        description: data.message,
        variant: data.result >= 0 ? "default" : "destructive",
      });
    },
    onError: (error: Error) => {
      setIsSpinning(false);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const spinWheel = () => {
    setResult(null);
    setIsSpinning(true);
    wheelMutation.mutate();
  };

  const handleClose = () => {
    setResult(null);
    setIsSpinning(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Rueda de la Suerte</DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="text-center space-y-6">
          {/* Wheel Display */}
          <div className="relative mx-auto">
            <div 
              className={`w-64 h-64 rounded-full border-8 border-gray-300 relative overflow-hidden mx-auto ${
                isSpinning ? "wheel-spin" : ""
              }`}
              style={{
                background: "conic-gradient(from 0deg, #ef4444 0deg 60deg, #22c55e 60deg 120deg, #3b82f6 120deg 180deg, #f59e0b 180deg 240deg, #8b5cf6 240deg 300deg, #ec4899 300deg 360deg)"
              }}
            >
              {/* Wheel pointer */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 z-10">
                <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-gray-800"></div>
              </div>
              
              {/* Center circle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center">
                  <span className="text-2xl">🎰</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-700">
                Costo: $10 por giro
              </AlertDescription>
            </Alert>

            <Button
              onClick={spinWheel}
              disabled={isSpinning || wheelMutation.isPending}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
            >
              {isSpinning ? "🎯 Girando..." : "🎯 ¡Girar la Rueda! ($10)"}
            </Button>

            {result && (
              <div className={`mt-4 p-4 rounded-lg ${
                result.result > 0 
                  ? "bg-green-50 border border-green-200" 
                  : result.result < 0 
                    ? "bg-red-50 border border-red-200"
                    : "bg-gray-50 border border-gray-200"
              }`}>
                <p className={`font-semibold text-lg ${
                  result.result > 0 
                    ? "text-green-600" 
                    : result.result < 0 
                      ? "text-red-600"
                      : "text-gray-600"
                }`}>
                  {result.message}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Nuevo saldo: {new Intl.NumberFormat("es-ES", { 
                    style: "currency", 
                    currency: "USD" 
                  }).format(parseFloat(result.newBalance))}
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
