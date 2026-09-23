import { Users, UserPlus, Phone, Mail } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import StatusBar from "@/components/status-bar";
import PathAwareLogo from "@/components/pathaware-logo";
import BottomNavigation from "@/components/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { EmergencyContact } from "@shared/schema";

export default function Contacts() {
  const { toast } = useToast();
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    email: '',
    relationship: ''
  });

  const { data: contacts, isLoading } = useQuery({
    queryKey: ['/api/emergency-contacts'],
  });

  const addContactMutation = useMutation({
    mutationFn: async (contact: typeof newContact) => {
      const response = await apiRequest('POST', '/api/emergency-contacts', contact);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/emergency-contacts'] });
      setIsAddingContact(false);
      setNewContact({ name: '', phone: '', email: '', relationship: '' });
      toast({
        title: "Contact added",
        description: "Emergency contact has been added successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add contact. Please try again.",
        variant: "destructive",
      });
    }
  });

  const deleteContactMutation = useMutation({
    mutationFn: async (contactId: number) => {
      await apiRequest('DELETE', `/api/emergency-contacts/${contactId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/emergency-contacts'] });
      toast({
        title: "Contact deleted",
        description: "Emergency contact has been removed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete contact. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleAddContact = () => {
    if (!newContact.name || !newContact.phone) {
      toast({
        title: "Missing information",
        description: "Please provide at least name and phone number.",
        variant: "destructive",
      });
      return;
    }
    addContactMutation.mutate(newContact);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getGradientClass = (index: number) => {
    const gradients = [
      'from-pink-400 to-purple-500',
      'from-blue-400 to-cyan-500',
      'from-amber-400 to-orange-500',
      'from-green-400 to-emerald-500',
      'from-indigo-400 to-purple-500',
    ];
    return gradients[index % gradients.length];
  };

  return (
    <>
      <StatusBar />
      <div className="px-6 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-safety-blue" />
            <h1 className="text-xl font-semibold">Emergency Contacts</h1>
          </div>
          <Dialog open={isAddingContact} onOpenChange={setIsAddingContact}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-safety-blue hover:bg-blue-600">
                <UserPlus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Emergency Contact</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={newContact.name}
                    onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter contact name"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={newContact.phone}
                    onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <Label htmlFor="relationship">Relationship</Label>
                  <Input
                    id="relationship"
                    value={newContact.relationship}
                    onChange={(e) => setNewContact(prev => ({ ...prev, relationship: e.target.value }))}
                    placeholder="e.g., Mother, Friend, Partner"
                  />
                </div>
                <Button 
                  onClick={handleAddContact}
                  disabled={addContactMutation.isPending}
                  className="w-full bg-safety-blue hover:bg-blue-600"
                >
                  {addContactMutation.isPending ? 'Adding...' : 'Add Contact'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {contacts?.map((contact: EmergencyContact, index: number) => (
              <Card key={contact.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 bg-gradient-to-r ${getGradientClass(index)} rounded-full flex items-center justify-center`}>
                        <span className="text-white font-semibold">
                          {getInitials(contact.name)}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{contact.name}</p>
                        <p className="text-sm text-gray-600">{contact.phone}</p>
                        {contact.relationship && (
                          <p className="text-xs text-gray-500">{contact.relationship}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-trust-green hover:text-green-600"
                        onClick={() => { window.location.href = `tel:${contact.phone.replace(/[^+\d]/g, '')}`; }}
                        title={`Call ${contact.name}`}
                      >
                        <Phone className="w-4 h-4" />
                      </Button>
                      {contact.email && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-safety-blue hover:text-blue-600"
                          onClick={() => { window.location.href = `mailto:${contact.email}`; }}
                          title={`Email ${contact.name}`}
                        >
                          <Mail className="w-4 h-4" />
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-alert-red hover:text-red-600"
                        onClick={() => deleteContactMutation.mutate(contact.id)}
                        disabled={deleteContactMutation.isPending}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {contacts?.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No emergency contacts added yet</p>
              <p className="text-sm text-gray-500 mt-2">
                Add contacts who should be notified during emergencies
              </p>
            </CardContent>
          </Card>
        )}
      </div>
      <div className="h-20"></div>
      <BottomNavigation />
    </>
  );
}
