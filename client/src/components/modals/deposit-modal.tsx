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
      <DialogContent className="sm:max-w-md neon-card border-green-500/30">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl neon-text">⬆️ INYECCIÓN CUÁNTICA</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-green-500/20">
              <X className="h-4 w-4 text-green-400" />
            </Button>
          </div>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-green-500/50 to-transparent"></div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cyber amount buttons */}
          <div className="grid grid-cols-2 gap-3">
            {[100, 250, 500, 1000].map((amount) => (
              <Button
                key={amount}
                type="button"
                onClick={() => selectAmount(amount)}
                className="cyber-button h-12 text-lg font-semibold bg-gradient-to-r from-green-500 to-cyan-500"
              >
                ${amount}
              </Button>
            ))}
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-green-300 font-medium">Cantidad de Inyección</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="Fondos a inyectar"
                          min={10}
                          step={1}
                          className="cyber-input h-12 text-lg pl-12"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                          <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="submit"
                  className="cyber-button h-12 text-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-500"
                  disabled={depositMutation.isPending}
                >
                  {depositMutation.isPending ? "PROCESANDO..." : "INYECTAR"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"
                  onClick={onClose}
                >
                  CANCELAR
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
