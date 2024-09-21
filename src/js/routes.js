
import HomePage from '../pages/home.jsx';
import SettingsPage from '../pages/settings.jsx';
import NotFoundPage from '../pages/404.jsx';
import GradesPage from '../pages/grades.jsx';
import GpaPage from '../pages/gpa.jsx';


var routes = [
  {
    path: '/',
    component: HomePage,
  },
  {
    path: '/grades/',
    component: GradesPage,
  },
  {
    path: '/gpa/',
    component: GpaPage,
  },
  {
    path: '/settings/',
    component: SettingsPage,
  },
  {
    path: '(.*)',
    component: NotFoundPage,
  },
];

export default routes;
