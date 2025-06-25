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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Retirar Dinero</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Saldo disponible:{" "}
            <span className="font-medium text-green-600">
              {user ? formatCurrency(user.balance) : "$0.00"}
            </span>
          </p>

          {/* Preset amounts */}
          <div className="grid grid-cols-2 gap-3">
            {[50, 100, 200, 500].map((amount) => (
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
                    <FormLabel>Cantidad personalizada</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ingrese cantidad"
                        min={10}
                        step={10}
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
                  className="flex-1"
                  disabled={withdrawMutation.isPending}
                >
                  {withdrawMutation.isPending ? "Procesando..." : "Retirar"}
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
