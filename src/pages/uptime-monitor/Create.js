import React, { useState } from 'react';
import {
    FormControl,
    Typography,
    Button,
    Breadcrumbs,
    InputLabel,
    Stack,
    CardContent,
    Card,
    Grid,
    MenuItem,
    Select,
    CircularProgress,
} from '@mui/material';

import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';
import Iconify from '../../components/iconify';
import Ping from './fields/Ping';
/**
 * Create Uptime Monitor Component
 *
 * All rights | ArhamSoft Pvt @2023
 *
 * @returns {JSX.Element} -JSX representation of the component.
 *
 */

const Create = () => {
    // Initialization and state management
    const navigate = useNavigate();
    const [pingVisible, setPingVisible] = useState(false);
    const [loader, setLoader] = useState(false);

    /**
     * Event handler for dropdown menu
     * Show the appropriate input fields based on the selected type
     * @param {Event}  event - The event object to be handled.
     * @return { void }
     *
     * Author: Muhammad Rooman
     * Date: September 19, 2023
     */
    const handleTypeChange = (event) => {
        const selectedValue = event.target.value;
        setPingVisible(selectedValue === 'Ping');
    };

    /**
     * Renders a Material-UI CircularProgress spinner when the loader is active.
     *
     * @returns {JSX.Element} CircularProgress spinner if loader is active, otherwise null.
     *
     * Author: Muhammad Rooman
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
        <div className='padding_px'>
            <Grid container spacing={2}>
                <Grid item xs={12} md={12}>
                    <Typography variant="h4" gutterBottom>
                        <Button onClick={() => navigate('/dashboard')} className="back_btn" variant="contained">
                            <Iconify icon="bi:arrow-left" />
                        </Button>
                        Uptime Monitor
                        <div className="mt-10">
                            <Breadcrumbs aria-label="breadcrumb">
                                <Link className="domain_bread" to={'/dashboard'}>
                                    Dashboard
                                </Link>
                                <Link
                                    underline="hover"
                                    href="/material-ui/getting-started/installation/"
                                    className="domain_bread"
                                    to={'/dashboard/uptime-monitor'}
                                >
                                    Uptime Monitor
                                </Link>
                                <Typography color="text.primary"> Add </Typography>
                            </Breadcrumbs>
                        </div>
                    </Typography>
                    <Card sx={{ p: 2 }}>
                        <CardContent>
                            <div style={{ display: 'flex', marginBottom: '16px' }}>
                                <FormControl
                                    sx={{ minWidth: 0, flex: 1, marginRight: '16px' }}
                                    variant="outlined"
                                    fullWidth
                                >
                                    <InputLabel id="demo-simple-select-label">Please Select</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        label="Choose Type"
                                        onChange={handleTypeChange}
                                    >
                                        <MenuItem value="Please Select">Please Select</MenuItem>
                                        <MenuItem value="Ping">Ping</MenuItem>
                                    </Select>
                                </FormControl>
                            </div>
                        </CardContent>
                        {pingVisible === false ? (
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    marginTop: '16px',
                                    marginRight: '40px',
                                }}
                            >
                                <Stack spacing={2} direction="row">
                                    <Button
                                        variant="outlined"
                                        className="cancel_btn"
                                        onClick={() => navigate('/dashboard/uptime-monitor')}
                                    >
                                        Cancel
                                    </Button>
                                </Stack>
                            </div>
                        ) : (
                            ''
                        )}

                        {/* Handle Ping Form */}
                        {pingVisible && <Ping setLoader={setLoader} />}
                    </Card>
                </Grid>
            </Grid>
        </div>
    );
};

export default Create;
