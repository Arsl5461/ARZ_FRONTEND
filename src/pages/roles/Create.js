import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
// @mui
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import { Divider, Checkbox, FormControlLabel, CircularProgress, Typography, TextField, Stack } from '@mui/material';
import Button from '@mui/material/Button';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import api from '../../config/axios-instance';
import { ENV } from '../../config/config';
import Iconify from '../../components/iconify';

/**
 * Create Roles Component.
 *
 * All rights Reserved | Arhamsoft Pvt @2023
 *
 * @returns {JSX.Element} - JSX representation of the component.
 */
const Create = () => {
    /**
     * Design create role form schema with validations
     *
     * Author: Ali Haider
     * Date: 08 sep, 2023
     */
    const schema = yup.object().shape({
        name: yup
            .string()
            .required('Role Name is Required')
            .trim()
            .min(3, 'Role Name Must be at Least 3 Characters Long'),
    });

    // Initialization and state management
    const navigate = useNavigate();
    const authToken = JSON.parse(localStorage.getItem('token'));
    const [permissionsList, setPermissionsList] = useState({});
    const [permissions, setPermissions] = useState({});
    const [loader, setLoader] = useState(false);

    /**
     * Fetch all permissions from the API
     *
     * Author: Ali Haider
     * Date: 08 sep, 2023
     */
    const fetchPermissions = async () => {
        try {
            const response = await api.get(`${ENV.appBaseUrl}/role/permissions`);
            if (response?.data?.success) {
                setPermissionsList(response?.data?.permissionsType || {});
                // Initialize permissions state with empty selections for each role
                const initialPermissionsState = {};
                Object.keys(response?.data?.permissionsType || {}).forEach((category) => {
                    response?.data?.permissionsType[category].forEach((permission) => {
                        initialPermissionsState[permission] = false;
                    });
                });
                setPermissions(initialPermissionsState);
            } else {
                toast.error(response?.data?.message);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message);
        }
    };

    useEffect(() => {
        // Initial data fetch
        fetchPermissions();
    }, []);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
    });

    /**
     * check previous permission and set new permission
     *
     * Author: Ali Haider
     * Date: 08 sep, 2023
     */
    const handlePermissionToggle = (permissionType) => {
        setPermissions((prevState) => ({
            ...prevState,
            [permissionType]: !prevState[permissionType],
        }));
    };

    /**
     * Handle logic for select all roles
     *
     * Author: Ali Haider
     * Date: 18 sep, 2023
     */
    const handleRoleToggleAll = (roleName) => {
        const permissionsForRole = permissionsList[roleName] || [];
        const allPermissionsSelected = permissionsForRole.every((permission) => permissions[permission]);
        const updatedPermissions = { ...permissions };
        permissionsForRole.forEach((permission) => {
            updatedPermissions[permission] = !allPermissionsSelected;
        });
        setPermissions(updatedPermissions);
    };

    /**
     * Role creation on form submission
     *
     * @param {object} data - The role data from the form.
     * @return {void}
     *
     * Author: Ali Haider
     * Date: 08 Sep, 2023
     */
    const handleSubmitForm = async (data) => {
        setLoader(true);
        const selectedPermissions = Object.keys(permissions).filter((permission) => permissions[permission]);
        try {
            const response = await api.post(
                `${ENV.appBaseUrl}/role`,
                { permissions: selectedPermissions, name: data?.name },
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            );
            if (response?.data?.success) {
                toast.success(response?.data?.message);
                setLoader(false);
                navigate('/dashboard/roles');
            } else {
                toast.error(response?.data?.message);
                setLoader(false);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message);
            setLoader(false);
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
        return <div className='spinner-wrapper'>
            <CircularProgress value={100} />
        </div>;
    }
    return (
        <div className='padding_px'>
            <Grid container spacing={2}>
            <Typography variant="h4" gutterBottom className='ml-10'>
            <Link to="/dashboard/roles">
                        <Button className="back_btn" variant="contained">
                            <Iconify icon="bi:arrow-left" />
                        </Button>
                        </Link>
                       Roles
                        <div className="mt-10">
                            <Breadcrumbs aria-label="breadcrumb">
                                <Link
                                    to="/dashboard"
                                    className="domain_bread"
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    to="/dashboard/roles"
                                    className="domain_bread"
                                >
                                     Roles
                                </Link>
                                <Typography color="text.primary">Add</Typography>
                            </Breadcrumbs>
                        </div>
                    </Typography>
                <Grid item xs={12} md={12}>
                    <form onSubmit={handleSubmit(handleSubmitForm)}>
                        <Card sx={{ p: 2 }}>
                            <CardContent>
                                <TextField
                                    {...register('name')}
                                    id="outlined-basic"
                                    label="Role Name"
                                    variant="outlined"
                                    sx={{ marginRight: '8px', width: '50%' }}
                                    error={!!errors?.name}
                                    helperText={errors.name?.message}
                                />
                            </CardContent>
                            <CardContent>
                                {Object.entries(permissionsList).map(([category, permissionList]) => (
                                    <div key={category} className="category_list">
                                        <Typography variant="h6">{category}</Typography>
                                        {permissionList.map((permission) => (
                                            <FormControlLabel
                                                key={permission}
                                                control={
                                                    <Checkbox
                                                        checked={permissions[permission] || false}
                                                        onChange={() => handlePermissionToggle(permission)}
                                                    />
                                                }
                                                label={permission}
                                            />
                                        ))}
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={permissionsList[category].every(
                                                        (permission) => permissions[permission]
                                                    )}
                                                    onChange={() => handleRoleToggleAll(category)}
                                                />
                                            }
                                            label="Select All"
                                        />
                                        <Divider />
                                    </div>
                                ))}
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
                                        onClick={() => navigate('/dashboard/roles')}
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
