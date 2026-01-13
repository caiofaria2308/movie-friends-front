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


    const fetchDayOffs = async (date: Date) => {
        try {
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const response = await api.get(`/api/user/dayoff?filter_type=month&year=${year}&month=${month}`);
            setDayOffs(response.data || []);
        } catch (error) {
            console.error('Error fetching day offs', error);
        }
    };

    useEffect(() => {
        fetchDayOffs(new Date());
    }, []);

    const handleDayClick = (value: Date) => {
        const existing = dayOffs.find(d => {
            const start = new Date(d.init_hour);
            const end = new Date(d.end_hour);
            const vTime = new Date(value).setHours(0, 0, 0, 0);
            const sTime = new Date(start).setHours(0, 0, 0, 0);
            const eTime = new Date(end).setHours(0, 0, 0, 0);
            return vTime >= sTime && vTime <= eTime;
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
            await fetchDayOffs(selectedDate);
        } catch (error) {
            console.error('Error deleting dayoff', error);
            alert('Erro ao deletar day off');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveDayOff = async (dayOffData: Partial<DayOff>) => {
        await api.post('/api/user/dayoff', dayOffData);
        await fetchDayOffs(selectedDate);
    };

    const tileClassName = ({ date, view }: { date: Date, view: string }) => {
        if (view === 'month') {
            const hasDayOff = dayOffs.some(d => {
                const start = new Date(d.init_hour);
                const end = new Date(d.end_hour);

                // Clear time parts for comparison
                const dDate = new Date(date).setHours(0, 0, 0, 0);
                const sDate = new Date(start).setHours(0, 0, 0, 0);
                const eDate = new Date(end).setHours(0, 0, 0, 0);

                return dDate >= sDate && dDate <= eDate;
            });

            if (hasDayOff) {
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
                        onActiveStartDateChange={({ activeStartDate }) => {
                            if (activeStartDate) {
                                fetchDayOffs(activeStartDate);
                            }
                        }}
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
