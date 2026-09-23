import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEmergencyContactSchema, insertActivityLogSchema, insertAppSettingsSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Emergency Contacts routes
  app.get("/api/emergency-contacts", async (req, res) => {
    try {
      const contacts = await storage.getEmergencyContacts();
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch emergency contacts" });
    }
  });

  app.post("/api/emergency-contacts", async (req, res) => {
    try {
      const validatedData = insertEmergencyContactSchema.parse(req.body);
      const contact = await storage.createEmergencyContact(validatedData);
      res.status(201).json(contact);
    } catch (error) {
      res.status(400).json({ error: "Invalid contact data" });
    }
  });

  app.put("/api/emergency-contacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertEmergencyContactSchema.partial().parse(req.body);
      const contact = await storage.updateEmergencyContact(id, validatedData);
      
      if (!contact) {
        return res.status(404).json({ error: "Contact not found" });
      }
      
      res.json(contact);
    } catch (error) {
      res.status(400).json({ error: "Invalid contact data" });
    }
  });

  app.delete("/api/emergency-contacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteEmergencyContact(id);
      
      if (!success) {
        return res.status(404).json({ error: "Contact not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete contact" });
    }
  });

  // Activity Logs routes
  app.get("/api/activity-logs", async (req, res) => {
    try {
      const logs = await storage.getActivityLogs();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch activity logs" });
    }
  });

  app.post("/api/activity-logs", async (req, res) => {
    try {
      const validatedData = insertActivityLogSchema.parse(req.body);
      const log = await storage.createActivityLog(validatedData);
      res.status(201).json(log);
    } catch (error) {
      res.status(400).json({ error: "Invalid log data" });
    }
  });

  // App Settings routes
  app.get("/api/app-settings", async (req, res) => {
    try {
      const settings = await storage.getAppSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch app settings" });
    }
  });

  app.put("/api/app-settings", async (req, res) => {
    try {
      const validatedData = insertAppSettingsSchema.partial().parse(req.body);
      const settings = await storage.updateAppSettings(validatedData);
      res.json(settings);
    } catch (error) {
      res.status(400).json({ error: "Invalid settings data" });
    }
  });

  // Emergency SOS endpoint
  app.post("/api/emergency/sos", async (req, res) => {
    try {
      const { location, message } = req.body;
      
      // Log the emergency
      await storage.createActivityLog({
        type: "emergency",
        description: "SOS emergency alert triggered",
        metadata: JSON.stringify({ location, message, timestamp: new Date() }),
      });

      // In a real implementation, this would send SMS/notifications to emergency contacts
      const contacts = await storage.getEmergencyContacts();
      
      // Mock emergency response
      const response = {
        success: true,
        message: "Emergency alerts sent successfully",
        contactsNotified: contacts.length,
        timestamp: new Date(),
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({ error: "Failed to process emergency alert" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
