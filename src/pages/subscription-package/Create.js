import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { Link } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import {
    TextField,
    Switch,
    Typography,
    InputAdornment,
    IconButton,
    Select,
    InputLabel,
    MenuItem,
    FormControl,
    Stack,
    CircularProgress,
} from '@mui/material';
import Button from '@mui/material/Button';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import api from '../../config/axios-instance';
import { ENV } from '../../config/config';
import Iconify from '../../components/iconify';

/**
 * Create User Component.
 *
 * All rights Reseverd | Arhamsoft Pvt @2023
 *
 * @returns {JSX.Element} - JSX representation of the component.
 */
const Create = () => {
    /**
     * Design create user profile form schema with validations
     *
     * Author: Ali Haider
     * Date: 07 sep, 2023
     *
     * Update1: Fix password and confirm password validation issue
     */
    const schema = yup.object().shape({
        name: yup.string().required('Name is Required').trim().min(3, 'Name Must be at Least 3 Characters Long'),
        email: yup
            .string()
            .required('Email is Required')
            .matches(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid Email Format'),
        role: yup.string().required('Role is Required'),
        phone: yup
            .string()
            .required('Phone is Required')
            .matches(/^[0-9]+$/, 'The Phone Number Must Contain Numbers Only')
            .min(11, 'The Phone Number Must be at Least 11 Digits Long')
            .max(16, 'The Phone Number Can be up to 16 Digits Long')
            .nullable(true),
        status: yup.boolean().default(true),
       
    });

    // Initialization and state management
    const navigate = useNavigate();
    const authToken = JSON.parse(localStorage.getItem('token'));
    const [role, setRole] = useState(null);
    const [selectedRoleName, setSelectedRoleName] = useState('');
    const [loader, setLoader] = useState(true);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        clearErrors,
    } = useForm({
        resolver: yupResolver(schema),
    });

    /**
     * User creation on form submission
     *
     * @param {object} data - The user data from the form.
     * @return {void}
     *
     * Author: Ali Haider
     * Date: 07 Sep, 2023
     */
    const handleFormSubmit = async (data) => {
        setLoader(true);
        try {
            const response = await api.post(`${ENV.appBaseUrl}/user`, data, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (response?.data?.success) {
                toast.success(response.data?.message);
                setLoader(false);
                navigate('/dashboard/users');
            } else {
                toast.error(response.data?.message);
                setValue('role', selectedRoleName, true);
                setLoader(false);
            }
        } catch (error) {
            toast.error(error?.response.data?.message);
            setLoader(false);
        }
    };

    /**
     * Handle Role Change
     *
     * @param {Event}  event - The event object to be handled.
     * @return { void }
     *
     * Author: Ali Haider
     * Date: 07 sep, 2023
     */
    const handleRoleChange = (event) => {
        const selectedRoleName = event.target.value;
        setSelectedRoleName(selectedRoleName); 
        const selectedRole = role?.find((type) => type?.name === selectedRoleName);
        setValue('role', selectedRole?._id, true); // Set the role ID in the form data
        // clearErrors('role');
    };

      /**
     * Renders a Material-UI CircularProgress spinner when the loader is active.
     *
     * @returns {JSX.Element} CircularProgress spinner if loader is active, otherwise null.
     *
     * Author: Ali Haider
     * Date: 22 Sep, 2023
     */
    if (loader) {
        return <div className='spinner-wrapper'>
            <CircularProgress value={100} />
        </div>;
    }
    return (
        <div className='padding_px'>
            <Grid container spacing={2}>
                <Grid item xs={12} md={12}>
                    <Typography variant="h4" gutterBottom className='ml-10'>
                        <Link to="/dashboard/users">
                            <Button className="back_btn" variant="contained">
                                <Iconify icon="bi:arrow-left" />
                            </Button>
                        </Link>
                        Users
                        <div className="mt-10">
                            <Breadcrumbs aria-label="breadcrumb">
                                <Link
                                    to="/dashboard"
                                    className="domain_bread"
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    to="/dashboard/users"
                                    className="domain_bread"
                                >
                                    Users
                                </Link>
                                <Typography color="text.primary">Add</Typography>
                            </Breadcrumbs>
                        </div>
                    </Typography>
                    <form onSubmit={handleSubmit(handleFormSubmit)}>
                        <Card sx={{ p: 2 }}>
                            <CardContent>
                                <div style={{ display: 'flex' }}>
                                    <TextField
                                        {...register('name')}
                                        id="outlined-basic"
                                        label="Name"
                                        variant="outlined"
                                        sx={{ marginRight: '8px', flex: 1 }}
                                        error={!!errors?.name}
                                        helperText={errors.name?.message}
                                    />
                                    <TextField
                                        {...register('email')}
                                        type="email"
                                        id="outlined-basic"
                                        label="Email"
                                        variant="outlined"
                                        autoComplete="off"
                                        sx={{ flex: 1 }}
                                        error={!!errors?.email}
                                        helperText={errors.email?.message}
                                    />
                                </div>
                            </CardContent>

                            <CardContent>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <TextField
                                            {...register('phone')}
                                            id="outlined-basic"
                                            label="Phone"
                                            variant="outlined"
                                            type="number"
                                            fullWidth
                                            error={!!errors?.phone}
                                            helperText={errors.phone?.message}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <FormControl sx={{ minWidth: '100%' }}>
                                            <InputLabel id="demo-simple-select-label">Choose Role</InputLabel>
                                            <Select
                                                labelId="demo-simple-select-label"
                                                id="demo-simple-select"
                                                label="Type"
                                                fullWidth
                                                onChange={handleRoleChange}
                                                error={!!errors?.role}
                                                value={selectedRoleName}
                                            >
                                                {role?.map((type, index) => {
                                                    return (
                                                        <MenuItem key={index} value={type?.name}>
                                                            {type?.name}
                                                        </MenuItem>
                                                    );
                                                })}
                                            </Select>
                                            {errors?.role && (
                                                <Typography variant="caption" color="error">
                                                    {errors?.role?.message}
                                                </Typography>
                                            )}
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </CardContent>
                            
                            <CardContent>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <Typography>Status</Typography>
                                    <Switch {...register('status')} color="primary" />
                                </div>
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
                                        onClick={() => navigate('/dashboard/users')}
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
};

export default Create;
