import React, { useEffect, useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    CardContent,
    Card,
    FormControl,
    TextField,
    Typography,
    Button,
    MenuItem,
    InputLabel,
    Select,
    Switch,
    Stack,
    CircularProgress,
    Breadcrumbs,
} from '@mui/material';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import '../../utils/cssStyles';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import api from '../../config/axios-instance';
import Iconify from '../../components/iconify';
import { ENV } from '../../config/config';

/**
 * Create Email Template Component.
 *
 * All rights Reseverd | Arhamsoft Pvt @2023
 *
 * @returns {JSX.Element} - JSX representation of the component.
 */
const Create = () => {
    /**
     * Design create Email Template form schema with validations
     *
     * Author: Zain Ashraf
     * Date: 08 sep, 2023
     */
    const schema = yup.object().shape({
        subject: yup.string().required('Subject is Required'),
        type: yup.string().required('Email type is Required'),
        text: yup.string().required('Description is Required'),
        status: yup.boolean().default(true),
    });

    // Initialization and state management
    const navigate = useNavigate();
    const [types, setTypes] = useState([]);
    const [description, setDescription] = useState([]);
    const [loader, setLoader] = useState(false);
    const token = JSON.parse(localStorage.getItem('token'));

    /**
     * Fetch all email template types from the API
     *
     * Author: Zain Ashraf
     * Date: 08 sep, 2023
     *
     */

    /**
     * Fetch email template types from the API.
     *
     * Changed function name.This function makes an API request to retrieve all email template types.
     * Used useCallback to memoize the function to improve performance by preventing unnecessary re-rendering of the component.
     *
     * Author: Muhammad Rooman
     * Date: September 20, 2023
     */
    const fetchEmailTemplateType = useCallback(async () => {
        try {
            const response = await api.get(`${ENV.appBaseUrl}/email/types`);
            if (response?.data?.success) {
                setTypes(response?.data?.typesArray);
            } else {
                toast.error(response?.data?.message);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message);
        }
    }, []);

    useEffect(() => {
        // Call the fetchEmailTemplateType function to fetch data
        fetchEmailTemplateType();
    }, [fetchEmailTemplateType]);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm({ resolver: yupResolver(schema) });

    /**
     * Email template creation on form submission
     *
     * @param {object} data - The email template data from the form.
     * @return {void}
     *
     * Author: Zain Ashraf
     * Date: 08 Sep, 2023
     *
     */
    const handleFormSubmit = async (data) => {
        setLoader(true);
        try {
            const headers = {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            };
            const response = await api.post(`${ENV.appBaseUrl}/email`, data, { headers });
            if (response?.data?.success) {
                navigate('/dashboard/email-templates');
                setLoader(false);
                toast.success(response?.data?.message);
            } else {
                setLoader(false);
                toast.error(response?.data?.message);
            }
        } catch (error) {
            setLoader(false);
            toast.error(error.response?.data?.message);
        }
    };

    /**
     * Handle Email template type Change
     *
     * @param {Event}  event - The event object to be handled.
     * @return { void }
     *
     * Author: Zain Ashraf
     * Date: 08 sep, 2023
     *
     */

    const handleEmailTypeChange = (event) => {
        setValue('type', event.target.value);
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
            <Typography variant="h4" gutterBottom>
                <Link to="/dashboard">
                    <Button className="back_btn" variant="contained">
                        <Iconify icon="bi:arrow-left" />
                    </Button>
                </Link>
                Email Templates
                <div className="mt-10">
                    <Breadcrumbs aria-label="breadcrumb">
                        <Link to="/dashboard" underline="hover" className="domain_bread">
                            Dashboard
                        </Link>
                        <Link to="/dashboard/email-templates" underline="hover" className="domain_bread">
                            Email Templates
                        </Link>
                        <Typography color="text.primary">Add</Typography>
                    </Breadcrumbs>
                </div>
            </Typography>
            <form onSubmit={handleSubmit(handleFormSubmit)}>
                <Card sx={{ p: 2 }}>
                    <CardContent>
                        <div style={{ display: 'flex', marginBottom: '16px' }}>
                            <FormControl
                                sx={{ minWidth: 0, flex: 1, marginRight: '16px' }}
                                variant="outlined"
                                fullWidth
                                error={!!errors?.type}
                            >
                                <InputLabel id="demo-simple-select-label">Select Type</InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    label="Select Type"
                                    onChange={handleEmailTypeChange}
                                >
                                    {types?.map((type, index) => (
                                        <MenuItem key={index} value={type}>
                                            {type}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors?.type && (
                                    <Typography variant="caption" color="error">
                                        {' '}
                                        {errors?.type?.message}{' '}
                                    </Typography>
                                )}
                            </FormControl>
                            <FormControl sx={{ minWidth: 0, flex: 1, marginRight: '16px' }}>
                                <TextField
                                    id="outlined-basic"
                                    label="Subject"
                                    variant="outlined"
                                    sx={{ flex: 1 }}
                                    {...register('subject')}
                                    type="text"
                                    error={!!errors.subject}
                                    helperText={errors.subject?.message}
                                />
                            </FormControl>
                        </div>

                        <br />
                        <Typography variant="h6" gutterBottom>
                            Description
                        </Typography>

                        <CKEditor
                            className="ckeditor"
                            style={{ Headers: '200px', height: '500px' }}
                            editor={ClassicEditor}
                            data={description || ''}
                            onChange={(event, editor) => {
                                const data = editor.getData();
                                setValue('text', data);
                                setDescription(data)
                            }}
                        />
                        <span style={{ color: 'red' }}>{errors.text?.message}</span>
                        <br />
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Typography>Status</Typography>
                            <Switch {...register('status')} defaultChecked="true" />
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
                            <Button className="cancel_btn" variant="outlined" onClick={() => navigate('/dashboard/email-templates')}>
                                Cancel
                            </Button>
                            <Button variant="contained" type="submit" color="primary">
                                Add
                            </Button>
                        </Stack>
                    </div>
                </Card>
            </form>
        </div>
    );
};

export default Create;
