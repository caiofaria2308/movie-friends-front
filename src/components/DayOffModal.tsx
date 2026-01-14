import { useState, useEffect } from 'react';
import { X, Trash2, Calendar, Clock, AlertTriangle } from 'lucide-react';
import type { DayOff } from '../types/dayoff';
import styles from './DayOffModal.module.css';

interface DayOffModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (dayOff: Partial<DayOff>) => Promise<void>;
    onUpdate?: (id: number, dayOff: Partial<DayOff>, mode: 'single' | 'future' | 'all') => Promise<void>;
    onDelete?: (id: number, mode: 'single' | 'future' | 'all') => Promise<void>;
    selectedDate?: Date;
    editingDayOff?: DayOff;
}

type RecurrenceMode = 'single' | 'future' | 'all';

const DayOffModal = ({
    isOpen,
    onClose,
    onSave,
    onUpdate,
    onDelete,
    selectedDate,
    editingDayOff
}: DayOffModalProps) => {
    const [initDate, setInitDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [initHour, setInitHour] = useState('08:00');
    const [endHour, setEndHour] = useState('18:00');
    const [repeat, setRepeat] = useState(false);
    const [repeatType, setRepeatType] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('weekly');
    const [repeatCount, setRepeatCount] = useState('1');
    const [loading, setLoading] = useState(false);

    // UI States
    const [confirmMode, setConfirmMode] = useState<'update' | 'delete' | null>(null);
    const [selectedMode, setSelectedMode] = useState<RecurrenceMode>('single');

    const isEditing = !!editingDayOff;

    const formatDate = (date: Date) => {
        const d = String(date.getDate()).padStart(2, '0');
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const y = date.getFullYear();
        return `${d}/${m}/${y}`;
    };

    const formatToInputTime = (isoString: string) => {
        const date = new Date(isoString);
        const h = String(date.getHours()).padStart(2, '0');
        const m = String(date.getMinutes()).padStart(2, '0');
        return `${h}:${m}`;
    };

    const parseDisplayDate = (displayDate: string) => {
        const [d, m, y] = displayDate.split('/');
        return `${y}-${m}-${d}`;
    };

    useEffect(() => {
        if (isOpen) {
            if (editingDayOff) {
                setInitDate(formatDate(new Date(editingDayOff.init_hour)));
                setEndDate(formatDate(new Date(editingDayOff.end_hour)));
                setInitHour(formatToInputTime(editingDayOff.init_hour));
                setEndHour(formatToInputTime(editingDayOff.end_hour));
                setRepeat(!!editingDayOff.repeat);
                setRepeatType((editingDayOff.repeat_type as 'daily' | 'weekly' | 'monthly' | 'yearly') || 'weekly');
                setRepeatCount(editingDayOff.repeat_value || '1');
            } else if (selectedDate) {
                setInitDate(formatDate(selectedDate));
                setEndDate(formatDate(selectedDate));
                setInitHour('08:00');
                setEndHour('18:00');
                setRepeat(false);
            }
            setConfirmMode(null);
            setSelectedMode('single');
        }
    }, [isOpen, selectedDate, editingDayOff]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing && editingDayOff?.repeat && !confirmMode) {
            setConfirmMode('update');
            return;
        }

        await handleFinalAction('update');
    };

    const handleFinalAction = async (action: 'update' | 'delete') => {
        setLoading(true);
        try {
            const apiInitDate = parseDisplayDate(initDate);
            const apiEndDate = parseDisplayDate(endDate);

            const initISO = new Date(`${apiInitDate}T${initHour}`).toISOString();
            const endISO = new Date(`${apiEndDate}T${endHour}`).toISOString();

            if (action === 'delete') {
                if (onDelete && editingDayOff?.id) {
                    await onDelete(editingDayOff.id, selectedMode);
                }
            } else {
                const dayOffData: Partial<DayOff> = {
                    init_hour: initISO,
                    end_hour: endISO,
                    repeat,
                };

                if (repeat) {
                    dayOffData.repeat_type = repeatType;
                    dayOffData.repeat_value = repeatCount;
                }

                if (isEditing && onUpdate && editingDayOff?.id) {
                    await onUpdate(editingDayOff.id, dayOffData, selectedMode);
                } else {
                    await onSave(dayOffData);
                }
            }
            onClose();
        } catch (error) {
            console.error(`Error ${action === 'delete' ? 'deleting' : 'saving'} day off`, error);
            alert(`Erro ao ${action === 'delete' ? 'deletar' : 'salvar'} day off`);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = () => {
        if (editingDayOff?.repeat) {
            setConfirmMode('delete');
        } else {
            handleFinalAction('delete');
        }
    };

    const renderRecurrenceOptions = () => (
        <div className={styles.recurrenceMode}>
            <h3 className={styles.recurrenceTitle}>
                {confirmMode === 'delete' ? 'Deseja excluir...' : 'Deseja alterar...'}
            </h3>
            <div className={styles.modeOptions}>
                <button
                    type="button"
                    className={`${styles.modeOption} ${selectedMode === 'single' ? styles.modeOptionActive : ''}`}
                    onClick={() => setSelectedMode('single')}
                >
                    <div className={styles.modeIcon}><Calendar size={24} /></div>
                    <div className={styles.modeTextContainer}>
                        <span className={styles.modeLabel}>Somente esta ocorrência</span>
                        <span className={styles.modeDescription}>Altera apenas o dia selecionado.</span>
                    </div>
                </button>
                <button
                    type="button"
                    className={`${styles.modeOption} ${selectedMode === 'future' ? styles.modeOptionActive : ''}`}
                    onClick={() => setSelectedMode('future')}
                >
                    <div className={styles.modeIcon}><Clock size={24} /></div>
                    <div className={styles.modeTextContainer}>
                        <span className={styles.modeLabel}>Esta e todas as futuras</span>
                        <span className={styles.modeDescription}>Altera este dia e os próximos da série.</span>
                    </div>
                </button>
                <button
                    type="button"
                    className={`${styles.modeOption} ${selectedMode === 'all' ? styles.modeOptionActive : ''}`}
                    onClick={() => setSelectedMode('all')}
                >
                    <div className={styles.modeIcon}><AlertTriangle size={24} /></div>
                    <div className={styles.modeTextContainer}>
                        <span className={styles.modeLabel}>Todas as ocorrências</span>
                        <span className={styles.modeDescription}>Altera toda a série de repetições.</span>
                    </div>
                </button>
            </div>

            <div className={styles.actions}>
                <button type="button" onClick={() => setConfirmMode(null)} className={styles.cancelButton}>
                    Voltar
                </button>
                <button
                    type="button"
                    onClick={() => handleFinalAction(confirmMode!)}
                    className={confirmMode === 'delete' ? styles.deleteButton : styles.saveButton}
                    disabled={loading}
                    style={{ marginTop: 0 }}
                >
                    {loading ? 'Processando...' : 'Confirmar'}
                </button>
            </div>
        </div>
    );

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>
                        {confirmMode ? 'Opções de Recorrência' : (isEditing ? 'Atualizar Day Off' : 'Adicionar Day Off')}
                    </h2>
                    <button onClick={onClose} className={styles.closeButton}>
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.form}>
                    {confirmMode ? (
                        renderRecurrenceOptions()
                    ) : (
                        <form onSubmit={handleSubmit} className={styles.form} style={{ padding: 0 }}>
                            <div className={styles.row}>
                                <div className={styles.field}>
                                    <label>Data Inicial</label>
                                    <input
                                        type="text"
                                        placeholder="DD/MM/AAAA"
                                        value={initDate}
                                        onChange={(e) => {
                                            let val = e.target.value.replace(/\D/g, '');
                                            if (val.length > 8) val = val.slice(0, 8);
                                            if (val.length >= 5) val = `${val.slice(0, 2)}/${val.slice(2, 4)}/${val.slice(4)}`;
                                            else if (val.length >= 3) val = `${val.slice(0, 2)}/${val.slice(2)}`;
                                            setInitDate(val);
                                        }}
                                        required
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label>Data Final</label>
                                    <input
                                        type="text"
                                        placeholder="DD/MM/AAAA"
                                        value={endDate}
                                        onChange={(e) => {
                                            let val = e.target.value.replace(/\D/g, '');
                                            if (val.length > 8) val = val.slice(0, 8);
                                            if (val.length >= 5) val = `${val.slice(0, 2)}/${val.slice(2, 4)}/${val.slice(4)}`;
                                            else if (val.length >= 3) val = `${val.slice(0, 2)}/${val.slice(2)}`;
                                            setEndDate(val);
                                        }}
                                        required
                                    />
                                </div>
                            </div>

                            <div className={styles.row}>
                                <div className={styles.field}>
                                    <label>Hora Inicial</label>
                                    <input
                                        type="text"
                                        placeholder="HH:MM"
                                        value={initHour}
                                        onChange={(e) => {
                                            let val = e.target.value.replace(/\D/g, '');
                                            if (val.length > 4) val = val.slice(0, 4);
                                            if (val.length >= 3) val = `${val.slice(0, 2)}:${val.slice(2)}`;
                                            setInitHour(val);
                                        }}
                                        required
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label>Hora Final</label>
                                    <input
                                        type="text"
                                        placeholder="HH:MM"
                                        value={endHour}
                                        onChange={(e) => {
                                            let val = e.target.value.replace(/\D/g, '');
                                            if (val.length > 4) val = val.slice(0, 4);
                                            if (val.length >= 3) val = `${val.slice(0, 2)}:${val.slice(2)}`;
                                            setEndHour(val);
                                        }}
                                        required
                                    />
                                </div>
                            </div>

                            {!isEditing && (
                                <>
                                    <div className={styles.field}>
                                        <label className={styles.checkbox}>
                                            <input
                                                type="checkbox"
                                                checked={repeat}
                                                onChange={(e) => setRepeat(e.target.checked)}
                                            />
                                            <span>Repetir</span>
                                        </label>
                                    </div>

                                    {repeat && (
                                        <>
                                            <div className={styles.field}>
                                                <label>Tipo de Recorrência</label>
                                                <select
                                                    value={repeatType}
                                                    onChange={(e) => setRepeatType(e.target.value as 'daily' | 'weekly' | 'monthly' | 'yearly')}
                                                >
                                                    <option value="daily">Diário</option>
                                                    <option value="weekly">Semanal</option>
                                                    <option value="monthly">Mensal</option>
                                                    <option value="yearly">Anual</option>
                                                </select>
                                            </div>

                                            <div className={styles.field}>
                                                <label>Número de Ocorrências</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="365"
                                                    value={repeatCount}
                                                    onChange={(e) => setRepeatCount(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            <div className={isEditing ? styles.actionGrid : styles.actions}>
                                {isEditing ? (
                                    <>
                                        <button type="button" onClick={handleDeleteClick} className={styles.deleteButton}>
                                            <Trash2 size={18} style={{ marginRight: '8px' }} />
                                            Excluir
                                        </button>
                                        <button type="submit" disabled={loading} className={styles.saveButton}>
                                            {loading ? 'Salvando...' : 'Salvar'}
                                        </button>
                                        <button type="button" onClick={onClose} className={`${styles.cancelButton} ${styles.fullWidth}`}>
                                            Cancelar
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button type="button" onClick={onClose} className={styles.cancelButton}>
                                            Cancelar
                                        </button>
                                        <button type="submit" disabled={loading} className={styles.saveButton}>
                                            {loading ? 'Salvando...' : 'Salvar'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DayOffModal;
