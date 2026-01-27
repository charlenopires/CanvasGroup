'use client';

import { useState, useEffect, useRef } from 'react';

interface GradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (grade: number, observations: string) => void;
    groupName?: string;
    initialGrade?: number;
    initialObservations?: string;
    isSaving?: boolean;
}

export function GradeModal({
    isOpen,
    onClose,
    onSave,
    groupName,
    initialGrade,
    initialObservations,
    isSaving = false,
}: GradeModalProps) {
    const [grade, setGrade] = useState<string>('');
    const [observations, setObservations] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setGrade(initialGrade !== undefined ? (initialGrade / 10).toString() : '');
            setObservations(initialObservations || '');
            // Focus input after slight delay for animation
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen, initialGrade, initialObservations]);

    const handleSave = () => {
        const numericGrade = parseFloat(grade);
        if (!isNaN(numericGrade) && numericGrade >= 0 && numericGrade <= 10) {
            // Save as 0-100 (multiplying by 10)
            onSave(Math.round(numericGrade * 10), observations);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md transform rounded-2xl bg-white p-6 text-left shadow-xl transition-all border border-slate-100">
                <div className="flex items-center gap-4 mb-5">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
                        <span className="material-symbols-outlined text-amber-600 text-2xl">star</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Avaliar Grupo</h3>
                        <p className="text-sm text-slate-500">{groupName || 'Novo Grupo'}</p>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Nota (0-10) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>grade</span>
                        </span>
                        <input
                            ref={inputRef}
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            value={grade}
                            onChange={(e) => setGrade(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 py-3 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-sm placeholder-slate-400 transition-all"
                            placeholder="Ex: 8.5"
                        />
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Observações
                    </label>
                    <textarea
                        value={observations}
                        onChange={(e) => setObservations(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white p-3 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-sm placeholder-slate-400 transition-all resize-none h-24"
                        placeholder="Comentários sobre o desempenho do grupo..."
                    />
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
                        disabled={!grade || isSaving}
                        className="px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 shadow-md shadow-amber-500/20 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-2"
                    >
                        {isSaving && <span className="animate-spin material-symbols-outlined text-sm">progress_activity</span>}
                        Salvar Avaliação
                    </button>
                </div>
            </div>
        </div>
    );
}
