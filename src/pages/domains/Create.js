import React, { useState } from 'react';
import { Button, Card, CardContent, Typography,Breadcrumbs,CircularProgress, Grid, Stack, TextField } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import api from '../../config/axios-instance';
import { ENV } from '../../config/config';
import Iconify from '../../components/iconify';


/**
 * Create Domain Component.
 *
 * All rights Reseverd | Arhamsoft Pvt @2023
 *
 * @returns {JSX.Element} - JSX representation of the component.
 */
function Create() {
    /**
     * Design create domain form schema with validations
     *
     * Author: Ali Haider
     * Date: 07 sep, 2023
     * Update 1 (12 Sep,2023): Update the  domain  schema field validation add https://example.com for ref
     */
    const schema = yup.object().shape({
        domain: yup
            .string()
            .required('Domain is Required')
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
    const token = JSON.parse(localStorage.getItem('token'));
    const [loader, setLoader] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
    });

    /**
     * Domain creation on form submission and map tags
     *
     * @param {object} data - The website data from the form.
     * @return {void}
     *
     * Author: Ali Haider
     * Date: 07 Sep, 2023
     */
    const handleFormSubmit = async (data) => {
        setLoader(true);
        try {
            const headers = {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            };
            const response = await api.post(`${ENV.appBaseUrl}/domain`, data, { headers });
            if (response?.data?.success) {
                setLoader(false);
                navigate('/dashboard/domains');
                toast.success(response?.data?.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message);
            setLoader(false);
            console.log(error);
        }
    };

     /**
     * Renders a Material-UI CircularProgress spinner when the loader is active.
     *
     * @returns {JSX.Element} CircularProgress spinner if loader is active, otherwise null.
     *
     * Author: Ali Haider
     * Date: 25 Sep, 2023
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
                    <Typography variant="h4" gutterBottom className='ml-10'>
                        <Link to="/dashboard/domains">
                            <Button className="back_btn" variant="contained">
                                <Iconify icon="bi:arrow-left" />
                            </Button>
                        </Link>
                        Domains
                        <div className="mt-10">
                            <Breadcrumbs aria-label="breadcrumb">
                                <Link
                                    to="/dashboard"
                                    className="domain_bread"
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    to="/dashboard/domains"
                                    className="domain_bread"
                                >
                                    Domains
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
                                    <Button
                                        variant="outlined"
                                        className="cancel_btn"
                                        onClick={() => navigate('/dashboard/domains')}
                                    >
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
