import { useState } from 'react';
import { IncidentDashboard } from './components/IncidentDashboard';
import { IncidentDetails } from './components/IncidentDetails';
import { CreateIncident } from './components/CreateIncident';

export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low';
export type IncidentStatus = 'active' | 'investigating' | 'monitoring' | 'resolved';
export type UserRole = 'sre_lead' | 'sre_engineer' | 'on_call' | 'security_analyst';

export interface TeamMember {
  id: string;
  name: string;
  role: UserRole;
  status: 'online' | 'busy' | 'offline';
  currentIncidents: number;
  responseTime: number; // minutes
}

export interface IncidentActivity {
  id: string;
  user: string;
  timestamp: Date;
  action: string;
  type: 'update' | 'escalation' | 'comment' | 'resolution';
}

export interface IncidentAttachment {
  id: string;
  filename: string;
  type: 'log' | 'screenshot' | 'metrics' | 'document';
  url: string;
  uploadedBy: string;
  timestamp: Date;
}

export interface Incident {
  id: string;
  systemId: string;
  systemName: string;
  title: string;
  description: string;
  status: IncidentStatus;
  severity: IncidentSeverity;
  category: string;
  service?: string;
  assignedTo?: string;
  assignedEngineer?: string;
  detectedAt: Date;
  lastUpdate: Date;
  activities: IncidentActivity[];
  attachments: IncidentAttachment[];
  affectedUsers?: number;
  environment?: string;
  errorRate?: number;
  responseTime?: number;
}

export type View = 'dashboard' | 'incident-details' | 'create-incident';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);

  const [teamMembers] = useState<TeamMember[]>([
    { id: '1', name: 'Alex Chen', role: 'sre_lead', status: 'online', currentIncidents: 3, responseTime: 5 },
    { id: '2', name: 'Jordan Rivera', role: 'sre_engineer', status: 'online', currentIncidents: 2, responseTime: 8 },
    { id: '3', name: 'Sam Taylor', role: 'on_call', status: 'busy', currentIncidents: 1, responseTime: 12 },
    { id: '4', name: 'Morgan Lee', role: 'security_analyst', status: 'offline', currentIncidents: 0, responseTime: 15 },
  ]);

  const [incidents, setIncidents] = useState<Incident[]>([
    {
      id: 'INC-2024-001',
      systemId: 'SYS-AUTH',
      systemName: 'Authentication Service',
      title: 'High latency in user authentication',
      description: 'Users experiencing 30+ second delays when logging in. Error rate increased to 15%.',
      status: 'active',
      severity: 'critical',
      category: 'Performance',
      service: 'Auth API',
      assignedTo: '1',
      assignedEngineer: 'Alex Chen',
      detectedAt: new Date('2024-01-15T14:30:00'),
      lastUpdate: new Date('2024-01-15T15:45:00'),
      activities: [
        {
          id: 'a1',
          user: 'Alex Chen',
          timestamp: new Date('2024-01-15T15:45:00'),
          action: 'Escalated to critical severity due to increasing error rate',
          type: 'escalation'
        }
      ],
      attachments: [],
      affectedUsers: 12500,
      environment: 'Production',
      errorRate: 15.3,
      responseTime: 32000
    },
    {
      id: 'INC-2024-002',
      systemId: 'SYS-PAY',
      systemName: 'Payment Gateway',
      title: 'Transaction processing failures',
      description: 'Payment transactions failing intermittently. Investigating connection timeouts.',
      status: 'investigating',
      severity: 'high',
      category: 'Functional',
      service: 'Payment API',
      assignedTo: '2',
      assignedEngineer: 'Jordan Rivera',
      detectedAt: new Date('2024-01-15T13:15:00'),
      lastUpdate: new Date('2024-01-15T15:30:00'),
      activities: [
        {
          id: 'a2',
          user: 'Jordan Rivera',
          timestamp: new Date('2024-01-15T15:30:00'),
          action: 'Identified potential database connection pool exhaustion',
          type: 'update'
        }
      ],
      attachments: [],
      affectedUsers: 800,
      environment: 'Production',
      errorRate: 8.7,
      responseTime: 15000
    },
    {
      id: 'INC-2024-003',
      systemId: 'SYS-NOT',
      systemName: 'Notification Service',
      title: 'Email delivery delays',
      description: 'Scheduled email notifications are being delayed by 2-3 hours.',
      status: 'monitoring',
      severity: 'medium',
      category: 'Performance',
      service: 'Email Queue',
      assignedTo: '3',
      assignedEngineer: 'Sam Taylor',
      detectedAt: new Date('2024-01-15T11:00:00'),
      lastUpdate: new Date('2024-01-15T14:20:00'),
      activities: [],
      attachments: [],
      affectedUsers: 3200,
      environment: 'Production',
      errorRate: 2.1,
      responseTime: 8500
    }
  ]);

  const handleNavigate = (view: View, incidentId?: string) => {
    setCurrentView(view);
    if (incidentId) {
      setSelectedIncidentId(incidentId);
    }
  };

  const handleCreateIncident = (incidentData: Partial<Incident>) => {
    const newIncident: Incident = {
      id: `INC-2024-${String(incidents.length + 1).padStart(3, '0')}`,
      systemId: incidentData.systemId || '',
      systemName: incidentData.systemName || '',
      title: incidentData.title || '',
      description: incidentData.description || '',
      status: 'investigating',
      severity: incidentData.severity || 'medium',
      category: incidentData.category || '',
      service: incidentData.service,
      assignedTo: incidentData.assignedTo,
      assignedEngineer: teamMembers.find(m => m.id === incidentData.assignedTo)?.name,
      detectedAt: new Date(),
      lastUpdate: new Date(),
      activities: [],
      attachments: [],
      affectedUsers: incidentData.affectedUsers,
      environment: incidentData.environment,
      errorRate: incidentData.errorRate,
      responseTime: incidentData.responseTime
    };

    setIncidents(prev => [...prev, newIncident]);
    setCurrentView('dashboard');
  };

  const handleUpdateIncident = (incidentId: string, updates: Partial<Incident>) => {
    setIncidents(prev => prev.map(incident => 
      incident.id === incidentId 
        ? { ...incident, ...updates, lastUpdate: new Date() }
        : incident
    ));
  };

  const handleAddActivity = (incidentId: string, action: string, type: IncidentActivity['type'] = 'comment') => {
    const newActivity: IncidentActivity = {
      id: `act${Date.now()}`,
      user: 'Current User',
      timestamp: new Date(),
      action,
      type
    };

    setIncidents(prev => prev.map(incident => 
      incident.id === incidentId 
        ? { 
            ...incident, 
            activities: [...incident.activities, newActivity],
            lastUpdate: new Date()
          }
        : incident
    ));
  };

  const handleAddAttachment = (incidentId: string, file: File) => {
    const newAttachment: IncidentAttachment = {
      id: `att${Date.now()}`,
      filename: file.name,
      type: file.type.startsWith('image/') ? 'screenshot' : 'document',
      url: URL.createObjectURL(file),
      uploadedBy: 'Current User',
      timestamp: new Date()
    };

    setIncidents(prev => prev.map(incident => 
      incident.id === incidentId 
        ? { 
            ...incident, 
            attachments: [...incident.attachments, newAttachment],
            lastUpdate: new Date()
          }
        : incident
    ));
  };

  const selectedIncident = selectedIncidentId ? incidents.find(i => i.id === selectedIncidentId) : null;

  return (
    <div className="min-h-screen bg-black">
      {currentView === 'dashboard' && (
        <IncidentDashboard 
          incidents={incidents}
          teamMembers={teamMembers}
          onNavigate={handleNavigate}
          onUpdateIncident={handleUpdateIncident}
        />
      )}
      
      {currentView === 'incident-details' && selectedIncident && (
        <IncidentDetails 
          incident={selectedIncident}
          teamMembers={teamMembers}
          onNavigate={handleNavigate}
          onUpdateIncident={handleUpdateIncident}
          onAddActivity={handleAddActivity}
          onAddAttachment={handleAddAttachment}
        />
      )}
      
      {currentView === 'create-incident' && (
        <CreateIncident 
          teamMembers={teamMembers}
          onNavigate={handleNavigate}
          onCreateIncident={handleCreateIncident}
        />
      )}
    </div>
  );
}