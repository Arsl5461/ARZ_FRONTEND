import React, { useEffect, useCallback, useState } from 'react';

import {
    CardHeader,
    TextField,
    CircularProgress,
    Stack,
    Grid,
    CardContent,
    Card,
    Button,
    Typography,
} from '@mui/material'; // @mui
import { useForm } from 'react-hook-form';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link,useNavigate } from 'react-router-dom';
import api from '../../config/axios-instance';
import { ENV } from '../../config/config';
import { checkPermission } from '../../utils/Permissions';
import Iconify from '../../components/iconify';
/**
 * Add Integrations (Email and SMS) in Component
 *
 * All rights | ArhamSoft Pvt @2023
 *
 * @returns {JSX.Element} -JSX representation of the component.
 *
 */

const Add = () => {
    /**
     * Design a schema for Add  Email Integration with form validations.
     *
     * Author: Muhammad Rooman
     * Date: September 12, 2023
     */
    const emailSchema = yup.object().shape({
        apiKey: yup
            .string()
            .required('API Key is Required')
            .trim()
            .min(3, 'API Key Must be at Least 3 Characters Long'),
        domain: yup.string().required('Domain is Required').trim().min(3, 'Domain Must be at Least 3 Characters Long'),
        user: yup.string().required('User is Required').trim(),
    });

    /**
     * Design a schema for Add SMS Integration with form validations.
     *
     * Author: Muhammad Rooman
     * Date: September 12, 2023
     */
    const smsSchema = yup.object().shape({
        apiKey: yup.string().required('API Key is Required').trim(),
        sender: yup.string().required('SMS Sender is Required').trim(),
        routeId: yup.string().required('Route ID is Required').trim(),
        campain: yup.string().required('campaign is Required').trim(),
    });

    // Initialization and state management
    const navigate = useNavigate();
    const [integrationType, setIntegrationType] = useState('email');
    const [emailIntegration, setEmailIntegration] = useState({});
    const [smsIntegration, setSMSIntegration] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const authToken = JSON.parse(localStorage.getItem('token')); // Retrieve the authentication token from local storage

    // They are part of the schema, form management and validation logic for Email
    const {
        register: registerEmail,
        handleSubmit: handleSubmitEmail,
        formState: { errors },
        setValue,
    } = useForm({
        resolver: yupResolver(emailSchema),
    });

    // They are part of the schema, form management and validation logic for SMS
    const {
        register: registerSMS,
        handleSubmit: handleSubmitSMS,
        formState: { errors: smsErrors },
    } = useForm({
        resolver: yupResolver(smsSchema),
    });

    /**
     * Fetch All Email Integration Data from the Get API
     *
     * Auther: Muhammad Rooman
     * Date: September 08, 2023
     *
     * Update 1 (September 13, 2023): Used useCallback to memoize the function to improve performance by preventing unnecessary re-rendering of the component.
     * update 2 (September 18, 2023) : axios replaced with api .If the response is successful, return it . If a 403 (Forbidden) response is received, perform some actions
     *
     */
    const fetchEmailIntegrationData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`${ENV.appBaseUrl}/email-integration`, {
                headers: {
                    Authorization: `Bearer ${authToken}`, // Include the token in the Authorization header
                },
            });
            if (response?.data?.success) {
                setValue('emailApiKey', response.data.emailIntegration.emailApiKey);
                setValue('domain', response.data.emailIntegration.domain);
                setValue('user', response.data.emailIntegration.user);
                setEmailIntegration(response.data.emailIntegration);
                setIsLoading(false);
            } else {
               toast.error(response?.data?.message);
                setIsLoading(false);
            }
        } catch (error) {
             setIsLoading(false);
        }
    }, [authToken, setValue, setEmailIntegration, setIsLoading]);

    useEffect(() => {
        // Call the fetchEmailIntegrationData function to fetch data
        fetchEmailIntegrationData();
    }, [fetchEmailIntegrationData]);

    /**
     *
     * Create a POST function for email integration data upon form submission.
     * Send a POST request to create a new Email Integration.
     *
     * @param {object} data - The Email Integration data, from the form.
     * @return {void}
     *
     * Author: Muhammad Rooman
     * Date: September 12, 2023
     *
     * update 1 (September 18, 2023) : axios replaced with api .If the response is successful, return it . If a 403 (Forbidden) response is received, perform some actions
     *
     */
    const handleSubmitForm = async (data) => {
        setIsLoading(true);
        try {
            const response = await api.post(`${ENV.appBaseUrl}/email-integration`, data, {
                headers: {
                    Authorization: `Bearer ${authToken}`, // Include the token in the Authorization header
                },
            });
            if (response?.data?.success) {
                setIsLoading(false);
                toast.success(response.data?.message);
            } else {
                setIsLoading(false);
              toast.error(response.data?.message);
            }
        } catch (error) {
            setIsLoading(false);
            toast.error(error?.response.data?.message);
        }
    };

    /**
     * Create a POST function for SMS  integration data upon form submission.
     * Send a POST request to create a new SMS Integration.
     *
     * @param {object} data - The SMS Integration data, from the form.
     * @return {void}
     *
     * Author: Muhammad Rooman
     * Date: September 12, 2023
     *
     * update 1 (September 18, 2023) : axios replaced with api .If the response is successful, return it . If a 403 (Forbidden) response is received, perform some actions
     *
     */
    const handleSubmitSMSForm = async (data) => {
        setIsLoading(true);
        try {
            const response = await api.post(`${ENV.appBaseUrl}/sms-integration`, data, {
                headers: {
                    Authorization: `Bearer ${authToken}`, // Include the token in the Authorization header
                },
            });
            if (response?.data?.success) {
                toast.success(response.data?.message);
        setIsLoading(false);
        } else {
        setIsLoading(false);
       toast.error(response.data?.message);
            }
        } catch (error) {
        setIsLoading(false);
      toast.error(error?.response.data?.message);
        }
    };

    /**
     * Fetch All SMS Integration Data from the Get API
     *
     * Auther: Muhammad Rooman
     * Date: September 08, 2023
     *
     * Update 1 (September 13, 2023): Used useCallback to memoize the function to improve performance by preventing unnecessary re-rendering of the component.
     * update 2 (September 18, 2023) : axios replaced with api .If the response is successful, return it . If a 403 (Forbidden) response is received, perform some actions
     *
     */
    const fetchSMSIntegrationData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`${ENV.appBaseUrl}/sms-integration`, {
                headers: {
                    Authorization: `Bearer ${authToken}`, // Include the token in the Authorization header
                },
            });
             if (response?.data?.success) {
                setValue('apiKey', response.data?.smsIntegration?.apiKey);
                setValue('routeId', response.data?.smsIntegration?.routeId);
                setValue('campain', response.data?.smsIntegration?.campain);
                setValue('sender', response.data?.smsIntegration?.sender);
                setSMSIntegration(response.data.smsIntegration);
                setIsLoading(false);
            } else {
                toast.error(response?.data?.message);
                setIsLoading(false);
            }
        } catch (error) {
            setIsLoading(false);
        }
    }, [authToken, setValue, setSMSIntegration, setIsLoading]);

    useEffect(() => {
        // Call the fetchSMSIntegrationData function to fetch data
        fetchSMSIntegrationData();
    }, [fetchSMSIntegrationData]);

    /**
     * Function to change the integrationType state.
     * @param {string} type - The type of integration to set (either 'email' or 'sms').
     *
     * Author: Muhammad Rooman
     * Date: September 12, 2023
     */
    const handleIntegrationTypeChange = (type) => {
        setIntegrationType(type);
    };

    /**
     * Renders a Material-UI CircularProgress spinner when the loader is true.
     *
     * @returns {JSX.Element} CircularProgress spinner if loader is true, otherwise null.
     *
     * Author: Muhammad Rooman
     * Date: 22 Sep, 2023
     */
    if (isLoading) {
        return (
            <div className="spinner-wrapper">
                <CircularProgress value={100} />
            </div>
        );
    }
    return (
        <div>
            <Grid container spacing={2}>
                <Grid item xs={12} md={12}>
                    <Stack spacing={1} direction="row" className="space-between">
                        <Typography variant="h4" gutterBottom>
                        <Button onClick={() => navigate('/dashboard')} className="back_btn" variant="contained">
                                <Iconify icon="bi:arrow-left" />
                            </Button>
                            Integration
                            <div className="mt-10">
                                <Breadcrumbs aria-label="breadcrumb">
                                    <Link
                                        underline="hover"
                                        to="/dashboard"
                                        className="domain_bread"
                                    >
                                        Dashboard
                                    </Link>
                                    <Typography color="text.primary">Integration</Typography>
                                </Breadcrumbs>
                            </div>
                        </Typography>
                        <div>
                            <Button
                                className="mr-4"
                                variant={integrationType === 'email' ? 'contained' : 'outlined'}
                                onClick={() => handleIntegrationTypeChange('email')}
                                color="primary"
                            >
                                Email
                            </Button>
                            <Button
                                variant={integrationType === 'sms' ? 'contained' : 'outlined'}
                                onClick={() => handleIntegrationTypeChange('sms')}
                                color="primary"
                            >
                                SMS
                            </Button>
                        </div>
                    </Stack>
                    {/* For Email Integration  Fields */}
                    <form onSubmit={handleSubmitEmail(handleSubmitForm)}>
                        {integrationType === 'email' && (
                            <Card sx={{ p: 2, height: '750px' }}>
                                <CardHeader title="Email Integration" />
                                <CardContent>
                                    <Grid container spacing={2}>
                                        {' '}
                                        {/* Add a nested grid */}
                                        <Grid item xs={6}>
                                            {' '}
                                            {/* Set the width for each label */}
                                            <TextField
                                                {...registerEmail('user')}
                                                defaultValue={emailIntegration?.user}
                                                id="outlined-basic"
                                                label="User"
                                                variant="outlined"
                                                sx={{ width: '100%' }}
                                                error={errors.user}
                                                helperText={errors.user?.message}
                                            />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <TextField
                                                {...registerEmail('domain')}
                                                defaultValue={emailIntegration?.domain}
                                                id="outlined-basic"
                                                label="Domain"
                                                variant="outlined"
                                                sx={{ width: '100%' }}
                                                error={errors.domain}
                                                helperText={errors.domain?.message}
                                            />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <TextField
                                                {...registerEmail('emailApiKey')}
                                                defaultValue={emailIntegration?.apiKey}
                                                id="outlined-basic"
                                                label="API Key"
                                                variant="outlined"
                                                sx={{ width: '100%' }}
                                                error={errors.apiKey}
                                                helperText={errors.apiKey?.message}
                                            />
                                        </Grid>
                                    </Grid>
                                </CardContent>
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                        marginTop: '16px',
                                        marginRight: '22px',
                                    }}
                                >
                                    <Stack spacing={2} direction="row">
                                        {checkPermission('Create-Email-Integration') ? (
                                            <Button variant="contained" type="submit" color="primary">
                                                {!emailIntegration?._id ? 'Create' : 'Update'}
                                            </Button>
                                        ) : (
                                            ''
                                        )}
                                    </Stack>
                                </div>
                            </Card>
                        )}
                    </form>

                    {/* For SMS Integration Fields */}
                    <form onSubmit={handleSubmitSMS(handleSubmitSMSForm)}>
                        {integrationType === 'sms' && (
                            <Card sx={{ p: 2, height: '750px' }}>
                                <CardHeader title="SMS Integration" />
                                <CardContent>
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <TextField
                                                {...registerSMS('apiKey')}
                                                defaultValue={smsIntegration?.apiKey}
                                                id="outlined-basic"
                                                label="API Key"
                                                variant="outlined"
                                                sx={{ width: '100%' }}
                                                error={smsErrors.apiKey}
                                                helperText={smsErrors.apiKey?.message}
                                            />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <TextField
                                                {...registerSMS('sender')}
                                                defaultValue={smsIntegration?.sender}
                                                id="outlined-basic"
                                                label="SMS Sender"
                                                variant="outlined"
                                                sx={{ width: '100%' }}
                                                error={smsErrors.sender}
                                                helperText={smsErrors.sender?.message}
                                            />
                                        </Grid>
                                   <Grid item xs={6}>
                                            <TextField
                                                {...registerSMS('routeId')}
                                                defaultValue={smsIntegration?.routeId}
                                                id="outlined-basic"
                                                label="Route Id"
                                                variant="outlined"
                                                sx={{ width: '100%' }}
                                                error={smsErrors.routeId}
                                                helperText={smsErrors.routeId?.message}
                                            />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <TextField
                                                {...registerSMS('campain')}
                                                defaultValue={smsIntegration?.campain}
                                                id="outlined-basic"
                                                label="campaign"
                                                variant="outlined"
                                                sx={{ width: '100%' }}
                                                error={smsErrors.campain}
                                                helperText={smsErrors.campain?.message}
                                            />
                                        </Grid>
                                    </Grid>
                                </CardContent>
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                        marginTop: '16px',
                                        marginRight: '22px',
                                    }}
                                >
                                    <Stack spacing={2} direction="row">
                                        {checkPermission('Create-SMS-Integration') ? (
                                            <Button variant="contained" type="submit" color="primary">
                                                {!smsIntegration?._id ? 'Add' : 'Update'}
                                            </Button>
                                        ) : (
                                            ''
                                        )}
                                    </Stack>
                                </div>
                            </Card>
                        )}
                    </form>
                </Grid>
            </Grid>
        </div>
    );
};

export default Add;
