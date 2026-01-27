'use client';

import { useState, useEffect, useRef } from 'react';

interface CreateGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: {
        name: string;
        type: 'superior' | 'medio-a' | 'medio-b';
        members: string[];
    }) => void;
    isSaving?: boolean;
}

const GROUP_TYPES = [
    { value: 'superior', label: 'Ensino Superior', icon: 'school', color: 'blue' },
    { value: 'medio-a', label: '2º Ano A', icon: 'menu_book', color: 'amber' },
    { value: 'medio-b', label: '2º Ano B', icon: 'science', color: 'violet' },
] as const;

export function CreateGroupModal({
    isOpen,
    onClose,
    onSave,
    isSaving = false,
}: CreateGroupModalProps) {
    const [name, setName] = useState('');
    const [type, setType] = useState<'superior' | 'medio-a' | 'medio-b'>('superior');
    const [memberInput, setMemberInput] = useState('');
    const [members, setMembers] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setName('');
            setType('superior');
            setMemberInput('');
            setMembers([]);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

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

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddMember();
        }
    };

    const handleSave = () => {
        if (name.trim()) {
            onSave({ name: name.trim(), type, members });
        }
    };

    if (!isOpen) return null;

    const selectedType = GROUP_TYPES.find(t => t.value === type);

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
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center">
                        <span className="material-symbols-outlined text-teal-600 text-2xl">group_add</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Cadastrar Grupo</h3>
                        <p className="text-sm text-slate-500">Adicione um novo grupo ao canvas</p>
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
                            className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 py-3 text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-sm placeholder-slate-400 transition-all"
                            placeholder="Ex: Equipe Alpha"
                        />
                    </div>
                </div>

                {/* Tipo do Grupo */}
                <div className="mb-4">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Tipo do Grupo <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {GROUP_TYPES.map((groupType) => (
                            <button
                                key={groupType.value}
                                type="button"
                                onClick={() => setType(groupType.value)}
                                className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${
                                    type === groupType.value
                                        ? groupType.color === 'blue'
                                            ? 'border-blue-500 bg-blue-50'
                                            : groupType.color === 'amber'
                                            ? 'border-amber-500 bg-amber-50'
                                            : 'border-violet-500 bg-violet-50'
                                        : 'border-slate-200 hover:border-slate-300'
                                }`}
                            >
                                <span
                                    className={`material-symbols-outlined text-xl ${
                                        type === groupType.value
                                            ? groupType.color === 'blue'
                                                ? 'text-blue-600'
                                                : groupType.color === 'amber'
                                                ? 'text-amber-600'
                                                : 'text-violet-600'
                                            : 'text-slate-400'
                                    }`}
                                >
                                    {groupType.icon}
                                </span>
                                <span className={`text-xs font-medium ${
                                    type === groupType.value ? 'text-slate-800' : 'text-slate-500'
                                }`}>
                                    {groupType.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Membros */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Membros
                    </label>
                    <div className="flex gap-2 mb-2">
                        <div className="relative flex-1">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person</span>
                            </span>
                            <input
                                type="text"
                                value={memberInput}
                                onChange={(e) => setMemberInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 py-2.5 text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-sm placeholder-slate-400 transition-all"
                                placeholder="Nome do membro"
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
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 text-sm text-slate-700"
                                >
                                    {member}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveMember(member)}
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
                        className="px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-teal-500 hover:bg-teal-600 shadow-md shadow-teal-500/20 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-2"
                    >
                        {isSaving && <span className="animate-spin material-symbols-outlined text-sm">progress_activity</span>}
                        Cadastrar Grupo
                    </button>
                </div>
            </div>
        </div>
    );
}
