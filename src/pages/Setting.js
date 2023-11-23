import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Grid, Card, CircularProgress, TextField, CardContent, Button, Typography,Breadcrumbs } from '@mui/material'; // @mui
import { toast } from 'react-toastify';
import { Link,useNavigate } from 'react-router-dom';
import { ENV } from '../config/config';
import { checkPermission } from '../utils/Permissions';
import Iconify from '../components/iconify';
import api from '../config/axios-instance';

/**
 * Create Setting Componnet.
 *
 * All right Reserved | ArhamSoft Pvt @2023.
 *
 * @return {JSX.Element} - Jsx representation of the component.
 */

const Setting = () => {
    /**
     * Design Create for Setting and hare is schema with validation
     *
     * Auther: Muhammad Rooman
     * Date: September 9, 2023
     */
    const schema = yup.object().shape({
        youtube: yup
            .string()
            .required('YouTube is Required')
            .matches(/^(https?:\/\/)?(www\.)?youtube\.com\/.+/i, 'Invalid YouTube URL'),
        facebook: yup
            .string()
            .required('Facebook is required')
            .matches(/^(https?:\/\/)?(www\.)?facebook\.com.*$/, 'Invalid Facebook URL'),
        linkedin: yup
            .string()
            .required('LinkedIn is Required')
            .matches(/^(https?:\/\/)?(www\.)?linkedin\.com\/.+/i, 'Invalid LinkedIn URL'),
        tiktok: yup
            .string()
            .required('TikTok is Required')
            .matches(/^(https?:\/\/)?(www\.)?tiktok\.com\/.+/i, 'Invalid TikTok URL'),
        instagram: yup
            .string()
            .required('Instagram is Required')
            .matches(/^(https?:\/\/)?(www\.)?instagram\.com\/.+/i, 'Invalid Instagram URL'),
        telegram: yup
            .string()
            .required('Telegram is Required')
            .matches(/^(https?:\/\/)?(www\.)?t\.me\/.+/i, 'Invalid Telegram URL'),
        email: yup
            .string()
            .required('Email is Required')
            .matches(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid rmail Format'),
        phone: yup
            .string()
            .required('Phone is Required')
            .matches(/^[0-9]+$/, 'The Phone Number Must Contain Numbers Only')
            .min(11, 'The Phone Number Must be at Least 11 Digits Long')
            .max(16, 'The Phone Number Can be up to 16 Digits Long')
            .nullable(true),
    });

    // Initialization and state managment
    const navigate = useNavigate();
    const [settingData, setSettingData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const token = JSON.parse(localStorage.getItem('token')); // Retrieve the authentication token from local storage

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
    });

    /**
     * Fetch All Setting Data from the Get API
     *
     * Auther: Muhammad Rooman
     * Date: September 08, 2023
     *
     * Update 1 (September 13, 2023): Used useCallback to memoize the function to improve performance by preventing unnecessary re-rendering of the component.
     * update 2 (September 18, 2023) : axios replaced with api .If the response is successful, return it . If a 403 (Forbidden) response is received, perform some actions
     *
     */
    const fetchSettingData = useCallback(async () => {
        setIsLoading(true);
        const url = `${ENV.appBaseUrl}/settings`;
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`, // Include the token in the Authorization header
                    'Content-Type': 'application/json',
                },
            };
            const response = await api.get(url, config);
            if (response?.data?.success) {
                setSettingData(response.data.settings);
                setIsLoading(false);
            } else {
                toast.error(response?.data?.message);
                setIsLoading(false);
            }
        } catch (error) {
            setIsLoading(false);
        }
    }, [setIsLoading, setSettingData, token]);

    useEffect(() => {
        // Call the fetchSettingData function to fetch data
        fetchSettingData();
    }, [fetchSettingData]);

    /**
     * Create Setting data upon form submission.
     * Send a POST request to create a new Setting.
     * @param {object} -The Setting data to be updated.
     * @return {void}
     *
     * Author: Muhammad Rooman
     * Date: September 08, 2023
     */
    const handleFormSubmit = async (data) => {
        const formData = new FormData();
        formData.append('youtube', data.youtube);
        formData.append('facebook', data.facebook);
        formData.append('email', data.email);
        formData.append('phone', data.phone);
        formData.append('tiktok', data.tiktok);
        formData.append('telegram', data.telegram);
        formData.append('instagram', data.instagram);
        formData.append('linkedin', data.linkedin);
        try {
            const url = `${ENV.appBaseUrl}/settings`;
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`, // Include the token in the Authorization header
                    'Content-Type': 'application/json',
                },
            };
            setIsLoading(true);
            const res = await api.post(url, formData, config);
            if (res?.data) {
                const { data } = res;
                toast.success(data.message);
                setIsLoading(false);
            }
        } catch (error) {
            setIsLoading(false);
            toast.error(error?.response?.data?.message);
        }
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
                    <form onSubmit={handleSubmit(handleFormSubmit)}>
                        <Typography variant="h4" gutterBottom>
                        <Button onClick={() => navigate('/dashboard')} className="back_btn" variant="contained">
                                <Iconify icon="bi:arrow-left" />
                            </Button>
                            Setting
                            <div className="mt-10">
                                <Breadcrumbs aria-label="breadcrumb">
                                    <Link 
                                        underline="hover"
                                        className="domain_bread"
                                        to="/dashboard"
                                    >
                                        Dashboard
                                    </Link >
                                    <Typography color="text.primary">setting</Typography>
                                </Breadcrumbs>
                            </div>
                        </Typography>
                        <Card sx={{ p: 2, border: '1px solid #c5c0c0' }}>
                            <CardContent>
                                <Grid container spacing={5}>
                                    <Grid item xs={6}>
                                        <TextField
                                            {...register('youtube')}
                                            defaultValue={settingData?.youtube}
                                            error={!!errors.youtube}
                                            helperText={errors.youtube?.message}
                                            label="Youtube"
                                            enabled="false"
                                            variant="outlined"
                                            id="outlined-error-helper-text"
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            {...register('facebook')}
                                            defaultValue={settingData?.facebook}
                                            error={!!errors.facebook}
                                            helperText={errors.facebook?.message}
                                            type="text"
                                            label="Facebook"
                                            variant="outlined"
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            {...register('tiktok')}
                                            defaultValue={settingData?.tiktok}
                                            error={!!errors.tiktok}
                                            helperText={errors.tiktok?.message}
                                            label="Tiktok"
                                            enabled="false"
                                            variant="outlined"
                                            id="outlined-error-helper-text"
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            {...register('instagram')}
                                            defaultValue={settingData?.instagram}
                                            error={!!errors.instagram}
                                            helperText={errors.instagram?.message}
                                            type="text"
                                            label="Instagram"
                                            variant="outlined"
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            {...register('telegram')}
                                            defaultValue={settingData?.telegram}
                                            error={!!errors.telegram}
                                            helperText={errors.telegram?.message}
                                            label="Telegram"
                                            enabled="false"
                                            variant="outlined"
                                            id="outlined-error-helper-text"
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            {...register('linkedin')}
                                            defaultValue={settingData?.linkedin}
                                            error={!!errors.linkedin}
                                            helperText={errors.linkedin?.message}
                                            type="text"
                                            label="Linkedin"
                                            variant="outlined"
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            {...register('email')}
                                            defaultValue={settingData?.email}
                                            error={!!errors.email}
                                            helperText={errors.email?.message}
                                            id="outlined-basic"
                                            label="Email"
                                            variant="outlined"
                                            type="email"
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            {...register('phone')}
                                            defaultValue={settingData?.phone}
                                            error={!!errors.phone}
                                            helperText={errors.phone?.message}
                                            id="outlined-basic"
                                            label="Phone"
                                            variant="outlined"
                                            type="number"
                                            fullWidth
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    marginTop: '10px',
                                    marginRight: '22px',
                                }}
                            >
                                {checkPermission('Create-Settings') ? (
                                    <Button type="submit" variant="contained" color="primary">
                                        {!settingData?._id ? 'Create' : 'Update'}
                                    </Button>
                                ) : (
                                    ''
                                )}
                            </div>
                        </Card>
                    </form>
                </Grid>
            </Grid>
        </div>
    );
};

export default Setting;
