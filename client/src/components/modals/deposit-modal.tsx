import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { depositSchema } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { X } from "lucide-react";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DepositModal({ isOpen, onClose, onSuccess }: DepositModalProps) {
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      amount: 0,
    },
  });

  const depositMutation = useMutation({
    mutationFn: async (data: { amount: number }) => {
      const response = await apiRequest("POST", "/api/banking/deposit", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Depósito exitoso",
        description: `Has depositado ${new Intl.NumberFormat("es-ES", { style: "currency", currency: "USD" }).format(data.amount)}. Nuevo saldo: ${new Intl.NumberFormat("es-ES", { style: "currency", currency: "USD" }).format(parseFloat(data.newBalance))}`,
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

  const onSubmit = (data: { amount: number }) => {
    depositMutation.mutate(data);
  };

  const selectAmount = (amount: number) => {
    form.setValue("amount", amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Depositar Dinero</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preset amounts */}
          <div className="grid grid-cols-2 gap-3">
            {[100, 250, 500, 1000].map((amount) => (
              <Button
                key={amount}
                type="button"
                variant="outline"
                onClick={() => selectAmount(amount)}
                className="py-3"
              >
                ${amount}
              </Button>
            ))}
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cantidad a depositar</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ingrese cantidad"
                        min={10}
                        step={1}
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
                  className="flex-1 bg-success text-success-foreground hover:bg-success/90"
                  disabled={depositMutation.isPending}
                >
                  {depositMutation.isPending ? "Procesando..." : "Depositar"}
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
