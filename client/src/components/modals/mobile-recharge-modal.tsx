import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { mobileRechargeSchema } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { X } from "lucide-react";

interface MobileRechargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MobileRechargeModal({ isOpen, onClose, onSuccess }: MobileRechargeModalProps) {
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(mobileRechargeSchema),
    defaultValues: {
      phoneNumber: "",
      operator: "movistar" as const,
      amount: 0,
    },
  });

  const rechargeMutation = useMutation({
    mutationFn: async (data: { phoneNumber: string; operator: string; amount: number }) => {
      const response = await apiRequest("POST", "/api/services/mobile-recharge", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Recarga exitosa",
        description: `Recarga de ${new Intl.NumberFormat("es-ES", { style: "currency", currency: "USD" }).format(data.amount)} para ${data.operator} - ${data.phoneNumber} completada.`,
      });
      onSuccess();
      onClose();
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: { phoneNumber: string; operator: string; amount: number }) => {
    rechargeMutation.mutate(data);
  };

  const selectAmount = (amount: number) => {
    form.setValue("amount", amount);
  };

  const operators = [
    { value: "movistar", label: "Movistar" },
    { value: "claro", label: "Claro" },
    { value: "tigo", label: "Tigo" },
    { value: "virgin", label: "Virgin Mobile" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Recarga Celular</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preset amounts */}
          <div className="grid grid-cols-4 gap-2">
            {[5, 10, 20, 50].map((amount) => (
              <Button
                key={amount}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => selectAmount(amount)}
              >
                ${amount}
              </Button>
            ))}
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de teléfono</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: 1234567890"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="operator"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Operador</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar operador" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {operators.map((operator) => (
                          <SelectItem key={operator.value} value={operator.value}>
                            {operator.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto de recarga</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="$0.00"
                        min={5}
                        max={100}
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex space-x-3">
                <Button
                  type="submit"
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                  disabled={rechargeMutation.isPending}
                >
                  {rechargeMutation.isPending ? "Procesando..." : "Recargar"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={onClose}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
