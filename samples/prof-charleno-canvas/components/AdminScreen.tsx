import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Types
type NodeType = 'superior' | 'medio-a' | 'medio-b';

interface GroupData {
    id: string;
    type: NodeType;
    title: string;
    members: string[];
    leaderName?: string;
    createdAt: Date;
    updatedAt: Date;
}

interface EdgeData {
    id: string;
    sourceId: string;
    targetId: string;
    label: string;
}

interface ActivityLogEntry {
    id: string;
    action: 'create' | 'update' | 'delete';
    entityType: 'group' | 'connection';
    entityId: string;
    entityName: string;
    timestamp: Date;
    details?: string;
}

const AdminScreen: React.FC = () => {
    const navigate = useNavigate();

    // UI State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('Superior');
    const [searchQuery, setSearchQuery] = useState('');

    // Data State
    const [groups, setGroups] = useState<GroupData[]>([]);
    const [edges, setEdges] = useState<EdgeData[]>([]);
    const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        category: 'superior' as NodeType,
        name: '',
        leader: '',
        participants: ''
    });

    // Edit/Delete State
    const [editingGroup, setEditingGroup] = useState<GroupData | null>(null);
    const [deleteConfirmGroup, setDeleteConfirmGroup] = useState<GroupData | null>(null);

    // Helper Functions
    const generateId = (): string => {
        return `grp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    };

    const parseParticipants = (input: string): string[] => {
        return input
            .split(/[,\n]/)
            .map(name => name.trim())
            .filter(name => name.length > 0);
    };

    const isFormValid = (): boolean => {
        const hasName = formData.name.trim().length > 0;
        const hasParticipants = parseParticipants(formData.participants).length > 0;
        return hasName && hasParticipants;
    };

    const tabToNodeType = (tab: string): NodeType => {
        switch (tab) {
            case 'Superior': return 'superior';
            case 'Ensino Médio - Class A': return 'medio-a';
            case 'Ensino Médio - Class B': return 'medio-b';
            default: return 'superior';
        }
    };

    const getCategoryStyle = (type: NodeType) => {
        switch (type) {
            case 'superior':
                return {
                    icon: 'school',
                    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
                    textColor: 'text-blue-600 dark:text-blue-400'
                };
            case 'medio-a':
                return {
                    icon: 'menu_book',
                    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
                    textColor: 'text-indigo-600 dark:text-indigo-400'
                };
            case 'medio-b':
                return {
                    icon: 'science',
                    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
                    textColor: 'text-purple-600 dark:text-purple-400'
                };
        }
    };

    const logActivity = (
        action: 'create' | 'update' | 'delete',
        entityType: 'group' | 'connection',
        entityId: string,
        entityName: string,
        details?: string
    ) => {
        const entry: ActivityLogEntry = {
            id: `log-${Date.now()}`,
            action,
            entityType,
            entityId,
            entityName,
            timestamp: new Date(),
            details
        };
        setActivityLog(prev => [entry, ...prev]);
    };

    // CRUD Handlers
    const handleOpenCreateModal = () => {
        setEditingGroup(null);
        setFormData({
            category: tabToNodeType(activeTab),
            name: '',
            leader: '',
            participants: ''
        });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (group: GroupData) => {
        setEditingGroup(group);
        setFormData({
            category: group.type,
            name: group.title,
            leader: group.leaderName || '',
            participants: group.members.join('\n')
        });
        setIsModalOpen(true);
    };

    const handleSaveGroup = () => {
        if (!isFormValid()) return;

        const members = parseParticipants(formData.participants);
        const now = new Date();

        if (editingGroup) {
            const updatedGroup: GroupData = {
                ...editingGroup,
                type: formData.category,
                title: formData.name.trim(),
                leaderName: formData.leader.trim() || undefined,
                members,
                updatedAt: now
            };

            setGroups(prev =>
                prev.map(g => g.id === editingGroup.id ? updatedGroup : g)
            );

            logActivity('update', 'group', editingGroup.id, formData.name.trim());
        } else {
            const newGroup: GroupData = {
                id: generateId(),
                type: formData.category,
                title: formData.name.trim(),
                leaderName: formData.leader.trim() || undefined,
                members,
                createdAt: now,
                updatedAt: now
            };

            setGroups(prev => [...prev, newGroup]);
            logActivity('create', 'group', newGroup.id, newGroup.title);
        }

        setIsModalOpen(false);
        setEditingGroup(null);
    };

    const handleOpenDeleteConfirm = (group: GroupData) => {
        setDeleteConfirmGroup(group);
    };

    const handleConfirmDelete = () => {
        if (!deleteConfirmGroup) return;

        const groupId = deleteConfirmGroup.id;
        const groupName = deleteConfirmGroup.title;

        setGroups(prev => prev.filter(g => g.id !== groupId));
        setEdges(prev => prev.filter(e =>
            e.sourceId !== groupId && e.targetId !== groupId
        ));

        logActivity('delete', 'group', groupId, groupName, 'Deleted with associated connections');

        setDeleteConfirmGroup(null);
    };

    const handleCancelDelete = () => {
        setDeleteConfirmGroup(null);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingGroup(null);
    };

    // Computed Values
    const filteredGroups = groups.filter(group => {
        const matchesTab = group.type === tabToNodeType(activeTab);
        const matchesSearch = searchQuery.trim() === '' ||
            group.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            group.leaderName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            group.members.some(m => m.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesTab && matchesSearch;
    });

    const superiorCount = groups.filter(g => g.type === 'superior').length;
    const medioACount = groups.filter(g => g.type === 'medio-a').length;
    const medioBCount = groups.filter(g => g.type === 'medio-b').length;

    // Render Group Card
    const renderGroupCard = (group: GroupData) => {
        const style = getCategoryStyle(group.type);

        return (
            <div
                key={group.id}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer group"
            >
                <div className="flex justify-between items-start mb-4">
                    <div className={`${style.bgColor} ${style.textColor} p-2.5 rounded-lg`}>
                        <span className="material-symbols-outlined text-[24px]">{style.icon}</span>
                    </div>
                    <div className="flex gap-1">
                        <button
                            onClick={() => handleOpenEditModal(group)}
                            className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-primary transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button
                            onClick={() => handleOpenDeleteConfirm(group)}
                            className="p-1.5 rounded-md text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                    </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{group.title}</h3>
                {group.leaderName && (
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                        Led by {group.leaderName}
                    </p>
                )}
                {!group.leaderName && (
                    <p className="text-slate-400 dark:text-slate-500 text-sm mb-4 italic">
                        No leader assigned
                    </p>
                )}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                    {group.leaderName ? (
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                                <span className="material-symbols-outlined text-[14px] text-slate-500">person</span>
                            </div>
                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{group.leaderName}</p>
                        </div>
                    ) : (
                        <div></div>
                    )}
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <span className="material-symbols-outlined text-[16px]">person</span>
                        <span className="text-xs font-bold">{group.members.length} Members</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white transition-colors duration-200">
            {/* Sidebar */}
            <aside className="hidden lg:flex flex-col w-72 h-full bg-card-light dark:bg-card-dark border-r border-slate-200 dark:border-slate-700 flex-shrink-0 z-20">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-8">
                        <div
                            className="bg-center bg-no-repeat bg-cover rounded-full h-10 w-10 shadow-sm"
                            style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuC5I62U5VCjRuf3H8Ic3FeQvZbcF0NRBAVNL4eH9Nk37oy900-obrd0BamQC0vsMKM3MdNHFPdAnNvbko4E1sZsZACTRKgt-lVrDYpFoBPBxDEyk-IVatSGUdEFXchEu3jPckHWgBFlKaoFXk_hYLkBBvzt-C5CnIlWMGFOukwwRMDtpyWL-FzIPvJHAHRObVUahKv1hjO2SKBl7ThJdAoFkDCnWWyZ1M-gglPxBLlQAGdnLcZEOMi3dH_23KLXl5TOJABWBYnGF6aT")' }}
                        ></div>
                        <div className="flex flex-col">
                            <h1 className="text-slate-900 dark:text-white text-base font-bold leading-tight">Prof Charleno</h1>
                            <p className="text-primary text-xs font-semibold uppercase tracking-wide">Admin Panel</p>
                        </div>
                    </div>
                    <nav className="flex flex-col gap-2">
                        <button className="flex items-center gap-3 px-3 py-3 rounded-lg bg-primary/10 text-primary group transition-colors w-full text-left">
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
                            <span className="text-sm font-bold">Dashboard</span>
                        </button>
                        <button className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors w-full text-left">
                            <span className="material-symbols-outlined">groups</span>
                            <span className="text-sm font-medium">Groups</span>
                        </button>
                        <button className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors w-full text-left">
                            <span className="material-symbols-outlined">link</span>
                            <span className="text-sm font-medium">Connections</span>
                        </button>
                        <button className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors w-full text-left">
                            <span className="material-symbols-outlined">settings</span>
                            <span className="text-sm font-medium">Settings</span>
                        </button>
                    </nav>
                </div>
                <div className="mt-auto p-6 border-t border-slate-200 dark:border-slate-700">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors w-full text-left"
                    >
                        <span className="material-symbols-outlined">logout</span>
                        <span className="text-sm font-medium">Log Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 h-full overflow-y-auto overflow-x-hidden relative">
                <div className="max-w-7xl mx-auto p-6 lg:p-10 flex flex-col gap-8">

                    {/* Page Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Management Dashboard</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-base">Overview of student groups and app ecosystem</p>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-card-dark px-4 py-2 rounded-full shadow-sm border border-slate-100 dark:border-slate-700">
                            <span className="material-symbols-outlined text-primary text-[20px]">calendar_today</span>
                            <span>Academic Year 2023-2024</span>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col gap-2 relative overflow-hidden group">
                            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="material-symbols-outlined text-4xl text-primary">school</span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Superior Groups</p>
                            <p className="text-3xl font-bold text-slate-900 dark:text-white">{superiorCount}</p>
                            <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold mt-1">
                                <span className="material-symbols-outlined text-[16px]">trending_up</span>
                                <span>Active</span>
                            </div>
                        </div>
                        <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col gap-2 relative overflow-hidden group">
                            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="material-symbols-outlined text-4xl text-indigo-500">menu_book</span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Class A Groups</p>
                            <p className="text-3xl font-bold text-slate-900 dark:text-white">{medioACount}</p>
                            <div className="flex items-center gap-1 text-slate-400 text-xs font-medium mt-1">
                                <span>Active</span>
                            </div>
                        </div>
                        <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col gap-2 relative overflow-hidden group">
                            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="material-symbols-outlined text-4xl text-purple-500">science</span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Class B Groups</p>
                            <p className="text-3xl font-bold text-slate-900 dark:text-white">{medioBCount}</p>
                            <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold mt-1">
                                <span className="material-symbols-outlined text-[16px]">trending_up</span>
                                <span>Active</span>
                            </div>
                        </div>
                        <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col gap-2 relative overflow-hidden group">
                            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="material-symbols-outlined text-4xl text-orange-500">apps</span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Registered Apps</p>
                            <p className="text-3xl font-bold text-slate-900 dark:text-white">{edges.length}</p>
                            <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold mt-1">
                                <span className="material-symbols-outlined text-[16px]">add_circle</span>
                                <span>Connections</span>
                            </div>
                        </div>
                    </div>

                    {/* Group Management Section */}
                    <section className="bg-card-light dark:bg-card-dark rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                        {/* Tabs Header */}
                        <div className="border-b border-slate-200 dark:border-slate-700 px-6 pt-2 bg-slate-50/50 dark:bg-slate-800/30">
                            <div className="flex gap-8 overflow-x-auto no-scrollbar">
                                {['Superior', 'Ensino Médio - Class A', 'Ensino Médio - Class B'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`relative pb-4 pt-4 text-sm font-bold border-b-[3px] transition-colors whitespace-nowrap ${
                                            activeTab === tab
                                            ? 'text-primary border-primary'
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border-transparent'
                                        }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Toolbar */}
                        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="relative w-full md:w-80">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-slate-400">search</span>
                                </div>
                                <input
                                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg leading-5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                                    placeholder="Search groups..."
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={handleOpenCreateModal}
                                className="flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-md shadow-blue-500/20"
                            >
                                <span className="material-symbols-outlined text-[20px]">add</span>
                                <span>Add New Group</span>
                            </button>
                        </div>

                        {/* Groups Grid */}
                        <div className="p-6 pt-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredGroups.length === 0 ? (
                                <div className="col-span-full text-center py-12">
                                    <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-2">
                                        folder_off
                                    </span>
                                    <p className="text-slate-500 dark:text-slate-400">
                                        No groups found. Create your first group!
                                    </p>
                                </div>
                            ) : (
                                filteredGroups.map(group => renderGroupCard(group))
                            )}
                        </div>

                        <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-center">
                            <button className="text-sm font-semibold text-primary hover:text-blue-700 dark:hover:text-blue-400 flex items-center gap-1">
                                Show all groups <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                            </button>
                        </div>
                    </section>

                    {/* Connection & App List */}
                    <section className="bg-card-light dark:bg-card-dark rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Connection & App List</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage integrations between study groups and external apps</p>
                            </div>
                            <button className="flex items-center justify-center gap-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg font-bold text-sm transition-colors">
                                <span className="material-symbols-outlined text-[20px]">filter_list</span>
                                <span>Filter</span>
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                                        <th className="p-4 pl-6 border-b border-slate-100 dark:border-slate-700">Superior Group</th>
                                        <th className="p-4 border-b border-slate-100 dark:border-slate-700">Middle School Group</th>
                                        <th className="p-4 border-b border-slate-100 dark:border-slate-700">App Name</th>
                                        <th className="p-4 border-b border-slate-100 dark:border-slate-700">Last Sync</th>
                                        <th className="p-4 border-b border-slate-100 dark:border-slate-700">Status</th>
                                        <th className="p-4 pr-6 border-b border-slate-100 dark:border-slate-700 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
                                    {edges.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-slate-500 dark:text-slate-400">
                                                No connections yet. Create groups and connect them on the Canvas.
                                            </td>
                                        </tr>
                                    ) : (
                                        edges.map(edge => (
                                            <tr key={edge.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="p-4 pl-6 font-bold text-slate-800 dark:text-white">
                                                    {groups.find(g => g.id === edge.targetId)?.title || 'Unknown'}
                                                </td>
                                                <td className="p-4 text-slate-600 dark:text-slate-300">
                                                    {groups.find(g => g.id === edge.sourceId)?.title || 'Unknown'}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded bg-orange-100 flex items-center justify-center text-orange-600">
                                                            <span className="material-symbols-outlined text-[16px]">link</span>
                                                        </div>
                                                        <span className="font-medium text-slate-900 dark:text-white">{edge.label}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-slate-500 dark:text-slate-400">Just now</td>
                                                <td className="p-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                        Active
                                                    </span>
                                                </td>
                                                <td className="p-4 pr-6 text-right">
                                                    <button className="text-slate-400 hover:text-primary transition-colors">
                                                        <span className="material-symbols-outlined">more_vert</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </main>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={handleCloseModal}></div>
                    <div className="relative w-full max-w-lg transform rounded-2xl bg-white dark:bg-card-dark p-6 text-left shadow-xl transition-all border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                {editingGroup ? 'Edit Group' : 'Add New Group'}
                            </h3>
                            <button
                                onClick={handleCloseModal}
                                className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 transition-colors rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="flex flex-col gap-4">
                            {/* Category Dropdown */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Group Category
                                </label>
                                <div className="relative">
                                    <select
                                        className="w-full appearance-none rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-slate-900 dark:text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                                        value={formData.category}
                                        onChange={(e) => setFormData({...formData, category: e.target.value as NodeType})}
                                    >
                                        <option value="superior">Superior</option>
                                        <option value="medio-a">Médio A</option>
                                        <option value="medio-b">Médio B</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                        <span className="material-symbols-outlined text-[20px]">expand_more</span>
                                    </div>
                                </div>
                            </div>

                            {/* Group Name */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Group Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-slate-900 dark:text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm placeholder-slate-400"
                                    placeholder="e.g. Advanced Mathematics"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                />
                            </div>

                            {/* Group Leader */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Group Leader
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                        <span className="material-symbols-outlined text-[18px]">person</span>
                                    </span>
                                    <input
                                        type="text"
                                        className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 pl-10 pr-3 py-2.5 text-slate-900 dark:text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm placeholder-slate-400"
                                        placeholder="Enter leader name..."
                                        value={formData.leader}
                                        onChange={(e) => setFormData({...formData, leader: e.target.value})}
                                    />
                                </div>
                            </div>

                            {/* Participants Textarea */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Participants <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    rows={3}
                                    className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-slate-900 dark:text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm placeholder-slate-400"
                                    placeholder="Enter student names..."
                                    value={formData.participants}
                                    onChange={(e) => setFormData({...formData, participants: e.target.value})}
                                ></textarea>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                    Separate names with commas or new lines. ({parseParticipants(formData.participants).length} participants)
                                </p>
                            </div>
                        </div>
                        <div className="mt-8 flex items-center justify-end gap-3">
                            <button
                                onClick={handleCloseModal}
                                className="px-4 py-2 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveGroup}
                                disabled={!isFormValid()}
                                className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-primary hover:bg-blue-600 shadow-md shadow-blue-500/20 transition-colors disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed disabled:shadow-none"
                            >
                                {editingGroup ? 'Update Group' : 'Save Group'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmGroup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={handleCancelDelete}></div>
                    <div className="relative w-full max-w-sm transform rounded-2xl bg-white dark:bg-card-dark p-6 text-left shadow-xl transition-all border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-2xl">warning</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Group</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">This action cannot be undone.</p>
                            </div>
                        </div>

                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
                            Are you sure you want to delete <strong>"{deleteConfirmGroup.title}"</strong>?
                            All associated connections will also be removed.
                        </p>

                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={handleCancelDelete}
                                className="px-4 py-2 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-500/20 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminScreen;
