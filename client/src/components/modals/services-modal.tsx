import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { X, AlertTriangle } from "lucide-react";

interface ServicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ServicesModal({ isOpen, onClose, onSuccess }: ServicesModalProps) {
  const { toast } = useToast();

  const serviceMutation = useMutation({
    mutationFn: async (data: { service: string; price: string }) => {
      const response = await apiRequest("POST", "/api/services/streaming", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Suscripción activada",
        description: `${data.service} activado por ${new Intl.NumberFormat("es-ES", { style: "currency", currency: "USD" }).format(data.amount)}`,
      });
      onSuccess();
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const services = [
    {
      id: "netflix",
      name: "Netflix",
      description: "Plan Estándar",
      price: 15.99,
      color: "bg-red-600",
      logo: "N",
    },
    {
      id: "spotify",
      name: "Spotify",
      description: "Premium Individual",
      price: 9.99,
      color: "bg-green-500",
      logo: "♪",
    },
    {
      id: "disney",
      name: "Disney+",
      description: "Plan Mensual",
      price: 7.99,
      color: "bg-blue-600",
      logo: "D+",
    },
    {
      id: "prime",
      name: "Prime Video",
      description: "Suscripción Mensual",
      price: 8.99,
      color: "bg-yellow-500",
      logo: "P",
    },
  ];

  const selectService = (service: any) => {
    if (confirm(`¿Confirma la compra de ${service.name} por $${service.price.toFixed(2)}?`)) {
      serviceMutation.mutate({
        service: service.id,
        price: service.price.toString(),
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Servicios de Streaming</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service) => (
              <Card
                key={service.id}
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => selectService(service)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-12 h-12 ${service.color} rounded-lg flex items-center justify-center mr-3`}>
                        <span className="text-white font-bold text-sm">{service.logo}</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{service.name}</h4>
                        <p className="text-sm text-gray-600">{service.description}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-gray-900">
                      ${service.price.toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-700">
              Los pagos se deducirán de su saldo disponible
            </AlertDescription>
          </Alert>
        </div>
      </DialogContent>
    </Dialog>
  );
}
