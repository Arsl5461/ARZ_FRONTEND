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
        additionalContact: yup
            .string()
            .matches(/^[0-9]+$/, 'The Phone Number Must Contain Numbers Only')
            .min(11, 'The Phone Number Must be at Least 11 Digits Long')
            .max(16, 'The Phone Number Can be up to 16 Digits Long')
            .nullable(true),
        cnic: yup
            .string()
            .matches(/^[0-9]{5}-[0-9]{7}-[0-9]$/, 'Invalid CNIC format. Example: 12345-1234567-1')
            .required('CNIC is required'),
        status: yup.boolean().default(true),

        postalAddress: yup
            .string()
            .required('Postal Address is required'),

        permanentAddress: yup
            .string()
            .required('Permanent Address is required'),

        dateOfBirth: yup
            .date()
            .max(new Date(), 'Date of Birth cannot be in the future')
            .required('Date of Birth is required'),

        cnicPicture: yup
            .mixed()
            .test('fileType', 'Invalid file format', (value) => {
                if (!value) return true; // No file provided is also considered valid
                return ['image/jpeg', 'image/png', 'image/jpg'].includes(value.type);
            })
            .test('fileSize', 'File size is too large', (value) => {
                if (!value) return true; // No file provided is also considered valid
                return value.size <= 5120000; // 1MB
            }),

            cnicBackSide: yup
            .mixed()
            .test('fileType', 'Invalid file format', (value) => {
              if (!value) return true; // No file provided is also considered valid
              return ['image/jpeg', 'image/png', 'image/jpg'].includes(value.type);
            })
            .test('fileSize', 'File size is too large', (value) => {
              if (!value) return true; // No file provided is also considered valid
              return value.size <= 5120000; // 5MB
            }),

        choosePicture: yup
            .mixed()
            .test('fileType', 'Invalid file format', (value) => {
                if (!value) return true; // No file provided is also considered valid
                return ['image/jpeg', 'image/png', 'image/jpg'].includes(value.type);
            })
            .test('fileSize', 'File size is too large', (value) => {
                if (!value) return true; // No file provided is also considered valid
                return value.size <= 5120000; // 1MB
            }),

        gender: yup
            .string()
            .oneOf(['Male', 'Female', 'Other'], 'Invalid gender')
            .required('Gender is required'),
        password: yup
            .string()
            .required('Password is Required')
            .min(6, 'Password Must be at Must 6 Characters')
            .matches(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+{}\]:;<>,.?~\\-])/,
                'password Must Contain at Must One Upper-Case Letter, One Lower-Case Letter, And One Symbol'
            ),
        confirmPassword: yup
            .string()
            .required('Confirm Password is Required')
            .oneOf([yup.ref('password'), null], 'Passwords Must Match'),
    });

    const RelativeInformationSchema = yup.object().shape({
        name: yup
          .string()
          .required('Name is Required')
          .trim()
          .min(3, 'Name Must be at Least 3 Characters Long'),
        relation: yup.string().required('Relation is Required'),
        phone: yup
          .string()
          .required('Contact No is Required')
          .matches(/^[0-9]+$/, 'The Phone Number Must Contain Numbers Only')
          .min(11, 'The Phone Number Must be at Least 11 Digits Long')
          .max(16, 'The Phone Number Can be up to 16 Digits Long')
          .nullable(true),
        additionalContact: yup
          .string()
          .required('Additiona Contact is Required')
          .matches(/^[0-9]+$/, 'The Phone Number Must Contain Numbers Only')
          .min(11, 'The Phone Number Must be at Least 11 Digits Long')
          .max(16, 'The Phone Number Can be up to 16 Digits Long')
          .nullable(true),
        cnic: yup
          .string()
          .matches(/^[0-9]{5}-[0-9]{7}-[0-9]$/, 'Invalid CNIC format. Example: 12345-1234567-1')
          .required('CNIC is required'),
        postalAddress: yup.string().required('Postal Address is Required'),
        permanentAddress: yup.string().required('Permanent Address is Required'),
        dateOfBirth: yup
          .date()
          .max(new Date(), 'Date of Birth cannot be in the future')
          .required('Date of Birth is required'),
       
      });

      const AccountDetailsSchema = yup.object().shape({
        bankName: yup.string().required('Bank Name is Required'),
        accountNumber: yup
          .string()
          .required('Account Number is Required')
          .matches(/^[0-9]+$/, 'The Account Number Must Contain Numbers Only'),
        accountTitle: yup.string().required('Account Title is Required'),
        branchCode: yup
          .string()
          .required('Branch Code is Required')
          .matches(/^[0-9]+$/, 'The Branch Code Must Contain Numbers Only'),
        branchName: yup.string().required('Branch Name is Required'),
      });
      
    // Initialization and state management
    const navigate = useNavigate();
    const authToken = JSON.parse(localStorage.getItem('token'));
    const [role, setRole] = useState(null);
    const [selectedRoleName, setSelectedRoleName] = useState('');
    const [loader, setLoader] = useState(true);
    const [currentStep, setCurrentStep] = useState(1); // Initial step

    const nextStep = () => {
      setCurrentStep(currentStep + 1);
    };
  
    const prevStep = () => {
      setCurrentStep(currentStep - 1);
    };
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
    }, []);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        clearErrors,
    } = useForm({
        resolver: yupResolver(schema),
    });

    const { register: relativeRegister, handleSubmit: relativeHandleSubmit, formState: relativeFormState, errors: relativeErrors } = useForm({
        resolver: yupResolver(RelativeInformationSchema),
      });


  const handleRelativeInformationSubmit = (data) => {
    console.log('Relative Information Data:', data);
  };

  const { isSubmitted: isRelativeSubmitted } = relativeFormState;

  const { register: accountRegister, handleSubmit: accountHandleSubmit, formState: accountFormState, errors: accountErrors } = useForm({
    resolver: yupResolver(AccountDetailsSchema),
  });

  const handleAccountDetailsSubmit = (data) => {
    console.log('Account Details Data:', data);
  };

  const { isSubmitted: isAccountSubmitted } = accountFormState;
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
                    <Card sx={{ p: 2 }}>
                        <Typography variant="h5" gutterBottom>
                            Personal Information
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
                                        <TextField
                                            {...register('additionalContact')}
                                            id="outlined-basic"
                                            label="Additional Contact "
                                            variant="outlined"
                                            type="number"
                                            fullWidth
                                            error={!!errors?.additionalContact}
                                            helperText={errors.additionalContact?.message}
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>

                            <CardContent>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <TextField
                                            {...register('cnic')}
                                            id="outlined-basic"
                                            label="CNIC"
                                            variant="outlined"
                                            type="cnic"
                                            fullWidth
                                            error={!!errors?.cnic}
                                            helperText={errors.cnic?.message}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            {...register('postalAddress')}
                                            id="outlined-basic"
                                            label="Postal Address"
                                            variant="outlined"
                                            type="text"
                                            fullWidth
                                            error={!!errors?.postalAddress}
                                            helperText={errors.postalAddress?.message}
                                        />
                                    </Grid>

                                </Grid>
                            </CardContent>
                            <CardContent>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <TextField
                                            {...register('permanentAddress')}
                                            id="outlined-basic"
                                            label="Permanent Address"
                                            variant="outlined"
                                            type="text"
                                            fullWidth
                                            error={!!errors?.permanentAddress}
                                            helperText={errors.permanentAddress?.message}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <FormControl sx={{ minWidth: '100%' }}>
                                            <InputLabel id="demo-simple-select-label">Choose Gender</InputLabel>
                                            <Select
                                                labelId="demo-simple-select-label"
                                                id="demo-simple-select"
                                                label="Choose Gender"
                                                fullWidth
                                                onChange={handleRoleChange}
                                                error={!!errors?.gender}
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
                                            {errors?.gender && (
                                                <Typography variant="caption" color="error">
                                                    {errors?.gender?.message}
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
                                            {...register('dateOfBirth')}
                                            id="outlined-basic"
                                            variant="outlined"
                                            type="date"
                                            fullWidth
                                            error={!!errors?.dateOfBirth}
                                            helperText={errors.dateOfBirth?.message}
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
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <TextField
                                            {...register('choosePicture')}
                                            id="outlined-basic"
                                            variant="outlined"
                                            type="file"
                                            fullWidth
                                            error={!!errors?.choosePicture}
                                            helperText={errors.choosePicture?.message}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            {...register('cnicPicture')}
                                            id="outlined-basic"
                                            variant="outlined"
                                            type="file"
                                            fullWidth
                                            error={!!errors?.cnicPicture}
                                            helperText={errors.cnicPicture?.message}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            {...register('cnicBackSide')}
                                            id="outlined-basic"
                                            variant="outlined"
                                            type="file"
                                            fullWidth
                                            error={!!errors?.cnicBackSide}
                                            helperText={errors.cnicBackSide?.message}
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
                                        Next
                                    </Button>
                                </Stack>
                            </div>
                            <br />
                        </form>
                    </Card>

                    {/* Relative Information */}

                    <Card sx={{ p: 2 }}>
                        <Typography variant="h5" gutterBottom>
                            Relative Information
                        </Typography>
                        <form onSubmit={relativeHandleSubmit(handleRelativeInformationSubmit)}>
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
                                        {...register('relation')}
                                        type="text"
                                        id="outlined-basic"
                                        label="Relation"
                                        variant="outlined"
                                        autoComplete="off"
                                        sx={{ flex: 1 }}
                                        error={!!errors?.relation}
                                        helperText={errors.relation?.message}
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
                                            {...register('additionalContact')}
                                            id="outlined-basic"
                                            label="Additional Contact "
                                            variant="outlined"
                                            type="number"
                                            fullWidth
                                            error={!!errors?.additionalContact}
                                            helperText={errors.additionalContact?.message}
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>

                            <CardContent>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <TextField
                                            {...register('cnic')}
                                            id="outlined-basic"
                                            label="CNIC"
                                            variant="outlined"
                                            type="number"
                                            fullWidth
                                            error={!!errors?.cnic}
                                            helperText={errors.cnic?.message}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            {...register('postalAddress')}
                                            id="outlined-basic"
                                            label="Postal Address"
                                            variant="outlined"
                                            type="number"
                                            fullWidth
                                            error={!!errors?.postalAddress}
                                            helperText={errors.postalAddress?.message}
                                        />
                                    </Grid>

                                </Grid>
                            </CardContent>
                            <CardContent>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <TextField
                                            {...register('permanentAddress')}
                                            id="outlined-basic"
                                            label="Permanent Address"
                                            variant="outlined"
                                            type="number"
                                            fullWidth
                                            error={!!errors?.permanentAddress}
                                            helperText={errors.permanentAddress?.message}
                                        />
                                    </Grid>

                                    <Grid item xs={6}>
                                        <TextField
                                            {...register('dateOfBirth')}
                                            id="outlined-basic"
                                            variant="outlined"
                                            type="date"
                                            fullWidth
                                            error={!!errors?.dateOfBirth}
                                            helperText={errors.dateOfBirth?.message}
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
                                        Next
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
                        <form onSubmit={accountHandleSubmit(handleAccountDetailsSubmit)}>
                            <CardContent>
                                <div style={{ display: 'flex' }}>
                                    <TextField
                                        {...register('bankName')}
                                        id="outlined-basic"
                                        label="Bank Name"
                                        variant="outlined"
                                        sx={{ marginRight: '8px', flex: 1 }}
                                        error={!!errors?.bankName}
                                        helperText={errors.bankName?.message}
                                    />
                                    <TextField
                                        {...register('accountNumber')}
                                        type="number"
                                        id="outlined-basic"
                                        label="Account Number"
                                        variant="outlined"
                                        autoComplete="off"
                                        sx={{ flex: 1 }}
                                        error={!!errors?.accountNumber}
                                        helperText={errors.accountNumber?.message}
                                    />
                                </div>
                            </CardContent>

                            <CardContent>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <TextField
                                            {...register('accountTitle')}
                                            id="outlined-basic"
                                            label="Account Title"
                                            variant="outlined"
                                            fullWidth
                                            error={!!errors?.accountTitle}
                                            helperText={errors.accountTitle?.message}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            {...register('branchCode')}
                                            id="outlined-basic"
                                            label="Branch Code"
                                            variant="outlined"
                                            type="number"
                                            fullWidth
                                            error={!!errors?.branchCode}
                                            helperText={errors.branchCode?.message}
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>

                            <CardContent>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <TextField
                                            {...register('branchName')}
                                            id="outlined-basic"
                                            label="Branch Name"
                                            variant="outlined"
                                            type="text"
                                            fullWidth
                                            error={!!errors?.branchName}
                                            helperText={errors.branchName?.message}
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
                                        Submit
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

export default Create;
