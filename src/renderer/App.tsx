import React, { createRef } from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Lost from './pages/Lost';
import Settings from './pages/Settings';
import SignIn from './pages/SignIn';
import Visualization from './pages/Visualization';
import Layout from './components/Layout';
import Header from './components/Header';
import AuthRoute from './components/AuthRoute';
import NotificationSystem from 'react-notification-system';
import { NotificationContent } from './types';
import { NotificationContext } from './components/utils/context';

function HomeStack() {
  return (
    <React.Fragment>
      <Header />
      <Routes>
        <AuthRoute path="/" element={<Home />} />
        <AuthRoute path="/visualization" element={<Visualization />} />
      </Routes>
    </React.Fragment>
  );
}

export default function App() {
  const notificationSystem = createRef();

  function notify(content: NotificationContent) {
    const notification = notificationSystem.current;
    const { title, message, level } = content;

    // @ts-ignore
    notification.addNotification({
      title,
      message,
      level,
    });
  }

  return (
    <MemoryRouter initialEntries={['/home']}>
      <NotificationContext.Provider value={{ notify }}>
        <Layout>
          <Routes>
            <Route path="/home/*" element={<HomeStack />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*">
              <Lost />
            </Route>
          </Routes>
        </Layout>
      </NotificationContext.Provider>

      {/* @ts-ignore */}
      <NotificationSystem ref={notificationSystem} />
    </MemoryRouter>
  );
}