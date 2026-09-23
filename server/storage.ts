import { 
  emergencyContacts, 
  activityLogs, 
  appSettings,
  type EmergencyContact, 
  type InsertEmergencyContact,
  type ActivityLog,
  type InsertActivityLog,
  type AppSettings,
  type InsertAppSettings
} from "@shared/schema";

export interface IStorage {
  // Emergency Contacts
  getEmergencyContacts(): Promise<EmergencyContact[]>;
  getEmergencyContact(id: number): Promise<EmergencyContact | undefined>;
  createEmergencyContact(contact: InsertEmergencyContact): Promise<EmergencyContact>;
  updateEmergencyContact(id: number, contact: Partial<InsertEmergencyContact>): Promise<EmergencyContact | undefined>;
  deleteEmergencyContact(id: number): Promise<boolean>;

  // Activity Logs
  getActivityLogs(): Promise<ActivityLog[]>;
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;

  // App Settings
  getAppSettings(): Promise<AppSettings>;
  updateAppSettings(settings: Partial<InsertAppSettings>): Promise<AppSettings>;
}

export class MemStorage implements IStorage {
  private contacts: Map<number, EmergencyContact>;
  private logs: Map<number, ActivityLog>;
  private settings: AppSettings;
  private currentContactId: number;
  private currentLogId: number;

  constructor() {
    this.contacts = new Map();
    this.logs = new Map();
    this.currentContactId = 1;
    this.currentLogId = 1;
    
    // Initialize with default settings
    this.settings = {
      id: 1,
      locationEnabled: false,
      audioEnabled: false,
      motionEnabled: true,
      sosEnabled: true,
      aiMonitoring: true,
      updatedAt: new Date(),
    };

    // Add some default contacts
    this.createEmergencyContact({ name: "Mom", phone: "+91 98765 43210", relationship: "Mother" });
    this.createEmergencyContact({ name: "Sister", phone: "+91 98765 43211", relationship: "Sister" });
    this.createEmergencyContact({ name: "Best Friend", phone: "+91 98765 43212", relationship: "Friend" });

    // Add some default activity logs
    this.createActivityLog({ type: "journey", description: "Safe journey completed" });
    this.createActivityLog({ type: "location_share", description: "Location shared with contacts" });
    this.createActivityLog({ type: "settings_update", description: "App settings updated" });
  }

  async getEmergencyContacts(): Promise<EmergencyContact[]> {
    return Array.from(this.contacts.values()).filter(contact => contact.isActive);
  }

  async getEmergencyContact(id: number): Promise<EmergencyContact | undefined> {
    return this.contacts.get(id);
  }

  async createEmergencyContact(insertContact: InsertEmergencyContact): Promise<EmergencyContact> {
    const id = this.currentContactId++;
    const contact: EmergencyContact = {
      ...insertContact,
      id,
      isActive: true,
      createdAt: new Date(),
    };
    this.contacts.set(id, contact);
    return contact;
  }

  async updateEmergencyContact(id: number, updateData: Partial<InsertEmergencyContact>): Promise<EmergencyContact | undefined> {
    const contact = this.contacts.get(id);
    if (!contact) return undefined;

    const updated = { ...contact, ...updateData };
    this.contacts.set(id, updated);
    return updated;
  }

  async deleteEmergencyContact(id: number): Promise<boolean> {
    const contact = this.contacts.get(id);
    if (!contact) return false;

    const updated = { ...contact, isActive: false };
    this.contacts.set(id, updated);
    return true;
  }

  async getActivityLogs(): Promise<ActivityLog[]> {
    return Array.from(this.logs.values()).sort((a, b) => 
      new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime()
    );
  }

  async createActivityLog(insertLog: InsertActivityLog): Promise<ActivityLog> {
    const id = this.currentLogId++;
    const log: ActivityLog = {
      ...insertLog,
      id,
      timestamp: new Date(),
    };
    this.logs.set(id, log);
    return log;
  }

  async getAppSettings(): Promise<AppSettings> {
    return this.settings;
  }

  async updateAppSettings(updateData: Partial<InsertAppSettings>): Promise<AppSettings> {
    this.settings = {
      ...this.settings,
      ...updateData,
      updatedAt: new Date(),
    };
    return this.settings;
  }
}

export const storage = new MemStorage();
