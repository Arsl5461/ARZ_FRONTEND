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
    Stack,
    CircularProgress,
    Breadcrumbs,
} from '@mui/material';
import '../../utils/cssStyles';
import api from '../../config/axios-instance';
import Iconify from '../../components/iconify';
import { ENV } from '../../config/config';

/**
 * View log Component.
 *
 * All rights Reserved | Arhamsoft Pvt @2023
 *
 * @returns {JSX.Element} - JSX representation of the component.
 */
const Edit = () => {

    // Initialization and state management
    const { id } = useParams();
    const navigate = useNavigate();
    const [log, setLog] = useState(null);
    const [loader, setLoader] = useState(true);
    const token = JSON.parse(localStorage.getItem('token'));

    /**
     *
     * This function makes an API request to retrieve log.
     * Author: Ali Haider
     * Date: 28 september, 2023
     */
    const fetchLog = useCallback(async () => {
        setLoader(true);
        try {
            const response = await api.get(`${ENV.appBaseUrl}/notification/${id}`);
            if (response?.data?.success) {
                setLog(response?.data?.notification);
                setLoader(false);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message);
            setLoader(false);
        }
    }, [setLog, id]);

    useEffect(() => {
        // Initial data fetch
        fetchLog();
    }, [id]);

    /**
     * Renders a Material-UI CircularProgress spinner when the loader is active.
     *
     * @returns {JSX.Element} CircularProgress spinner if loader is active, otherwise null.
     *
     * Author: Ali Haider
     * Date: 28 Sep, 2023
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
                <Link to="/dashboard/logs">
                    <Button className="back_btn" variant="contained">
                        <Iconify icon="bi:arrow-left" />
                    </Button>
                </Link>
                Logs
                <div className="mt-10">
                    <Breadcrumbs aria-label="breadcrumb">
                        <Link to="/dashboard" underline="hover" className="domain_bread">
                            Dashboard
                        </Link>
                        <Link to="/dashboard/logs" underline="hover" className="domain_bread">
                            Logs
                        </Link>
                        <Typography color="text.primary">View</Typography>
                    </Breadcrumbs>
                </div>
            </Typography>
            <form>
                <Card sx={{ p: 2 }}>
                    <CardContent>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                            <FormControl sx={{ minWidth: 0, flex: 1, marginRight: '16px' }}>
                                <CardContent>
                                    <div style={{ display: 'flex' }}>
                                        <TextField
                                            value={log?.action || ''}
                                            InputProps={{
                                                readOnly: true,
                                                style: { color: '#a9a9a9' },
                                            }}
                                            id="outlined-basic"
                                            label="Action Performed"
                                            variant="outlined"
                                            sx={{ marginRight: '8px', flex: 1 }}
                                        />
                                        <TextField
                                            value={log?.domain || ''}
                                            InputProps={{
                                                readOnly: true,
                                                style: { color: '#a9a9a9' },
                                            }}
                                            id="outlined-basic"
                                            label="Domain Name"
                                            variant="outlined"
                                            sx={{ flex: 1 }}
                                        />
                                    </div>
                                </CardContent>
                                <CardContent>
                                    <div style={{ display: 'flex' }}>
                                        <TextField
                                            value={log?.createdBy || ''}
                                            id="outlined-basic"
                                            label="Created By"
                                            InputProps={{
                                                readOnly: true,
                                                style: { color: '#a9a9a9' },
                                            }}
                                            variant="outlined"
                                            sx={{ marginRight: '8px', flex: 1 }}
                                        />
                                        <TextField
                                            value={log?.role || ''}
                                            InputProps={{
                                                readOnly: true,
                                                style: { color: '#a9a9a9' },
                                            }}
                                            id="outlined-basic"
                                            label="Role"
                                            variant="outlined"
                                            sx={{ flex: 1 }}
                                        />
                                    </div>
                                </CardContent>
                                <CardContent>
                                    <div style={{ display: 'flex' }}>
                                        <TextField
                                            value={log?.type || ''}
                                            id="outlined-basic"
                                            InputProps={{
                                                readOnly: true,
                                                style: { color: '#a9a9a9' },
                                            }}
                                            label="Type"
                                            variant="outlined"
                                            sx={{ flex: 1 }}
                                        />
                                    </div>
                                </CardContent>
                                <CardContent>
                                <div style={{ display: 'flex' }}>
                                    <TextField
                                        label="Message"
                                        variant="outlined"
                                        value={log?.message}
                                        InputProps={{
                                            readOnly: true,
                                            style: { color: '#a9a9a9' },
                                        }}
                                        InputLabelProps={{ shrink: true }}
                                        sx={{ flex: 1 }}
                                        multiline
                                        rows={4}
                                        type="text"
                                    />
                                    </div>
                                </CardContent>
                            </FormControl>
                        </div>

                    </CardContent>
                    <div
                        style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', marginRight: '22px' }}
                    >
                        <Stack spacing={2} direction="row">
                            <Button
                                variant="outlined"
                                className="cancel_btn"
                                onClick={() => navigate('/dashboard/logs')}
                            >
                                Back
                            </Button>
                        </Stack>
                    </div>
                </Card>
            </form>
        </div>
    );
};

export default Edit;
