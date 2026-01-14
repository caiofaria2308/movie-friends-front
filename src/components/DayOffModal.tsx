import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { DayOff } from '../types/dayoff';
import styles from './DayOffModal.module.css';

interface DayOffModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (dayOff: Partial<DayOff>) => Promise<void>;
    selectedDate?: Date;
}

const DayOffModal = ({ isOpen, onClose, onSave, selectedDate }: DayOffModalProps) => {
    const [initDate, setInitDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [initHour, setInitHour] = useState('08:00');
    const [endHour, setEndHour] = useState('18:00');
    const [repeat, setRepeat] = useState(false);
    const [repeatType, setRepeatType] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('weekly');
    const [repeatCount, setRepeatCount] = useState('1');
    const [loading, setLoading] = useState(false);

    const formatDate = (date: Date) => {
        const d = String(date.getDate()).padStart(2, '0');
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const y = date.getFullYear();
        return `${d}/${m}/${y}`;
    };

    const parseDisplayDate = (displayDate: string) => {
        const [d, m, y] = displayDate.split('/');
        return `${y}-${m}-${d}`;
    };

    useEffect(() => {
        if (isOpen && selectedDate) {
            setInitDate(formatDate(selectedDate));
            setEndDate(formatDate(selectedDate));
        }
    }, [isOpen, selectedDate]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const apiInitDate = parseDisplayDate(initDate);
            const apiEndDate = parseDisplayDate(endDate);

            // Using full date-time strings to avoid timezone issues when constructing
            const initISO = new Date(`${apiInitDate}T${initHour}`).toISOString();
            const endISO = new Date(`${apiEndDate}T${endHour}`).toISOString();

            const dayOffData: Partial<DayOff> = {
                init_hour: initISO,
                end_hour: endISO,
                repeat,
            };

            if (repeat) {
                dayOffData.repeat_type = repeatType;
                dayOffData.repeat_value = repeatCount;
            }

            await onSave(dayOffData);
            onClose();
        } catch (error) {
            console.error('Error saving day off', error);
            alert('Erro ao salvar day off');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Adicionar Day Off</h2>
                    <button onClick={onClose} className={styles.closeButton}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
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

                    <div className={styles.actions}>
                        <button type="button" onClick={onClose} className={styles.cancelButton}>
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading} className={styles.saveButton}>
                            {loading ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DayOffModal;
