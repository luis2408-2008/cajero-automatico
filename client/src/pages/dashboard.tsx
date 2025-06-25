import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  CreditCard, 
  DollarSign, 
  Minus, 
  Plus, 
  ArrowLeftRight, 
  Smartphone, 
  Play, 
  FileText, 
  Zap, 
  Lock,
  LogOut
} from "lucide-react";
import { authService } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import WithdrawModal from "@/components/modals/withdraw-modal";
import DepositModal from "@/components/modals/deposit-modal";
import TransferModal from "@/components/modals/transfer-modal";
import MobileRechargeModal from "@/components/modals/mobile-recharge-modal";
import ServicesModal from "@/components/modals/services-modal";
import HistoryModal from "@/components/modals/history-modal";
import WheelModal from "@/components/modals/wheel-modal";
import ChangePinModal from "@/components/modals/change-pin-modal";

export default function DashboardPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const { data: userData, refetch } = useQuery({
    queryKey: ["/api/auth/me"],
  });

  const user = userData?.user;

  const handleLogout = async () => {
    try {
      await authService.logout();
      queryClient.clear();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente.",
      });
      setLocation("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al cerrar sesión.",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "USD",
    }).format(num);
  };

  const showBalance = () => {
    toast({
      title: "Saldo Actual",
      description: `Tu saldo disponible es: ${formatCurrency(user?.balance || 0)}`,
    });
  };

  const atmFunctions = [
    {
      id: "balance",
      title: "Consultar Saldo",
      description: "Ver saldo actual",
      icon: DollarSign,
      color: "bg-blue-100",
      iconColor: "text-primary",
      onClick: showBalance,
    },
    {
      id: "withdraw",
      title: "Retirar Dinero",
      description: "Retiro de efectivo",
      icon: Minus,
      color: "bg-red-100",
      iconColor: "text-red-600",
      onClick: () => setActiveModal("withdraw"),
    },
    {
      id: "deposit",
      title: "Depositar Dinero",
      description: "Agregar fondos",
      icon: Plus,
      color: "bg-green-100",
      iconColor: "text-green-600",
      onClick: () => setActiveModal("deposit"),
    },
    {
      id: "transfer",
      title: "Transferir",
      description: "Enviar a otro usuario",
      icon: ArrowLeftRight,
      color: "bg-purple-100",
      iconColor: "text-purple-600",
      onClick: () => setActiveModal("transfer"),
    },
    {
      id: "mobile",
      title: "Recarga Celular",
      description: "Recargar saldo móvil",
      icon: Smartphone,
      color: "bg-yellow-100",
      iconColor: "text-yellow-600",
      onClick: () => setActiveModal("mobile"),
    },
    {
      id: "services",
      title: "Servicios",
      description: "Netflix, Spotify, etc.",
      icon: Play,
      color: "bg-indigo-100",
      iconColor: "text-indigo-600",
      onClick: () => setActiveModal("services"),
    },
  ];

  const additionalFunctions = [
    {
      id: "history",
      title: "Historial",
      description: "Ver movimientos",
      icon: FileText,
      color: "bg-gray-100",
      iconColor: "text-gray-600",
      onClick: () => setActiveModal("history"),
    },
    {
      id: "wheel",
      title: "Rueda de la Suerte",
      description: "¡Prueba tu suerte!",
      icon: Zap,
      color: "bg-pink-100",
      iconColor: "text-pink-600",
      onClick: () => setActiveModal("wheel"),
    },
    {
      id: "change-pin",
      title: "Cambiar PIN",
      description: "Actualizar seguridad",
      icon: Lock,
      color: "bg-orange-100",
      iconColor: "text-orange-600",
      onClick: () => setActiveModal("change-pin"),
    },
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center mr-3">
                <CreditCard className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">BancoSeguro</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Bienvenido</p>
                <p className="font-medium text-gray-900">{user.username}</p>
              </div>
              <Button 
                onClick={handleLogout}
                variant="destructive"
                size="sm"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Balance Card */}
        <Card className="gradient-primary text-white mb-8 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Saldo Disponible</p>
                <p className="text-3xl font-bold">{formatCurrency(user.balance)}</p>
                <p className="text-blue-100 text-xs mt-1">
                  Última actualización: hace 2 minutos
                </p>
              </div>
              <div className="h-16 w-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Functions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {atmFunctions.map((func) => {
            const Icon = func.icon;
            return (
              <Card 
                key={func.id}
                className="shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                onClick={func.onClick}
              >
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className={`h-12 w-12 ${func.color} rounded-lg flex items-center justify-center mr-4`}>
                      <Icon className={`h-6 w-6 ${func.iconColor}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{func.title}</h3>
                      <p className="text-sm text-gray-600">{func.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Functions Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {additionalFunctions.map((func) => {
            const Icon = func.icon;
            return (
              <Card 
                key={func.id}
                className="shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                onClick={func.onClick}
              >
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className={`h-12 w-12 ${func.color} rounded-lg flex items-center justify-center mr-4`}>
                      <Icon className={`h-6 w-6 ${func.iconColor}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{func.title}</h3>
                      <p className="text-sm text-gray-600">{func.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>

      {/* Modals */}
      <WithdrawModal 
        isOpen={activeModal === "withdraw"} 
        onClose={() => setActiveModal(null)}
        onSuccess={refetch}
      />
      <DepositModal 
        isOpen={activeModal === "deposit"} 
        onClose={() => setActiveModal(null)}
        onSuccess={refetch}
      />
      <TransferModal 
        isOpen={activeModal === "transfer"} 
        onClose={() => setActiveModal(null)}
        onSuccess={refetch}
      />
      <MobileRechargeModal 
        isOpen={activeModal === "mobile"} 
        onClose={() => setActiveModal(null)}
        onSuccess={refetch}
      />
      <ServicesModal 
        isOpen={activeModal === "services"} 
        onClose={() => setActiveModal(null)}
        onSuccess={refetch}
      />
      <HistoryModal 
        isOpen={activeModal === "history"} 
        onClose={() => setActiveModal(null)}
      />
      <WheelModal 
        isOpen={activeModal === "wheel"} 
        onClose={() => setActiveModal(null)}
        onSuccess={refetch}
      />
      <ChangePinModal 
        isOpen={activeModal === "change-pin"} 
        onClose={() => setActiveModal(null)}
      />
    </div>
  );
}
