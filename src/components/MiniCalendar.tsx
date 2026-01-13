import { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import api from '../services/api';
import type { DayOff } from '../types/dayoff';
import styles from './MiniCalendar.module.css';

const MiniCalendar = () => {
    const [dayOffs, setDayOffs] = useState<DayOff[]>([]);
    const [currentDate] = useState<Date>(new Date());

    const fetchDayOffs = async (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;

        try {
            const response = await api.get(`/api/user/dayoff?filter_type=month&year=${year}&month=${month}`);
            setDayOffs(response.data || []);
        } catch (error) {
            console.error('Error fetching day offs', error);
        }
    };

    useEffect(() => {
        fetchDayOffs(new Date());
    }, []);

    const tileClassName = ({ date, view }: { date: Date, view: string }) => {
        if (view === 'month') {
            const hasDayOff = dayOffs.some(d => {
                const start = new Date(d.init_hour);
                const end = new Date(d.end_hour);
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
            <h3 className={styles.title}>Meus Day Offs</h3>
            <div className={styles.calendarWrapper}>
                <Calendar
                    value={currentDate}
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
    );
};

export default MiniCalendar;
