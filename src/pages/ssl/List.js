import { Helmet } from 'react-helmet-async';
import DataTable from 'react-data-table-component';
import { useCallback, useEffect, useMemo, useState } from 'react';
// @mui
import { Card, Stack, Button, Container, Typography, Modal, Box, CircularProgress } from '@mui/material';
import { toast } from 'react-toastify';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { mkConfig, generateCsv, download } from 'export-to-csv';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
// components
import { format } from 'date-fns';
import { styled } from 'styled-components';
import { formatDate } from '../../utils/formatTime';
import api from '../../config/axios-instance';
import { ENV } from '../../config/config';
import { checkPermission } from '../../utils/Permissions';
import FilterComponent from '../../utils/FilterComponent';
import Iconify from '../../components/iconify';
import Columns from './Columns';

// ----------------------------------------------------------------------

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

/**
 * Website Ssl Data List Component.
 *
 * All rights Reseverd | Arhamsoft Pvt @2023
 *
 * @returns {JSX.Element} - JSX representation of the component.
 */
export default function List() {
    // Initialization and state management
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const sslExpired = queryParams.get('sslExpired');
    const navigate = useNavigate();
    const dayStart = new Date();
    dayStart.setUTCHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setUTCHours(23, 59, 59);
    const [websitesSsls, setWebsitesSsls] = useState([]);
    const [filterText, setFilterText] = useState('');
    const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
    const [open, setOpen] = useState(false);
    const [delId, setDelId] = useState('');
    const token = JSON.parse(localStorage.getItem('token'));
    const [csvToExport, setCsvToExport] = useState(null);
    const [csvToExportName, setCsvToExportName] = useState(`export_${format(new Date(), 'yyyy-MM-dd')}`);
    const [startDate, setStartDate] = useState(dayStart);
    const [endDate, setEndDate] = useState(todayEnd);
    const [filteredWebsites, setFilteredWebsites] = useState([]);
    const [csvFile, setCsvFile] = useState('');
    const [loader, setLoader] = useState(true);
    const [uploadCsvLoader, setUploadCsvLoader] = useState(false);

    const csvConfig = mkConfig({ useKeysAsHeaders: true, filename: csvToExportName });

    /**
     * Handle model
     *
     * Author: Zain Ashraf
     * Date: 11 Sep, 2023
     *
     * Update (26 Sep, 2023): Removed the selected CSV File before opening Modal
     */
    const handleOpen = useCallback(() => {
        setOpen(true);
        setCsvFile('');
    }, [setOpen, setCsvFile]);

    const handleClose = useCallback(() => setOpen(false), [setOpen]);

    /**
     * Filtering logic for search in data table
     *
     * Author: Zain Ashraf
     * Date: 11 Sep, 2023
     */
    const filteredItems = websitesSsls?.filter((item) => {
        const filterTextLowerCase = filterText.toLowerCase();

        return (
            (item.domain && item.domain.toLowerCase().includes(filterTextLowerCase)) ||
            (item.sslIssuer && item.sslIssuer.toLowerCase().includes(filterTextLowerCase)) ||
            (item.sslExpired && item.sslExpired.toLowerCase().includes(filterTextLowerCase)) ||
            (item.sslExpiryDate && item.sslExpiryDate.toLowerCase().includes(filterTextLowerCase)) ||
            (item.sslExpiryDays && item.sslExpiryDays.toLowerCase().includes(filterTextLowerCase))
        );
    });

    /**
     * Fetch website ssl data from the server
     *
     * Author: Zain Ashraf
     * Date: 11 Sep, 2023
     */
    const fetchWebsiteSslData = useCallback(async () => {
        setLoader(true);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            };
            let apiUrl = `${ENV.appBaseUrl}/ssl`;

            if (sslExpired === 'true') {
                apiUrl += '?sslExpired=true';
            }
            const response = await api.get(apiUrl, config);
            if (response?.data?.success) {
                setWebsitesSsls(response?.data?.ssl);
                setFilteredWebsites(response?.data?.ssl);
                setLoader(false);
            } else {
                console.error(response?.data?.message);
                setLoader(false);
            }
        } catch (error) {
            setLoader(false);
            toast.error(error?.response?.data?.message);
        }
    }, [token, setWebsitesSsls]);

    useEffect(() => {
        // Initial data fetch
        fetchWebsiteSslData();
    }, [fetchWebsiteSslData]);

    useEffect(() => {
        if (websitesSsls.length > 0) {
            const modifiedData = websitesSsls.map((item) => {
                const modifiedItem = {
                    ...item,
                    createdAt: formatDate(item?.createdAt),
                };
                delete modifiedItem.certificate;
                delete modifiedItem.updatedAt;
                delete modifiedItem.__v;
                return modifiedItem;
            });

            const csvConfig = mkConfig({ useKeysAsHeaders: true });
            const newCsv = generateCsv(csvConfig)(modifiedData);
            setCsvToExport(newCsv);
        }
    }, [websitesSsls]);

    const handleEdit = useCallback(
        (row) => {
            navigate(`/dashboard/ssl/edit/${row._id}`);
        },
        [navigate]
    );

    const handleDelete = useCallback(
        (row) => {
            handleOpen();
            setDelId(row?._id);
        },
        [handleOpen, setDelId]
    );

    /**
     * Define columns for the DataTable and pass
     *
     * @param {Function}
     *
     * DataTable and Filter
     * Author: Zain Ashraf
     * Date: 11 Sep, 2023
     */
    const columns = useMemo(() => Columns({ handleEdit, handleDelete }), [handleEdit, handleDelete]);

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
     * Handle Delete Website Ssl Data
     *
     * Author: Zain Ashraf
     * Date: 11 Sep, 2023
     */
    async function deleteWebsiteSslData() {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            };
            const response = await api.delete(`${ENV.appBaseUrl}/ssl/${delId}`, config);
            if (response?.data?.success) {
                toast.success(response?.data?.message);
                fetchWebsiteSslData();
            } else {
                toast.error(response?.data?.message);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message);
        }
    }

    /**
     * Refetching website ssl data from the server
     *
     * Author: Zain Ashraf
     * Date: 18 Sep, 2023
     */
    const recheckSslDetails = async () => {
        setLoader(true);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            };
            const response = await api.get(`${ENV.appBaseUrl}/ssl`, config);
            if (response?.data?.success) {
                setLoader(false);
                toast.success(response?.data?.message);
                setWebsitesSsls(response?.data?.ssl);
                setFilterText('');
            } else {
                setLoader(false);
                console.error(response?.data?.message);
            }
        } catch (error) {
            setLoader(false);
            toast.error(error?.response?.data?.message);
        }
    };

    /**
     * Handle filtered websites SSL data with date range
     *
     * Author: Zain Ashraf
     * Date: 18 Sep, 2023
     */
    const applyDateRangeFilter = () => {
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
        const filteredData = filteredWebsites.filter((websiteSsl) => {
            const filteredData = new Date(websiteSsl.createdAt);
            return filteredData >= startDate && filteredData <= endDate;
        });
        setWebsitesSsls(filteredData);
        setLoader(false);
    };

    /**
     * Handle CSV File Change
     *
     * @param {Event}  event - The event object to be handled.
     * @return { void }
     *
     * Author: Zain Ashraf
     * Date: 20 sep, 2023
     */
    const handleCsvFileChange = (event) => {
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
     * Author: Zain Ashraf
     * Date: 20 Sep, 2023
     */
    const handleCsvFileSubmit = async (event) => {
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
            const response = await api.post(`${ENV.appBaseUrl}/ssl/upload-csv`, formData, { headers });
            if (response?.data?.success) {
                setUploadCsvLoader(false);
                setCsvFile('');
                setOpen(false);
                toast.success(response?.data?.message);
                setTimeout(() => {
                    fetchWebsiteSslData();
                }, 2000);
            }
        } catch (error) {
            setOpen(false);
            setCsvFile('');
            setUploadCsvLoader(false);
            setLoader(false);
            toast.error(error?.response?.data?.message);
        }
    };

    /**
     * Clear the date range filter and reset it to today's date.
     *
     * @return {void}
     *
     * Author: Zain Ashraf
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
        fetchWebsiteSslData();
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
        //  download(csvConfig)(csvToExport)  If you want to export without any search criteria.
        if (filterText.toLowerCase()) {
            // Export filtered data based on the search criteria
            const filteredCsvConfig = mkConfig({
                useKeysAsHeaders: true,
                filename: csvToExportName,
            });
            // Export the filtered CSV file
            download(filteredCsvConfig)(generateCsv(filteredCsvConfig)(filteredItems));
        } else {
            // Export the full CSV file
            download(csvConfig)(generateCsv(csvConfig)(websitesSsls));
        }
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
        <>
            <Helmet>
                <title> SSLs </title>
            </Helmet>
            <Container className="dashboard_width">
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
                    <Typography variant="h4" gutterBottom>
                        <Link to="/dashboard">
                            <Button className="back_btn" variant="contained">
                                <Iconify icon="bi:arrow-left" />
                            </Button>
                        </Link>
                        SSL
                        <div className="mt-10">
                            <Breadcrumbs aria-label="breadcrumb">
                                <Link to="/dashboard" className="domain_bread">
                                    Dashboard
                                </Link>
                                <Typography color="text.primary">SSL</Typography>
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
                        <Button className="mr-4" color="primary" variant="contained" onClick={applyDateRangeFilter}>
                            Apply
                        </Button>
                        <Button
                            className="mr-4 cancel_btn"
                            color="primary"
                            variant="contained"
                            onClick={clearDateRangeFilter}
                        >
                            Clear
                        </Button>
                        <Button
                            className="mr-4"
                            color="primary"
                            variant="contained"
                            startIcon={<Iconify icon="bi:file-earmark-arrow-up" />}
                            disabled={!websitesSsls.length}
                            onClick={exportCSV}
                        >
                            Export To CSV
                        </Button>
                        {checkPermission('Create-SSL') ? (
                            <>
                                <Button
                                    className="mr-4"
                                    component="label"
                                    variant="contained"
                                    startIcon={<CloudUploadIcon />}
                                    onClick={handleOpen}
                                >
                                    Bulk Import
                                </Button>
                                <Button
                                    onClick={() => navigate('/dashboard/ssl/create')}
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
                    <div className="ssl_dtb_wraper">
                        <Button
                            className="check_detail_btn"
                            onClick={recheckSslDetails}
                            style={{ float: 'right', background: '#ECEFF8' }}
                        >
                            Check All Certificates Now
                        </Button>
                        {checkPermission('List-SSL') ? (
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
                                Are you sure to delete this SSL data?
                            </Typography>
                            <Button onClick={handleClose} sx={{ mt: 3, mr: 2 }}>
                                No
                            </Button>
                            <Button
                                onClick={() => {
                                    deleteWebsiteSslData();
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
                        <form onSubmit={(event) => handleCsvFileSubmit(event)}>
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
                                        onChange={handleCsvFileChange}
                                    />
                                </Button>
                                {csvFile && <Typography>Selected CSV: {csvFile?.name}</Typography>}
                                <br />

                                <Button disabled={!csvFile} type="submit" variant="contained" className="fl-end">
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
