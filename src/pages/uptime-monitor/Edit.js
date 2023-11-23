import { React, useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    TextField,
    Stack,
    Typography,
    Slider,
    Card,
    Switch,
    Breadcrumbs,
    CardHeader,
    Tooltip,
    Grid,
    styled,
    CardContent,
    Button,
    CircularProgress,
} from '@mui/material';
import { WithContext as ReactTags } from 'react-tag-input';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import api from '../../config/axios-instance';
import { ENV } from '../../config/config';
import Iconify from '../../components/iconify';

const ReactTagsContainer = styled('div')({
    marginRight: (theme) => theme.spacing(2),
    width: '100%',
});

/**
 * Edit Ping Field Component
 *
 * All rights | ArhamSoft Pvt @2023
 *
 * @returns {JSX.Element} -JSX representation of the component.
 *
 */

const Edit = () => {
    /**
     * Design a schema for creating Ping Field with form validations.
     *
     * Author: Muhammad Rooman
     * Date: September 20, 2023
     */
    const schema = yup.object().shape({
        name: yup
            .string()
            .required('Friendly Name is Required')
            .trim()
            .min(3, 'Friendly Name Must be at Least 3 Characters Long'),
        domain: yup
            .string()
            .required('API URL is Required')
            .url('API URL Format. Please enter a valid API URL in the following format: https://example.com.')
            .test('no-trailing-slash', 'API URL should not end with a slash ("/")', (value) => {
                if (value && value.endsWith('/')) {
                    return false;
                }
                return true;
            }),
    });

    // Initialization and state management
    const { id } = useParams();
    const navigate = useNavigate();
    const [EmailTags, setEmailTags] = useState([]);
    const [phoneTags, setPhoneTags] = useState([]);
    const [monitoringIntervalValue, setMonitoringIntervalValue] = useState(1);
    const [monitoringtimeOut, setMonitoringtimeOut] = useState(1);
    const authToken = JSON.parse(localStorage.getItem('token'));
    const [isloading, setIsLoading] = useState(true);
    const [pingMonitorData, setPingMonitorData] = useState([]);

    // They are part of the schema, form management and validation logic for Ping field
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
    });

    /**
     * Fetch All Uptime Monitors Data from the Get API
     *
     * Used useCallback to memoize the function to improve performance by preventing unnecessary re-rendering of the component.
     * axios replaced with api .If the response is successful, return it . If a 403 (Forbidden) response is received, perform some actions
     *
     * Auther: Muhammad Rooman
     * Date: September 21, 2023
     *
     */
    const fetchEmailIntegrationData = useCallback(async () => {
        try {
            const response = await api.get(`${ENV.appBaseUrl}/monitor/${id}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`, // Include the token in the Authorization header
                },
            });

            if (response?.data?.success) {
                const emailArray = response?.data?.monitor?.email || [];
                const phoneArray = response?.data?.monitor?.phone || [];
                const tagsArray = emailArray?.map((email) => ({ id: email, text: email }));
                const phoneTagsArray = phoneArray?.map((phone) => ({ id: phone, text: phone }));
                setEmailTags(tagsArray);
                setPhoneTags(phoneTagsArray);
                setValue('name', response.data.monitor.name);
                setValue('domain', response.data.monitor.domain);

                const intervalInMilliseconds = response.data.monitor.interval;
                const timeOutInMilliseconds = response.data.monitor.timeOut;

                // Convert interval to minutes
                const intervalInMinutes = intervalInMilliseconds / (1000 * 60); 

                // Convert timeOut to seconds
                const timeOutInSeconds = timeOutInMilliseconds / 1000; 
                setValue('interval', intervalInMinutes);
                setValue('timeOut', timeOutInSeconds);
                setValue('status', response?.data?.monitor?.status);
                setPingMonitorData(response.data.monitor);
                setIsLoading(false);
            } else {
                toast.error(response?.data?.message);
                setIsLoading(false);
            }
        } catch (error) {
            setIsLoading(false);
        }
    }, [authToken, id, setValue, setEmailTags, setPhoneTags, setPingMonitorData, setIsLoading]);

    useEffect(() => {
        // Call the fetchEmailIntegrationData function to fetch data
        fetchEmailIntegrationData();
    }, [fetchEmailIntegrationData]);

    /**
     * Creates Ping field data upon form submission and sends a PUT request to create a new Ping field.
     *
     * @param {object} data - The Ping field data from the form.
     * @return {void}
     *
     * Author: Muhammad Rooman
     * Date: September 21, 2023
     *
     * Update 1 (October 17, 2023): Further includes phone and email tags in the data.
     */
    const handleSubmitForm = async (data) => {
        const interval = parseInt(data.interval, 10);
        const timeOut = parseInt(data.timeOut, 10);
        const newData = {
            ...data,
            interval,
            timeOut,
        };
        setIsLoading(true);
        try {
            if (EmailTags?.length === 0 && phoneTags?.length === 0) {
                toast.error('Please Enter Your Email or Phone Number to Receive Notifications');
                setIsLoading(false);
            } else {
                const dataToSend = {
                    ...newData, // Include all the form data
                    email: EmailTags.map((tag) => tag.text), // further Include the email tags
                    phone: phoneTags.map((tag) => tag.text), // further Include the phone tags
                };

                const headers = {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                };

                const response = await api.put(`${ENV.appBaseUrl}/monitor/${id}`, dataToSend, { headers });
                if (response?.data?.success) {
                    setIsLoading(false);
                    toast.success(response?.data?.message);
                    navigate('/dashboard/uptime-monitor');
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message);
            setIsLoading(false);
            console.error(error);
        }
    };

    /**
     * Handle Ping 'Monitor Interval' Selcted option.
     *
     * @param {Event} event - The event object to be handled.
     * @param {any} newValue - The new value for the monitoring interval.
     *  @return {void}
     *
     * Author: Muhammad Rooman
     * Date: September 21, 2023
     */
    const handleIntervalChange = (event, newValue) => {
        setMonitoringIntervalValue(newValue);
    };

    /**
     * Handle Ping 'Monitor TimeOut' Selcted option.
     *
     * @param {Event} event - The event object to be handled.
     * @param {any} newValue - The new value for the monitoring timeOut.
     *  @return {void}
     *
     * Author: Muhammad Rooman
     * Date: September 21, 2023
     */
    const handleTimeOutChange = (event, newValue) => {
        setMonitoringtimeOut(newValue);
    };

    /**
     * Handles the addition of Email tags to an array and performs validation.
     *
     * as @param {Array} EmailTags -Email tag to be added.
     * @return {void}
     *
     * Author: Muhammad Rooman
     * Date: October 17, 2023
     */
    const handleEmailAddition = (tag) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(tag.text)) {
            setEmailTags([...EmailTags, tag]);
        } else {
            toast.error('Enter The Valid Email');
        }
    };

    /**
     * Handles the deletion of Email tags based on the provided index.
     *
     * @param {number} i - The index of the Email tag to delete.
     * @return {void}
     *
     * Author: Muhammad Rooman
     * Date: October 17, 2023
     */
    const handleEmailDelete = (i) => {
        const newTags = [...EmailTags];
        newTags.splice(i, 1);
        setEmailTags(newTags);
    };

    /**
     * Handles the deletion of phone tags based on the provided index.
     *
     * @param {number} i - The index of the phone tag to delete.
     * @return {void}
     *
     * Author: Muhammad Rooman
     * Date: October 17, 2023
     */
    const handlePhoneDelete = (i) => {
        const newTags = [...phoneTags];
        newTags.splice(i, 1);
        setPhoneTags(newTags);
    };

    /**
     * Handles the addition of Phone tags to an array and performs validation.
     *
     * @param {Array} phoneTags - Array of Phone tags.
     * @return {void}
     *
     * Author: Muhammad Rooman
     * Date: October 17, 2023
     */
    const handlePhoneAddition = (tag) => {
        const phoneRegex = /^\d{9,16}$/;
        if (phoneRegex.test(tag.text)) {
            setPhoneTags([...phoneTags, tag]);
        } else {
            toast.error('Enter a Valid Phone Number With 9 to 16 Digits');
        }
    };

    /**
     * Renders a Material-UI CircularProgress spinner when the loader is active.
     *
     * @returns {JSX.Element} CircularProgress spinner if loader is active, otherwise null.
     *
     * Author: Muhammad Rooman
     * Date: October 17, 2023
     */

    if (isloading) {
        return (
            <div className="spinner-wrapper">
                <CircularProgress value={100} />
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(handleSubmitForm)}>
            <Grid container spacing={2}>
                <Grid item xs={12} md={12}>
                    <Typography variant="h4" gutterBottom>
                        <Button onClick={() => navigate('/dashboard')} className="back_btn" variant="contained">
                            <Iconify icon="bi:arrow-left" />
                        </Button>
                        Uptime Monitor
                        <div className="mt-10">
                            <Breadcrumbs aria-label="breadcrumb">
                                <Link underline="hover" className="domain_bread" to={'/dashboard'}>
                                    Dashboard
                                </Link>
                                <Link
                                    underline="hover"
                                    href="/material-ui/getting-started/installation/"
                                    className="domain_bread"
                                    to={'/dashboard/uptime-monitor'}
                                >
                                    Uptime Monitor
                                </Link>
                                <Typography color="text.primary"> Update </Typography>
                            </Breadcrumbs>
                        </div>
                    </Typography>
                    <Card sx={{ p: 2 }}>
                        <CardHeader title="Update Monitor Information" />
                        <CardContent>
                            <Grid container spacing={1}>
                                <Grid item xs={6}>
                                    <TextField
                                        {...register('name')}
                                        id="outlined-basic1"
                                        label="Friendly Name"
                                        variant="outlined"
                                        fullWidth
                                        error={!!errors?.name}
                                        helperText={errors.name?.message}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        {...register('domain')}
                                        id="outlined-basic2"
                                        label="API URL"
                                        variant="outlined"
                                        fullWidth
                                        error={!!errors?.domain}
                                        helperText={errors.domain?.message}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                <Grid container spacing={2} className="ss_personal_field">
                                    <Grid item xs={6} style={{ width: '100%', marginTop: '10px' }}>
                                        <div className="update_monitor">
                                            <Typography sx={{ height: '35px', marginTop: '30px' }} gutterBottom>
                                                Monitoring Interval
                                            </Typography>
                                            <span>(Every {pingMonitorData?.interval / 60000} Minutes)</span>
                                        </div>
                                        {' '}
                                        {monitoringIntervalValue > 1
                                            ? `Updated Every ${monitoringIntervalValue} Minutes`
                                            : ''}
                                        <Slider
                                            {...register('interval')}
                                            sx={{ height: '40px' }}
                                            defaultValue={pingMonitorData?.interval / 60000}
                                            aria-label="Default"
                                            valueLabelDisplay="auto"
                                            onChange={handleIntervalChange}
                                        />
                                    </Grid>
                                    <Grid item xs={6} style={{ width: '100%', marginTop: '10px' }}>
                                        <div className="update_monitor">
                                            <Typography sx={{ height: '35px', marginTop: '30px' }} gutterBottom>
                                                Monitoring TimeOut
                                            </Typography>
                                            <span>(Every {pingMonitorData?.timeOut / 1000} Secounds)</span>
                                        </div>

                                        {monitoringtimeOut > 1 ? `Updated Every ${monitoringtimeOut} Secounds` : ''}
                                        <Slider
                                            {...register('timeOut')}
                                            sx={{ height: '40px' }}
                                            defaultValue={pingMonitorData?.timeOut / 1000}
                                            max={60}
                                            aria-label="Default"
                                            valueLabelDisplay="auto"
                                            onChange={handleTimeOutChange}
                                        />
                                    </Grid>
                                </Grid>
                                <Grid container spacing={2} className="ss_personal_field">
                                    <Grid item xs={6}>
                                        <Tooltip title="Press Enter Key on Keyboard to Add Email" arrow>
                                            <ReactTagsContainer>
                                                <ReactTags
                                                    tags={EmailTags}
                                                    handleDelete={handleEmailDelete}
                                                    handleAddition={handleEmailAddition}
                                                    allowDragDrop={false}
                                                    placeholder="Emails"
                                                />
                                            </ReactTagsContainer>
                                        </Tooltip>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Tooltip title="Press Enter Key on Keyboard Add Phone Number" arrow>
                                            <ReactTagsContainer>
                                                <ReactTags
                                                    tags={phoneTags}
                                                    handleDelete={handlePhoneDelete}
                                                    handleAddition={handlePhoneAddition}
                                                    allowDragDrop={false}
                                                    placeholder="Phone"
                                                />
                                            </ReactTagsContainer>
                                        </Tooltip>
                                    </Grid>
                                    <br />
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography>Status</Typography>
                                        <Switch
                                            {...register('status')}
                                            defaultChecked={pingMonitorData?.status || false}
                                        />
                                    </div>
                                </Grid>
                            </Grid>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    marginTop: '16px',
                                    marginRight: '22px',
                                }}
                            >
                                <Stack spacing={2} direction="row">
                                    <Button
                                        variant="outlined"
                                        className="cancel_btn"
                                        onClick={() => navigate('/dashboard/uptime-monitor')}
                                    >
                                        Cancel
                                    </Button>
                                    <Button variant="contained" type="submit" color="primary">
                                        Update
                                    </Button>
                                </Stack>
                            </div>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </form>
    );
};

export default Edit;
