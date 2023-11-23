import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'react-toastify';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import {
    TextField,
    Switch,
    Typography,
    InputLabel,
    Select,
    MenuItem,
    InputAdornment,
    IconButton,
    Stack,
    FormControl,
    Breadcrumbs,
} from '@mui/material';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import api from '../../config/axios-instance';
import { ENV } from '../../config/config';
import Iconify from '../../components/iconify';


/**
 * Edit User Component.
 *
 * All rights Reserved | Arhamsoft Pvt @2023
 *
 * @returns {JSX.Element} - JSX representation of the component.
 */
const Edit = () => {
    /**
     * Design edit profile form schema with validations
     * Author: Ali Haider
     * Date: 07 sep, 2023
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
    const { id } = useParams();
    const authToken = JSON.parse(localStorage.getItem('token'));
    const [role, setRole] = useState(null);
    const [user, setUser] = useState(null);
    const [loader, setLoader] = useState(true);
    const [selectedRoleId, setSelectedRoleId] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
     * Fetch all roles from the API
     *
     * Author: Ali Haider
     * Date: 07 sep, 2023
     */
    async function FetchRoles() {
        try {
            const response = await api.get(`${ENV.appBaseUrl}/role`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });
            if (response?.data?.success) {
                setRole(response?.data?.roles);
            } else {
                toast.error(response?.data?.message);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message);
        }
    }

    /**
     * Fetch user details by ID
     *
     * Author: Ali Haider
     * Date: 07 sep, 2023
     */
    async function FetchUser() {
        try {
            const response = await api.get(`${ENV.appBaseUrl}/user/${id}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });
            if (response?.data?.success) {
                setUser(response?.data?.user);
                setValue('name', response?.data?.user?.name);
                setValue('email', response?.data?.user?.email);
                setValue('phone', response?.data?.user?.phone);
                setSelectedRoleId(response?.data?.user?.role?._id);
                setValue('role', response?.data?.user?.role?._id);
                setValue('status', response?.data?.user?.status);
                setLoader(false);
            } else {
                toast.error(response?.data?.message);
                setLoader(false);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message);
            setLoader(false);
        }
    }

    useEffect(() => {
        // Initial data fetch
        FetchRoles();
        FetchUser();
    }, []);

    /**
     * On form submit call edit user api and pass from @data in body
     *
     * @param {Object} props - Component props.
     * @return {void}
     *
     * Author: Ali Haider
     * Date: 07 sep, 2023
     * update fix the user role issue
     */
    //
    const handleFormSubmit = async (data) => {
        // Include the selected role ID in the data object
        data.role = selectedRoleId;
        setLoader(true);
        try {
            const response = await api.put(`${ENV.appBaseUrl}/user/${id}`, data, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });
            if (response?.data?.success) {
                toast.success(response.data?.message);
                navigate('/dashboard/users');
                setLoader(false);
            } else {
                toast.error(response.data?.message);
                setLoader(false);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message);
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
        const selectedRole = role?.find((type) => type?.name === selectedRoleName);

        // Update the selected role name and ID
        setSelectedRoleId(selectedRole?._id || '');

        // Set the role ID in the 'role' field of the form data
        setValue('role', selectedRole?._id || '', true);

        setUser((prevUser) => ({
            ...prevUser,
            role: selectedRole, // Update the user's role in the state
        }));
        clearErrors('role');
    };

   /**
     * Renders a Material-UI CircularProgress spinner when the loader is active.
     *
     * @returns {JSX.Element} CircularProgress spinner if loader is active, otherwise null.
     *
     * Author: Ali Haider
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
        <div>
            <Grid container spacing={2}>
                <Grid item xs={12} md={12}>
                <Typography variant="h4" gutterBottom>
                    <Link to="/dashboard/users">
                        <Button
                            className='back_btn'
                            variant="contained"
                        >
                            <Iconify icon="bi:arrow-left" />
                        </Button>
                        </Link>
                        Users
                        <div className='mt-10'>
                            <Breadcrumbs aria-label="breadcrumb">

                                <Link                                
                                    to="/dashboard"
                                    className="domain_bread"
                                >
                                    Dashboard
                                </Link>
                                <Link to="/dashboard/users" underline="hover" className="domain_bread">Users</Link>
                                <Typography color="text.primary">Update</Typography>
                            </Breadcrumbs>
                        </div>
                    </Typography>
                    <form onSubmit={handleSubmit(handleFormSubmit)}>
                        <Card sx={{ p: 2 }}>  
                            <CardContent>
                                <div style={{ display: 'flex' }}>
                                    <TextField
                                        {...register('name')}
                                        defaultValue={user?.name || ''}
                                        id="outlined-basic"
                                        label="Name"
                                        variant="outlined"
                                        sx={{ marginRight: '8px', flex: 1 }}
                                        error={!!errors?.name}
                                        helperText={errors.name?.message}
                                    />
                                    <TextField
                                        {...register('email')}
                                        defaultValue={user?.email || ''}
                                        InputProps={{
                                            readOnly: true,
                                            style: { color: '#a9a9a9' },
                                        }}
                                        type="email"
                                        id="outlined-basic"
                                        label="Email"
                                        variant="outlined"
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
                                            defaultValue={user?.phone || ''}
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
                                        <TextField
                                            {...register('phone')}
                                            defaultValue={user?.phone || ''}
                                            id="outlined-basic"
                                            label="Additional Contact "
                                            variant="outlined"
                                            type="number"
                                            fullWidth
                                            error={!!errors?.phone}
                                            helperText={errors.phone?.message}
                                        />
                                    </Grid>                                 
                                </Grid>
                            </CardContent>
                            <CardContent>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <TextField
                                            {...register('phone')}
                                            id="outlined-basic"
                                            label="CNIC"
                                            variant="outlined"
                                            type="number"
                                            fullWidth
                                            error={!!errors?.phone}
                                            helperText={errors.phone?.message}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            {...register('phone')}
                                            id="outlined-basic"
                                            label="Postal Address"
                                            variant="outlined"
                                            type="number"
                                            fullWidth
                                            error={!!errors?.phone}
                                            helperText={errors.phone?.message}
                                        />
                                    </Grid>

                                </Grid>
                            </CardContent>
                            <CardContent>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <TextField
                                            {...register('phone')}
                                            id="outlined-basic"
                                            label="Permanent Address"
                                            variant="outlined"
                                            type="number"
                                            fullWidth
                                            error={!!errors?.phone}
                                            helperText={errors.phone?.message}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <FormControl sx={{ minWidth: '100%' }}>
                                            <InputLabel id="demo-simple-select-label">Choose Gender</InputLabel>
                                            <Select
                                                labelId="demo-simple-select-label"
                                                id="demo-simple-select"
                                                label="Choose Role"
                                                fullWidth
                                                value={user?.role?.name || ''}
                                                onChange={handleRoleChange}
                                                error={!!errors?.role}
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
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <TextField
                                            {...register('phone')}
                                            id="outlined-basic"
                                            variant="outlined"
                                            type="date"
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
                                                label="Choose Role"
                                                fullWidth
                                                value={user?.role?.name || ''}
                                                onChange={handleRoleChange}
                                                error={!!errors?.role}
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
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <TextField
                                            {...register('phone')}
                                            id="outlined-basic"
                                            variant="outlined"                                        
                                            type="file"
                                            fullWidth
                                            error={!!errors?.phone}
                                            helperText={errors.phone?.message}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            {...register('phone')}
                                            id="outlined-basic"
                                            variant="outlined"                                        
                                            type="file"
                                            fullWidth
                                            error={!!errors?.phone}
                                            helperText={errors.phone?.message}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            {...register('phone')}
                                            id="outlined-basic"
                                            variant="outlined"                                        
                                            type="file"
                                            fullWidth
                                            error={!!errors?.phone}
                                            helperText={errors.phone?.message}
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
                                    <Button variant="contained" type="submit" color="primary">
                                        Update
                                    </Button>
                                </Stack>
                            </div>
                        </Card>
                        <br />
                    </form>

                      {/* Relative Information */}

                      <Card sx={{ p: 2 }}>
                        <Typography variant="h5" gutterBottom>
                            Relative Information
                        </Typography>
                        <form onSubmit={handleSubmit(handleFormSubmit)}>
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
                                        type="text"
                                        id="outlined-basic"
                                        label="Relation"
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
                                            label="Contact No"
                                            variant="outlined"
                                            type="number"
                                            fullWidth
                                            error={!!errors?.phone}
                                            helperText={errors.phone?.message}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            {...register('phone')}
                                            id="outlined-basic"
                                            label="Additional Contact "
                                            variant="outlined"
                                            type="number"
                                            fullWidth
                                            error={!!errors?.phone}
                                            helperText={errors.phone?.message}
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>

                            <CardContent>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <TextField
                                            {...register('phone')}
                                            id="outlined-basic"
                                            label="CNIC"
                                            variant="outlined"
                                            type="number"
                                            fullWidth
                                            error={!!errors?.phone}
                                            helperText={errors.phone?.message}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            {...register('phone')}
                                            id="outlined-basic"
                                            label="Postal Address"
                                            variant="outlined"
                                            type="number"
                                            fullWidth
                                            error={!!errors?.phone}
                                            helperText={errors.phone?.message}
                                        />
                                    </Grid>

                                </Grid>
                            </CardContent>
                            <CardContent>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <TextField
                                            {...register('phone')}
                                            id="outlined-basic"
                                            label="Permanent Address"
                                            variant="outlined"
                                            type="number"
                                            fullWidth
                                            error={!!errors?.phone}
                                            helperText={errors.phone?.message}
                                        />
                                    </Grid>

                                    <Grid item xs={6}>
                                        <TextField
                                            {...register('phone')}
                                            id="outlined-basic"
                                            variant="outlined"
                                            type="date"
                                            fullWidth
                                            error={!!errors?.phone}
                                            helperText={errors.phone?.message}
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
                                    <Button variant="contained" type="submit" color="primary">
                                    Update
                                    </Button>
                                </Stack>
                            </div>
                            <br />
                        </form>
                    </Card>

                    {/* Account Details */}
                    <Card sx={{ p: 2 }}>
                        <Typography variant="h5" gutterBottom>
                            Account Details
                        </Typography>
                        <form onSubmit={handleSubmit(handleFormSubmit)}>
                            <CardContent>
                                <div style={{ display: 'flex' }}>
                                    <TextField
                                        {...register('name')}
                                        id="outlined-basic"
                                        label="Bank Name"
                                        variant="outlined"
                                        sx={{ marginRight: '8px', flex: 1 }}
                                        error={!!errors?.name}
                                        helperText={errors.name?.message}
                                    />
                                    <TextField
                                        {...register('email')}
                                        type="number"
                                        id="outlined-basic"
                                        label="Account Number"
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
                                            label="Account Title"
                                            variant="outlined"
                                            fullWidth
                                            error={!!errors?.phone}
                                            helperText={errors.phone?.message}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            {...register('phone')}
                                            id="outlined-basic"
                                            label="Branch Code"
                                            variant="outlined"
                                            type="number"
                                            fullWidth
                                            error={!!errors?.phone}
                                            helperText={errors.phone?.message}
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>

                            <CardContent>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <TextField
                                            {...register('Branch Name')}
                                            id="outlined-basic"
                                            label="Branch Name"
                                            variant="outlined"
                                            type="text"
                                            fullWidth
                                            error={!!errors?.phone}
                                            helperText={errors.phone?.message}
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
                                    <Button variant="contained" type="submit" color="primary">
                                    Update
                                    </Button>
                                </Stack>
                            </div>
                            <br />
                        </form>
                    </Card>
                </Grid>
            </Grid>
        </div>
    );
};

export default Edit;
