import React, { lazy } from 'react';
import { Navigate, useRoutes } from 'react-router-dom';

// layouts
import DashboardLayout from './layouts/dashboard';
import SimpleLayout from './layouts/simple';
import { checkPermission } from './utils/Permissions';
import PrivateRoute from './privateRoute';

// Lazy loading is used to optimize performance.
const DashboardAppPage = lazy(() => import('./pages/DashboardAppPage'));
const UserPage = lazy(() => import('./pages/users/List'));
const CreateUser = lazy(() => import('./pages/users/Create'));
const EditUser = lazy(() => import('./pages/users/Edit'));
const RoleList = lazy(() => import('./pages/roles/List'));
const CreateRoles = lazy(() => import('./pages/roles/Create'));
const CreateEditRole = lazy(() => import('./pages/roles/Edit'));
const EmailTemplatePage = lazy(() => import('./pages/email-template/List'));
const CreateDomainPage = lazy(() => import('./pages/domains/Create'));
const CreateEmailTemplatePage = lazy(() => import('./pages/email-template/Create'));
const EditEmailTemplatePage = lazy(() => import('./pages/email-template/Edit'));
const Domain = lazy(() => import('./pages/domains/List'));
const EditDomainPage = lazy(() => import('./pages/domains/Edit'));
const Ssl = lazy(() => import('./pages/ssl/List'));
const CreateSsl = lazy(() => import('./pages/ssl/Create'));
const EditSsl = lazy(() => import('./pages/ssl/Edit'));
const Profile = lazy(() => import('./pages/Profile'));
const LogHistory = lazy(() => import('./pages/log-history/List'));
const ViewLog = lazy(() => import('./pages/log-history/View'));
const Integration = lazy(() => import('./pages/integration/Add'));
const CreateQuestions = lazy(() => import('./pages/questions/Create'));
const Questions = lazy(() => import('./pages/questions/List'));
const SubscriptionPackage = lazy(() => import('./pages/subscription-package/List'));
const CreateSubscription = lazy(() => import('./pages/subscription-package/Create'));
const UptimeMonitorList = lazy(() => import('./pages/uptime-monitor/List'));
const CreateUptimeMonitor = lazy(() => import('./pages/uptime-monitor/Create'));
const EditUptimeMonitor = lazy(() => import('./pages/uptime-monitor/Edit'));
const ViewGraphUptimeMonitor = lazy(() => import('./pages/uptime-monitor/ViewGraph'));
const Setting = lazy(() => import('./pages/Setting'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const Page404 = lazy(() => import('./pages/Page404'));

// ----------------------------------------------------------------------
/**
 * User List Component.
 *
 * All rights Reseverd | Arhamsoft Pvt @2023
 *
 * @returns {Array} routes - Array or routes
 */

export default function Router() {
    /**
     * Create routes and Implement permissions on routes
     *
     * Author: Ali Haider
     * Date: 013 Sep, 2023
     *
     * Update: change the permission on all routes
     *
     * Update2: Add private route middleware to protect our routes and remove Suspense from all routes
     */

    /**
     * Create Lazy Loading and Implement on routes.
     * Lazy loading is used to optimize performance by loading only the required parts of an application.
     *
     * Author: Muhammad Rooman
     * Date: 15 Sep, 2023
     */

    const isAuthenticated = !!localStorage.getItem('token');

    const routes = useRoutes([
        {
            path: '/dashboard',
            element: <DashboardLayout />,
            children: [
                { element: <Navigate to="/dashboard/app" />, index: true },
                {
                    path: 'app',
                    element: (
                        <PrivateRoute
                            isAuthenticated={isAuthenticated}
                            element={
                                checkPermission('View-Dashboard') ? <DashboardAppPage /> : <Navigate to="/403" />
                            }
                        />
                    ),
                },
                {
                    path: 'users',
                    element: (
                        <PrivateRoute
                            isAuthenticated={isAuthenticated}
                            element={checkPermission('View-Users') ? <UserPage /> : <Navigate to="/403" />}
                        />
                    ),
                },
                {
                    path: 'users/create',
                    element: (
                        <PrivateRoute
                            isAuthenticated={isAuthenticated}
                            element={checkPermission('Create-User') ? <CreateUser /> : <Navigate to="/403" />}
                        />
                    ),
                },
                {
                    path: 'users/edit/:id',
                    element: (
                        <PrivateRoute
                            isAuthenticated={isAuthenticated}
                            element={checkPermission('Update-User') ? <EditUser /> : <Navigate to="/403" />}
                        />
                    ),
                },
                {
                    path: 'roles',
                    element: (
                        <PrivateRoute
                            isAuthenticated={isAuthenticated}
                            element={checkPermission('View-Role') ? <RoleList /> : <Navigate to="/403" />}
                        />
                    ),
                },
                {
                    path: 'roles/create',
                    element: (
                        <PrivateRoute
                            isAuthenticated={isAuthenticated}
                            element={checkPermission('Create-Role') ? <CreateRoles /> : <Navigate to="/403" />}
                        />
                    ),
                },
                {
                    path: 'roles/edit/:id',
                    element: (
                        <PrivateRoute
                            isAuthenticated={isAuthenticated}
                            element={checkPermission('Update-Role') ? <CreateEditRole /> : <Navigate to="/403" />}
                        />
                    ),
                },
                {
                    path: 'email-templates',
                    element: (
                        <PrivateRoute
                            isAuthenticated={isAuthenticated}
                            element={
                                checkPermission('View-Email-Template') ? (
                                    <EmailTemplatePage />
                                ) : (
                                    <Navigate to="/403" />
                                )
                            }
                        />
                    ),
                },
                {
                    path: 'email-templates/create',
                    element: (
                        <PrivateRoute
                            isAuthenticated={isAuthenticated}
                            element={
                                checkPermission('Create-Email-Template') ? (
                                    <CreateEmailTemplatePage />
                                ) : (
                                    <Navigate to="/403" />
                                )
                            }
                        />
                    ),
                },
                {
                    path: 'email-templates/edit/:id',
                    element: (
                        <PrivateRoute
                            isAuthenticated={isAuthenticated}
                            element={
                                checkPermission('Update-Email-Template') ? (
                                    <EditEmailTemplatePage />
                                ) : (
                                    <Navigate to="/403" />
                                )
                            }
                        />
                    ),
                },
                {
                    path: 'domains',
                    element: (
                        <PrivateRoute
                            isAuthenticated={isAuthenticated}
                            element={checkPermission('View-Domain') ? <Domain /> : <Navigate to="/403" />}
                        />
                    ),
                },
                {
                    path: 'domains/create',
                    element: (
                        <PrivateRoute
                            isAuthenticated={isAuthenticated}
                            element={
                                checkPermission('Create-Domain') ? <CreateDomainPage /> : <Navigate to="/403" />
                            }
                        />
                    ),
                },
                {
                    path: 'domains/edit/:id',
                    element: (
                        <PrivateRoute
                            isAuthenticated={isAuthenticated}
                            element={checkPermission('Update-Domain') ? <EditDomainPage /> : <Navigate to="/403" />}
                        />
                    ),
                },
                {
                    path: 'ssl',
                    element: (
                        <PrivateRoute
                            isAuthenticated={isAuthenticated}
                            element={checkPermission('View-SSL') ? <Ssl /> : <Navigate to="/403" />}
                        />
                    ),
                },
                {
                    path: 'ssl/create',
                    element: (
                        <PrivateRoute
                            isAuthenticated={isAuthenticated}
                            element={checkPermission('Create-SSL') ? <CreateSsl /> : <Navigate to="/403" />}
                        />
                    ),
                },
                {
                    path: 'ssl/edit/:id',
                    element: (
                        <PrivateRoute
                            isAuthenticated={isAuthenticated}
                            element={checkPermission('Update-SSL') ? <EditSsl /> : <Navigate to="/403" />}
                        />
                    ),
                },
                {
                    path: 'profile',
                    element: (
                        <PrivateRoute
                            isAuthenticated={isAuthenticated}
                            element={checkPermission('View-Profile') ? <Profile /> : <Navigate to="/403" />}
                        />
                    ),
                },
                {
                    path: 'logs',
                    element: (
                        <PrivateRoute
                            isAuthenticated={isAuthenticated}
                            element={checkPermission('View-Notification') ? <LogHistory /> : <Navigate to="/403" />}
                        />
                    ),
                },
                {
                    path: 'logs/:id',
                    element: (
                        <PrivateRoute
                            isAuthenticated={isAuthenticated}
                            element={checkPermission('View-Notification') ? <ViewLog /> : <Navigate to="/403" />}
                        />
                    ),
                },
                {
                    path: 'integration',
                    element: (
                        <PrivateRoute
                            isAuthenticated={isAuthenticated}
                            element={checkPermission('View-Integration') ? <Integration /> : <Navigate to="/403" />}
                        />
                    ),
                },
                
                {
                    path: 'packages',
                    element: (
                        <PrivateRoute
                            isAuthenticated={isAuthenticated}
                            element={checkPermission('View-Integration') ? <SubscriptionPackage /> : <Navigate to="/403" />}
                        />
                    ),
                },
                
                {
                    path: 'packages/create',
                    element: (
                        <PrivateRoute
                            isAuthenticated={isAuthenticated}
                            element={checkPermission('View-Integration') ? <CreateSubscription /> : <Navigate to="/403" />}
                        />
                    ),
                },
                {
                    path: 'questions',
                    element: (
                        <PrivateRoute
                            isAuthenticated={isAuthenticated}
                            element={checkPermission('View-Integration') ? <Questions /> : <Navigate to="/403" />}
                        />
                    ),
                },
                {
                    path: 'question/create',
                    element: (
                        <PrivateRoute
                            isAuthenticated={isAuthenticated}
                            element={checkPermission('View-Integration') ? <CreateQuestions /> : <Navigate to="/403" />}
                        />
                    ),
                },
                {
                    path: 'uptime-monitor',
                    element: (
                        <PrivateRoute
                            isAuthenticated={isAuthenticated}
                            element={
                                checkPermission('View-Uptime-Monitor') ? <UptimeMonitorList /> : <Navigate to="/403" />
                            }
                        />
                    ),
                },
                {
                    path: 'uptime-monitor/create',
                    element: (
                        <PrivateRoute
                            isAuthenticated={isAuthenticated}
                            element={
                                checkPermission('Create-Uptime-Monitor') ? (
                                    <CreateUptimeMonitor />
                                ) : (
                                    <Navigate to="/403" />
                                )
                            }
                        />
                    ),
                },
                {
                    path: 'uptime-monitor/edit/:id',
                    element: (
                        <PrivateRoute
                            isAuthenticated={isAuthenticated}
                            element={
                                checkPermission('Update-Uptime-Monitor') ? (
                                    <EditUptimeMonitor />
                                ) : (
                                    <Navigate to="/403" />
                                )
                            }
                        />
                    ),
                },
                {
                    path: 'uptime-monitor/view-graph/:id',
                    element: (
                        <PrivateRoute
                            isAuthenticated={isAuthenticated}
                            element={
                                checkPermission('Update-Uptime-Monitor') ? (
                                    <ViewGraphUptimeMonitor />
                                ) : (
                                    <Navigate to="/403" />
                                )
                            }
                        />
                    ),
                },
              
                {
                    path: 'setting',
                    element: (
                        <PrivateRoute
                            isAuthenticated={isAuthenticated}
                            element={checkPermission('Create-Settings') ? <Setting /> : <Navigate to="/403" />}
                        />
                    ),
                },
                
            ],
        },
        {
            path: 'login',
            element: <LoginPage />,
        },
        {
            element: <SimpleLayout />,
            children: [
                { element: <Navigate to="/login" />, index: true },
                {
                    path: '404',
                    element: <Page404 />,
                },
                { path: '*', element: <Navigate to="/404" /> },
            ],
        },
        {
            path: '*',
            element: <Navigate to="/404" replace />,
        },
    ]);

    return routes;
}
