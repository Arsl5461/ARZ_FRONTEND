import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import { CardHeader, Divider, Checkbox, FormControlLabel,Breadcrumbs, Typography, TextField, Stack } from '@mui/material';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import api from '../../config/axios-instance';
import { ENV } from '../../config/config';
import Iconify from '../../components/iconify';

/**
 * Edit Role Component.
 *
 * All rights Reserved | Arhamsoft Pvt @2023
 *
 * @returns {JSX.Element} - JSX representation of the component.
 */
const Edit = () => {
    /**
     * Design Role form schema with validations
     * Author: Ali Haider
     * Date: 08 sep, 2023
     */
    const schema = yup.object().shape({
        name: yup.string().required('Name is Required').trim().min(3, 'Name Must be at Least 3 Characters Long'),
    });

    // Initialization and state management
    const { id } = useParams();
    const navigate = useNavigate();
    const authToken = JSON.parse(localStorage.getItem('token'));
    const [permissionsList, setPermissionsList] = useState({});
    const [permissions, setPermissions] = useState([]);
    const [roles, setRoles] = useState(null);
    const [loader, setLoader] = useState(true);

    /**
     * Fetch all permissions from the API
     *
     * Author: Ali Haider
     * Date: 08 sep, 2023
     */
    const fetchPermissions = async () => {
        try {
            const response = await api.get(`${ENV.appBaseUrl}/role/permissions`);
            setPermissionsList(response?.data?.permissionsType || {});
            setPermissions(response?.data?.role?.permissions || []);
        } catch (error) {
            toast.error(error?.response?.data?.message);
        }
    };

    /**
     * Fetch Role details by ID
     *
     * Author: Ali Haider
     * Date: 08 sep, 2023
     */
    async function FetchUserRole() {
        try {
            const response = await api.get(`${ENV.appBaseUrl}/role/${id}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });
            if (response?.data?.success) {
                setRoles(response?.data?.role);
                setPermissions(response?.data?.role?.permissions || []);
                setValue('name', response?.data?.role?.name);
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
        fetchPermissions();
        FetchUserRole();
    }, []);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm({
        resolver: yupResolver(schema),
    });

    /**
     * check pervious permission and set new permission
     *
     * Author: Ali Haider
     * Date: 08 sep, 2023
     */
    const handlePermissionToggle = (permissionType) => {
        setPermissions((prevSelected) =>
            prevSelected.includes(permissionType)
                ? prevSelected.filter((item) => item !== permissionType)
                : [...prevSelected, permissionType]
        );
    };
    /**
 * Handle logic for select all permissions within a specific category
 *
 * @param {string} category - The category name.
 * 
 * Author: Ali Haider
 * Date: 25 sep, 2023
 */
    const handleCategoryToggleAll = (category) => {
        const permissionsForCategory = permissionsList[category] || [];
        const updatedPermissions = [...permissions]; // Change this to an array
    
        // Calculate if all permissions for this category are already selected
        const allPermissionsSelected = permissionsForCategory.every((permission) =>
            updatedPermissions.includes(permission)
        );
    
        // Toggle the selection of all permissions within the category
        if (!allPermissionsSelected) {
            // If not all permissions are selected, add the missing ones
            updatedPermissions.push(...permissionsForCategory.filter((permission) => !updatedPermissions.includes(permission)));
        } else {
            // If all permissions are already selected, remove them all
            permissionsForCategory.forEach((permission) => {
                const index = updatedPermissions.indexOf(permission);
                if (index !== -1) {
                    updatedPermissions.splice(index, 1);
                }
            });
        }
    
        setPermissions(updatedPermissions);
    };
    
    
    

    /**
     * On form submit call edit role api and pass from @data in body
     *
     * @param {Object} props - Component props.
     * @return {void}
     *
     * Author: Ali Haider
     * Date: 08 sep, 2023
     */
    const handleSubmitForm = async (data) => {
        setLoader(true);
        try {
            const response = await api.put(
                `${ENV.appBaseUrl}/role/${id}`,
                { permissions, name: data?.name },
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
                toast.error(response.data?.message);
                setLoader(false);
            }
        } catch (error) {
            toast.error(error?.response.data?.message);
            setLoader(false);
        }
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
                    <Link to="/dashboard/roles">
                        <Button
                            className='back_btn'
                            variant="contained"
                        >
                            <Iconify icon="bi:arrow-left" />
                        </Button>
                        </Link>
                        Roles
                        <div className='mt-10'>
                            <Breadcrumbs aria-label="breadcrumb">

                                <Link                                
                                    to="/dashboard"
                                    className="domain_bread"
                                >
                                    Dashboard
                                </Link>
                                <Link to="/dashboard/roles" underline="hover" className="domain_bread">Roles</Link>
                                <Typography color="text.primary">Update</Typography>
                            </Breadcrumbs>
                        </div>
                    </Typography>
                    <form onSubmit={handleSubmit(handleSubmitForm)}>
                        <Card sx={{ p: 2 }}>
                            <CardContent>
                                <TextField
                                    {...register('name')}
                                    id="outlined-basic"
                                    defaultValue={roles?.name || ''}
                                    label="Name"
                                    variant="outlined"
                                    sx={{ marginRight: '8px', width: '50%' }}
                                    error={!!errors?.name}
                                    helperText={errors.name?.message}
                                />
                            </CardContent>
                            <CardContent>
                                {Object.entries(permissionsList).map(([category, permissionList]) => (
                                    <div key={category}>
                                        <Typography variant="h6">{category}</Typography>
                                        {permissionList.map((permission) => (
                                            <FormControlLabel
                                                key={permission}
                                                control={
                                                    <Checkbox
                                                        checked={permissions.includes(permission)}
                                                        onChange={() => handlePermissionToggle(permission)}
                                                    />
                                                }
                                                label={permission}
                                            />
                                        ))}
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={permissionsList[category].every((permission) =>
                                                        permissions.includes(permission)
                                                    )}
                                                    onChange={() => handleCategoryToggleAll(category)}
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
                                        Update
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

export default Edit;
