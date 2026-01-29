import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className="container">
                <p className={styles.text}>© {new Date().getFullYear()} All Sikkim Govt. Employees Association ( C & D Category).</p>
                <p className={styles.govt}>Official Voting Platform</p>
            </div>
        </footer>
    );
}
