import styles from './Header.module.css';

export default function Header() {
    return (
        <header className={styles.header}>
            <div className={`container ${styles.headerContent}`}>
                <div className={styles.logoSection}>
                    <div className={styles.logoCircle}>
                        <img
                            src="/logo.png"
                            alt="All Sikkim Govt. Employees Association"
                            className={styles.logoImage}
                            fetchPriority="high"
                        />
                    </div>
                    <div className={styles.titles}>
                        <h1 className={styles.mainTitle}>All Sikkim Govt. Employees Association ( C & D Category)</h1>
                        <span className={styles.subTitle}>Group C & D Voting Platform</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
