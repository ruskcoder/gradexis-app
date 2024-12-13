import HomePage from '../pages/home.jsx';
import SettingsPage from '../pages/settings.jsx';
import NotFoundPage from '../pages/404.jsx';
import GradesPage from '../pages/grades.jsx';
import TodoPage from '../pages/todo.jsx';
import AccountsPage from '../pages/settings/accounts.jsx';
import LoginPage from '../pages/login.jsx';
import ClassGradesPage from '../pages/classGrades.jsx';
import SchedulePage from '../pages/info/schedule.jsx';
import AttendancePage from '../pages/info/attendance.jsx';

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
    path: '/assignments/:course/',
    component: ClassGradesPage,
    hideTabbar: true
  },
  {
    path: '/todo/',
    component: TodoPage,
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
    path: '/info/schedule/',
    component: SchedulePage,
    hideTabbar: false
  },
  {
    path: '/info/attendance/',
    component: AttendancePage,
    hideTabbar: false
  },
  {
    path: '(.*)',
    component: NotFoundPage,
  },
];

export default routes;
