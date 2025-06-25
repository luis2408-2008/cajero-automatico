import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  X, 
  Plus, 
  Minus, 
  ArrowLeftRight, 
  Smartphone, 
  Play, 
  Zap,
  Download
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HistoryModal({ isOpen, onClose }: HistoryModalProps) {
  const { data: transactionsData, isLoading } = useQuery({
    queryKey: ["/api/banking/transactions"],
    enabled: isOpen,
  });

  const transactions = transactionsData?.transactions || [];

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return Plus;
      case "withdraw":
        return Minus;
      case "transfer_out":
      case "transfer_in":
        return ArrowLeftRight;
      case "mobile_recharge":
        return Smartphone;
      case "service":
        return Play;
      case "game":
        return Zap;
      default:
        return Plus;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "deposit":
      case "transfer_in":
        return "text-green-600 bg-green-100";
      case "withdraw":
      case "transfer_out":
      case "mobile_recharge":
      case "service":
        return "text-red-600 bg-red-100";
      case "game":
        return "text-purple-600 bg-purple-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getAmountDisplay = (type: string, amount: string) => {
    const value = parseFloat(amount);
    const formatted = new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "USD",
    }).format(Math.abs(value));

    if (type === "deposit" || type === "transfer_in" || (type === "game" && value > 0)) {
      return `+${formatted}`;
    }
    return `-${formatted}`;
  };

  const getAmountColorClass = (type: string, amount: string) => {
    const value = parseFloat(amount);
    if (type === "deposit" || type === "transfer_in" || (type === "game" && value > 0)) {
      return "text-green-600";
    }
    return "text-red-600";
  };

  const exportHistory = () => {
    // In a real application, this would generate a PDF or CSV
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Fecha,Tipo,Descripción,Monto\n"
      + transactions.map((t: any) => 
          `${format(new Date(t.createdAt), "dd/MM/yyyy HH:mm", { locale: es })},${t.type},${t.description},${t.amount}`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "historial-transacciones.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Historial de Movimientos</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay transacciones registradas
            </div>
          ) : (
            <>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {transactions.map((transaction: any) => {
                    const Icon = getTransactionIcon(transaction.type);
                    const colorClass = getTransactionColor(transaction.type);
                    
                    return (
                      <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${colorClass}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{transaction.description}</p>
                            <p className="text-sm text-gray-600">
                              {format(new Date(transaction.createdAt), "dd MMM yyyy, HH:mm", { locale: es })}
                            </p>
                            {transaction.recipientUsername && (
                              <Badge variant="secondary" className="mt-1">
                                {transaction.type === "transfer_out" ? "Para: " : "De: "}
                                {transaction.recipientUsername}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <span className={`font-semibold ${getAmountColorClass(transaction.type, transaction.amount)}`}>
                          {getAmountDisplay(transaction.type, transaction.amount)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              <div className="pt-4 border-t border-gray-200 text-center">
                <Button onClick={exportHistory} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Historial
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
