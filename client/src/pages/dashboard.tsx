import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Cpu, 
  DollarSign, 
  Download, 
  Upload, 
  ArrowLeftRight, 
  Smartphone, 
  Play, 
  FileText, 
  Zap, 
  Shield,
  Power,
  Eye,
  TrendingUp,
  Activity,
  Sparkles,
  Hexagon,
  LucideIcon
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

  const user = userData?.user as any;

  const handleLogout = async () => {
    try {
      await authService.logout();
      queryClient.clear();
      toast({
        title: "🔒 Sesión Finalizada",
        description: "Desconectado del sistema de forma segura.",
      });
      setLocation("/");
    } catch (error) {
      toast({
        title: "Error de Sistema",
        description: "Fallo en el proceso de desconexión.",
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
      title: "💰 Análisis Cuántico de Fondos",
      description: `Fondos disponibles en tu cartera digital: ${formatCurrency(user?.balance || 0)}`,
    });
  };

  const cyberFunctions = [
    {
      id: "balance",
      title: "Consulta Cuántica",
      description: "Análisis de fondos",
      icon: Eye,
      gradient: "gradient-cyber-1",
      onClick: showBalance,
    },
    {
      id: "withdraw",
      title: "Extracción",
      description: "Retirar fondos",
      icon: Download,
      gradient: "gradient-cyber-2",
      onClick: () => setActiveModal("withdraw"),
    },
    {
      id: "deposit",
      title: "Inyección",
      description: "Agregar fondos",
      icon: Upload,
      gradient: "gradient-cyber-3",
      onClick: () => setActiveModal("deposit"),
    },
    {
      id: "transfer",
      title: "Transferencia Neural",
      description: "Envío quantum",
      icon: ArrowLeftRight,
      gradient: "gradient-cyber-4",
      onClick: () => setActiveModal("transfer"),
    },
    {
      id: "mobile",
      title: "Recarga Wireless",
      description: "Energía móvil",
      icon: Smartphone,
      gradient: "gradient-cyber-1",
      onClick: () => setActiveModal("mobile"),
    },
    {
      id: "services",
      title: "Servicios Digitales",
      description: "Plataformas premium",
      icon: Play,
      gradient: "gradient-cyber-2",
      onClick: () => setActiveModal("services"),
    },
  ];

  const advancedFunctions = [
    {
      id: "history",
      title: "Registro Neural",
      description: "Historial completo",
      icon: FileText,
      gradient: "gradient-cyber-3",
      onClick: () => setActiveModal("history"),
    },
    {
      id: "wheel",
      title: "Algoritmo de Suerte",
      description: "Probabilidad cuántica",
      icon: Zap,
      gradient: "gradient-cyber-4",
      onClick: () => setActiveModal("wheel"),
    },
    {
      id: "change-pin",
      title: "Reconfiguración",
      description: "Actualizar código",
      icon: Shield,
      gradient: "gradient-cyber-1",
      onClick: () => setActiveModal("change-pin"),
    },
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="cyber-loading h-16 w-16 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-cyan-400 font-mono text-sm animate-pulse">INICIANDO SISTEMA...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'cyber-grid 20s linear infinite'
        }}></div>
      </div>

      {/* Cyber Header */}
      <header className="relative z-10 border-b border-cyan-500/30 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 gradient-cyber-1 rounded-xl flex items-center justify-center floating">
                <Cpu className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold neon-text tracking-wider">NEXUS</h1>
                <p className="text-cyan-400/80 text-xs tracking-wide">QUANTUM INTERFACE</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-cyan-400/80 text-sm">Operador Activo</p>
                <p className="font-bold text-cyan-300 text-lg">{user.username}</p>
              </div>
              <Button 
                onClick={handleLogout}
                className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 hover:text-red-200 transition-all duration-300"
                size="sm"
              >
                <Power className="h-4 w-4 mr-2" />
                DESCONECTAR
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Quantum Balance Display */}
        <div className="neon-card balance-glow mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10"></div>
          <div className="relative p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-cyan-400" />
                  <p className="text-cyan-300/80 text-sm font-medium tracking-wide">FONDOS CUÁNTICOS DISPONIBLES</p>
                </div>
                <p className="text-4xl font-bold neon-text">{formatCurrency(user.balance)}</p>
                <div className="flex items-center space-x-4 text-xs text-cyan-400/60">
                  <div className="flex items-center space-x-1">
                    <Activity className="h-3 w-3" />
                    <span>TIEMPO REAL</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="h-1 w-1 bg-green-400 rounded-full animate-pulse"></div>
                    <span>ACTIVO</span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="h-20 w-20 gradient-cyber-1 rounded-2xl flex items-center justify-center floating">
                  <DollarSign className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 h-6 w-6 bg-green-400 rounded-full flex items-center justify-center">
                  <div className="h-2 w-2 bg-white rounded-full animate-ping"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Operations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {cyberFunctions.map((func) => {
            const Icon = func.icon;
            return (
              <div 
                key={func.id}
                className="neon-card cursor-pointer group"
                onClick={func.onClick}
              >
                <div className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`h-14 w-14 ${func.gradient} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-cyan-300 group-hover:text-cyan-200 transition-colors">{func.title}</h3>
                      <p className="text-sm text-cyan-400/70">{func.description}</p>
                      <div className="mt-2 flex items-center space-x-1">
                        <div className="h-1 w-8 bg-gradient-to-r from-cyan-500 to-transparent rounded-full"></div>
                        <div className="h-1 w-1 bg-cyan-400 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Advanced Operations */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center space-x-2">
            <Hexagon className="h-5 w-5 text-purple-400" />
            <h2 className="text-xl font-bold neon-text-purple">OPERACIONES AVANZADAS</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-purple-500/50 to-transparent"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {advancedFunctions.map((func) => {
              const Icon = func.icon;
              return (
                <div 
                  key={func.id}
                  className="neon-card cursor-pointer group"
                  onClick={func.onClick}
                >
                  <div className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className={`h-12 w-12 ${func.gradient} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-purple-300 group-hover:text-purple-200 transition-colors">{func.title}</h3>
                        <p className="text-sm text-purple-400/70">{func.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* System Status */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "CONEXIÓN", status: "ESTABLE", color: "text-green-400" },
            { label: "SEGURIDAD", status: "MÁXIMA", color: "text-cyan-400" },
            { label: "LATENCIA", status: "BAJA", color: "text-purple-400" },
            { label: "RENDIMIENTO", status: "ÓPTIMO", color: "text-yellow-400" }
          ].map((stat, index) => (
            <div key={index} className="bg-black/30 border border-cyan-500/20 rounded-lg p-3">
              <div className="text-xs text-cyan-400/60 mb-1">{stat.label}</div>
              <div className={`font-mono text-sm font-semibold ${stat.color}`}>{stat.status}</div>
              <div className="mt-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full animate-pulse" style={{width: '85%'}}></div>
              </div>
            </div>
          ))}
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
