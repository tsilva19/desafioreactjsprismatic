import Link from 'next/Link';
import styles from './header.module.scss';

export default function Header() {
  return (
    <header className={styles.headerSpacing}>
      <Link href="/">
        <a>
          <img src="/logo.svg" alt="logo" />
        </a>
      </Link>
    </header>
  );
}
