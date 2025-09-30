import { useState } from 'react';
import { ArrowLeft, User, Clock, Paperclip, Send, MapPin, Tool, Phone, Mail, AlertTriangle } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import type { Ticket, User as AppUser, Screen, TicketStatus, TicketPriority } from '../App';

interface TicketDetailProps {
  ticket: Ticket;
  users: AppUser[];
  onNavigate: (screen: Screen) => void;
  onUpdateTicket: (ticketId: string, updates: Partial<Ticket>) => void;
  onAddComment: (ticketId: string, content: string) => void;
  onAddAttachment: (ticketId: string, file: File) => void;
}

export function TicketDetail({ 
  ticket, 
  users, 
  onNavigate, 
  onUpdateTicket, 
  onAddComment, 
  onAddAttachment 
}: TicketDetailProps) {
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case 'urgent': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'en_cours': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50';
      case 'assigne': return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
      case 'resolu': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  const getPriorityColor = (priority: TicketPriority) => {
    switch (priority) {
      case 'critique': return 'text-red-600 bg-red-50 border-red-200';
      case 'haute': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'normale': return 'text-violet-600 bg-violet-50 border-violet-200';
      case 'basse': return 'text-slate-600 bg-slate-50 border-slate-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      onAddComment(ticket.id, newComment.trim());
      setNewComment('');
      setIsAddingComment(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onAddAttachment(ticket.id, file);
    }
  };

  const handleStatusChange = (newStatus: TicketStatus) => {
    onUpdateTicket(ticket.id, { status: newStatus });
  };

  const handlePriorityChange = (newPriority: TicketPriority) => {
    onUpdateTicket(ticket.id, { priority: newPriority });
  };

  const handleAssignmentChange = (newAssignedTo: string) => {
    const user = users.find(u => u.id === newAssignedTo);
    onUpdateTicket(ticket.id, { 
      assignedTo: newAssignedTo,
      assignedTech: user?.name 
    });
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onNavigate('dashboard')}
          className="min-h-[44px] md:min-h-auto"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Badge className="font-mono text-base px-3 py-1">
              {ticket.id}
            </Badge>
            {ticket.status === 'urgent' && (
              <div className="flex items-center gap-1 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">URGENT</span>
              </div>
            )}
          </div>
          <h1 className="text-violet-900">{ticket.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Overview */}
          <Card className={`p-6 ${ticket.status === 'urgent' ? 'bg-gradient-to-r from-red-50 to-red-100/30 border-red-200/50' : 'bg-gradient-to-br from-white to-violet-50/30 border-violet-200/50 shadow-sm'}`}>
            <h3 className="mb-4">Détails du ticket</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-600 mb-1 block">Client</label>
                  <p className="font-medium">{ticket.clientName}</p>
                  <p className="text-sm text-slate-600">{ticket.clientId}</p>
                </div>
                
                <div>
                  <label className="text-sm text-slate-600 mb-1 block">Catégorie</label>
                  <p className="font-medium">{ticket.category}</p>
                  {ticket.subcategory && (
                    <p className="text-sm text-slate-600">{ticket.subcategory}</p>
                  )}
                </div>
                
                {ticket.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-700">{ticket.location}</span>
                  </div>
                )}
                
                {ticket.equipment && (
                  <div className="flex items-center gap-2">
                    <Tool className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-700">{ticket.equipment}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-600 mb-2 block">Priorité</label>
                  <Select value={ticket.priority} onValueChange={handlePriorityChange}>
                    <SelectTrigger className="min-h-[44px] md:min-h-auto">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critique">🔴 Critique</SelectItem>
                      <SelectItem value="haute">🟠 Haute</SelectItem>
                      <SelectItem value="normale">🔵 Normale</SelectItem>
                      <SelectItem value="basse">⚪ Basse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm text-slate-600 mb-2 block">Statut</label>
                  <Select value={ticket.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="min-h-[44px] md:min-h-auto">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent">🚨 Urgent</SelectItem>
                      <SelectItem value="en_cours">⏳ En cours</SelectItem>
                      <SelectItem value="assigne">👥 Assigné</SelectItem>
                      <SelectItem value="resolu">✅ Résolu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm text-slate-600 mb-2 block">Technicien assigné</label>
                  <Select value={ticket.assignedTo || ''} onValueChange={handleAssignmentChange}>
                    <SelectTrigger className="min-h-[44px] md:min-h-auto">
                      <SelectValue placeholder="Assigner un technicien" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${user.available ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            {user.name} ({user.role.replace('_', ' ')})
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {ticket.estimatedTime && (
                  <div>
                    <label className="text-sm text-slate-600 mb-1 block">Temps estimé</label>
                    <p className="font-medium">{ticket.estimatedTime}h</p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Problem Description */}
          <Card className="p-6 bg-gradient-to-br from-white to-slate-50/30 border-slate-200/50 shadow-sm">
            <h3 className="mb-3">Description du problème</h3>
            <p className="text-slate-700 leading-relaxed">{ticket.description}</p>
          </Card>

          {/* Attachments */}
          <Card className="p-6 bg-gradient-to-br from-white to-cyan-50/20 border-cyan-200/50 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3>Fichiers joints ({ticket.attachments.length})</h3>
              <div className="flex gap-2">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept="image/*,.pdf,.doc,.docx"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="min-h-[44px] md:min-h-auto"
                >
                  <Paperclip className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
              </div>
            </div>
            
            {ticket.attachments.length === 0 ? (
              <p className="text-slate-500 text-center py-8">Aucun fichier joint</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ticket.attachments.map(attachment => (
                  <div key={attachment.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                    <div className="flex-shrink-0">
                      {attachment.type === 'image' ? (
                        <img 
                          src={attachment.url} 
                          alt={attachment.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-slate-100 rounded flex items-center justify-center">
                          <Paperclip className="w-6 h-6 text-slate-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{attachment.name}</p>
                      <p className="text-sm text-slate-600">{attachment.uploadedBy}</p>
                      <p className="text-xs text-slate-500">{formatDateTime(attachment.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Overview */}
          <Card className="p-6 bg-gradient-to-br from-white to-slate-50/30 border-slate-200/50 shadow-sm">
            <h3 className="mb-4">Informations</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-slate-600">Créé le :</span>
                <p className="font-medium">{formatDateTime(ticket.createdAt)}</p>
              </div>
              <div>
                <span className="text-slate-600">Dernière mise à jour :</span>
                <p className="font-medium">{formatDateTime(ticket.updatedAt)}</p>
              </div>
              <div className="pt-3 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <Badge className={getPriorityColor(ticket.priority)}>
                    {ticket.priority.toUpperCase()}
                  </Badge>
                </div>
                <div className={`px-3 py-1 rounded-lg text-sm mt-2 ${getStatusColor(ticket.status)}`}>
                  {ticket.status === 'urgent' ? 'URGENT' :
                   ticket.status === 'en_cours' ? 'EN COURS' :
                   ticket.status === 'assigne' ? 'ASSIGNÉ' : 'RÉSOLU'}
                </div>
              </div>
            </div>
          </Card>

          {/* Comments Timeline */}
          <Card className="p-6 bg-gradient-to-br from-white to-violet-50/20 border-violet-200/50 shadow-sm">
            <h3 className="mb-4">Historique des échanges</h3>
            
            <div className="space-y-4 mb-4">
              {ticket.comments.length === 0 ? (
                <p className="text-slate-500 text-center py-4">Aucun commentaire</p>
              ) : (
                ticket.comments.map(comment => (
                  <div key={comment.id} className="border-l-2 border-violet-200 pl-4">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-slate-500" />
                      <span className="font-medium text-sm">{comment.author}</span>
                      <span className="text-xs text-slate-500">
                        {formatDateTime(comment.timestamp)}
                      </span>
                    </div>
                    <p className="text-slate-700 text-sm">{comment.content}</p>
                  </div>
                ))
              )}
            </div>
            
            {/* Add Comment */}
            {isAddingComment ? (
              <div className="space-y-3">
                <Textarea
                  placeholder="Ajouter un commentaire..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[100px]"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim()}
                    className="bg-violet-600 hover:bg-violet-700 min-h-[44px] md:min-h-auto"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Publier
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsAddingComment(false);
                      setNewComment('');
                    }}
                    className="min-h-[44px] md:min-h-auto"
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddingComment(true)}
                className="w-full min-h-[44px] md:min-h-auto"
              >
                Ajouter un commentaire
              </Button>
            )}
          </Card>

          {/* Contact Information */}
          {(ticket as any).contactPerson && (
            <Card className="p-6 bg-gradient-to-br from-white to-cyan-50/20 border-cyan-200/50 shadow-sm">
              <h3 className="mb-4">Contact</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-slate-600">Personne de contact :</span>
                  <p className="font-medium">{(ticket as any).contactPerson}</p>
                </div>
                {(ticket as any).contactPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-700">{(ticket as any).contactPhone}</span>
                  </div>
                )}
                {(ticket as any).contactEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-700">{(ticket as any).contactEmail}</span>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}