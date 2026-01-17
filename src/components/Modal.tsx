import styles from './Modal.module.css';

interface Props {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function Modal({ isOpen, title, message, onConfirm, onCancel }: Props) {
    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h3 className={styles.title}>{title}</h3>
                <p className={styles.content}>{message}</p>
                <div className={styles.actions}>
                    <button className={styles.cancelBtn} onClick={onCancel}>
                        Cancel
                    </button>
                    <button className={styles.confirmBtn} onClick={onConfirm}>
                        Confirm Vote
                    </button>
                </div>
            </div>
        </div>
    );
}
