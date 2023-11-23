import { React, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { TextField, Stack, Typography, Slider, Switch, Checkbox, Grid, CardContent, Button } from '@mui/material';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import api from '../../../config/axios-instance';
import { ENV } from '../../../config/config';

/**
 * Create Ping Field Component
 *
 * All rights | ArhamSoft Pvt @2023
 *
 * @returns {JSX.Element} -JSX representation of the component.
 *
 */

const Ping = ({setLoader}) => {
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
            .required('Domain is Required')
            .url('API URL Format. Please enter a valid Domain in the following format: https://example.com.')
            .test('no-trailing-slash', 'Domain should not end with a slash ("/")', (value) => {
                if (value && value.endsWith('/')) {
                    return false;
                }
                return true;
            }),
    });

    // Initialization and state management
    const navigate = useNavigate();
    const [monitoringIntervalValue, setMonitoringIntervalValue] = useState(0);
    const [monitoringTimeOutValue, setMonitoringTimeOutValue] = useState(0);
    const authToken = JSON.parse(localStorage.getItem('token'));

    // They are part of the schema, form management and validation logic for Ping field
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
    });

    /**
     * Creates Ping field data upon form submission
     * Send a POST request to create a new Ping field
     *
     * @param {object} data - The Ping field data, from the form.
     * @return {void}
     *
     * Author: Muhammad Rooman
     * Date: September 20, 2023
     *
     */
    const handleSubmitForm = async (data) => {
        setLoader(true);
        const interval = parseInt(data.interval, 10);
        const timeOut = parseInt(data.timeOut, 10);
        const newData = {
            ...data,
            interval,
            timeOut,
        };
        try {
            const response = await api.post(`${ENV.appBaseUrl}/monitor`, newData, {
                headers: {
                    Authorization: `Bearer ${authToken}`, // Include the token in the Authorization header
                },
            });
            if (response?.data?.success) {
                toast.success(response.data?.message);
                navigate('/dashboard/uptime-monitor');
            setLoader(false);
            } else {
               setLoader(false);
                toast.error(response.data?.message);
            }
        } catch (error) {
            setLoader(false);
            toast.error(error?.response.data?.message);
        }
    };

    /**
     * Handle Monitoring Interval
     *
     * @param {Event} event - The event object to be handled.
     * @param {any} newValue - The new value for the Monitoring Interval
     * @return {void}
     *
     * Author: Muhammad Rooman
     * Date: September 20, 2023
     */
    const handleIntervalChange = (event, newValue) => {
        setMonitoringIntervalValue(newValue);
    };

    /**
     * Handle Monitoring TimeOut
     *
     * @param {Event} event - The event object to be handled.
     * @param {any} newValue - The new value for the Monitoring TimeOut
     * @return {void}
     *
     * Author: Muhammad Rooman
     * Date: September 21, 2023
     */
    const handleIntervalChanges = (event, newValue) => {
        setMonitoringTimeOutValue(newValue);
    };

    return (
        <form onSubmit={handleSubmit(handleSubmitForm)}>
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
                        />
                    </Grid>
                    <Grid item xs={6} style={{ width: '100%', marginTop: '10px' }}>
                        <Typography sx={{ height: '35px', marginTop: '30px' }} gutterBottom>
                            Monitoring Interval
                        </Typography>
                        <Slider
                            {...register('interval')}
                            sx={{ height: '40px' }}
                            aria-label="Default"
                            valueLabelDisplay="auto"
                            onChange={handleIntervalChange}
                        />{' '}
                        Every {monitoringIntervalValue} Minutes
                    </Grid>
                    <Grid item xs={6} style={{ width: '100%', marginTop: '10px' }}>
                        <Typography sx={{ height: '35px', marginTop: '30px' }} gutterBottom>
                            Monitoring TimeOut
                        </Typography>
                        <Slider
                            {...register('timeOut')}
                            sx={{ height: '40px' }}
                            max={60}
                            aria-label="Default"
                            valueLabelDisplay="auto"
                            onChange={handleIntervalChanges}
                        />
                        Every {monitoringTimeOutValue} Secounds
                    </Grid>
                    <Grid item xs={6} style={{ width: '100%', marginTop: '10px' }}>
                        <br />
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Typography>Status</Typography>
                            <Switch {...register('status')} defaultChecked="true" />
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
                            Add
                        </Button>
                    </Stack>
                </div>
            </CardContent>
        </form>
    );
};

export default Ping;
