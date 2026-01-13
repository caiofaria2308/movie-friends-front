import { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import api from '../services/api';
import { Plus } from 'lucide-react';
import DayOffModal from '../components/DayOffModal';
import styles from './CalendarPage.module.css';
import type { DayOff } from '../types/dayoff';

const CalendarPage = () => {
    const [dayOffs, setDayOffs] = useState<DayOff[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [clickedDate, setClickedDate] = useState<Date | undefined>();

    const isSameDay = (d1: Date, d2: Date) => {
        return d1.getDate() === d2.getDate() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getFullYear() === d2.getFullYear();
    };

    const fetchDayOffs = async () => {
        try {
            const response = await api.get('/api/user/dayoff');
            setDayOffs(response.data || []);
        } catch (error) {
            console.error('Error fetching day offs', error);
        }
    };

    useEffect(() => {
        fetchDayOffs();
    }, []);

    const handleDayClick = (value: Date) => {
        const existing = dayOffs.find(d => {
            const start = new Date(d.init_hour);
            return isSameDay(start, value);
        });

        if (existing && existing.id) {
            // Show delete options
            const mode = prompt(
                'Escolha como deletar:\n' +
                '1 - Somente esta ocorrência (single)\n' +
                '2 - Esta e futuras ocorrências (future)\n' +
                '3 - Todas as ocorrências (all)',
                '1'
            );

            const modeMap: { [key: string]: string } = {
                '1': 'single',
                '2': 'future',
                '3': 'all'
            };

            const deleteMode = modeMap[mode || '1'] || 'single';

            if (confirm(`Confirmar exclusão (${deleteMode})?`)) {
                handleDeleteDayOff(existing.id, deleteMode);
            }
        } else {
            // Open modal to create
            setClickedDate(value);
            setModalOpen(true);
        }
    };

    const handleDeleteDayOff = async (id: number, mode: string) => {
        setLoading(true);
        try {
            await api.delete(`/api/user/dayoff/${id}?mode=${mode}`);
            await fetchDayOffs();
        } catch (error) {
            console.error('Error deleting dayoff', error);
            alert('Erro ao deletar day off');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveDayOff = async (dayOffData: Partial<DayOff>) => {
        await api.post('/api/user/dayoff', dayOffData);
        await fetchDayOffs();
    };

    const tileClassName = ({ date, view }: { date: Date, view: string }) => {
        if (view === 'month') {
            if (dayOffs.find(d => isSameDay(new Date(d.init_hour), date))) {
                return styles.dayOff;
            }
        }
        return null;
    };

    return (
        <div className={styles.container}>
            <div className={styles.headerSection}>
                <div>
                    <h2 className={styles.title}>Meus Day Offs</h2>
                    <p className={styles.subtitle}>Gerencie seus dias de folga e recorrências.</p>
                </div>
                <button
                    className={styles.addButton}
                    onClick={() => {
                        setClickedDate(new Date());
                        setModalOpen(true);
                    }}
                >
                    <Plus size={20} />
                    <span>Adicionar</span>
                </button>
            </div>

            <div className={styles.card}>
                <div className={styles.calendarWrapper}>
                    {loading && <p style={{ textAlign: 'center', marginBottom: '10px' }}>Atualizando...</p>}
                    <Calendar
                        onChange={(value) => setSelectedDate(value as Date)}
                        value={selectedDate}
                        onClickDay={handleDayClick}
                        tileClassName={tileClassName}
                        locale="pt-BR"
                    />
                </div>
                <div className={styles.legend}>
                    <span className={styles.dot}></span> Dias de folga
                </div>
            </div>

            <DayOffModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSaveDayOff}
                selectedDate={clickedDate}
            />
        </div>
    );
};

export default CalendarPage;
