import { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import api from '../services/api';
import styles from './CalendarPage.module.css';
import type { DayOff } from '../types/dayoff';

const CalendarPage = () => {
    const [dayOffs, setDayOffs] = useState<DayOff[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [loading, setLoading] = useState(false);

    // Helper to strip time for comparison
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

    const handleDayClick = async (value: Date) => {
        // Determine if we are adding or removing
        // For simplicity: if exists, remove (single instance). If not, add (single instance full day).
        // Real app might show a modal for details (repeat, specific hours).

        // Check if there's a dayoff on this day
        const existing = dayOffs.find(d => {
            const start = new Date(d.init_hour);
            return isSameDay(start, value);
        });

        setLoading(true);
        try {
            if (existing && existing.id) {
                // Delete
                if (confirm('Remover day off deste dia?')) {
                    await api.delete(`/api/user/dayoff/${existing.id}?mode=single`);
                    setDayOffs(prev => prev.filter(p => p.id !== existing.id));
                }
            } else {
                // Add new (Standard 8h-18h for example, or full day)
                const init = new Date(value);
                init.setHours(8, 0, 0, 0);
                const end = new Date(value);
                end.setHours(18, 0, 0, 0);

                const payload = {
                    init_hour: init.toISOString(),
                    end_hour: end.toISOString(),
                    repeat: false
                };

                const res = await api.post('/api/user/dayoff', payload);
                // The API returns the created object
                setDayOffs([...dayOffs, res.data]);
            }
        } catch (error) {
            console.error('Error updating dayoff', error);
            alert('Erro ao atualizar day off');
        } finally {
            setLoading(false);
        }
    };

    // Custom tile class to highlight days
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
            <h2 className={styles.title}>Meus Day Offs</h2>
            <p className={styles.subtitle}>Gerencie seus dias de folga.</p>

            <div className={styles.card}>
                <div className={styles.calendarWrapper}>
                    {loading && <p style={{ textAlign: 'center', marginBottom: '10px' }}>Atualizando...</p>}
                    <Calendar
                        onChange={(value) => setSelectedDate(value as Date)}
                        value={selectedDate}
                        onClickDay={handleDayClick}
                        tileClassName={tileClassName}
                    />
                </div>
                <div className={styles.legend}>
                    <span className={styles.dot}></span> Dias de folga
                </div>
            </div>
        </div>
    );
};

export default CalendarPage;
