import { useState } from 'react';
import { ArrowLeft, Shield, HelpCircle, ChevronDown, ChevronUp, Camera, Paperclip } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import type { TeamMember, View, IncidentSeverity } from '../App';

interface CreateIncidentProps {
  teamMembers: TeamMember[];
  onNavigate: (view: View) => void;
  onCreateIncident: (incidentData: any) => void;
}

export function CreateIncident({ teamMembers, onNavigate, onCreateIncident }: CreateIncidentProps) {
  const [formData, setFormData] = useState({
    systemId: '',
    systemName: '',
    severity: 'medium' as IncidentSeverity,
    category: '',
    service: '',
    title: '',
    description: '',
    assignedTo: '',
    affectedUsers: '',
    environment: 'Production',
    errorRate: '',
    responseTime: ''
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = {
    'Performance': ['Latency', 'Throughput', 'Resource Usage', 'Timeout'],
    'Functional': ['API Errors', 'Data Corruption', 'Feature Failure', 'Integration'],
    'Security': ['Breach', 'Vulnerability', 'Access Issues', 'Audit'],
    'Infrastructure': ['Server Down', 'Network', 'Database', 'Storage']
  };

  const systems = {
    'SYS-AUTH': 'Authentication Service',
    'SYS-PAY': 'Payment Gateway',
    'SYS-NOT': 'Notification Service',
    'SYS-USER': 'User Management',
    'SYS-API': 'Core API Gateway',
    'SYS-DB': 'Database Cluster',
    'SYS-CDN': 'Content Delivery Network'
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.systemId) {
      newErrors.systemId = 'System selection required';
    }
    if (!formData.severity) {
      newErrors.severity = 'Severity required';
    }
    if (!formData.category) {
      newErrors.category = 'Category required';
    }
    if (!formData.title.trim()) {
      newErrors.title = 'Incident title required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const incidentData = {
      ...formData,
      systemName: systems[formData.systemId as keyof typeof systems] || formData.systemName,
      affectedUsers: formData.affectedUsers ? parseInt(formData.affectedUsers) : undefined,
      errorRate: formData.errorRate ? parseFloat(formData.errorRate) : undefined,
      responseTime: formData.responseTime ? parseInt(formData.responseTime) * 1000 : undefined,
    };

    onCreateIncident(incidentData);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-blue-400';
      case 'low': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getCategoryHelp = (category: string) => {
    const descriptions = {
      'Performance': 'System slowdowns, high latency, resource constraints',
      'Functional': 'Features not working, API errors, data issues',
      'Security': 'Security breaches, vulnerabilities, access problems',
      'Infrastructure': 'Server outages, network issues, hardware failures'
    };
    return descriptions[category as keyof typeof descriptions] || '';
  };

  return (
    <TooltipProvider>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onNavigate('dashboard')}
            className="bg-zinc-900 border-zinc-700 text-gray-300 hover:bg-zinc-800 min-h-[44px] md:min-h-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-6 h-6 text-cyan-400" />
              <h1 className="text-white text-2xl font-medium">Report New Incident</h1>
            </div>
            <p className="text-gray-400">Document and track system incidents for rapid response</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Critical Information */}
          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="w-5 h-5 text-cyan-400" />
              <h2 className="text-white text-lg font-medium">Critical Information</h2>
              <span className="text-sm text-gray-400">*Required fields</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* System Selection */}
              <div>
                <Label className="text-gray-300">Affected System *</Label>
                <Select value={formData.systemId} onValueChange={(value) => handleInputChange('systemId', value)}>
                  <SelectTrigger className={`bg-zinc-800 border-zinc-700 text-white min-h-[44px] md:min-h-auto ${errors.systemId ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Select affected system" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {Object.entries(systems).map(([id, name]) => (
                      <SelectItem key={id} value={id}>
                        <div>
                          <p className="text-white">{name}</p>
                          <p className="text-xs text-gray-400">{id}</p>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.systemId && (
                  <p className="text-red-400 text-sm mt-1">{errors.systemId}</p>
                )}
              </div>

              {/* Environment */}
              <div>
                <Label className="text-gray-300">Environment</Label>
                <Select value={formData.environment} onValueChange={(value) => handleInputChange('environment', value)}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white min-h-[44px] md:min-h-auto">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="Production">🔴 Production</SelectItem>
                    <SelectItem value="Staging">🟡 Staging</SelectItem>
                    <SelectItem value="Development">🟢 Development</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Severity */}
              <div>
                <Label className="flex items-center gap-1 text-gray-300">
                  Severity *
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="w-4 h-4 text-gray-500" />
                    </TooltipTrigger>
                    <TooltipContent className="bg-zinc-800 border-zinc-700">
                      <div className="space-y-1 text-sm">
                        <p><strong>Critical:</strong> Complete service outage</p>
                        <p><strong>High:</strong> Major functionality impacted</p>
                        <p><strong>Medium:</strong> Some features affected</p>
                        <p><strong>Low:</strong> Minor issues or improvements</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Select value={formData.severity} onValueChange={(value) => handleInputChange('severity', value)}>
                  <SelectTrigger className={`bg-zinc-800 border-zinc-700 text-white min-h-[44px] md:min-h-auto ${errors.severity ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="critical">
                      <span className="flex items-center gap-2">
                        🔴 <span className="text-red-400">Critical</span>
                      </span>
                    </SelectItem>
                    <SelectItem value="high">
                      <span className="flex items-center gap-2">
                        🟠 <span className="text-orange-400">High</span>
                      </span>
                    </SelectItem>
                    <SelectItem value="medium">
                      <span className="flex items-center gap-2">
                        🔵 <span className="text-blue-400">Medium</span>
                      </span>
                    </SelectItem>
                    <SelectItem value="low">
                      <span className="flex items-center gap-2">
                        ⚪ <span className="text-gray-400">Low</span>
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.severity && (
                  <p className="text-red-400 text-sm mt-1">{errors.severity}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <Label className="flex items-center gap-1 text-gray-300">
                  Category *
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="w-4 h-4 text-gray-500" />
                    </TooltipTrigger>
                    <TooltipContent className="bg-zinc-800 border-zinc-700">
                      <p className="text-sm max-w-xs">
                        {formData.category ? getCategoryHelp(formData.category) : 'Select a category to see description'}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Select value={formData.category} onValueChange={(value) => {
                  handleInputChange('category', value);
                  setFormData(prev => ({ ...prev, service: '' }));
                }}>
                  <SelectTrigger className={`bg-zinc-800 border-zinc-700 text-white min-h-[44px] md:min-h-auto ${errors.category ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {Object.keys(categories).map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-red-400 text-sm mt-1">{errors.category}</p>
                )}
              </div>

              {/* Service/Component */}
              {formData.category && (
                <div className="md:col-span-2">
                  <Label className="text-gray-300">Service/Component</Label>
                  <Select value={formData.service} onValueChange={(value) => handleInputChange('service', value)}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white min-h-[44px] md:min-h-auto">
                      <SelectValue placeholder="Select specific service (optional)" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      {categories[formData.category as keyof typeof categories]?.map(service => (
                        <SelectItem key={service} value={service}>
                          {service}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Title and Description */}
            <div className="space-y-4 mt-6">
              <div>
                <Label htmlFor="title" className="text-gray-300">Incident Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., High latency in authentication service"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`bg-zinc-800 border-zinc-700 text-white min-h-[44px] md:min-h-auto ${errors.title ? 'border-red-500' : ''}`}
                />
                {errors.title && (
                  <p className="text-red-400 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description" className="text-gray-300">Detailed Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the incident, symptoms observed, impact on users, and any troubleshooting steps already taken..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={`min-h-[120px] bg-zinc-800 border-zinc-700 text-white ${errors.description ? 'border-red-500' : ''}`}
                />
                {errors.description && (
                  <p className="text-red-400 text-sm mt-1">{errors.description}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Advanced Details */}
          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <Card className="bg-zinc-900 border-zinc-800 p-6">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="p-0 h-auto justify-start text-white hover:bg-transparent">
                  <div className="flex items-center gap-2">
                    {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    <h3 className="text-lg font-medium">Impact & Assignment</h3>
                    <span className="text-sm text-gray-400">(optional)</span>
                  </div>
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Assignment */}
                  <div>
                    <Label className="text-gray-300">Assign to Engineer</Label>
                    <Select value={formData.assignedTo} onValueChange={(value) => handleInputChange('assignedTo', value)}>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white min-h-[44px] md:min-h-auto">
                        <SelectValue placeholder="Auto-assign based on severity" />
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

                  {/* Affected Users */}
                  <div>
                    <Label htmlFor="affectedUsers" className="text-gray-300">Affected Users</Label>
                    <Input
                      id="affectedUsers"
                      type="number"
                      min="0"
                      placeholder="e.g., 12500"
                      value={formData.affectedUsers}
                      onChange={(e) => handleInputChange('affectedUsers', e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white min-h-[44px] md:min-h-auto"
                    />
                  </div>

                  {/* Error Rate */}
                  <div>
                    <Label htmlFor="errorRate" className="text-gray-300">Error Rate (%)</Label>
                    <Input
                      id="errorRate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="e.g., 15.3"
                      value={formData.errorRate}
                      onChange={(e) => handleInputChange('errorRate', e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white min-h-[44px] md:min-h-auto"
                    />
                  </div>

                  {/* Response Time */}
                  <div>
                    <Label htmlFor="responseTime" className="text-gray-300">Response Time (seconds)</Label>
                    <Input
                      id="responseTime"
                      type="number"
                      min="0"
                      placeholder="e.g., 32"
                      value={formData.responseTime}
                      onChange={(e) => handleInputChange('responseTime', e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white min-h-[44px] md:min-h-auto"
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Attachments */}
          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-medium">Evidence & Logs</h3>
              <div className="flex gap-2">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                  multiple
                  accept="image/*,.log,.txt,.json"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="bg-zinc-800 border-zinc-700 text-gray-300 hover:bg-zinc-700 min-h-[44px] md:min-h-auto"
                >
                  <Paperclip className="w-4 h-4 mr-2" />
                  Upload File
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.capture = 'environment';
                    input.onchange = (e) => {
                      const files = Array.from((e.target as HTMLInputElement).files || []);
                      setAttachments(prev => [...prev, ...files]);
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

            {attachments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No files attached. Upload screenshots, logs, or other evidence to help with diagnosis.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg">
                    <div className="flex-shrink-0">
                      {file.type.startsWith('image/') ? (
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt={file.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-zinc-700 rounded flex items-center justify-center">
                          <Paperclip className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{file.name}</p>
                      <p className="text-sm text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(index)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      ✕
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Actions */}
          <div className="flex flex-col md:flex-row gap-4 pt-6">
            <Button
              type="submit"
              className="bg-cyan-500 hover:bg-cyan-600 text-black font-medium flex-1 min-h-[44px] md:min-h-auto"
            >
              Create Incident Report
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onNavigate('dashboard')}
              className="bg-zinc-900 border-zinc-700 text-gray-300 hover:bg-zinc-800 md:w-auto min-h-[44px] md:min-h-auto"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </TooltipProvider>
  );
}