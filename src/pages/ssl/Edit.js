import React, { useCallback, useEffect, useState } from 'react';
import {
    Button,
    Card,
    CardContent,
    Grid,
    Stack,
    TextField,
    styled,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Tooltip,
    CircularProgress,
    Typography,
    Breadcrumbs,
} from '@mui/material';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { WithContext as ReactTags } from 'react-tag-input';
import { toast } from 'react-toastify';
import api from '../../config/axios-instance';
import Iconify from '../../components/iconify';
import { ENV } from '../../config/config';

const ReactTagsContainer = styled('div')({
    marginRight: (theme) => theme.spacing(2),
    width: '100%',
});

/**
 * Edit Website Ssl data Component.
 *
 * All rights Reserved | Arhamsoft Pvt @2023
 *
 * @returns {JSX.Element} - JSX representation of the component.
 */
function Edit() {
    // Initialization and state management
    const { id } = useParams();
    const navigate = useNavigate();
    const token = JSON.parse(localStorage.getItem('token'));
    const [sslData, setSslData] = useState();
    const [tags, setTags] = useState([]);
    const [phoneTag, setPhoneTag] = useState([]);
    const [showCertificate, setShowCertificate] = useState(false);
    const [notificationType, setNotificationType] = useState({});
    const [loader, setLoader] = useState(true);
    const [schedule] = useState([
        'One Day Before Expiry',
        'Three Days Before Expiry',
        'Seven Days Before Expiry',
        'Fourteen Days Before Expiry',
        'Twenty One Days Before Expiry',
        'Thirty Days Before Expiry',
    ]);

    /**
     * Fetch Notification Types data from the API
     *
     * Author: Zain Ashraf
     * Date: 12 sep, 2023
     */
    const fetchNotificationTypes = useCallback(async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            };
            const response = await api.get(`${ENV.appBaseUrl}/domain/types`, config);
            if (response?.data?.success) {
                setNotificationType(response?.data?.typesArray);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message);
        }
    }, [token, setNotificationType]);

    /**
  * Fetch SSL certificate data for a website from the API and prepare the data for rendering.
  *
  * Author: Zain Ashraf
  * Date: 11 Sep, 2023
  *
  * This function sends a GET request to the API to retrieve SSL certificate data for a website based on the provided ID.
  * It then processes the response data, extracts email and phone arrays, and maps time intervals to their corresponding labels.
  * The prepared data is set in the component's state for rendering, and the loader is cleared upon completion.
  *
  * @throws {Error} If there is an error during the API request, it logs the error and displays a toast notification.
  */
    const fetchWebsiteSslData = useCallback(async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            };
            const response = await api.get(`${ENV.appBaseUrl}/ssl/${id}`, config);
            if (response?.data?.success) {
                const emailArray = response?.data?.ssl?.email || [];
                const phoneArray = response?.data?.ssl?.phone || [];

                 // Prepare tags arrays for email and phone
                const emailTagsArray = emailArray.map((email) => ({ id: email, text: email }));
                const phoneTagsArray = phoneArray.map((phone) => ({ id: phone, text: phone }));

                 // Extract and map time intervals from the API response to label
                const timeIntervals = response?.data?.ssl?.timeInterval || [];
                const scheduleLabels = timeIntervals.map(interval => {
                    switch (interval) {
                        case "1":
                            return "One Day Before Expiry";
                        case "3":
                            return "Three Days Before Expiry";
                        case "7":
                            return "Seven Days Before Expiry";
                        case "14":
                            return "Fourteen Days Before Expiry";
                        case "21":
                            return "Twenty One Days Before Expiry";
                        case "30":
                            return "Thirty Days Before Expiry";
                        default:
                            return null;
                    }
                });
                setTags(emailTagsArray);
                setPhoneTag(phoneTagsArray);
                setSslData({
                    ...response?.data?.ssl,
                    timeInterval: scheduleLabels,
                });
                setLoader(false);
            }
        } catch (error) {
            setLoader(false);
            toast.error(error?.response?.data?.message);
        }
    }, [token, setTags, setPhoneTag, setSslData, id]);

    useEffect(() => {
        // Initial data fetch
        fetchNotificationTypes();
        fetchWebsiteSslData();
    }, [fetchNotificationTypes, fetchWebsiteSslData]);

    /**
     * On form submit call edit ssl api and pass from @data in body
     *
     * @param {Object} props - Component props.
     * @return {void}
     *
     * Author: Zain Ashraf
     * Date: 11 sep, 2023
     */
    const handleFormSubmit = async (event) => {
        event.preventDefault();
        try {
            if (tags.length === 0 && phoneTag.length === 0) {
                toast.error('Please Enter Your Email or Phone Number to Receive Notifications');
            } else {
                setLoader(true);
                const data = {
                    email: tags.map((tag) => tag.text),
                    phone: phoneTag.map((tag) => tag.text),
                    types: sslData?.types,
                    timeInterval: sslData?.timeInterval,
                    notes: sslData?.notes,
                };
                const headers = {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                };

                const response = await api.put(`${ENV.appBaseUrl}/ssl/${id}`, data, { headers });

                if (response?.data?.success) {
                    navigate('/dashboard/ssl');
                    setLoader(false);
                    toast.success(response?.data?.message);
                }
            }
        } catch (error) {
            setLoader(false);
            toast.error(error?.response?.data?.message);
        }
    };

    /**
     * Handle tag additions and passed tags
     *
     * as @param {Array} tag -Array of tags.
     * @return {void}
     *
     * Author: Zain Ashraf
     * Date: 11 sep, 2023
     */
    const handleAddition = (tag) => {
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tag.text)) {
            setTags([...tags, tag]);
        } else {
            toast.error('Enter the Valid Email');
        }
    };

    /**
     * Handle tag deletions and passed phone tags
     *
     * as @param {Array} tag -Array of phone tags.
     * @return {void}
     *
     * Author: Zain Ashraf
     * Date: 11 sep, 2023
     */
    const handleDelete = (i) => {
        const newTags = [...tags];
        newTags.splice(i, 1);
        setTags(newTags);
    };

    /**
     * Handle phone tag additions
     *
     * @param {Array} phoneTags - Phone tag from this form.
     * @return {void}
     *
     * Author: Zain Ashraf
     * Date: 11 Sep, 2023
     */
    const handlePhoneAddition = (tag) => {
        // Regular expression to validate phone numbers (adjust as needed)
        const phoneRegex = /^\d{9,16}$/;

        if (phoneRegex.test(tag.text)) {
            setPhoneTag([...phoneTag, tag]);
        } else {
            toast.error('Enter a Valid Phone Number With 9 to 16 Digits');
        }
    };

    /**
     * Handle phone tag deletions and accept index in param
     *
     * Author: Zain Ashraf
     * Date: 11 Sep, 2023
     */
    const handlePhoneDelete = (i) => {
        const newTags = [...phoneTag];
        newTags.splice(i, 1);
        setPhoneTag(newTags);
    };

    /**
     * Handle SSL Expiry notification type Change
     *
     * @param {Event}  event - The event object to be handled.
     * @return { void }
     *
     * Author: Zain Ashraf
     * Date: 11 sep, 2023
     */
    const handleTypeChange = (event) => {
        const selectedType = event.target.value;
        setSslData({ ...sslData, types: selectedType });
    };

    /**
     * Handle time interval schedule for notification of SSL Expiry
     *
     * @param {Event}  event - The event object to be handled.
     * @return { void }
     *
     * Author: Zain Ashraf
     * Date: 11 sep, 2023
     */
    const handleScheduleChange = (event) => {
        const selectedType = event.target.value;
        setSslData({ ...sslData, timeInterval: selectedType });
    };

    /**
     * Handle description notes Change
     *
     * @param {Event}  event - The event object to be handled.
     * @return { void }
     *
     * Author: Zain Ashraf
     * Date: 11 sep, 2023
     */
    const handleNotesChange = (event) => {
        const selectedType = event.target.value;
        setSslData({ ...sslData, notes: selectedType });
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
        <div >
            <Grid container spacing={2}>
                <Grid item xs={12} md={12}>
                    <Typography variant="h4" gutterBottom>
                        <Link to="/dashboard/ssl">
                            <Button className="back_btn" variant="contained">
                                <Iconify icon="bi:arrow-left" />
                            </Button>
                        </Link>
                        SSL
                        <div className="mt-10">
                            <Breadcrumbs aria-label="breadcrumb">
                                <Link to="/dashboard" underline="hover" className="domain_bread">
                                    Dashboard
                                </Link>
                                <Link to="/dashboard/ssl" underline="hover" className="domain_bread">
                                    SSL
                                </Link>
                                <Typography color="text.primary">Update</Typography>
                            </Breadcrumbs>
                        </div>
                    </Typography>
                    <form onSubmit={(e) => handleFormSubmit(e)}>
                        <Card sx={{ p: 2 }}>
                            <CardContent>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            id="outlined-basic"
                                            label="Domain"
                                            disabled
                                            variant="outlined"
                                            fullWidth
                                            sx={{ marginRight: '8px' }}
                                            type="text"
                                            value={sslData?.domain}
                                            InputLabelProps={{ shrink: true }}
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>
                            <CardContent>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <FormControl sx={{ minWidth: '100%', width: 300 }}>
                                            <InputLabel id="demo-simple-select-label">Choose Notification Types</InputLabel>
                                            <Select
                                                labelId="demo-simple-select-label"
                                                id="demo-simple-select"
                                                label="Choose Notification Types"
                                                fullWidth
                                                multiple
                                                value={sslData?.types || []}
                                                onChange={handleTypeChange}
                                                MenuProps={{
                                                    getContentAnchorEl: null, // Remove the CSS error
                                                    anchorOrigin: {
                                                        vertical: 'bottom',
                                                        horizontal: 'left',
                                                    },
                                                    transformOrigin: {
                                                        vertical: 'top',
                                                        horizontal: 'left',
                                                    },
                                                    PaperProps: {
                                                        style: {
                                                            maxHeight: 200, // Adjust the max height as needed
                                                        },
                                                    },
                                                }}
                                            >
                                                {notificationType?.SSL && Object.entries(notificationType?.SSL).map(([type, value]) => (
                                                    <MenuItem key={value} value={value}>
                                                        {type}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <FormControl sx={{ minWidth: '100%', width: 300 }}>
                                            <InputLabel id="demo-simple-select-label">Schedule</InputLabel>
                                            <Select
                                                labelId="demo-simple-select-label"
                                                id="demo-simple-select"
                                                label="Schedule"
                                                multiple
                                                value={sslData?.timeInterval || []}
                                                onChange={handleScheduleChange}
                                                MenuProps={{
                                                    getContentAnchorEl: null, // Remove the CSS error
                                                    anchorOrigin: {
                                                        vertical: 'bottom',
                                                        horizontal: 'left',
                                                    },
                                                    transformOrigin: {
                                                        vertical: 'top',
                                                        horizontal: 'left',
                                                    },
                                                    PaperProps: {
                                                        style: {
                                                            maxHeight: 200, // Adjust the max height as needed
                                                        },
                                                    },
                                                }}
                                            >
                                                {schedule?.map((type, index) => (
                                                    <MenuItem key={index} value={type}>
                                                        {type}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </CardContent>
                            <CardContent className="profile_wrap">
                                <Grid container spacing={2} className="personal_field">
                                    <Grid item xs={6}>
                                        <Tooltip title="Press Enter Key on Keyboard to Add Email" arrow>
                                            <ReactTagsContainer>
                                                <ReactTags
                                                    tags={tags}
                                                    handleDelete={handleDelete}
                                                    handleAddition={handleAddition}
                                                    allowDragDrop={false}
                                                    placeholder="Emails"
                                                />
                                            </ReactTagsContainer>
                                        </Tooltip>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Tooltip title="Press Enter Key on Keyboard Add Phone Number" arrow>
                                            <ReactTagsContainer>
                                                <ReactTags
                                                    tags={phoneTag}
                                                    handleDelete={handlePhoneDelete}
                                                    handleAddition={handlePhoneAddition}
                                                    allowDragDrop={false}
                                                    placeholder="Phone"
                                                />
                                            </ReactTagsContainer>
                                        </Tooltip>
                                    </Grid>
                                </Grid>
                            </CardContent>
                            <CardContent>
                                <TextField
                                    className="p-0"
                                    id="outlined-basic"
                                    label="Notes"
                                    variant="outlined"
                                    sx={{ marginRight: '8px', flex: 1 }}
                                    InputLabelProps={{ shrink: sslData?.notes && true }}
                                    value={sslData?.notes}
                                    onChange={handleNotesChange}
                                    fullWidth
                                    multiline
                                    rows={4}
                                />
                            </CardContent>
                            <CardContent>
                                <Button onClick={() => setShowCertificate(!showCertificate)}>
                                    {showCertificate ? 'Hide Certificate' : 'Show Certificate'}
                                </Button>
                                {showCertificate && <div className="certificate_ssl">{sslData?.certificate}</div>}
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
                                        onClick={() => navigate('/dashboard/ssl')}
                                        className="cancel_btn"
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
}

export default Edit;
