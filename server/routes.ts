import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import session from "express-session";
import { 
  loginSchema, 
  registerSchema, 
  withdrawSchema, 
  depositSchema, 
  transferSchema,
  changePinSchema,
  mobileRechargeSchema
} from "@shared/schema";

declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || "banco-seguro-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: false, // Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "No autorizado" });
    }
    next();
  };

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, pin } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Credenciales inválidas" });
      }

      if (user.isLocked) {
        return res.status(423).json({ message: "Cuenta bloqueada. Contacte al banco." });
      }

      const isValidPin = await bcrypt.compare(pin, user.pin);
      if (!isValidPin) {
        await storage.incrementLoginAttempts(username);
        return res.status(401).json({ 
          message: "Credenciales inválidas",
          attemptsRemaining: Math.max(0, 3 - (user.loginAttempts + 1))
        });
      }

      await storage.resetLoginAttempts(username);
      req.session.userId = user.id;
      
      res.json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          balance: user.balance 
        } 
      });
    } catch (error) {
      res.status(400).json({ message: "Datos inválidos" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, pin } = registerSchema.parse(req.body);
      
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ message: "El usuario ya existe" });
      }

      const hashedPin = await bcrypt.hash(pin, 10);
      const user = await storage.createUser({ username, pin: hashedPin });
      
      req.session.userId = user.id;
      
      res.status(201).json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          balance: user.balance 
        } 
      });
    } catch (error) {
      res.status(400).json({ message: "Datos inválidos" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Error al cerrar sesión" });
      }
      res.json({ message: "Sesión cerrada exitosamente" });
    });
  });

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      
      res.json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          balance: user.balance 
        } 
      });
    } catch (error) {
      res.status(500).json({ message: "Error del servidor" });
    }
  });

  // Banking operations
  app.post("/api/banking/withdraw", requireAuth, async (req, res) => {
    try {
      const { amount } = withdrawSchema.parse(req.body);
      const user = await storage.getUser(req.session.userId!);
      
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      const currentBalance = parseFloat(user.balance);
      if (currentBalance < amount) {
        return res.status(400).json({ message: "Saldo insuficiente" });
      }

      const newBalance = (currentBalance - amount).toFixed(2);
      await storage.updateUser(user.id, { balance: newBalance });
      
      await storage.createTransaction({
        userId: user.id,
        type: "withdraw",
        amount: amount.toString(),
        description: `Retiro de efectivo`,
        recipientUsername: null,
        metadata: null,
      });

      res.json({ 
        message: "Retiro exitoso", 
        newBalance,
        amount 
      });
    } catch (error) {
      res.status(400).json({ message: "Datos inválidos" });
    }
  });

  app.post("/api/banking/deposit", requireAuth, async (req, res) => {
    try {
      const { amount } = depositSchema.parse(req.body);
      const user = await storage.getUser(req.session.userId!);
      
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      const currentBalance = parseFloat(user.balance);
      const newBalance = (currentBalance + amount).toFixed(2);
      await storage.updateUser(user.id, { balance: newBalance });
      
      await storage.createTransaction({
        userId: user.id,
        type: "deposit",
        amount: amount.toString(),
        description: `Depósito de efectivo`,
        recipientUsername: null,
        metadata: null,
      });

      res.json({ 
        message: "Depósito exitoso", 
        newBalance,
        amount 
      });
    } catch (error) {
      res.status(400).json({ message: "Datos inválidos" });
    }
  });

  app.post("/api/banking/transfer", requireAuth, async (req, res) => {
    try {
      const { recipientUsername, amount, note } = transferSchema.parse(req.body);
      const user = await storage.getUser(req.session.userId!);
      const recipient = await storage.getUserByUsername(recipientUsername);
      
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      if (!recipient) {
        return res.status(404).json({ message: "Usuario destinatario no encontrado" });
      }

      if (user.username === recipientUsername) {
        return res.status(400).json({ message: "No puedes transferir a ti mismo" });
      }

      const currentBalance = parseFloat(user.balance);
      if (currentBalance < amount) {
        return res.status(400).json({ message: "Saldo insuficiente" });
      }

      // Update sender balance
      const newSenderBalance = (currentBalance - amount).toFixed(2);
      await storage.updateUser(user.id, { balance: newSenderBalance });

      // Update recipient balance
      const recipientBalance = parseFloat(recipient.balance);
      const newRecipientBalance = (recipientBalance + amount).toFixed(2);
      await storage.updateUser(recipient.id, { balance: newRecipientBalance });
      
      // Create transaction records
      await storage.createTransaction({
        userId: user.id,
        type: "transfer_out",
        amount: amount.toString(),
        description: `Transferencia a ${recipientUsername}`,
        recipientUsername,
        metadata: note ? JSON.stringify({ note }) : null,
      });

      await storage.createTransaction({
        userId: recipient.id,
        type: "transfer_in",
        amount: amount.toString(),
        description: `Transferencia de ${user.username}`,
        recipientUsername: user.username,
        metadata: note ? JSON.stringify({ note }) : null,
      });

      res.json({ 
        message: "Transferencia exitosa", 
        newBalance: newSenderBalance,
        amount,
        recipient: recipientUsername
      });
    } catch (error) {
      res.status(400).json({ message: "Datos inválidos" });
    }
  });

  app.get("/api/banking/balance", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      
      res.json({ balance: user.balance });
    } catch (error) {
      res.status(500).json({ message: "Error del servidor" });
    }
  });

  app.get("/api/banking/transactions", requireAuth, async (req, res) => {
    try {
      const transactions = await storage.getUserTransactions(req.session.userId!);
      res.json({ transactions });
    } catch (error) {
      res.status(500).json({ message: "Error del servidor" });
    }
  });

  // Additional services
  app.post("/api/services/mobile-recharge", requireAuth, async (req, res) => {
    try {
      const { phoneNumber, operator, amount } = mobileRechargeSchema.parse(req.body);
      const user = await storage.getUser(req.session.userId!);
      
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      const currentBalance = parseFloat(user.balance);
      if (currentBalance < amount) {
        return res.status(400).json({ message: "Saldo insuficiente" });
      }

      const newBalance = (currentBalance - amount).toFixed(2);
      await storage.updateUser(user.id, { balance: newBalance });
      
      await storage.createTransaction({
        userId: user.id,
        type: "mobile_recharge",
        amount: amount.toString(),
        description: `Recarga ${operator.toUpperCase()} - ${phoneNumber}`,
        recipientUsername: null,
        metadata: JSON.stringify({ phoneNumber, operator }),
      });

      res.json({ 
        message: "Recarga exitosa", 
        newBalance,
        amount,
        phoneNumber,
        operator: operator.toUpperCase()
      });
    } catch (error) {
      res.status(400).json({ message: "Datos inválidos" });
    }
  });

  app.post("/api/services/streaming", requireAuth, async (req, res) => {
    try {
      const { service, price } = req.body;
      const amount = parseFloat(price);
      
      if (!service || !amount || amount <= 0) {
        return res.status(400).json({ message: "Datos inválidos" });
      }

      const user = await storage.getUser(req.session.userId!);
      
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      const currentBalance = parseFloat(user.balance);
      if (currentBalance < amount) {
        return res.status(400).json({ message: "Saldo insuficiente" });
      }

      const newBalance = (currentBalance - amount).toFixed(2);
      await storage.updateUser(user.id, { balance: newBalance });
      
      const serviceNames: Record<string, string> = {
        netflix: "Netflix",
        spotify: "Spotify Premium",
        disney: "Disney+",
        prime: "Prime Video"
      };

      await storage.createTransaction({
        userId: user.id,
        type: "service",
        amount: amount.toString(),
        description: `Suscripción ${serviceNames[service] || service}`,
        recipientUsername: null,
        metadata: JSON.stringify({ service }),
      });

      res.json({ 
        message: "Suscripción activada", 
        newBalance,
        amount,
        service: serviceNames[service] || service
      });
    } catch (error) {
      res.status(400).json({ message: "Error al procesar el pago" });
    }
  });

  app.post("/api/games/wheel", requireAuth, async (req, res) => {
    try {
      const spinCost = 10;
      const user = await storage.getUser(req.session.userId!);
      
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      const currentBalance = parseFloat(user.balance);
      if (currentBalance < spinCost) {
        return res.status(400).json({ message: "Saldo insuficiente para jugar" });
      }

      // Deduct spin cost
      let newBalance = currentBalance - spinCost;

      // Random outcomes: win or lose
      const outcomes = [50, -25, 100, -10, 25, -5, 75, -15, 30, -20];
      const result = outcomes[Math.floor(Math.random() * outcomes.length)];
      
      newBalance += result;
      const finalBalance = newBalance.toFixed(2);
      
      await storage.updateUser(user.id, { balance: finalBalance });
      
      await storage.createTransaction({
        userId: user.id,
        type: "game",
        amount: (-spinCost).toString(),
        description: `Rueda de la Suerte - Costo`,
        recipientUsername: null,
        metadata: null,
      });

      if (result !== 0) {
        await storage.createTransaction({
          userId: user.id,
          type: "game",
          amount: result.toString(),
          description: `Rueda de la Suerte - ${result > 0 ? 'Premio' : 'Pérdida'}`,
          recipientUsername: null,
          metadata: JSON.stringify({ spinResult: result }),
        });
      }

      res.json({ 
        result,
        newBalance: finalBalance,
        message: result > 0 ? `¡Felicidades! Ganaste $${result}` : result < 0 ? `Perdiste $${Math.abs(result)}` : "¡Suerte la próxima vez!"
      });
    } catch (error) {
      res.status(500).json({ message: "Error en el juego" });
    }
  });

  // Security
  app.post("/api/security/change-pin", requireAuth, async (req, res) => {
    try {
      const { currentPin, newPin } = changePinSchema.parse(req.body);
      const user = await storage.getUser(req.session.userId!);
      
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      const isValidCurrentPin = await bcrypt.compare(currentPin, user.pin);
      if (!isValidCurrentPin) {
        return res.status(401).json({ message: "PIN actual incorrecto" });
      }

      const hashedNewPin = await bcrypt.hash(newPin, 10);
      await storage.updateUser(user.id, { pin: hashedNewPin });
      
      res.json({ message: "PIN actualizado exitosamente" });
    } catch (error) {
      res.status(400).json({ message: "Datos inválidos" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
