'use client';

import { useState, useEffect, useRef } from 'react';

interface EditGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: {
        name: string;
        leaderName: string | null;
        members: string[];
    }) => void;
    groupData?: {
        id: string;
        name: string;
        type: 'superior' | 'medio-a' | 'medio-b';
        leaderName?: string;
        members: string[];
    } | null;
    isSaving?: boolean;
}

export function EditGroupModal({
    isOpen,
    onClose,
    onSave,
    groupData,
    isSaving = false,
}: EditGroupModalProps) {
    const [name, setName] = useState('');
    const [leaderName, setLeaderName] = useState('');
    const [memberInput, setMemberInput] = useState('');
    const [members, setMembers] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && groupData) {
            setName(groupData.name);
            setLeaderName(groupData.leaderName || '');
            setMembers(groupData.members || []);
            setMemberInput('');
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen, groupData]);

    const handleAddMember = () => {
        const trimmed = memberInput.trim();
        if (trimmed && !members.includes(trimmed)) {
            setMembers([...members, trimmed]);
            setMemberInput('');
        }
    };

    const handleRemoveMember = (memberToRemove: string) => {
        setMembers(members.filter(m => m !== memberToRemove));
    };

    const handleSetLeader = (member: string) => {
        setLeaderName(member);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddMember();
        }
    };

    const handleSave = () => {
        if (name.trim()) {
            onSave({
                name: name.trim(),
                leaderName: leaderName.trim() || null,
                members,
            });
        }
    };

    if (!isOpen || !groupData) return null;

    const typeLabels = {
        superior: 'Ensino Superior',
        'medio-a': '2º Ano A',
        'medio-b': '2º Ano B',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md transform rounded-2xl bg-white p-6 text-left shadow-xl transition-all border border-slate-100 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center gap-4 mb-5">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                        <span className="material-symbols-outlined text-blue-600 text-2xl">edit</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Editar Grupo</h3>
                        <p className="text-sm text-slate-500">{typeLabels[groupData.type]}</p>
                    </div>
                </div>

                {/* Nome do Grupo */}
                <div className="mb-4">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Nome do Grupo <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>badge</span>
                        </span>
                        <input
                            ref={inputRef}
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm placeholder-slate-400 transition-all"
                            placeholder="Ex: Equipe Alpha"
                        />
                    </div>
                </div>

                {/* Líder do Grupo */}
                <div className="mb-4">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Líder do Grupo
                    </label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person</span>
                        </span>
                        <input
                            type="text"
                            value={leaderName}
                            onChange={(e) => setLeaderName(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm placeholder-slate-400 transition-all"
                            placeholder="Nome do líder"
                        />
                    </div>
                    {members.length > 0 && (
                        <p className="text-xs text-slate-400 mt-2">
                            Ou clique em um membro abaixo para defini-lo como líder
                        </p>
                    )}
                </div>

                {/* Membros */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Membros
                    </label>
                    <div className="flex gap-2 mb-2">
                        <div className="relative flex-1">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>group</span>
                            </span>
                            <input
                                type="text"
                                value={memberInput}
                                onChange={(e) => setMemberInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm placeholder-slate-400 transition-all"
                                placeholder="Adicionar membro"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleAddMember}
                            disabled={!memberInput.trim()}
                            className="px-3 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span>
                        </button>
                    </div>

                    {members.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {members.map((member, index) => (
                                <span
                                    key={index}
                                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm cursor-pointer transition-all ${
                                        member === leaderName
                                            ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                                    onClick={() => handleSetLeader(member)}
                                    title="Clique para definir como líder"
                                >
                                    {member === leaderName && (
                                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>star</span>
                                    )}
                                    {member}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveMember(member);
                                            if (member === leaderName) setLeaderName('');
                                        }}
                                        className="ml-1 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    {members.length === 0 && (
                        <p className="text-xs text-slate-400 mt-2">
                            Pressione Enter ou clique em + para adicionar membros
                        </p>
                    )}
                </div>

                <div className="flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2.5 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                        disabled={isSaving}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!name.trim() || isSaving}
                        className="px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-blue-500 hover:bg-blue-600 shadow-md shadow-blue-500/20 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-2"
                    >
                        {isSaving && <span className="animate-spin material-symbols-outlined text-sm">progress_activity</span>}
                        Salvar Alterações
                    </button>
                </div>
            </div>
        </div>
    );
}
