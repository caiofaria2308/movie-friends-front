import { Calendar, MapPin, Beer } from 'lucide-react';
import styles from './CrewListPage.module.css';

interface Crew {
    id: number;
    name: string;
    nextEvent: string;
    location: string;
    members: number;
}

const MOCKED_CREWS: Crew[] = [
    { id: 1, name: "Rolê de Sexta", nextEvent: "Sexta, 20:00", location: "Bar do Zé", members: 5 },
    { id: 2, name: "Futebol Quarta", nextEvent: "Quarta, 19:30", location: "Arena Society", members: 12 },
    { id: 3, name: "Cinema", nextEvent: "Sábado, 16:00", location: "Shopping Central", members: 3 },
];

const CrewListPage = () => {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>Meus Crews</h2>
                <p className={styles.subtitle}>Seus grupos de rolês.</p>
            </div>

            <div className={styles.grid}>
                {MOCKED_CREWS.map(crew => (
                    <div key={crew.id} className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h3 className={styles.crewName}>{crew.name}</h3>
                            <div className={styles.badge}>{crew.members} membros</div>
                        </div>

                        <div className={styles.info}>
                            <div className={styles.infoItem}>
                                <Calendar size={16} />
                                <span>{crew.nextEvent}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <MapPin size={16} />
                                <span>{crew.location}</span>
                            </div>
                        </div>

                        <button className={styles.actionButton}>
                            <Beer size={16} />
                            <span>Detalhes do Rolê</span>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CrewListPage;
