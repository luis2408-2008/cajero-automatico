import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registerSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Cpu, UserPlus, Shield, Sparkles, Zap, DollarSign } from "lucide-react";
import { authService } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string>("");

  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      pin: "",
      confirmPin: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: { username: string; pin: string; confirmPin: string }) => {
      return authService.register(data.username, data.pin, data.confirmPin);
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/auth/me"], { user });
      toast({
        title: "🚀 Cuenta Activada",
        description: `¡Bienvenido al futuro, ${user.username}! Fondos iniciales: $${user.balance}`,
      });
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const onSubmit = (data: { username: string; pin: string; confirmPin: string }) => {
    setError("");
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-green-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Cyber Bank Logo & Header */}
        <div className="text-center space-y-6">
          <div className="relative">
            {/* Registration Logo */}
            <div className="mx-auto h-24 w-24 gradient-cyber-2 rounded-2xl flex items-center justify-center mb-6 floating shadow-2xl">
              <div className="relative">
                <UserPlus className="h-12 w-12 text-white" />
                <div className="absolute -top-1 -right-1 h-4 w-4 bg-purple-400 rounded-full animate-ping"></div>
                <div className="absolute -bottom-1 -left-1 h-3 w-3 bg-pink-400 rounded-full animate-ping delay-300"></div>
              </div>
            </div>
            
            {/* Holographic Elements */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-32">
              <div className="absolute inset-0 border border-purple-500/30 rounded-2xl animate-pulse"></div>
              <div className="absolute inset-2 border border-pink-500/30 rounded-xl animate-pulse delay-150"></div>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-bold neon-text tracking-wider">
              NEXUS
              <span className="neon-text-purple">BANK</span>
            </h1>
            <div className="flex items-center justify-center space-x-2">
              <Shield className="h-4 w-4 text-purple-400" />
              <p className="text-purple-300/80 text-sm font-medium tracking-wide">
                REGISTRO DE NUEVA CUENTA
              </p>
              <Sparkles className="h-4 w-4 text-pink-400 animate-pulse" />
            </div>
            <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
          </div>
        </div>

        {/* Cyber Registration Form */}
        <div className="neon-card space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-purple-300 mb-2">Crear Cuenta</h3>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-purple-300 font-medium">Usuario</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          className="cyber-input pl-12 h-12 text-lg"
                          placeholder="Nombre de usuario"
                          {...field}
                        />
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                          <div className="h-2 w-2 bg-purple-400 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-pink-300 font-medium">PIN</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="password"
                          maxLength={4}
                          className="cyber-input pl-12 h-12 text-lg tracking-widest"
                          placeholder="● ● ● ●"
                          {...field}
                        />
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                          <div className="h-2 w-2 bg-pink-400 rounded-full animate-pulse delay-150"></div>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-cyan-300 font-medium">Confirmar PIN</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="password"
                          maxLength={4}
                          className="cyber-input pl-12 h-12 text-lg tracking-widest"
                          placeholder="● ● ● ●"
                          {...field}
                        />
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                          <div className="h-2 w-2 bg-cyan-400 rounded-full animate-pulse delay-300"></div>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Alert className="bg-green-500/10 border-green-500/30 text-green-300">
                <DollarSign className="h-5 w-5 text-green-400" />
                <AlertDescription className="font-medium">
                  <span className="text-green-400">BONO INICIAL:</span> Recibirás un saldo aleatorio entre $100 - $1,000
                </AlertDescription>
              </Alert>

              {error && (
                <Alert className="bg-red-500/10 border-red-500/30 text-red-300">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="font-medium">{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-14 cyber-button text-lg font-semibold tracking-wide bg-gradient-to-r from-purple-500 to-pink-500"
                disabled={registerMutation.isPending}
              >
                <div className="flex items-center space-x-3">
                  <Zap className={`h-5 w-5 ${registerMutation.isPending ? 'animate-spin' : ''}`} />
                  <span>
                    {registerMutation.isPending ? "CREANDO CUENTA..." : "CREAR CUENTA"}
                  </span>
                </div>
              </Button>
            </form>
          </Form>
        </div>

        {/* Login Link */}
        <div className="text-center">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-purple-500/30 to-transparent mb-4"></div>
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="text-purple-300/80 hover:text-purple-300 text-sm font-medium hover:bg-purple-500/10 transition-all duration-300"
          >
            <span className="flex items-center space-x-2">
              <span>¿Ya tienes acceso? Conectar al sistema</span>
              <div className="h-1 w-1 bg-purple-400 rounded-full animate-ping"></div>
            </span>
          </Button>
        </div>

        {/* Security Indicators */}
        <div className="flex justify-center space-x-8 text-xs text-purple-400/60">
          <div className="flex items-center space-x-1">
            <div className="h-1 w-1 bg-green-400 rounded-full animate-pulse"></div>
            <span>QUANTUM SEC</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="h-1 w-1 bg-purple-400 rounded-full animate-pulse delay-150"></div>
            <span>NEURAL NET</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="h-1 w-1 bg-pink-400 rounded-full animate-pulse delay-300"></div>
            <span>BLOCKCHAIN</span>
          </div>
        </div>
      </div>
    </div>
  );
}
