import { Phone, Mail, Plus, Trash2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { EmergencyContact } from "@shared/schema";

export default function EmergencyContacts() {
  const { toast } = useToast();
  
  const { data: contacts, isLoading } = useQuery({
    queryKey: ['/api/emergency-contacts'],
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

  const handleDeleteContact = (contactId: number) => {
    deleteContactMutation.mutate(contactId);
  };

  const handleAddContact = () => {
    // In a real app, this would open a contact picker or form
    toast({
      title: "Add Contact",
      description: "Contact picker would be opened here.",
    });
  };

  if (isLoading) {
    return (
      <div className="px-6 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Emergency Contacts</h2>
          <button className="text-safety-blue text-sm font-medium">
            <Plus className="w-4 h-4 mr-1 inline" />Add
          </button>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl p-4 animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Emergency Contacts</h2>
        <button 
          onClick={handleAddContact}
          className="text-safety-blue text-sm font-medium hover:text-blue-600"
        >
          <Plus className="w-4 h-4 mr-1 inline" />Add
        </button>
      </div>
      
      <div className="space-y-3">
        {contacts?.map((contact: EmergencyContact, index: number) => (
          <div key={contact.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 bg-gradient-to-r ${getGradientClass(index)} rounded-full flex items-center justify-center`}>
                  <span className="text-white font-medium text-sm">
                    {getInitials(contact.name)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">{contact.name}</p>
                  <p className="text-sm text-gray-500">{contact.phone}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  className="text-trust-green hover:text-green-600"
                  onClick={() => { window.location.href = `tel:${contact.phone.replace(/[^+\d]/g, '')}`; }}
                  title={`Call ${contact.name}`}
                >
                  <Phone className="w-4 h-4" />
                </button>
                {contact.email && (
                  <button
                    className="text-safety-blue hover:text-blue-600"
                    onClick={() => { if (contact.email) window.location.href = `mailto:${contact.email}`; }}
                    title={`Email ${contact.name}`}
                  >
                    <Mail className="w-4 h-4" />
                  </button>
                )}
                <button 
                  onClick={() => handleDeleteContact(contact.id)}
                  className="text-alert-red hover:text-red-600"
                  disabled={deleteContactMutation.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
