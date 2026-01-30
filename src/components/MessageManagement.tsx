import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MessageSquare, Reply, Mail, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  admin_response: string | null;
  created_at: string;
}

export function MessageManagement() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [responseText, setResponseText] = useState('');
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      toast.error('Failed to fetch messages');
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ status: 'read' })
        .eq('id', messageId);

      if (error) throw error;
      fetchMessages();
    } catch (error) {
      toast.error('Failed to update message status');
      console.error('Error updating message:', error);
    }
  };

  const submitResponse = async () => {
    if (!selectedMessage || !responseText.trim()) return;

    try {
      setResponding(true);
      const { error } = await supabase
        .from('messages')
        .update({ 
          admin_response: responseText,
          status: 'responded'
        })
        .eq('id', selectedMessage.id);

      if (error) throw error;
      toast.success('Response saved successfully');
      setResponseText('');
      setSelectedMessage(null);
      fetchMessages();
    } catch (error) {
      toast.error('Failed to save response');
      console.error('Error saving response:', error);
    } finally {
      setResponding(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread': return 'bg-red-100 text-red-800';
      case 'read': return 'bg-yellow-100 text-yellow-800';
      case 'responded': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'unread': return <Mail className="h-4 w-4" />;
      case 'read': return <Clock className="h-4 w-4" />;
      case 'responded': return <CheckCircle className="h-4 w-4" />;
      default: return <Mail className="h-4 w-4" />;
    }
  };

  if (loading) {
    return <div>Loading messages...</div>;
  }

  const unreadCount = messages.filter(m => m.status === 'unread').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Message Management</h3>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>Unread: {unreadCount}</span>
          <span>Total: {messages.length}</span>
        </div>
      </div>

      <div className="grid gap-4">
        {messages.map((message) => (
          <Card key={message.id} className={message.status === 'unread' ? 'border-l-4 border-l-red-500' : ''}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{message.subject}</h4>
                    <Badge className={getStatusColor(message.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(message.status)}
                        {message.status}
                      </div>
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                    <div>
                      <span className="font-medium">From:</span> {message.name}
                      <br />
                      <span className="font-medium">Email:</span> {message.email}
                      <br />
                      <span className="font-medium">Date:</span> {new Date(message.created_at).toLocaleString()}
                    </div>
                    
                    <div>
                      <span className="font-medium">Message:</span>
                      <p className="text-muted-foreground mt-1 line-clamp-2">
                        {message.message}
                      </p>
                    </div>
                  </div>

                  {message.admin_response && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium text-sm text-blue-800">Admin Response:</span>
                      <p className="text-sm text-blue-700 mt-1">{message.admin_response}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  {message.status === 'unread' && (
                    <Button size="sm" variant="outline" onClick={() => markAsRead(message.id)}>
                      Mark as Read
                    </Button>
                  )}
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" onClick={() => setSelectedMessage(message)}>
                        <MessageSquare className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{selectedMessage?.subject}</DialogTitle>
                        <DialogDescription>
                          Message from {selectedMessage?.name} ({selectedMessage?.email})
                        </DialogDescription>
                      </DialogHeader>
                      
                      {selectedMessage && (
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2">Message Details</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                              <div>
                                <p><strong>From:</strong> {selectedMessage.name}</p>
                                <p><strong>Email:</strong> {selectedMessage.email}</p>
                                <p><strong>Date:</strong> {new Date(selectedMessage.created_at).toLocaleString()}</p>
                              </div>
                              <div>
                                <p><strong>Status:</strong> {selectedMessage.status}</p>
                              </div>
                            </div>
                            
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                            </div>
                          </div>

                          {selectedMessage.admin_response && (
                            <div>
                              <h4 className="font-semibold mb-2">Previous Response</h4>
                              <div className="p-4 bg-blue-50 rounded-lg">
                                <p className="whitespace-pre-wrap">{selectedMessage.admin_response}</p>
                              </div>
                            </div>
                          )}

                          <div>
                            <h4 className="font-semibold mb-2">
                              {selectedMessage.admin_response ? 'Update Response' : 'Send Response'}
                            </h4>
                            <Textarea
                              placeholder="Type your response here..."
                              value={responseText}
                              onChange={(e) => setResponseText(e.target.value)}
                              rows={4}
                              className="mb-2"
                            />
                            <div className="flex gap-2">
                              <Button onClick={submitResponse} disabled={responding || !responseText.trim()}>
                                <Reply className="h-4 w-4 mr-2" />
                                {responding ? 'Saving...' : 'Send Response'}
                              </Button>
                              <Button variant="outline" onClick={() => {
                                setSelectedMessage(null);
                                setResponseText('');
                              }}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {messages.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No messages found. Customer messages will appear here.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}