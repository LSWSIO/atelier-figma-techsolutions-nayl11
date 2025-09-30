import { useState } from 'react';
import { Plus, AlertTriangle, Clock, Users, CheckCircle, Search, Filter } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Input } from './ui/input';
import type { Ticket, User, Screen, TicketStatus } from '../App';

interface DashboardProps {
  tickets: Ticket[];
  users: User[];
  onNavigate: (screen: Screen, ticketId?: string) => void;
  onUpdateTicket: (ticketId: string, updates: Partial<Ticket>) => void;
}

export function Dashboard({ tickets, users, onNavigate, onUpdateTicket }: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');

  const urgentTickets = tickets.filter(t => t.status === 'urgent');
  const inProgressTickets = tickets.filter(t => t.status === 'en_cours');
  const assignedTickets = tickets.filter(t => t.status === 'assigne');
  const resolvedTickets = tickets.filter(t => t.status === 'resolu');

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case 'urgent': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'en_cours': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50';
      case 'assigne': return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
      case 'resolu': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critique': return 'text-red-600';
      case 'haute': return 'text-orange-600';
      case 'normale': return 'text-violet-600';
      case 'basse': return 'text-slate-600';
      default: return 'text-slate-600';
    }
  };

  const getStatusIcon = (status: TicketStatus) => {
    switch (status) {
      case 'urgent': return <AlertTriangle className="w-4 h-4" />;
      case 'en_cours': return <Clock className="w-4 h-4" />;
      case 'assigne': return <Users className="w-4 h-4" />;
      case 'resolu': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `${diffInMinutes}min`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}j`;
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-violet-900 mb-2">Dashboard TechSolutions</h1>
          <p className="text-slate-600">Gestion centralisée des tickets de support technique</p>
        </div>
        <Button 
          onClick={() => onNavigate('create-ticket')}
          className="bg-violet-600 hover:bg-violet-700 min-h-[44px] md:min-h-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau ticket
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 mb-8">
        <Card className="p-4 md:p-6 bg-gradient-to-br from-red-50 to-red-100/50 border-red-200/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Tickets urgents</p>
              <p className="text-2xl font-bold text-red-600">{urgentTickets.length}</p>
            </div>
            <div className="p-3 bg-red-500/20 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
          </div>
        </Card>

        <Card className="p-4 md:p-6 bg-gradient-to-br from-cyan-50 to-cyan-100/50 border-cyan-200/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">En cours</p>
              <p className="text-2xl font-bold text-cyan-600">{inProgressTickets.length}</p>
            </div>
            <div className="p-3 bg-cyan-500/20 rounded-lg">
              <Clock className="w-6 h-6 text-cyan-500" />
            </div>
          </div>
        </Card>

        <Card className="p-4 md:p-6 bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Assignés</p>
              <p className="text-2xl font-bold text-amber-600">{assignedTickets.length}</p>
            </div>
            <div className="p-3 bg-amber-500/20 rounded-lg">
              <Users className="w-6 h-6 text-amber-500" />
            </div>
          </div>
        </Card>

        <Card className="p-4 md:p-6 bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Résolus (7j)</p>
              <p className="text-2xl font-bold text-emerald-600">{resolvedTickets.length}</p>
            </div>
            <div className="p-3 bg-emerald-500/20 rounded-lg">
              <CheckCircle className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Urgent Tickets Section */}
      {urgentTickets.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h2 className="text-red-700">Tickets urgents ({urgentTickets.length})</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {urgentTickets.map(ticket => (
              <Card 
                key={ticket.id}
                className="p-4 md:p-6 bg-gradient-to-r from-red-50 to-red-100/30 border-red-200/50 cursor-pointer hover:shadow-md transition-all"
                onClick={() => onNavigate('ticket-detail', ticket.id)}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge className="bg-red-500/20 text-red-600 border-red-500/50 font-mono">
                        {ticket.id}
                      </Badge>
                      <Badge className={`${getPriorityColor(ticket.priority)} border-current/30`}>
                        {ticket.priority}
                      </Badge>
                      <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300">
                        {ticket.category}
                      </Badge>
                    </div>
                    <h3 className="font-medium mb-2">{ticket.title}</h3>
                    <p className="text-slate-600 text-sm mb-2">{ticket.clientName}</p>
                    <p className="text-slate-700 text-sm line-clamp-2">{ticket.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600 mb-1">Assigné à</p>
                    <p className="font-medium">{ticket.assignedTech}</p>
                    <p className="text-xs text-slate-500 mt-2">{formatTimeAgo(ticket.updatedAt)}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Rechercher par titre, client ou description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 min-h-[44px] md:min-h-auto"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TicketStatus | 'all')}
            className="px-3 py-2 border border-slate-300 rounded-md bg-white min-h-[44px] md:min-h-auto"
          >
            <option value="all">Tous les statuts</option>
            <option value="urgent">🚨 Urgent</option>
            <option value="en_cours">⏳ En cours</option>
            <option value="assigne">👥 Assigné</option>
            <option value="resolu">✅ Résolu</option>
          </select>
        </div>
      </div>

      {/* Team Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="lg:col-span-2">
          <h2 className="mb-4">Tous les tickets ({filteredTickets.length})</h2>
          <div className="space-y-3">
            {filteredTickets.length === 0 ? (
              <Card className="p-8 text-center text-slate-500">
                Aucun ticket trouvé
              </Card>
            ) : (
              filteredTickets.map(ticket => (
                <Card 
                  key={ticket.id}
                  className="p-4 cursor-pointer hover:shadow-sm transition-all bg-gradient-to-r from-white to-violet-50/20 border-violet-200/30"
                  onClick={() => onNavigate('ticket-detail', ticket.id)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="font-mono text-xs">
                          {ticket.id}
                        </Badge>
                        <Badge className={getStatusColor(ticket.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(ticket.status)}
                            {ticket.status.replace('_', ' ')}
                          </div>
                        </Badge>
                        <Badge className={`${getPriorityColor(ticket.priority)} border-current/30`}>
                          {ticket.priority}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h4 className="font-medium mb-1">{ticket.title}</h4>
                          <p className="text-slate-600 text-sm mb-1">{ticket.clientName}</p>
                          <p className="text-slate-600 text-sm">{ticket.category}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">{ticket.assignedTech}</p>
                          <p className="text-slate-500">{formatTimeAgo(ticket.updatedAt)}</p>
                        </div>
                        <div className="text-right">
                          {ticket.estimatedTime && (
                            <p className="text-sm text-slate-600">
                              Estimation: {ticket.estimatedTime}h
                            </p>
                          )}
                          {ticket.location && (
                            <p className="text-xs text-slate-500">{ticket.location}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Team Status */}
        <div>
          <Card className="p-6 bg-gradient-to-br from-white to-slate-50/30 border-slate-200/50 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-5 h-5 text-violet-600" />
              <h3>Charge de l'équipe</h3>
            </div>
            
            <div className="space-y-4">
              {users.map(user => (
                <div key={user.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-slate-600 capitalize">
                        {user.role.replace('_', ' ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div 
                        className={`w-3 h-3 rounded-full ${
                          user.available ? 'bg-emerald-500' : 'bg-red-500'
                        }`}
                      />
                      <span className="text-sm text-slate-600">
                        {tickets.filter(t => t.assignedTo === user.id && t.status !== 'resolu').length} actifs
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Charge de travail</span>
                      <span>{user.workload}%</span>
                    </div>
                    <Progress 
                      value={user.workload} 
                      className="h-2"
                    />
                  </div>
                  
                  <div className="text-xs text-slate-500">
                    Statut: {user.available ? 'Disponible' : 'Occupé'}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-200">
              <div className="text-sm text-slate-600 space-y-1">
                <p>
                  <span className="text-red-600 font-medium">{urgentTickets.length}</span> tickets urgents
                </p>
                <p>
                  <span className="text-cyan-600 font-medium">{inProgressTickets.length}</span> en cours
                </p>
                <p>
                  <span className="text-amber-600 font-medium">{assignedTickets.length}</span> assignés
                </p>
                <p>
                  <span className="text-emerald-600 font-medium">{resolvedTickets.length}</span> résolus cette semaine
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}