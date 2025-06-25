import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { withdrawSchema } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { X } from "lucide-react";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function WithdrawModal({ isOpen, onClose, onSuccess }: WithdrawModalProps) {
  const { toast } = useToast();

  const { data: userData } = useQuery({
    queryKey: ["/api/auth/me"],
  });

  const user = userData?.user;

  const form = useForm({
    resolver: zodResolver(withdrawSchema),
    defaultValues: {
      amount: 0,
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: async (data: { amount: number }) => {
      const response = await apiRequest("POST", "/api/banking/withdraw", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Retiro exitoso",
        description: `Has retirado ${new Intl.NumberFormat("es-ES", { style: "currency", currency: "USD" }).format(data.amount)}. Nuevo saldo: ${new Intl.NumberFormat("es-ES", { style: "currency", currency: "USD" }).format(parseFloat(data.newBalance))}`,
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
    withdrawMutation.mutate(data);
  };

  const selectAmount = (amount: number) => {
    form.setValue("amount", amount);
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "USD",
    }).format(num);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md neon-card border-red-500/30">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl neon-text-purple">💰 RETIRAR DINERO</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-red-500/20">
              <X className="h-4 w-4 text-red-400" />
            </Button>
          </div>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
            <p className="text-sm text-green-300">
              Saldo disponible:{" "}
              <span className="font-bold text-green-400 neon-text">
                {user ? formatCurrency(user.balance) : "$0.00"}
              </span>
            </p>
          </div>

          {/* Cyber amount buttons */}
          <div className="grid grid-cols-2 gap-3">
            {[50, 100, 200, 500].map((amount) => (
              <Button
                key={amount}
                type="button"
                onClick={() => selectAmount(amount)}
                className="cyber-button h-12 text-lg font-semibold"
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
                    <FormLabel className="text-cyan-300 font-medium">Cantidad a retirar</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="Cantidad a retirar"
                          min={10}
                          step={10}
                          className="cyber-input h-12 text-lg pl-12"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                          <div className="h-2 w-2 bg-red-400 rounded-full animate-pulse"></div>
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
                  className="cyber-button h-12 text-lg font-semibold bg-gradient-to-r from-red-500 to-orange-500"
                  disabled={withdrawMutation.isPending}
                >
                  {withdrawMutation.isPending ? "PROCESANDO..." : "RETIRAR"}
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
