import { useState } from 'react';
import { ArrowLeft, Shield, User, Clock, Server, Zap, Camera, Paperclip, Send, Activity, TrendingUp } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import type { Incident, TeamMember, View, IncidentStatus, IncidentSeverity } from '../App';

interface IncidentDetailsProps {
  incident: Incident;
  teamMembers: TeamMember[];
  onNavigate: (view: View) => void;
  onUpdateIncident: (incidentId: string, updates: Partial<Incident>) => void;
  onAddActivity: (incidentId: string, action: string, type?: 'comment' | 'update' | 'escalation' | 'resolution') => void;
  onAddAttachment: (incidentId: string, file: File) => void;
}

export function IncidentDetails({ 
  incident, 
  teamMembers, 
  onNavigate, 
  onUpdateIncident, 
  onAddActivity, 
  onAddAttachment 
}: IncidentDetailsProps) {
  const [newActivity, setNewActivity] = useState('');
  const [isAddingActivity, setIsAddingActivity] = useState(false);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'medium': return 'bg-blue-400/20 text-blue-400 border-blue-400/50';
      case 'low': return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
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

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  };

  const handleSubmitActivity = () => {
    if (newActivity.trim()) {
      onAddActivity(incident.id, newActivity.trim());
      setNewActivity('');
      setIsAddingActivity(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onAddAttachment(incident.id, file);
    }
  };

  const handleStatusChange = (newStatus: IncidentStatus) => {
    onUpdateIncident(incident.id, { status: newStatus });
    onAddActivity(incident.id, `Status changed to ${newStatus}`, 'update');
  };

  const handleSeverityChange = (newSeverity: IncidentSeverity) => {
    onUpdateIncident(incident.id, { severity: newSeverity });
    onAddActivity(incident.id, `Severity changed to ${newSeverity}`, 'escalation');
  };

  const handleAssignmentChange = (newAssignedTo: string) => {
    const member = teamMembers.find(m => m.id === newAssignedTo);
    onUpdateIncident(incident.id, { 
      assignedTo: newAssignedTo,
      assignedEngineer: member?.name 
    });
    onAddActivity(incident.id, `Reassigned to ${member?.name}`, 'update');
  };

  const getHealthScore = () => {
    const errorRate = incident.errorRate || 0;
    const responseTime = (incident.responseTime || 0) / 1000;
    
    if (errorRate > 10 || responseTime > 30) return { score: 25, color: 'text-red-400', bg: 'bg-red-500' };
    if (errorRate > 5 || responseTime > 15) return { score: 50, color: 'text-orange-400', bg: 'bg-orange-500' };
    if (errorRate > 2 || responseTime > 5) return { score: 75, color: 'text-yellow-400', bg: 'bg-yellow-500' };
    return { score: 95, color: 'text-green-400', bg: 'bg-green-500' };
  };

  const healthScore = getHealthScore();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onNavigate('dashboard')}
          className="bg-zinc-900 border-zinc-700 text-gray-300 hover:bg-zinc-800 min-h-[44px] md:min-h-auto"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="outline" className="bg-zinc-800 text-gray-300 border-zinc-700 font-mono text-base px-3 py-1">
              {incident.id}
            </Badge>
            {incident.status === 'active' && (
              <div className="flex items-center gap-1 text-red-400">
                <Shield className="w-5 h-5" />
                <span className="font-medium">CRITICAL</span>
              </div>
            )}
          </div>
          <h1 className="text-white text-2xl font-medium">{incident.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* System Health Metrics */}
          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <h3 className="text-white text-lg font-medium mb-4">System Health Overview</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-gray-400 text-sm mb-2">Service Health</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Progress value={healthScore.score} className="h-3 bg-zinc-800" />
                  </div>
                  <span className={`${healthScore.color} font-medium`}>{healthScore.score}%</span>
                </div>
              </div>
              
              <div>
                <p className="text-gray-400 text-sm mb-2">Error Rate</p>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 font-medium">{incident.errorRate}%</span>
                </div>
              </div>
              
              <div>
                <p className="text-gray-400 text-sm mb-2">Response Time</p>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-orange-400" />
                  <span className="text-orange-400 font-medium">{Math.round((incident.responseTime || 0) / 1000)}s</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Incident Details */}
          <Card className={`p-6 ${incident.status === 'active' ? 'bg-gradient-to-r from-red-900/30 to-red-800/20 border-red-500/50' : 'bg-zinc-900 border-zinc-800'}`}>
            <h3 className="text-white text-lg font-medium mb-4">Incident Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Affected System</label>
                  <p className="text-white font-medium">{incident.systemName}</p>
                  <p className="text-sm text-gray-400">{incident.systemId}</p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Service</label>
                  <p className="text-white font-medium">{incident.service || 'Not specified'}</p>
                  <p className="text-sm text-gray-400">{incident.category}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">{incident.environment}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">{incident.affectedUsers?.toLocaleString()} users affected</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Severity</label>
                  <Select value={incident.severity} onValueChange={handleSeverityChange}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white min-h-[44px] md:min-h-auto">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="critical">🔴 Critical</SelectItem>
                      <SelectItem value="high">🟠 High</SelectItem>
                      <SelectItem value="medium">🔵 Medium</SelectItem>
                      <SelectItem value="low">⚪ Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Status</label>
                  <Select value={incident.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white min-h-[44px] md:min-h-auto">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="active">🚨 Active</SelectItem>
                      <SelectItem value="investigating">🔍 Investigating</SelectItem>
                      <SelectItem value="monitoring">👁️ Monitoring</SelectItem>
                      <SelectItem value="resolved">✅ Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Assigned Engineer</label>
                  <Select value={incident.assignedTo || ''} onValueChange={handleAssignmentChange}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white min-h-[44px] md:min-h-auto">
                      <SelectValue placeholder="Assign engineer" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      {teamMembers.map(member => (
                        <SelectItem key={member.id} value={member.id}>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              member.status === 'online' ? 'bg-green-500' : 
                              member.status === 'busy' ? 'bg-yellow-500' : 'bg-gray-500'
                            }`} />
                            {member.name} ({member.role.replace('_', ' ')})
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </Card>

          {/* Problem Description */}
          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <h3 className="text-white text-lg font-medium mb-3">Problem Description</h3>
            <p className="text-gray-300 leading-relaxed">{incident.description}</p>
          </Card>

          {/* Attachments */}
          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-medium">Logs & Attachments ({incident.attachments.length})</h3>
              <div className="flex gap-2">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept="image/*,.log,.txt,.json"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="bg-zinc-800 border-zinc-700 text-gray-300 hover:bg-zinc-700 min-h-[44px] md:min-h-auto"
                >
                  <Paperclip className="w-4 h-4 mr-2" />
                  Upload
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.capture = 'environment';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) onAddAttachment(incident.id, file);
                    };
                    input.click();
                  }}
                  className="bg-zinc-800 border-zinc-700 text-gray-300 hover:bg-zinc-700 min-h-[44px] md:min-h-auto"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Screenshot
                </Button>
              </div>
            </div>
            
            {incident.attachments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No attachments uploaded</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {incident.attachments.map(attachment => (
                  <div key={attachment.id} className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg">
                    <div className="flex-shrink-0">
                      {attachment.type === 'screenshot' ? (
                        <img 
                          src={attachment.url} 
                          alt={attachment.filename}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-zinc-700 rounded flex items-center justify-center">
                          <Paperclip className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{attachment.filename}</p>
                      <p className="text-sm text-gray-400">{attachment.uploadedBy}</p>
                      <p className="text-xs text-gray-500">{formatDateTime(attachment.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Timeline */}
          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <h3 className="text-white text-lg font-medium mb-4">Timeline</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-400">Detected:</span>
                <p className="text-white font-medium">{formatDateTime(incident.detectedAt)}</p>
              </div>
              <div>
                <span className="text-gray-400">Last Update:</span>
                <p className="text-white font-medium">{formatDateTime(incident.lastUpdate)}</p>
              </div>
              <div className="pt-3 border-t border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className={`px-3 py-1 rounded-full text-sm ${getSeverityColor(incident.severity)}`}>
                    {incident.severity.toUpperCase()}
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-lg text-sm mt-2 ${getStatusColor(incident.status)}`}>
                  {incident.status === 'active' ? 'ACTIVE' :
                   incident.status === 'investigating' ? 'INVESTIGATING' :
                   incident.status === 'monitoring' ? 'MONITORING' : 'RESOLVED'}
                </div>
              </div>
            </div>
          </Card>

          {/* Activity Timeline */}
          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <h3 className="text-white text-lg font-medium mb-4">Activity Timeline</h3>
            
            <div className="space-y-4 mb-4">
              {incident.activities.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No activity recorded</p>
              ) : (
                incident.activities.map(activity => (
                  <div key={activity.id} className="border-l-2 border-cyan-500/50 pl-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="w-4 h-4 text-gray-400" />
                      <span className="text-white font-medium text-sm">{activity.user}</span>
                      <span className="text-xs text-gray-500">
                        {formatDateTime(activity.timestamp)}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm">{activity.action}</p>
                  </div>
                ))
              )}
            </div>
            
            {/* Add Activity */}
            {isAddingActivity ? (
              <div className="space-y-3">
                <Textarea
                  placeholder="Add activity update..."
                  value={newActivity}
                  onChange={(e) => setNewActivity(e.target.value)}
                  className="min-h-[100px] bg-zinc-800 border-zinc-700 text-white"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSubmitActivity}
                    disabled={!newActivity.trim()}
                    className="bg-cyan-500 hover:bg-cyan-600 text-black min-h-[44px] md:min-h-auto"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Update
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsAddingActivity(false);
                      setNewActivity('');
                    }}
                    className="bg-zinc-800 border-zinc-700 text-gray-300 hover:bg-zinc-700 min-h-[44px] md:min-h-auto"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddingActivity(true)}
                className="w-full bg-zinc-800 border-zinc-700 text-gray-300 hover:bg-zinc-700 min-h-[44px] md:min-h-auto"
              >
                Add Activity
              </Button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}