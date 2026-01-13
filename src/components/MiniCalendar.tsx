import { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import api from '../services/api';
import type { DayOff } from '../types/dayoff';
import styles from './MiniCalendar.module.css';

const MiniCalendar = () => {
    const [dayOffs, setDayOffs] = useState<DayOff[]>([]);
    const [currentDate] = useState<Date>(new Date());

    const isSameDay = (d1: Date, d2: Date) => {
        return d1.getDate() === d2.getDate() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getFullYear() === d2.getFullYear();
    };

    const fetchDayOffs = async () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;

        try {
            const response = await api.get(`/api/user/dayoff?filter_type=month&year=${year}&month=${month}`);
            setDayOffs(response.data || []);
        } catch (error) {
            console.error('Error fetching day offs', error);
        }
    };

    useEffect(() => {
        fetchDayOffs();
    }, []);

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
            <h3 className={styles.title}>Meus Day Offs</h3>
            <div className={styles.calendarWrapper}>
                <Calendar
                    value={currentDate}
                    tileClassName={tileClassName}
                    locale="pt-BR"
                />
            </div>
            <div className={styles.legend}>
                <span className={styles.dot}></span> Dias de folga
            </div>
        </div>
    );
};

export default MiniCalendar;
