import React from 'react';
import Navbar from '../Navbar/Navbar.jsx';
import Footer from '../Footer/Footer.jsx';
import InformativeNotificationModal from '../../notifications/InformativeNotificationModal.jsx';
import { useNotifications } from '../../../context/NotificationContext.jsx';
import styles from './PageContainer.module.css';

const PageContainer = ({ children }) => {
  const { activeInformative, closeInformativeModal } = useNotifications();

  return (
    <div className={styles.pageWrapper}>
      <Navbar />
      <main className={styles.mainContent}>
        {children}
        <InformativeNotificationModal
          isOpen={Boolean(activeInformative)}
          onClose={closeInformativeModal}
          notification={activeInformative}
        />
      </main>
      <Footer />
    </div>
  );
};

export default PageContainer;
