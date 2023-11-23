import { Helmet } from 'react-helmet-async';
import DataTable from 'react-data-table-component';
import { useEffect, useMemo, useState } from 'react';
// @mui
import { Card, Stack, Button, Container, Typography, Modal, Box } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import { toast } from 'react-toastify';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { mkConfig, generateCsv, download } from 'export-to-csv';
// components
import { format } from 'date-fns';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { ENV } from '../../config/config';
import api from '../../config/axios-instance';
import { checkPermission } from '../../utils/Permissions';
import FilterComponent from '../../utils/FilterComponent';
import Iconify from '../../components/iconify';
import Columns from './Columns';

// ----------------------------------------------------------------------

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

/**
 * Domain List Component.
 *
 * All rights Reseverd | Arhamsoft Pvt @2023
 *
 * @returns {JSX.Element} - JSX representation of the component.
 */
export default function List() {
    // Initialization and state management
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const domainExpired = queryParams.get('domainExpired');
    const navigate = useNavigate();
    const dayStart = new Date();
    dayStart.setUTCHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setUTCHours(23, 59, 59);
    const token = JSON.parse(localStorage.getItem('token'));
    const [csv, setCsv] = useState(null);
    const [csvToExportName, setCsvToExportName] = useState(`export_${format(new Date(), 'yyyy-MM-dd')}`);
    const [delId, setDelId] = useState('');
    const [open, setOpen] = useState(false);
    const [domains, setDomains] = useState([]);
    const [loader, setLoader] = useState(true);
    const [csvFile, setCsvFile] = useState('');
    const [filterText, setFilterText] = useState('');
    const [startDate, setStartDate] = useState(dayStart);
    const [endDate, setEndDate] = useState(todayEnd);
    const [filteredDomain, setFilteredDomain] = useState([]);
    const [uploadCsvLoader, setUploadCsvLoader] = useState(false);
    const [resetPaginationToggle, setResetPaginationToggle] = useState(false);

    const csvConfig = mkConfig({ useKeysAsHeaders: true, filename: csvToExportName });

    /**
     * Handle model
     *
     * Author: Ali Haider
     * Date: 07 Sep, 2023
     */
    const handleOpen = () => {
        setOpen(true);
        setCsvFile('');
    };
    const handleClose = () => setOpen(false);

    /**
     * Filtering logic for search in data table
     *
     * Author: Ali Haider
     * Date: 07 Sep, 2023
     */
    const filteredItems = domains?.filter((item) => {
        const filterTextLowerCase = filterText.toLowerCase();

        return (
            (item?.domain && item?.domain.toLowerCase().includes(filterTextLowerCase)) ||
            (item?.health && item?.health.toLowerCase().includes(filterTextLowerCase)) ||
            (item?.domainExpired && item?.domainExpired.toLowerCase().includes(filterTextLowerCase)) ||
            (item?.domainExpiryDays && item?.domainExpiryDays.includes(filterTextLowerCase)) ||
            (item?.domainExpiryDate && item?.domainExpiryDate.includes(filterTextLowerCase)) ||
            (filterTextLowerCase === 'mailgun' && item?.isUsingMailGun)
        );
    });

    /**
     * Fetch domain data from the API
     *
     * Author: Ali Haider
     * Date: 07 Sep, 2023
     */
    async function fetchDomain() {
        setLoader(true);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            };
            let apiUrl = `${ENV.appBaseUrl}/domain`;

            if (domainExpired === 'true') {
                apiUrl += '?domainExpired=true';
            }
            const response = await api.get(apiUrl, config);
            if (response?.data?.success) {
                setDomains(response?.data?.domains);
                setFilteredDomain(response?.data?.domains);
                setLoader(false);
            } else {
                console.error(response?.data?.message);
                setLoader(false);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message);
            setLoader(false);
        }
    }

    useEffect(() => {
        // Initial data fetch
        fetchDomain();
    }, []);

    const handleEdit = (row) => {
        navigate(`/dashboard/domains/edit/${row?._id}`);
    };

    const handleDelete = (row) => {
        handleOpen();
        setDelId(row?._id);
    };

    useEffect(() => {
        if (domains?.length > 0) {
            const csvConfig = mkConfig({ useKeysAsHeaders: true });
            const newCsv = generateCsv(csvConfig)(domains);
            setCsv(newCsv);
        }
    }, [domains]);

    /**
     * Define columns for the DataTable and pass
     *
     * @param {Function}
     *
     * DataTable and Filter
     * Author: Ali Haider
     * Date: 07 Sep, 2023
     */
    const columns = useMemo(() => Columns({ handleEdit, handleDelete }), []);

    // Memoize the subHeaderComponent for performance
    const subHeaderComponentMemo = useMemo(() => {
        const handleClear = () => {
            if (filterText) {
                setResetPaginationToggle(!resetPaginationToggle);
                setFilterText('');
            }
        };
        return (
            <FilterComponent
                onFilter={(e) => setFilterText(e.target.value)}
                onClear={handleClear}
                filterText={filterText}
            />
        );
    }, [filterText, resetPaginationToggle]);

    /**
     * Handle filtered domains data with date range
     *
     * Author: Ali Haider
     * Date: 21 Sep, 2023
     */
    const handleDateSelect = () => {
        if (startDate > endDate) {
            toast.error('Start Date Must be Less Than or Equal to End Date');
            return;
        }
        const endDateRange = new Date(endDate);
        endDateRange.setDate(endDate.getDate() - 1);
        if (startDate.toDateString() === endDateRange.toDateString()) {
            setCsvToExportName(`export_${format(startDate, 'yyyy-MM-dd')}`);
        } else {
            setCsvToExportName(`export_${format(startDate, 'yyyy-MM-dd')}_to_${format(endDateRange, 'yyyy-MM-dd')}`);
        }
        setLoader(true);
        const filteredData = filteredDomain.filter((website) => {
            const filteredData = new Date(website.createdAt);
            return filteredData >= startDate && filteredData <= endDate;
        });
        setDomains(filteredData);
        setLoader(false);
    };

    /**
     * Handle CSV File Change
     *
     * @param {Event}  event - The event object to be handled.
     * @return { void }
     *
     * Author: Ali Haider
     * Date: 21 Sep, 2023
     */
    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            // Check if the selected file has a CSV file type
            if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
                setCsvFile(selectedFile);
            } else {
                toast.error('Please Select a Valid CSV File.');
            }
        }
    };

    /**
     * Upload CSV form submission
     *
     * @param {object} data - CSV data from the form.
     * @return {void}
     *
     * Author: Ali Haider
     * Date: 21 Sep, 2023
     */
    const handleCsvSubmit = async (event) => {
        event.preventDefault();
        setUploadCsvLoader(true);
        setLoader(true);
        try {
            const formData = new FormData();
            if (csvFile) {
                formData.append('file', csvFile);
            }
            const headers = {
                Authorization: `Bearer ${token}`,
                'content-type': 'multipart/form-data',
            };
            const response = await api.post(`${ENV.appBaseUrl}/domain/upload-csv`, formData, { headers });
            if (response?.data?.success) {
                setOpen(false);
                setCsvFile();
                setUploadCsvLoader(false);
                toast.success(response?.data?.message);
                // Add a setTimeout before calling fetchDomain
                setTimeout(() => {
                    fetchDomain();
                }, 2000);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message);
            setOpen(false);
            setCsvFile();
            setUploadCsvLoader(false);
            setLoader(false);
        }
    };
    /**
     * Handle Delete domain
     *
     * Author: Ali Haider
     * Date: 07 Sep, 2023
     */
    async function deleteDomain() {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            };
            const response = await api.delete(`${ENV.appBaseUrl}/domain/${delId}`, config);
            if (response?.data?.success) {
                toast.success(response?.data?.message);
                fetchDomain();
            } else {
                toast.error(response?.data?.message);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message);
        }
    }

    /**
     * Clear the date range filter and reset it to today's date.
     *
     * @return {void}
     *
     * Author: Ali Haider
     * Date: 25 Sep, 2023
     */
    const clearDateRangeFilter = () => {
        const todayStart = new Date();
        todayStart.setUTCHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setUTCHours(23, 59, 59);
        setStartDate(todayStart);
        setEndDate(todayEnd);
        setCsvToExportName(`export_${format(new Date(), 'yyyy-MM-dd')}`);
        fetchDomain();
    };

    /**
     * Handle exportCSV to Export filtered data, based on the search criteria
     *
     * @return {void}
     *
     * Author: Muhammad Rooman
     * Date: 25 October, 2023
     */
    const exportCSV = () => {
        //  download(csvConfig)(csv)  If you want to export without any search criteria.
        if (filterText.toLowerCase()) {
            // Export filtered data based on the search criteria
            const filteredCsvConfig = mkConfig({
                useKeysAsHeaders: true,
                filename: csvToExportName,
            });
            download(filteredCsvConfig)(generateCsv(filteredCsvConfig)(filteredItems));
        } else {
            // Export all data
            download(csvConfig)(generateCsv(csvConfig)(filteredItems));
        }
    };

    /**
     * Renders a Material-UI CircularProgress spinner when the loader is active.
     *
     * @returns {JSX.Element} CircularProgress spinner if loader is active, otherwise null.
     *
     * Author: Muhammad Rooman
     * Date: 25 October, 2023
     */
    if (loader) {
        return (
            <div className="spinner-wrapper">
                <CircularProgress value={100} />
            </div>
        );
    }
    return (
        <>
            <Helmet>
                <title> Domains </title>
            </Helmet>
            <Container className="dashboard_width">
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
                    <Typography variant="h4" gutterBottom>
                        <Link to="/dashboard">
                            <Button className="back_btn" variant="contained">
                                <Iconify icon="bi:arrow-left" />
                            </Button>
                        </Link>
                        Domains
                        <div className="mt-10">
                            <Breadcrumbs aria-label="breadcrumb">
                                <Link to="/dashboard" className="domain_bread">
                                    Dashboard
                                </Link>
                                <Typography color="text.primary">Domains</Typography>
                            </Breadcrumbs>
                        </div>
                    </Typography>
                    <div className="domain_btn_wrap">
                        <input
                            className="mr-4"
                            type="date"
                            value={startDate.toISOString().split('T')[0]}
                            max={new Date().toISOString().split('T')[0]}
                            onChange={(e) => {
                                const selectedDate = new Date(e.target.value);
                                selectedDate.setUTCHours(0, 0, 0, 0);
                                setStartDate(selectedDate);
                            }}
                        />
                        <input
                            className="mr-4"
                            type="date"
                            value={endDate.toISOString().split('T')[0]}
                            max={new Date().toISOString().split('T')[0]}
                            onChange={(e) => {
                                const selectedDate = new Date(e.target.value);
                                selectedDate.setUTCHours(23, 59, 59);
                                setEndDate(selectedDate);
                            }}
                        />
                        <Button className="mr-4" color="primary" variant="contained" onClick={handleDateSelect}>
                            Apply
                        </Button>
                        <Button className="mr-4 cancel_btn" variant="contained" onClick={clearDateRangeFilter}>
                            Clear
                        </Button>
                        <Button
                            className="mr-4"
                            variant="contained"
                            disabled={!filteredItems?.length}
                            onClick={exportCSV}
                            startIcon={<Iconify icon="bi:file-earmark-arrow-down" />}
                        >
                            Export To CSV
                        </Button>
                        {checkPermission('Create-Domain') ? (
                            <>
                                {' '}
                                <Button
                                    className="mr-4"
                                    variant="contained"
                                    startIcon={<CloudUploadIcon />}
                                    onClick={handleOpen}
                                >
                                    Bulk Import
                                </Button>
                                <Button
                                    onClick={() => navigate('/dashboard/domains/create')}
                                    variant="contained"
                                    startIcon={<Iconify icon="eva:plus-fill" />}
                                >
                                    Add
                                </Button>
                            </>
                        ) : (
                            ''
                        )}
                    </div>
                </Stack>
                <Card>
                    <div className="monitor_dtb_wraper">
                        {checkPermission('List-Domains') ? (
                            <DataTable
                                columns={columns}
                                data={filteredItems}
                                pagination
                                paginationResetDefaultPage={resetPaginationToggle} // optionally, a hook to reset pagination to page 1
                                subHeader
                                subHeaderComponent={subHeaderComponentMemo}
                                persistTableHead
                            />
                        ) : (
                            <div>
                                {/* Content to display when the user doesn't have permission */}
                                <p>You don't have permission to view this content.</p>
                            </div>
                        )}
                    </div>
                </Card>
                <div>
                    <Modal
                        open={open}
                        onClose={handleClose}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                    >
                        <Box sx={style}>
                            <Typography id="modal-modal-title" variant="h6" component="h2">
                                Are you sure to delete this website?
                            </Typography>
                            <Button onClick={handleClose} sx={{ mt: 3, mr: 2 }}>
                                No
                            </Button>
                            <Button
                                onClick={() => {
                                    deleteDomain();
                                    handleClose(); // Close the modal after deletion
                                }}
                                variant="contained"
                                color="error"
                                sx={{ mt: 3 }}
                            >
                                Yes, Delete
                            </Button>
                        </Box>
                    </Modal>
                </div>
                <div>
                    <Modal
                        open={open}
                        onClose={handleClose}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                    >
                        <form onSubmit={(event) => handleCsvSubmit(event)}>
                            <Box sx={style}>
                                <a
                                    href={`${ENV.appClientUrl}assets/sample/sample.csv`}
                                    className="mb-10"
                                    download="sample.csv"
                                >
                                    Click here to Download Sample CSV file
                                </a>
                                <Button
                                    className="my-10"
                                    component="label"
                                    variant="contained"
                                    startIcon={<CloudUploadIcon />}
                                >
                                    Import CSV
                                    <VisuallyHiddenInput
                                        type="file"
                                        name="csv"
                                        accept="application/csv, text/csv"
                                        onChange={handleFileChange}
                                    />
                                </Button>
                                {csvFile && <Typography>Selected CSV: {csvFile?.name}</Typography>}
                                <br />

                                <Button type="submit" disabled={!csvFile} variant="contained" className="fl-end">
                                    Submit
                                </Button>
                                <br />
                                {uploadCsvLoader && <CircularProgress value={100} size={30} />}
                            </Box>
                        </form>
                    </Modal>
                </div>
            </Container>
        </>
    );
}
