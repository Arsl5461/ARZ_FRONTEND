import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { toast } from 'react-toastify';
import {
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
 * Edit Email template Component.
 *
 * All rights Reserved | Arhamsoft Pvt @2023
 *
 * @returns {JSX.Element} - JSX representation of the component.
 */
const Edit = () => {
    /**
     * Design email template form schema with validations
     * Author: Zain Ashraf
     * Date: 08 sep, 2023
     */
    const schema = yup.object().shape({
        subject: yup.string().required('Subject is Required'),
        type: yup.string().required('Email type is Required'),
        text: yup.string().required('Description is Required'),
        status: yup.boolean(),
    });

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
    });

    // Initialization and state management
    const { id } = useParams();
    const navigate = useNavigate();
    const [types, setTypes] = useState([]);
    const [emailTemplate, setEmailTemplate] = useState([]);
    const [loader, setLoader] = useState(true);
    const token = JSON.parse(localStorage.getItem('token'));

    /**
     * Fetch all email template types from the API
     *
     * Author: Zain Ashraf
     * Date: 08 sep, 2023
     */

    /**
     * Fetch all email template types from the API
     *
     * This function makes an API request to retrieve all email template types.
     * Author: Muhammad Rooman
     * Date: 20 september, 2023
     */
    const fetchEmailTemplateTypes = useCallback(async () => {
        try {
            const response = await api.get(`${ENV.appBaseUrl}/email/types`);
            if (response?.data?.success) {
                setTypes(response?.data?.typesArray);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message);
        }
    }, [setTypes]);

    /**
     * Fetch email template details by ID
     *
     * Author: Zain Ashraf
     * Date: 08 sep, 2023
     */
    const fetchEmailTemplate = useCallback(async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            };
            const response = await api.get(`${ENV.appBaseUrl}/email/${id}`, config);
            if (response?.data?.success) {
                setEmailTemplate(response?.data?.template);
                setValue('type', response?.data?.template?.type);
                setValue('text', response?.data?.template?.text);
                setValue('subject', response?.data?.template?.subject);
                setValue('status', response?.data?.template?.status);
                setLoader(false);
            }
        } catch (error) {
            setLoader(false);
            toast.error(error?.response?.data?.message);
        }
    }, [token, setEmailTemplate, setValue, setLoader, id]);

    useEffect(() => {
        // Initial data fetch
        fetchEmailTemplateTypes();
        fetchEmailTemplate();
    }, [fetchEmailTemplateTypes, fetchEmailTemplate]);

    /**
     * On form submit call edit email template api and pass from @data in body
     *
     * @param {Object} props - Component props.
     * @return {void}
     *
     * Author: Zain Ashraf
     * Date: 08 sep, 2023
     */
    const handleFormSubmit = async (data) => {
        setLoader(true);
        try {
            const headers = {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            };

            const response = await api.put(`${ENV.appBaseUrl}/email/${id}`, data, { headers });
            if (response?.data?.success) {
                setLoader(false);
                navigate('/dashboard/email-templates');
                toast.success(response?.data?.message);
            } else {
                setLoader(false);
                toast.error(response?.data?.message);
            }
        } catch (error) {
            setLoader(false);
            toast.error(error?.response?.data?.message);
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
     */
    const handleEmailTypeChange = (event) => {
        const selectedType = event.target.value;
        setValue('type', selectedType);
        setEmailTemplate({ ...emailTemplate, type: selectedType });
    };

    /**
     * Handle Email template status Change
     *
     * @return {void}
     *
     * Author: Zain Ashraf
     * Date: 08 Sep, 2023
     */
    const handleStatusChange = () => {
        const updatedStatus = !emailTemplate.status;
        setValue('status', updatedStatus);
        setEmailTemplate({ ...emailTemplate, status: updatedStatus });
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
        <div>
            <Typography variant="h4" gutterBottom>
                <Link to="/dashboard/email-templates">
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
                        <Typography color="text.primary">Update</Typography>
                    </Breadcrumbs>
                </div>
            </Typography>
            <form onSubmit={handleSubmit(handleFormSubmit)}>
                <Card sx={{ p: 2 }}>
                    <CardContent>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                            <FormControl sx={{ minWidth: 0, flex: 1, marginRight: '16px' }}>
                                <InputLabel id="demo-simple-select-label">Select Type</InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    label="Select Type"
                                    value={emailTemplate?.type}
                                    onChange={handleEmailTypeChange}
                                >
                                    {types?.map((type, index) => (
                                        <MenuItem key={index} value={type}>
                                            {type}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <span style={{ color: 'red' }}>{errors.type?.message}</span>
                            </FormControl>
                            <FormControl sx={{ minWidth: 0, flex: 1, marginRight: '16px' }}>
                                <TextField
                                    label="Subject"
                                    variant="outlined"
                                    id="outlined-error-helper-text"
                                    InputLabelProps={{ shrink: true }}
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
                            style={{ Headers: '200px' }}
                            editor={ClassicEditor}
                            data={emailTemplate?.text || ''}
                            content={emailTemplate?.text || ''}
                            onChange={(event, editor) => {
                                const data = editor.getData();
                                setValue('text', data);
                            }}
                        />
                        <span style={{ color: 'red' }}>{errors.text?.message}</span>
                        <br />
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Typography>Status</Typography>
                            <Switch checked={emailTemplate?.status} onChange={handleStatusChange} />
                        </div>
                    </CardContent>
                    <div
                        style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', marginRight: '22px' }}
                    >
                        <Stack spacing={2} direction="row">
                            <Button
                                variant="outlined"
                                className="cancel_btn"
                                onClick={() => navigate('/dashboard/email-templates')}
                            >
                                Cancel
                            </Button>
                            <Button variant="contained" type="submit" color="primary">
                                Update
                            </Button>
                        </Stack>
                    </div>
                </Card>
            </form>
        </div>
    );
};

export default Edit;
