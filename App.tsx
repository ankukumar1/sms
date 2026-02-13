
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  LayoutDashboard, Send, Users, Sparkles, Plus, Settings, Search, Filter, 
  MoreVertical, Mail, MessageSquare, AlertCircle, Copy, Trash2, Layout, Clock, Calendar, Check, UserPlus, FolderPlus, Phone, Tags, ChevronRight, ExternalLink
} from 'lucide-react';
import { Campaign, Contact, AnalyticsData, CampaignType, Template, CampaignStatus, ContactGroup } from './types';
import { generateMarketingContent } from './services/gemini';

// --- Real-looking Initial Data ---
const MOCK_CAMPAIGNS: Campaign[] = [
  { 
    id: '1', 
    name: 'Summer Flash Sale', 
    type: 'Email', 
    status: 'Sent', 
    subject: 'Up to 50% Off Everything!', 
    content: 'Join us for our biggest sale of the season. Use code SUMMER50 at checkout.', 
    recipientsCount: 12500, 
    openRate: 24.5, 
    clickRate: 3.2, 
    createdAt: '2024-05-10' 
  },
  { 
    id: '2', 
    name: 'Product Update Q2', 
    type: 'Email', 
    status: 'Sent', 
    subject: 'Meet your new dashboard', 
    content: 'We have completely revamped the user interface for better speed.', 
    recipientsCount: 8400, 
    openRate: 18.2, 
    clickRate: 5.1, 
    createdAt: '2024-05-15' 
  },
  { 
    id: '3', 
    name: 'Weekend SMS Alert', 
    type: 'SMS', 
    status: 'Scheduled', 
    content: 'Don\'t miss out! Our 24-hour sale starts tomorrow at 9 AM.', 
    recipientsCount: 1200, 
    scheduledAt: '2024-06-20 09:00 AM',
    createdAt: '2024-05-20' 
  },
];

const MOCK_GROUPS: ContactGroup[] = [
  { id: 'g1', name: 'VIP Customers', description: 'Customers with over $500 lifetime spend', memberCount: 125, createdAt: '2024-01-10' },
  { id: 'g2', name: 'New Leads', description: 'Acquired via Q2 landing page', memberCount: 840, createdAt: '2024-03-22' },
  { id: 'g3', name: 'Inactive Users', description: 'Users who haven\'t opened in 90 days', memberCount: 52, createdAt: '2024-04-05' },
];

const MOCK_CONTACTS: Contact[] = [
  { id: 'c1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', phone: '+123456789', status: 'Subscribed', tags: ['High-Value'], groupId: 'g1' },
  { id: 'c2', firstName: 'Jane', lastName: 'Smith', email: 'jane@acme.co', phone: '+198765432', status: 'Subscribed', tags: ['B2B'], groupId: 'g2' },
  { id: 'c3', firstName: 'Robert', lastName: 'Patterson', email: 'rob.p@gmail.com', phone: '+14445556', status: 'Subscribed', tags: ['Sneakers'], groupId: 'g2' },
];

const ANALYTICS_DATA: AnalyticsData[] = [
  { date: 'Mon', sent: 1200, opens: 400, clicks: 120 },
  { date: 'Tue', sent: 1500, opens: 550, clicks: 180 },
  { date: 'Wed', sent: 1100, opens: 380, clicks: 90 },
  { date: 'Thu', sent: 2200, opens: 900, clicks: 310 },
  { date: 'Fri', sent: 1800, opens: 720, clicks: 240 },
  { date: 'Sat', sent: 800, opens: 250, clicks: 60 },
  { date: 'Sun', sent: 900, opens: 310, clicks: 85 },
];

// --- Sub-Components ---

const CampaignRow: React.FC<{ campaign: Campaign }> = ({ campaign }) => (
  <tr className="hover:bg-slate-50/50 group transition-all border-b border-slate-100 last:border-0">
    <td className="px-8 py-5">
      <div className="flex items-center space-x-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${campaign.type === 'Email' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
          {campaign.type === 'Email' ? <Mail size={18} /> : <MessageSquare size={18} />}
        </div>
        <div>
          <p className="font-bold text-slate-900 leading-none">{campaign.name}</p>
          <p className="text-xs text-slate-400 mt-1 truncate max-w-xs">{campaign.subject || campaign.content}</p>
        </div>
      </div>
    </td>
    <td className="px-8 py-5">
      <div className="flex flex-col">
        <span className={`w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
          campaign.status === 'Sent' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
          campaign.status === 'Scheduled' ? 'bg-blue-50 text-blue-600 border-blue-100' :
          'bg-slate-100 text-slate-500 border-slate-200'
        }`}>
          {campaign.status}
        </span>
        {campaign.status === 'Scheduled' && (
          <span className="text-[10px] text-blue-500 font-bold mt-1 flex items-center">
            <Clock size={10} className="mr-1" />
            {campaign.scheduledAt}
          </span>
        )}
      </div>
    </td>
    <td className="px-8 py-5">
      <span className="text-sm font-bold text-slate-600">
        {campaign.recipientsCount > 0 ? campaign.recipientsCount.toLocaleString() : 'Pending'}
      </span>
    </td>
    <td className="px-8 py-5">
      <span className="text-sm font-black text-slate-900">
        {campaign.openRate ? `${campaign.openRate}%` : '--'}
      </span>
    </td>
    <td className="px-8 py-5 text-right">
      <button className="p-2 text-slate-300 hover:text-indigo-600 transition-colors">
        <MoreVertical size={20} />
      </button>
    </td>
  </tr>
);

const SidebarItem: React.FC<{ icon: any; label: string; active?: boolean; onClick: () => void }> = ({ icon: Icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      active ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'
    }`}
  >
    <Icon size={20} />
    <span className="font-semibold">{label}</span>
  </button>
);

const StatCard: React.FC<{ title: string; value: string; trend: string; isPositive: boolean }> = ({ title, value, trend, isPositive }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
    <p className="text-sm font-medium text-slate-500 tracking-tight">{title}</p>
    <div className="flex items-end justify-between mt-2">
      <h3 className="text-2xl font-bold text-slate-900 leading-none">{value}</h3>
      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${isPositive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
        {trend}
      </span>
    </div>
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'campaigns' | 'contacts' | 'ai' | 'templates'>('dashboard');
  const [contactsTab, setContactsTab] = useState<'all' | 'groups'>('all');
  
  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [contacts, setContacts] = useState<Contact[]>(MOCK_CONTACTS);
  const [groups, setGroups] = useState<ContactGroup[]>(MOCK_GROUPS);

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  
  // New Campaign Form State
  const [pendingCampaign, setPendingCampaign] = useState<Partial<Campaign>>({});
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [newCampaignType, setNewCampaignType] = useState<CampaignType>('Email');
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // New Contact/Group Form State
  const [newContact, setNewContact] = useState({ firstName: '', lastName: '', email: '', phone: '', groupId: '' });
  const [newGroup, setNewGroup] = useState({ name: '', description: '' });

  const handleGenerateAI = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    try {
      const result = await generateMarketingContent(newCampaignType, prompt);
      setGeneratedContent(result);
    } catch (err) {
      console.error(err);
      alert("AI Service temporary unavailable.");
    } finally {
      setIsGenerating(false);
    }
  };

  const openFinalize = (source?: Partial<Campaign> | Template) => {
    setPendingCampaign({
      name: (source as Template)?.name || prompt.substring(0, 20) || 'New Campaign',
      type: (source as Template)?.type || newCampaignType,
      subject: (source as Template)?.subject || generatedContent?.subject || '',
      content: (source as Template)?.content || generatedContent?.content || prompt || '',
    });
    setShowFinalizeModal(true);
    setShowCreateModal(false);
    setShowTemplatePicker(false);
  };

  const handleCompleteLaunch = () => {
    if (!pendingCampaign.name) return alert("Please provide a name for this campaign.");

    const finalStatus: CampaignStatus = isScheduled ? 'Scheduled' : 'Sent';
    const finalScheduledAt = isScheduled ? `${scheduleDate} ${scheduleTime}` : undefined;

    const newEntry: Campaign = {
      id: Date.now().toString(),
      name: pendingCampaign.name,
      type: pendingCampaign.type || 'Email',
      status: finalStatus,
      subject: pendingCampaign.subject,
      content: pendingCampaign.content || '',
      recipientsCount: contacts.length, // Sending to everyone for now
      scheduledAt: finalScheduledAt,
      createdAt: new Date().toISOString().split('T')[0],
      openRate: isScheduled ? undefined : 0,
      clickRate: isScheduled ? undefined : 0,
    };

    setCampaigns([newEntry, ...campaigns]);
    setShowFinalizeModal(false);
    setGeneratedContent(null);
    setPrompt('');
    setIsScheduled(false);
    setScheduleDate('');
    setScheduleTime('');
    setActiveTab('campaigns');
    alert(isScheduled ? "Campaign scheduled successfully!" : "Campaign launched to all contacts!");
  };

  const handleAddContact = () => {
    if (!newContact.email || !newContact.firstName) return alert("Email and First Name are required.");
    const contact: Contact = {
      id: Date.now().toString(),
      ...newContact,
      status: 'Subscribed',
      tags: ['Manual Entry']
    };
    setContacts([contact, ...contacts]);
    setShowContactModal(false);
    setNewContact({ firstName: '', lastName: '', email: '', phone: '', groupId: '' });
  };

  const handleAddGroup = () => {
    if (!newGroup.name) return alert("Group name is required.");
    const group: ContactGroup = {
      id: `g${Date.now()}`,
      ...newGroup,
      memberCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setGroups([...groups, group]);
    setShowGroupModal(false);
    setNewGroup({ name: '', description: '' });
  };

  return (
    <div className="flex min-h-screen bg-slate-50 selection:bg-indigo-100">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 hidden md:flex flex-col p-8 sticky top-0 h-screen">
        <div className="flex items-center space-x-3 mb-12">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-indigo-200 shadow-xl">
            <Layout className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Omni<span className="text-indigo-600">Send</span></h1>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem icon={LayoutDashboard} label="Overview" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={Send} label="Campaigns" active={activeTab === 'campaigns'} onClick={() => setActiveTab('campaigns')} />
          <SidebarItem icon={Users} label="Contacts" active={activeTab === 'contacts'} onClick={() => setActiveTab('contacts')} />
          <SidebarItem icon={Layout} label="Templates" active={activeTab === 'templates'} onClick={() => setActiveTab('templates')} />
          <SidebarItem icon={Sparkles} label="AI Copywriter" active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} />
        </nav>

        <div className="mt-auto pt-8 border-t border-slate-100">
          <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-3xl shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Growth Stats</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Reachability</span>
              <span className="text-xs font-black text-indigo-600">98.2%</span>
            </div>
            <div className="mt-2 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 w-[98.2%]" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-10 py-5 sticky top-0 z-20 flex items-center justify-between">
          <div className="relative w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search data..." 
              className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-6 py-2.5 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
            >
              <Plus size={18} />
              <span>Launch</span>
            </button>
            <div className="w-12 h-12 rounded-2xl bg-slate-100 border-2 border-white shadow-sm overflow-hidden cursor-pointer ring-1 ring-slate-200">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Omni" alt="User" />
            </div>
          </div>
        </header>

        <div className="p-10 max-w-7xl mx-auto">
          {activeTab === 'dashboard' && (
            <div className="space-y-10 animate-in fade-in duration-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Performance Summary</h2>
                  <p className="text-slate-500 font-medium">Your global reach is expanding.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Contacts" value={contacts.length.toString()} trend="+3.2%" isPositive={true} />
                <StatCard title="Active Campaigns" value={campaigns.filter(c => c.status === 'Sent' || c.status === 'Scheduled').length.toString()} trend="--%" isPositive={true} />
                <StatCard title="Avg. Open Rate" value="22.4%" trend="-1.2%" isPositive={false} />
                <StatCard title="Click Through" value="8.1%" trend="+2.4%" isPositive={true} />
              </div>
              <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={ANALYTICS_DATA}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                      <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                      <Area type="monotone" dataKey="sent" stroke="#6366f1" fill="#6366f115" strokeWidth={4} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'campaigns' && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Campaign History</h2>
                    <p className="text-slate-500 font-medium">Manage and track your marketing efforts.</p>
                  </div>
               </div>

               <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                  <table className="w-full text-left">
                     <thead className="bg-slate-50 border-b border-slate-200">
                       <tr>
                          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Campaign</th>
                          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Recipients</th>
                          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Open Rate</th>
                          <th className="px-8 py-5"></th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        {campaigns.length > 0 ? (
                           campaigns.map(campaign => <CampaignRow key={campaign.id} campaign={campaign} />)
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-8 py-20 text-center">
                               <div className="flex flex-col items-center">
                                  <div className="p-4 bg-slate-100 rounded-full mb-4">
                                     <Send size={32} className="text-slate-300" />
                                  </div>
                                  <p className="text-slate-400 font-bold">No campaigns yet. Launch your first one!</p>
                               </div>
                            </td>
                          </tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
          )}

          {/* ... Other Tabs remain the same ... */}
          {activeTab === 'contacts' && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Customer Hub</h2>
                    <div className="flex mt-4 p-1 bg-slate-200/50 rounded-xl w-fit">
                        <button 
                          onClick={() => setContactsTab('all')}
                          className={`px-5 py-2 text-xs font-bold rounded-lg transition-all ${contactsTab === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          All Contacts
                        </button>
                        <button 
                          onClick={() => setContactsTab('groups')}
                          className={`px-5 py-2 text-xs font-bold rounded-lg transition-all ${contactsTab === 'groups' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          Groups & Segments
                        </button>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button onClick={() => setShowGroupModal(true)} className="px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 flex items-center space-x-2 hover:bg-slate-50 shadow-sm transition-all"><FolderPlus size={16} /><span>New Group</span></button>
                    <button onClick={() => setShowContactModal(true)} className="px-5 py-2.5 bg-indigo-600 text-white rounded-2xl text-xs font-bold flex items-center space-x-2 shadow-lg hover:bg-indigo-700 transition-all"><UserPlus size={16} /><span>Add Contact</span></button>
                  </div>
               </div>

               {contactsTab === 'all' ? (
                 <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                       <thead className="bg-slate-50 border-b border-slate-200">
                         <tr>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Group</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tags</th>
                            <th className="px-8 py-5"></th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                          {contacts.map(contact => (
                            <tr key={contact.id} className="hover:bg-slate-50/50 group transition-all">
                               <td className="px-8 py-5">
                                  <div className="flex items-center space-x-4">
                                     <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-100">
                                        <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${contact.firstName} ${contact.lastName}`} alt="Avatar" />
                                     </div>
                                     <div><p className="font-bold text-slate-900 leading-none">{contact.firstName} {contact.lastName}</p><p className="text-xs text-slate-500 mt-1">{contact.email}</p></div>
                                  </div>
                               </td>
                               <td className="px-8 py-5"><span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider border border-emerald-100">{contact.status}</span></td>
                               <td className="px-8 py-5"><span className="text-xs font-semibold text-slate-600">{groups.find(g => g.id === contact.groupId)?.name || 'Unassigned'}</span></td>
                               <td className="px-8 py-5"><div className="flex gap-1.5 flex-wrap">{contact.tags.map(tag => (<span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-bold border border-slate-200 uppercase">{tag}</span>))}</div></td>
                               <td className="px-8 py-5 text-right"><button className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"><MoreVertical size={20} /></button></td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groups.map(group => (
                       <div key={group.id} className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600 opacity-0 group-hover:opacity-100 transition-all" />
                          <div className="flex items-center justify-between mb-6">
                             <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600"><Users size={24} /></div>
                             <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{contacts.filter(c => c.groupId === group.id).length} MEMBERS</span>
                          </div>
                          <h4 className="text-xl font-black text-slate-900 leading-tight">{group.name}</h4>
                          <p className="text-sm text-slate-500 mt-2 font-medium line-clamp-2 leading-relaxed">{group.description}</p>
                          <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Created {group.createdAt}</p><button className="text-indigo-600 hover:text-indigo-800 flex items-center text-sm font-bold">View Group <ChevronRight size={16} className="ml-1" /></button></div>
                       </div>
                    ))}
                 </div>
               )}
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="max-w-3xl mx-auto space-y-12 animate-in zoom-in-95 duration-500 py-6">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-[40px] flex items-center justify-center text-white mx-auto mb-8 shadow-2xl shadow-indigo-100 ring-8 ring-indigo-50">
                    <Sparkles size={42} fill="currentColor" />
                  </div>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Content Studio</h2>
                  <p className="text-slate-500 mt-4 text-lg font-medium max-w-md mx-auto">Generate high-converting copy using Gemini Pro.</p>
                </div>

                <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-2xl space-y-8">
                   <div className="space-y-3">
                      <label className="text-sm font-black text-slate-800 uppercase tracking-widest">PROMOTION DESCRIPTION</label>
                      <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="What are you selling today? Mention target audience and key benefits..."
                        className="w-full h-44 p-6 bg-slate-50 border border-slate-200 rounded-3xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none font-medium text-slate-800 text-lg shadow-inner"
                      />
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CHANNEL</label>
                         <select value={newCampaignType} onChange={(e) => setNewCampaignType(e.target.value as CampaignType)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 cursor-pointer appearance-none hover:bg-slate-100 transition-all">
                            <option value="Email">Professional Email</option>
                            <option value="SMS">Concise SMS</option>
                         </select>
                      </div>
                      <div className="flex items-end">
                         <button 
                            onClick={handleGenerateAI} 
                            disabled={isGenerating || !prompt} 
                            className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center space-x-3"
                         >
                            {isGenerating ? <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div> : <><Sparkles size={20} /><span>CRAFT MESSAGE</span></>}
                         </button>
                      </div>
                   </div>
                </div>

                {generatedContent && (
                   <div className="bg-white border border-indigo-100 p-10 rounded-[40px] space-y-8 animate-in slide-in-from-top-6 duration-700 shadow-2xl shadow-indigo-50">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center space-x-3"><div className="w-2 h-8 bg-indigo-600 rounded-full" /><h3 className="text-2xl font-black text-slate-900 tracking-tight">AI Proposal</h3></div>
                      </div>
                      <div className="bg-indigo-50/30 p-8 rounded-3xl border border-indigo-50 text-slate-700 whitespace-pre-wrap leading-relaxed shadow-inner font-medium text-lg">
                        {generatedContent.content}
                      </div>
                      <div className="flex space-x-4">
                         <button onClick={() => openFinalize()} className="flex-1 py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center space-x-3"><Check size={24} /><span>USE THIS CONTENT</span></button>
                      </div>
                   </div>
                )}
            </div>
          )}
        </div>
      </main>

      {/* --- MODALS --- */}

      {/* Finalize Modal (THE BRAINS) */}
      {showFinalizeModal && (
         <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[120] flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-12 duration-500">
                <div className="px-10 py-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                   <div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Finalize Delivery</h3>
                      <p className="text-sm text-slate-500 font-medium">Set your schedule and launch.</p>
                   </div>
                   <button onClick={() => setShowFinalizeModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-all"><Plus className="rotate-45" size={24} /></button>
                </div>
                <div className="p-10 space-y-8 max-h-[75vh] overflow-y-auto">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CAMPAIGN NAME</label>
                      <input 
                         type="text" 
                         value={pendingCampaign.name}
                         onChange={e => setPendingCampaign({...pendingCampaign, name: e.target.value})}
                         placeholder="e.g. June Promotional Blast"
                         className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                   </div>

                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">TIMING OPTIONS</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button 
                          onClick={() => setIsScheduled(false)}
                          className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${!isScheduled ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-500'}`}
                        >
                           <span className="font-bold">Send Now</span>
                           {!isScheduled && <Check size={18} />}
                        </button>
                        <button 
                          onClick={() => setIsScheduled(true)}
                          className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${isScheduled ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-500'}`}
                        >
                           <span className="font-bold">Schedule</span>
                           {isScheduled && <Check size={18} />}
                        </button>
                      </div>

                      {isScheduled && (
                        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                           <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">DATE</label>
                              <input 
                                type="date" 
                                value={scheduleDate}
                                onChange={e => setScheduleDate(e.target.value)}
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700"
                              />
                           </div>
                           <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">TIME</label>
                              <input 
                                type="time" 
                                value={scheduleTime}
                                onChange={e => setScheduleTime(e.target.value)}
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700"
                              />
                           </div>
                        </div>
                      )}
                   </div>

                   <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex space-x-4">
                      <AlertCircle className="text-amber-600 shrink-0" size={24} />
                      <p className="text-sm font-bold text-amber-800 leading-relaxed">
                        You are about to launch to {contacts.length} subscribers. {isScheduled ? 'A schedule will be created for the date above.' : 'This will be sent immediately.'}
                      </p>
                   </div>
                </div>

                <div className="p-10 bg-slate-50/50 border-t border-slate-100 flex space-x-4">
                   <button onClick={() => setShowFinalizeModal(false)} className="flex-1 py-5 bg-white border border-slate-200 text-slate-600 font-black rounded-2xl hover:bg-slate-50 transition-all">CANCEL</button>
                   <button 
                      onClick={handleCompleteLaunch}
                      className="flex-[2] py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center space-x-3"
                   >
                      <Send size={20} />
                      <span>{isScheduled ? 'SCHEDULE CAMPAIGN' : 'LAUNCH NOW'}</span>
                   </button>
                </div>
            </div>
         </div>
      )}

      {/* Campaign Create Select Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="p-10 space-y-4">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight text-center mb-6">Choose Creation Path</h3>
                <button 
                  onClick={() => { setActiveTab('ai'); setShowCreateModal(false); }}
                  className="w-full flex items-center justify-between p-6 rounded-3xl border-2 border-slate-100 hover:border-indigo-600 hover:bg-indigo-50/50 transition-all group shadow-sm hover:shadow-md"
                >
                   <div className="flex items-center space-x-4 text-left">
                      <div className="p-4 bg-slate-50 rounded-2xl text-slate-400 group-hover:text-indigo-600 transition-colors shadow-inner"><Sparkles /></div>
                      <div><p className="font-black text-slate-900">AI Designer</p><p className="text-xs text-slate-500 font-bold">Fast-track with Gemini</p></div>
                   </div>
                   <ChevronRight className="text-slate-300 group-hover:text-indigo-600" />
                </button>
                <button 
                  onClick={() => openFinalize()}
                  className="w-full flex items-center justify-between p-6 rounded-3xl border-2 border-slate-100 hover:border-indigo-600 hover:bg-indigo-50/50 transition-all group shadow-sm hover:shadow-md"
                >
                   <div className="flex items-center space-x-4 text-left">
                      <div className="p-4 bg-slate-50 rounded-2xl text-slate-400 group-hover:text-indigo-600 transition-colors shadow-inner"><Plus /></div>
                      <div><p className="font-black text-slate-900">Blank Campaign</p><p className="text-xs text-slate-500 font-bold">Start from scratch</p></div>
                   </div>
                   <ChevronRight className="text-slate-300 group-hover:text-indigo-600" />
                </button>
                <button onClick={() => setShowCreateModal(false)} className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 transition-all uppercase tracking-widest text-[10px]">Close</button>
             </div>
          </div>
        </div>
      )}

      {/* Other modals for Contact/Group creation... */}
      {showContactModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
           <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50"><h3 className="text-2xl font-black text-slate-900 tracking-tight">New Contact</h3><button onClick={() => setShowContactModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-all"><Plus className="rotate-45" size={24} /></button></div>
              <div className="p-10 space-y-6">
                 <div className="grid grid-cols-2 gap-4"><div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">FIRST NAME</label><input type="text" placeholder="John" value={newContact.firstName} onChange={e => setNewContact({...newContact, firstName: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" /></div><div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">LAST NAME</label><input type="text" placeholder="Doe" value={newContact.lastName} onChange={e => setNewContact({...newContact, lastName: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" /></div></div>
                 <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">EMAIL ADDRESS</label><div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="email" placeholder="john@example.com" value={newContact.email} onChange={e => setNewContact({...newContact, email: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" /></div></div>
                 <button onClick={handleAddContact} className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all mt-4">SAVE CONTACT</button>
              </div>
           </div>
        </div>
      )}

      {showGroupModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
           <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between"><h3 className="text-2xl font-black text-slate-900 tracking-tight">New Segment</h3><button onClick={() => setShowGroupModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><Plus className="rotate-45" size={24} /></button></div>
              <div className="p-10 space-y-6">
                 <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">GROUP NAME</label><input type="text" placeholder="e.g. VIP Fall Fashion" value={newGroup.name} onChange={e => setNewGroup({...newGroup, name: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" /></div>
                 <button onClick={handleAddGroup} className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">CREATE GROUP</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
