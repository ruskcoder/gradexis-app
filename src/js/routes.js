import HomePage from '../pages/home.jsx';
import SettingsPage from '../pages/settings.jsx';
import NotFoundPage from '../pages/404.jsx';
import GradesPage from '../pages/grades.jsx';
import GpaPage from '../pages/gpa.jsx';
import AccountsPage from '../pages/settings/accounts.jsx';
import LoginPage from '../pages/login.jsx';
import AssignmentsPage from '../pages/assignments.jsx';

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
    path: '/login/',
    component: LoginPage,
    hideTabbar: true
  },
  {
    path: '/settings/',
    component: SettingsPage,
  },
  {
    path: '/settings/accounts/',
    component: AccountsPage,
    hideTabbar: true
  },
  {
    path: '/assignments/:course/',
    component: AssignmentsPage,
    hideTabbar: true
  },
  {
    path: '(.*)',
    component: NotFoundPage,
  },
];

export default routes;
