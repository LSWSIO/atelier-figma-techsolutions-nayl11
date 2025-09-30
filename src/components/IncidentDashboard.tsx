import { Shield, Zap, Users, Activity, Plus, TrendingUp, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import type { Incident, TeamMember, View } from '../App';

interface IncidentDashboardProps {
  incidents: Incident[];
  teamMembers: TeamMember[];
  onNavigate: (view: View, incidentId?: string) => void;
  onUpdateIncident: (incidentId: string, updates: Partial<Incident>) => void;
}

export function IncidentDashboard({ incidents, teamMembers, onNavigate }: IncidentDashboardProps) {
  const activeIncidents = incidents.filter(i => i.status === 'active');
  const investigatingIncidents = incidents.filter(i => i.status === 'investigating');
  const monitoringIncidents = incidents.filter(i => i.status === 'monitoring');
  const resolvedIncidents = incidents.filter(i => i.status === 'resolved');

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'medium': return 'bg-blue-400/20 text-blue-400 border-blue-400/50';
      case 'low': return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <AlertCircle className="w-4 h-4" />;
      case 'investigating': return <Activity className="w-4 h-4" />;
      case 'monitoring': return <Clock className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-red-400 bg-red-500/10';
      case 'investigating': return 'text-blue-400 bg-blue-500/10';
      case 'monitoring': return 'text-yellow-400 bg-yellow-500/10';
      case 'resolved': return 'text-green-400 bg-green-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const totalAffectedUsers = incidents
    .filter(i => i.status !== 'resolved')
    .reduce((sum, incident) => sum + (incident.affectedUsers || 0), 0);

  const avgResponseTime = incidents
    .filter(i => i.responseTime)
    .reduce((sum, incident, _, arr) => sum + (incident.responseTime || 0) / arr.length, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-cyan-400" />
            <h1 className="text-white text-2xl font-medium">Incident Command Center</h1>
          </div>
          <p className="text-gray-400">Real-time system monitoring and incident management</p>
        </div>
        <Button 
          onClick={() => onNavigate('create-incident')}
          className="bg-cyan-500 hover:bg-cyan-600 text-black font-medium min-h-[44px] md:min-h-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Report Incident
        </Button>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Incidents</p>
              <p className="text-2xl font-bold text-red-400">{activeIncidents.length}</p>
            </div>
            <div className="p-3 bg-red-500/20 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Affected Users</p>
              <p className="text-2xl font-bold text-orange-400">{totalAffectedUsers.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-orange-500/20 rounded-lg">
              <Users className="w-6 h-6 text-orange-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg Response Time</p>
              <p className="text-2xl font-bold text-blue-400">{Math.round(avgResponseTime / 1000)}s</p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Zap className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">System Health</p>
              <p className="text-2xl font-bold text-green-400">94%</p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Critical Incidents */}
      {activeIncidents.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <h2 className="text-red-400 text-xl font-medium">Critical Incidents ({activeIncidents.length})</h2>
          </div>
          <div className="space-y-4">
            {activeIncidents.map(incident => (
              <Card 
                key={incident.id}
                className="bg-gradient-to-r from-red-900/30 to-red-800/20 border-red-500/50 p-6 cursor-pointer hover:from-red-900/40 hover:to-red-800/30 transition-all"
                onClick={() => onNavigate('incident-details', incident.id)}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/50 font-mono">
                        {incident.id}
                      </Badge>
                      <Badge className={getSeverityColor(incident.severity)}>
                        {incident.severity.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="bg-zinc-800 text-gray-300 border-zinc-700">
                        {incident.systemName}
                      </Badge>
                    </div>
                    <h3 className="text-white font-medium mb-2">{incident.title}</h3>
                    <p className="text-gray-400 text-sm mb-3">{incident.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{incident.affectedUsers?.toLocaleString()} users affected</span>
                      <span>Error rate: {incident.errorRate}%</span>
                      <span>Response: {Math.round((incident.responseTime || 0) / 1000)}s</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400 mb-1">Assigned to</p>
                    <p className="text-white font-medium">{incident.assignedEngineer}</p>
                    <p className="text-xs text-gray-500 mt-2">{formatTimeAgo(incident.lastUpdate)}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incident Columns */}
        <div className="lg:col-span-2 space-y-6">
          {[
            { status: 'investigating', incidents: investigatingIncidents, title: 'Investigating', color: 'blue' },
            { status: 'monitoring', incidents: monitoringIncidents, title: 'Monitoring', color: 'yellow' },
            { status: 'resolved', incidents: resolvedIncidents, title: 'Recently Resolved', color: 'green' }
          ].map(({ status, incidents: statusIncidents, title, color }) => (
            <div key={status}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${getStatusColor(status)}`}>
                  {getStatusIcon(status)}
                </div>
                <h3 className="text-white text-lg font-medium">
                  {title} ({statusIncidents.length})
                </h3>
              </div>
              
              <div className="space-y-3">
                {statusIncidents.length === 0 ? (
                  <Card className="bg-zinc-900 border-zinc-800 p-6 text-center text-gray-500">
                    No incidents in {title.toLowerCase()}
                  </Card>
                ) : (
                  statusIncidents.map(incident => (
                    <Card 
                      key={incident.id}
                      className="bg-zinc-900 border-zinc-800 p-4 cursor-pointer hover:bg-zinc-800/50 transition-colors"
                      onClick={() => onNavigate('incident-details', incident.id)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="bg-zinc-800 text-gray-300 border-zinc-700 font-mono text-xs">
                              {incident.id}
                            </Badge>
                            <Badge className={getSeverityColor(incident.severity)}>
                              {incident.severity}
                            </Badge>
                          </div>
                          <h4 className="text-white font-medium mb-1">{incident.title}</h4>
                          <p className="text-gray-400 text-sm mb-1">{incident.systemName}</p>
                          <p className="text-gray-500 text-sm">{incident.category}</p>
                        </div>
                        <div className="text-right text-sm">
                          <p className="text-gray-400">{incident.assignedEngineer}</p>
                          <p className="text-gray-500">{formatTimeAgo(incident.lastUpdate)}</p>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Team Status */}
        <div>
          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-5 h-5 text-cyan-400" />
              <h3 className="text-white text-lg font-medium">Team Status</h3>
            </div>
            
            <div className="space-y-4">
              {teamMembers.map(member => (
                <div key={member.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-white font-medium">{member.name}</p>
                      <p className="text-sm text-gray-400 capitalize">
                        {member.role.replace('_', ' ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div 
                        className={`w-3 h-3 rounded-full ${
                          member.status === 'online' ? 'bg-green-500' : 
                          member.status === 'busy' ? 'bg-yellow-500' : 'bg-gray-500'
                        }`}
                      />
                      <span className="text-sm text-gray-400">
                        {member.currentIncidents} active
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Workload</span>
                      <span>{member.currentIncidents * 25}%</span>
                    </div>
                    <Progress 
                      value={member.currentIncidents * 25} 
                      className="h-2 bg-zinc-800"
                    />
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Avg response: {member.responseTime}min</span>
                    <span className="capitalize">{member.status}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-zinc-800">
              <div className="text-sm text-gray-400 space-y-1">
                <p>
                  <span className="text-cyan-400 font-medium">{incidents.filter(i => i.status === 'active').length}</span> critical incidents
                </p>
                <p>
                  <span className="text-blue-400 font-medium">{incidents.filter(i => i.status === 'investigating').length}</span> under investigation
                </p>
                <p>
                  <span className="text-yellow-400 font-medium">{incidents.filter(i => i.status === 'monitoring').length}</span> being monitored
                </p>
                <p>
                  <span className="text-green-400 font-medium">{totalAffectedUsers.toLocaleString()}</span> users affected
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}