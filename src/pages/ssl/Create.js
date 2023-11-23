import React, { useState } from 'react';
import {
    Breadcrumbs,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Grid,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import Iconify from '../../components/iconify';
import { ENV } from '../../config/config';
import api from '../../config/axios-instance';

/**
 * Create Website Domain Component.
 *
 * All rights Reseverd | Arhamsoft Pvt @2023
 *
 * @returns {JSX.Element} - JSX representation of the component.
 */
function Create() {
    /**
     * Design Create Website Domain form schema with validations
     *
     * Author: Zain Ashraf
     * Date: 11 sep, 2023
     */
    const schema = yup.object().shape({
        domain: yup
            .string()
            .url('Invalid URL Format. Please enter a valid URL in the following format: https://example.com.')
            .test('no-trailing-slash', 'URL should not end with a slash ("/")', (value) => {
                if (value && value.endsWith('/')) {
                    return false;
                }
                return true;
            }),
    });

    // Initialization and state management
    const navigate = useNavigate();
    const [loader, setLoader] = useState(false);
    const token = JSON.parse(localStorage.getItem('token'));
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
    });

    /**
     * Create Website Domain on form submission
     *
     * @param {object} data - The website domain data from the form.
     * @return {void}
     *
     * Author: Zain Ashraf
     * Date: 11 Sep, 2023
     */
    const handleFormSubmit = async (data) => {
        setLoader(true);
        try {
            const formData = new FormData();
            formData.append('domain', data.domain);
            const headers = {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            };
            const response = await api.post(`${ENV.appBaseUrl}/ssl`, formData, { headers });
            if (response?.data?.success) {
                navigate('/dashboard/ssl');
                setLoader(false);
                toast.success(response?.data?.message);
            }
        } catch (error) {
            setLoader(false);
            toast.error(error?.response?.data?.message);
        }
    };

    /**
     * Renders a Material-UI CircularProgress spinner when the loader is active.
     *
     * @returns {JSX.Element} CircularProgress spinner if loader is active, otherwise null.
     *
     * Author: Zain Ashraf
     * Date: 21 Sep, 2023
     */
    if (loader) {
        return (
            <div className="spinner-wrapper">
                <CircularProgress value={100} />
            </div>
        );
    }

    return (
        <div className='padding_px'>
            <Grid container spacing={2}>
                <Grid item xs={12} md={12}>
                    <Typography variant="h4" gutterBottom>
                        <Link to="/dashboard/ssl">
                            <Button className="back_btn" variant="contained">
                                <Iconify icon="bi:arrow-left" />
                            </Button>
                        </Link>
                        SSL
                        <div className="mt-10">
                            <Breadcrumbs aria-label="breadcrumb">
                                <Link to="/dashboard" underline="hover" className="domain_bread">
                                    Dashboard
                                </Link>
                                <Link to="/dashboard/ssl" underline="hover" className="domain_bread">
                                    SSL
                                </Link>
                                <Typography color="text.primary">Add</Typography>
                            </Breadcrumbs>
                        </div>
                    </Typography>
                    <form onSubmit={handleSubmit(handleFormSubmit)}>
                        <Card sx={{ p: 2 }}>
                            <CardContent>
                                <TextField
                                    id="outlined-basic"
                                    label="Domain"
                                    variant="outlined"
                                    sx={{ marginRight: '8px', width: '100%' }}
                                    {...register('domain')}
                                    type="text"
                                    error={!!errors.domain}
                                    helperText={errors.domain?.message}
                                />
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
                                    <Button className="cancel_btn" variant="outlined" onClick={() => navigate('/dashboard/ssl')}>
                                        Cancel
                                    </Button>
                                    <Button variant="contained" type="submit" color="primary">
                                        Add
                                    </Button>
                                </Stack>
                            </div>
                        </Card>
                        <br />
                    </form>
                </Grid>
            </Grid>
        </div>
    );
}

export default Create;
