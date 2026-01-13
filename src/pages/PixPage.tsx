import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Button from '../components/Button';
import Input from '../components/Input';
import styles from './PixPage.module.css';
import { Trash2, Plus } from 'lucide-react';

interface PixKey {
    id: number;
    pix_key: string;
}

const PixPage = () => {
    const [keys, setKeys] = useState<PixKey[]>([]);
    const [newKey, setNewKey] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchKeys = async () => {
        try {
            const response = await api.get('/user/pix');
            setKeys(response.data);
        } catch (error) {
            console.error('Error fetching pix keys', error);
        }
    };

    useEffect(() => {
        fetchKeys();
    }, []);

    const handleAddKey = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newKey) return;
        setLoading(true);
        try {
            await api.post('/user/pix', { pix_key: newKey });
            setNewKey('');
            fetchKeys();
        } catch (error) {
            console.error('Error adding pix key', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Tem certeza que deseja excluir esta chave?')) return;
        try {
            await api.delete(`/user/pix/${id}`);
            setKeys(keys.filter(k => k.id !== id));
        } catch (error) {
            console.error('Error deleting pix key', error);
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Minhas Chaves Pix</h2>
            <p className={styles.subtitle}>Gerencie suas chaves para receber pagamentos nos rolês.</p>

            <div className={styles.card}>
                <form onSubmit={handleAddKey} className={styles.form}>
                    <Input
                        placeholder="Nova chave pix (CPF, Email, Tel)"
                        value={newKey}
                        onChange={(e) => setNewKey(e.target.value)}
                        className={styles.inputWrapper}
                    />
                    <Button type="submit" disabled={loading} className={styles.addButton}>
                        <Plus size={20} />
                    </Button>
                </form>

                <ul className={styles.list}>
                    {keys.map(key => (
                        <li key={key.id} className={styles.listItem}>
                            <span className={styles.keyText}>{key.pix_key}</span>
                            <button
                                onClick={() => handleDelete(key.id)}
                                className={styles.deleteBtn}
                                title="Excluir chave"
                            >
                                <Trash2 size={18} />
                            </button>
                        </li>
                    ))}
                    {keys.length === 0 && (
                        <li className={styles.emptyState}>Nenhuma chave cadastrada.</li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default PixPage;
