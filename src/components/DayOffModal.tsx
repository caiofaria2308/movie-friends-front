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

    useEffect(() => {
        if (isOpen && selectedDate) {
            const dateStr = selectedDate.toISOString().split('T')[0];
            setInitDate(dateStr);
            setEndDate(dateStr);
        }
    }, [isOpen, selectedDate]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const [initH, initM] = initHour.split(':');
            const [endH, endM] = endHour.split(':');

            const init = new Date(initDate);
            init.setHours(parseInt(initH), parseInt(initM), 0, 0);

            const end = new Date(endDate);
            end.setHours(parseInt(endH), parseInt(endM), 0, 0);

            // Using full date-time strings to avoid timezone issues when constructing
            const initISO = new Date(`${initDate}T${initHour}`).toISOString();
            const endISO = new Date(`${endDate}T${endHour}`).toISOString();

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
                                type="date"
                                value={initDate}
                                onChange={(e) => setInitDate(e.target.value)}
                                required
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Data Final</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.field}>
                            <label>Hora Inicial</label>
                            <input
                                type="time"
                                value={initHour}
                                onChange={(e) => setInitHour(e.target.value)}
                                required
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Hora Final</label>
                            <input
                                type="time"
                                value={endHour}
                                onChange={(e) => setEndHour(e.target.value)}
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
