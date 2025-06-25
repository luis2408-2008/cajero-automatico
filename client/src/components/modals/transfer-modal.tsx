import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { transferSchema } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { X } from "lucide-react";

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TransferModal({ isOpen, onClose, onSuccess }: TransferModalProps) {
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      recipientUsername: "",
      amount: 0,
      note: "",
    },
  });

  const transferMutation = useMutation({
    mutationFn: async (data: { recipientUsername: string; amount: number; note?: string }) => {
      const response = await apiRequest("POST", "/api/banking/transfer", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Transferencia exitosa",
        description: `Has transferido ${new Intl.NumberFormat("es-ES", { style: "currency", currency: "USD" }).format(data.amount)} a ${data.recipient}. Nuevo saldo: ${new Intl.NumberFormat("es-ES", { style: "currency", currency: "USD" }).format(parseFloat(data.newBalance))}`,
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

  const onSubmit = (data: { recipientUsername: string; amount: number; note?: string }) => {
    transferMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Transferir Dinero</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="recipientUsername"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usuario destinatario</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nombre de usuario"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cantidad a transferir</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="$0.00"
                      min={1}
                      step={0.01}
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nota (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Descripción de la transferencia"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex space-x-3 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                disabled={transferMutation.isPending}
              >
                {transferMutation.isPending ? "Procesando..." : "Transferir"}
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
      </DialogContent>
    </Dialog>
  );
}
