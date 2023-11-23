import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { toast } from 'react-toastify';
import Grid from '@mui/material/Grid';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { CardHeader, FormHelperText, IconButton, ImageListItem,Breadcrumbs, InputAdornment, TextField, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import api from '../config/axios-instance';
import { checkPermission } from '../utils/Permissions';
import { ENV } from '../config/config';
import Iconify from '../components/iconify';


/**
 * Design profile form schema with validations
 * Author: Ali Haider
 * Date: 07 sep, 2023
 */

const schema = yup.object().shape({
    name: yup.string().required('Name is required').trim(),
    email: yup
        .string()
        .required('Email is required')
        .matches(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format'),
    role: yup.string().required('Role is Required'),
    phone: yup
        .string()
        .required('Phone is required')
        .matches(/^[0-9]+$/, 'The phone number must contain numbers only')
        .min(11, 'The phone number must be at least 11 digits long')
        .max(16, 'The phone number can be up to 16 digits long')
        .nullable(true),
});

/**
 * Design Password schema with validation
 * Author: Ali Haider
 * Date: 07 sep, 2023
 */

const passwordSchema = yup.object().shape({
    currentPassword: yup.string().required('Current Password is Required'),
    newPassword: yup
        .string()
        .required('New Password is Required')
        .min(6, 'New password Must be at Least 6 Characters')
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+{}\]:;<>,.?~\\-])/,
            'New password Must Contain at Least One Upper-Case Letter, One Lower-Case Letter, And One Symbol'
        ),
    confirmPassword: yup
        .string()
        .required('Confirm Password is Required')
        .oneOf([yup.ref('newPassword'), null], 'Passwords Must Match'),
});

const Profile = () => {
    const token = JSON.parse(localStorage.getItem('token'));
    const userId = JSON.parse(localStorage.getItem('userId'));
    const [profileData, setProfileData] = useState({ name: '', email: '', phone: '' });
    const [loader, setLoader] = useState(true);
    const [prevImage, setPrevImage] = useState('');
    const [image, setImage] = useState();
    const [imageEmpty, setImageEmpty] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Yup vlidation name email phone
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
    });

    // Yup vlidation Update Password
    const {
        handleSubmit: handleSubmitPassword,
        register: registerPassword,
        formState: { errors: passwordErrors },
    } = useForm({ resolver: yupResolver(passwordSchema) });

    // GET Method
    const fetchUser = async () => {
        const url = `${ENV.appBaseUrl}/user/${userId}`;
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            };
            const response = await api.get(url, config);
            setProfileData(response?.data?.user);
            setLoader(false);
        } catch (error) {
            setLoader(false);
            toast.error(error?.response?.data?.message);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    // PUT Method
    const handleFormSubmit = async (data) => {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('email', data.email);
        formData.append('role', profileData?.role?._id);
        formData.append('phone', data.phone);
        setLoader(true);
        try {
            const url = `${ENV.appBaseUrl}/user/${userId}`;

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            };

            const res = await api.put(url, formData, config);
            if (res?.data) {
                const { data } = res;
                setLoader(false);
                toast.success(data?.message);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message);
            setLoader(false);
        }
    };

    // Handle image submission
    const submitPic = async (event) => {
        event.preventDefault();

        if (!image) {
            setImageEmpty('No image selected');
            return;
        }

        if (!['image/jpeg', 'image/png', 'image/jpg'].includes(image.type)) {
            setImageEmpty('Only PNG, JPEG, and JPG images are allowed');
            return;
        }
        setLoader(true);
        try {
            const url = `${ENV.appBaseUrl}/user/edit-profile-image`;
            const formData = new FormData();
            formData.append('profileImage', image);
            formData.append('_id', userId);

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            };

            const res = await api.put(url, formData, config);
            if (res?.data) {
                const { data } = res;
                toast.success(data?.message);
                setLoader(false);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message);
            setLoader(false);
        }
    };

    const handleImageChange = (event) => {
        if (event.target.files.length > 0) {
            const selectedImage = event.target.files[0];
            setImage(selectedImage);

            // Check if the selected file is an image
            if (selectedImage.type.startsWith('image/')) {
                setPrevImage(URL.createObjectURL(selectedImage));
                setImageEmpty('');
            }
        } else {
            setPrevImage(null);
        }
    };

    //  handle changes password
    const handlePasswordChange = async (data) => {
        setLoader(true);
        try {
            const url = `${ENV.appBaseUrl}/auth/edit-password`;
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            };
            const requestBody = {
                _id: userId,
                current: data.currentPassword,
                new: data.newPassword,
                confirm: data.confirmPassword,
            };
            const res = await api.put(url, requestBody, config);
            if (res?.data) {
                const { data } = res;
                setLoader(false);
                toast.success(data?.message);
            }
        } catch (error) {
            toast.error(error.response.data.message);
            setLoader(false);
        }
    };

    /**
     * Set loder
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
            <Typography variant="h4" gutterBottom>
            <Link to="/dashboard">
                <Button
                    className='back_btn'
                    variant="contained"
                >
                    <Iconify icon="bi:arrow-left" />
                </Button>
                </Link>
                Profile
                <div className='mt-10'>
                    <Breadcrumbs aria-label="breadcrumb">

                        <Link
                            to="/dashboard"
                            className="domain_bread"
                        >
                            Dashboard
                        </Link>
                        <Typography color="text.primary">Profile</Typography>
                    </Breadcrumbs>
                </div>
            </Typography>
            <Grid container spacing={2}>

                {/* Admin information fields */}
                <Grid item xs={12} md={8}>

                    <form onSubmit={handleSubmit(handleFormSubmit)}>
                        <Card sx={{ p: 2, height: '450px', border: '1px solid #c5c0c0' }}>
                            <CardHeader title={'Profile'} />
                            <CardContent>
                                <Grid container spacing={5}>
                                    <Grid item xs={6}>
                                        <TextField
                                            {...register('name')}
                                            defaultValue={profileData?.name}
                                            error={!!errors.name}
                                            helperText={errors.name?.message}
                                            label="Name"
                                            enabled="false"
                                            variant="outlined"
                                            id="outlined-error-helper-text"
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            {...register('email')}
                                            value={profileData?.email}
                                            InputProps={{
                                                readOnly: true,
                                                style: { color: '#a9a9a9' },
                                            }}
                                            type="email"
                                            label="Email"
                                            variant="outlined"
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            {...register('phone')}
                                            defaultValue={profileData?.phone}
                                            error={!!errors.phone}
                                            helperText={errors.phone?.message}
                                            id="outlined-basic"
                                            label="Phone"
                                            variant="outlined"
                                            type="number"
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            {...register('role')}
                                            value={profileData?.role?.name}
                                            InputProps={{
                                                readOnly: true,
                                                style: { color: '#a9a9a9' },
                                            }}
                                            type="role"
                                            label="Role"
                                            variant="outlined"
                                            fullWidth
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    marginTop: '100px',
                                    marginRight: '22px',
                                }}
                            >
                                {checkPermission('Update-Profile') ? (
                                    <Button type="submit" variant="contained" color="primary">
                                        {' '}
                                        Update{' '}
                                    </Button>
                                ) : (
                                    ''
                                )}
                            </div>
                        </Card>
                    </form>
                </Grid>

                {/* Image Uploded field */}
                <Grid item xs={12} md={4}>
                    <form onSubmit={submitPic}>
                        <Card sx={{ p: 2, height: '450px', border: '1px solid #c5c0c0' }}>
                            <CardHeader title={'Profile Image'} />
                            <CardContent>
                                <ImageListItem>
                                    {profileData.profileImage || prevImage ? (
                                        <img
                                            style={{ width: 180, height: 180, margin: 'auto', borderRadius: '50%' }}
                                            src={prevImage || `${ENV.file_Url}/${profileData.profileImage}`}
                                            alt="Remy Sharp"
                                            accept=".png,.jpeg,.jpg"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div
                                            style={{
                                                width: 180,
                                                height: 180,
                                                margin: 'auto',
                                                borderRadius: '50%',
                                                border: '2px dashed gray',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <span>Upload Profile Image</span>
                                        </div>
                                    )}

                                    <TextField
                                        sx={{ display: 'flex', paddingTop: '20px' }}
                                        name="uploadPhoto"
                                        type="file"
                                        onChange={handleImageChange}
                                        error={imageEmpty}
                                    />
                                    <FormHelperText sx={{ color: 'red' }}>{imageEmpty}</FormHelperText>
                                </ImageListItem>
                            </CardContent>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginRight: '22px' }}>
                                {checkPermission('Update-Profile-Image') ? (
                                    <Button type="submit" variant="contained" color="primary">
                                        {' '}
                                        Update{' '}
                                    </Button>
                                ) : (
                                    ''
                                )}
                            </div>
                        </Card>
                    </form>
                </Grid>
            </Grid>

            {/* update password fields  */}
            <Card sx={{ p: 2, marginTop: '15px', height: '280px', border: '1px solid #c5c0c0' }}>
                <form onSubmit={handleSubmitPassword(handlePasswordChange)}>
                    <CardHeader title={'Update Password'} />
                    <CardContent>
                        <div style={{ display: 'flex' }}>
                            <TextField
                                {...registerPassword('currentPassword')}
                                error={!!passwordErrors.currentPassword}
                                helperText={passwordErrors.currentPassword?.message}
                                type={showCurrentPassword ? 'text' : 'password'}
                                label="Current Password"
                                variant="outlined"
                                sx={{ marginRight: '8px', flex: 1 }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                edge="end"
                                            >
                                                <Iconify
                                                    icon={showCurrentPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'}
                                                />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <TextField
                                {...registerPassword('newPassword')}
                                error={!!passwordErrors.newPassword}
                                helperText={passwordErrors.newPassword?.message}
                                type={showNewPassword ? 'text' : 'password'}
                                label="New Password"
                                variant="outlined"
                                sx={{ marginRight: '8px', flex: 1 }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                                                <Iconify icon={showNewPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <TextField
                                {...registerPassword('confirmPassword')}
                                error={!!passwordErrors.confirmPassword}
                                helperText={passwordErrors.confirmPassword?.message}
                                type={showConfirmPassword ? 'text' : 'password'}
                                label="Confirm Password"
                                variant="outlined"
                                sx={{ flex: 1 }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                edge="end"
                                            >
                                                <Iconify
                                                    icon={showConfirmPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'}
                                                />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </div>
                    </CardContent>
                    <div
                        style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', marginRight: '22px' }}
                    >
                        {checkPermission('Update-Password') ? (
                            <Button type="submit" variant="contained" color="primary">
                                {' '}
                                Update{' '}
                            </Button>
                        ) : (
                            ''
                        )}
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default Profile;
