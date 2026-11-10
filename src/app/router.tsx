import { createBrowserRouter, Navigate } from 'react-router'
import { AttendanceListPage } from '@/pages/AttendanceListPage'
import { EmployeeFormPage } from '@/pages/EmployeeFormPage'
import { EmployeesPage } from '@/pages/EmployeesPage'
import { ForbiddenPage, NotFoundPage, RouteErrorPage } from '@/pages/ErrorPages'
import { LoginPage } from '@/pages/LoginPage'
import { MyAttendancePage } from '@/pages/MyAttendancePage'
import { TodayPage } from '@/pages/TodayPage'
import { RedirectIfAuthenticated, RequireAuth } from './guards/RequireAuth'
import { RequireRole } from './guards/RequireRole'
import { AppLayout } from './layouts/AppLayout'
import { AuthLayout } from './layouts/AuthLayout'

export const router = createBrowserRouter([
  {
    errorElement: <RouteErrorPage />,
    children: [
      {
        element: <RedirectIfAuthenticated />,
        children: [{ element: <AuthLayout />, children: [{ path: '/login', element: <LoginPage /> }] }],
      },
      {
        element: <RequireAuth />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { index: true, element: <Navigate to="/today" replace /> },
              { path: '/today', element: <TodayPage /> },
              { path: '/attendance/me', element: <MyAttendancePage /> },
              {
                element: <RequireRole roles={['HR_ADMIN']} />,
                children: [
                  { path: '/hr/employees', element: <EmployeesPage /> },
                  { path: '/hr/employees/new', element: <EmployeeFormPage /> },
                  { path: '/hr/employees/:id/edit', element: <EmployeeFormPage /> },
                  { path: '/hr/attendance', element: <AttendanceListPage /> },
                ],
              },
              { path: '/403', element: <ForbiddenPage /> },
              { path: '*', element: <NotFoundPage /> },
            ],
          },
        ],
      },
    ],
  },
])
