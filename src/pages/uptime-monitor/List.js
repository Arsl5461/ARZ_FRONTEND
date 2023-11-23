import { Helmet } from 'react-helmet-async';
import DataTable from 'react-data-table-component'; // import react data table
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Card, Stack, Button, Container, CircularProgress, Typography, Breadcrumbs, Modal, Box } from '@mui/material'; // @mui
import { mkConfig, generateCsv, download } from 'export-to-csv'; // import export-to-csv packege for csv export
import { styled } from 'styled-components';
import CloudUploadIcon from '@mui/icons-material/CloudUpload'; // Import CloudUploadIcon before formatDate
import { format } from 'date-fns';
import { formatDate } from '../../utils/formatTime';
import api from '../../config/axios-instance';
import { checkPermission } from '../../utils/Permissions';
import FilterComponent from '../../utils/FilterComponent';
import Iconify from '../../components/iconify';
import Columns from './Columns';
import { ENV } from '../../config/config';

// Style
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
 * List Uptime Monitor Component.
 *
 * All rights Reseverd | Arhamsoft Pvt @2023
 *
 * @returns {JSX.Element} - JSX representation of the component.
 */
export default function List() {
    // Initialization and state management
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const status = queryParams.get('errorsLog');
    const navigate = useNavigate();
    const dayStart = new Date();
    dayStart.setUTCHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setUTCHours(23, 59, 59);
    const [open, setOpen] = useState(false);
    const [uptimeMonitor, setUptimeMonitor] = useState([]);
    const [delId, setDelId] = useState('');
    const [filterText, setFilterText] = useState('');
    const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
    const [csvToExport, setCsvToExport] = useState(null); // Export Csv
    const [csvToExportName, setCsvToExportName] = useState(`export_${format(new Date(), 'yyyy-MM-dd')}`);
    const [startDate, setStartDate] = useState(dayStart);
    const [endDate, setEndDate] = useState(todayEnd);
    const [filteredMonitors, setFilteredMonitors] = useState([]); // Date Filter out state
    const [uploadCsvLoader, setUploadCsvLoader] = useState(false);
    const [csvFile, setCsvFile] = useState(''); // Imoport Csv
    const [loader, setLoader] = useState(true);
    const authToken = JSON.parse(localStorage.getItem('token')); // Retrieve the authentication token from local storage

    const csvConfig = mkConfig({ useKeysAsHeaders: true, filename: csvToExportName }); // Configure CSV settings with headers based on keys.

    /**
     * Handles the opening and closing of a model (modal).
     *
     * Author: Muhammad Rooman
     * Date: September 19, 2023
     *
     * Update 1 (September 26, 2023): Set CsvFile to an empty string when the modal is closed
     */
    const handleOpen = useCallback(() => {
        setOpen(true);
        setCsvFile('');
    }, [setOpen, setCsvFile]);
    const handleClose = useCallback(() => setOpen(false), [setOpen]);

    /**
     * Filtering logic for searching in a React data table.
     *
     * @param {Array} uptimeMonitor - The array of items to be filtered.
     * @param {string} filterText - The text used for filtering.
     * @return {Array} - An array of filtered items.
     *
     * Author: Muhammad Rooman
     * Date: September 19, 2023
     *
     * Update 1 (September 25, 2023):
     * - If the `filterText` is 'Up', 'Down', or 'Pause', the data will be filtered based on these statuses.
     */
    const filteredItems = uptimeMonitor?.filter((item) => {
        // Check if uptimeMonitor is defined and is an array
        if (!Array.isArray(uptimeMonitor)) {
            return false; // Return false to exclude items when uptimeMonitor is not an array
        }

        const filterTextLowerCase = filterText.toLowerCase();

        return (
            (item.name && item.name.toLowerCase().includes(filterTextLowerCase)) ||
            (item.domain && item.domain.toLowerCase().includes(filterTextLowerCase)) ||
            (item.status && item.status.toLowerCase().includes(filterTextLowerCase)) ||
            (item.interval && item.interval.toString().toLowerCase().includes(filterTextLowerCase)) ||
            (item.errorsLog && item.errorsLog.toString().toLowerCase().includes(filterTextLowerCase)) ||
            (item.timeOut && item.timeOut.toString().toLowerCase().includes(filterTextLowerCase))
        );
    });

    /**
     * Fetch all Uptime_Monitor from the Get API
     *
     * Author : Muhammad Rooman
     * Date: September 19, 2023
     *
     */
    const fetchUptimeMonitor = useCallback(async () => {
        setLoader(true);
        try {
            let apiUrl = `${ENV.appBaseUrl}/monitor`;

            if (status === 'up' || status === 'down' || status === 'pause') {
                apiUrl += `?errorsLog=${status}`;
            }
            const response = await api.get(apiUrl, {
                headers: {
                    Authorization: `Bearer ${authToken}`, // Include the token in the Authorization header
                },
            });

            if (response?.data?.success) {
                setUptimeMonitor(response?.data?.monitors);
                setFilteredMonitors(response?.data?.monitors);
                setLoader(false);
            } else {
                toast.error(response?.data?.message);
                setLoader(false);
            }
        } catch (error) {
            setLoader(false);
            toast.error(error?.response?.data?.message);
        }
    }, [authToken, setUptimeMonitor]);

    useEffect(() => {
        // Call the fetchUptimeMonitor function to fetch data
        fetchUptimeMonitor();
    }, [fetchUptimeMonitor]);

    /**
     *  Generates a Export CSV file for exporting data.
     *
     * @param {Array} - The data to be exported as a CSV file.
     * @return {void}
     * Author: Muhammad Rooman
     * Date: September 21, 2023
     *
     * update 1 (September 25, 2023) : Remove the "updatedAt", "__v" field from each item in the uptimeMonitor array
     */
    useEffect(() => {
        if (uptimeMonitor.length > 0) {
            // Remove the "updatedAt" , "__v" field from each item in the uptimeMonitor array
            const modifiedData = uptimeMonitor.map((item) => {
                const modifiedItem = {
                    ...item,
                    createdAt: formatDate(item?.createdAt),
                };
                // Delete the "updatedAt" field from the copied item
                delete modifiedItem.updatedAt;
                // Delete the "__v" field from the copied item
                delete modifiedItem.__v;
                return modifiedItem;
            });
            // Create a CSV configuration with keys as headers
            const csvConfig = mkConfig({ useKeysAsHeaders: true });
            const newCsv = generateCsv(csvConfig)(modifiedData);
            setCsvToExport(newCsv);
        }
    }, [uptimeMonitor]);

    const handleEdit = useCallback(
        (row) => {
            navigate(`/dashboard/uptime-monitor/edit/${row?._id}`, { replace: true });
        },
        [navigate]
    );

    const handleViewGraph = useCallback(
        (row) => {
            navigate(`/dashboard/uptime-monitor/view-graph/${row?._id}`, { replace: true });
        },
        [navigate]
    );

    /**
     * The deleteUptimeMonitor() function code is not currently used in our project but may be used in the future.
     * It sends a DELETE request to delete a Uptime_Monitor by its ID.
     *
     * Author: Muhammad Rooman
     * Date: September 21, 2023
     */
    async function deleteUptimeMonitor() {
        try {
            const response = await api.delete(`${ENV.appBaseUrl}/up-time/${delId}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`, // Include the token in the Authorization header
                },
            });
            if (response?.data?.success) {
                toast.success(response?.data?.message);
                fetchUptimeMonitor();
            } else {
                toast.error(response?.data?.message);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message);
        }
    }

    /**
     * Handles the delete action for a given row
     * @param {object} // the one we click on become an object in row
     * @param {void}
     *
     * Author: Muhammad Rooman
     * Date: September 19, 2023
     *
     */
    const handleDelete = useCallback(
        (row) => {
            handleOpen();
            setDelId(row?._id);
        },
        [handleOpen, setDelId]
    );

    /**
     * Define columns for the React Data Table
     * Here We have used "React Data Table" which here we have used its column and further we used filter
     *
     * Author: Muhammad Rooman
     * Date: September 19, 2023
     *
     */
    const columns = useMemo(() => Columns({ handleEdit, handleViewGraph, handleDelete }), [handleEdit, handleViewGraph, handleDelete]);

    /**
     * This useMemo hook memoizes subHeaderComponent for performance optimization
     * It handles filter text changes and pagination reset, enhancing component rendering efficiency.
     * When filterText or resetPaginationToggle changes, this memoized component is updated.
     *
     */
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
     * Apply a date range filter to Uptime Monitor data.
     *
     * @returns {void} - This function updates the state with the filtered Uptime Monitors.
     *
     * Author: Muhammad Rooman
     * Date: 22 September 2023
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
        const filteredData = filteredMonitors.filter((monitor) => {
            const filteredData = new Date(monitor?.createdAt);
            return filteredData >= startDate && filteredData <= endDate;
        });
        setUptimeMonitor(filteredData);
        setLoader(false);
    };

    /**
     * Handle handleCsvFileChange to Import CSV File Change
     *
     * @param {Event}  event - The event object to be handled.
     * @return { void }
     *
     * Author: Muhammad Rooman
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
     * Handle handleCsvFileSubmit to Upload Import CSV form submission
     *
     * @param {object} data - CSV data from the form.
     * @return {void}
     *
     * Author: Muhammad Rooman
     * Date: 22 Sep, 2023
     */
    const handleCsvFileSubmit = async (event) => {
        event.preventDefault();
        setUploadCsvLoader(true);
        try {
            const formData = new FormData();
            if (csvFile) {
                formData.append('file', csvFile);
            }
            const headers = {
                Authorization: `Bearer ${authToken}`,
                'content-type': 'multipart/form-data',
            };
            const response = await api.post(`${ENV.appBaseUrl}/monitor/upload-csv`, formData, { headers });
            if (response?.data?.success) {
                setUploadCsvLoader(false);
                setCsvFile('');
                setOpen(false);
                toast.success(response?.data?.message);
                setTimeout(() => {
                    fetchUptimeMonitor();
                }, 2000);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message);
            setUploadCsvLoader(false);
        }
    };

    /**
     * Handle clearDateRangeFilter to Clear the date range filter.
     *
     * Author: Muhammad Rooman
     * Date: September 25, 2023
     */
    const clearDateRangeFilter = () => {
        // Set the start and end date to today's beginning and end.
        const todayStart = new Date();
        todayStart.setUTCHours(0, 0, 0, 0);

        const todayEnd = new Date();
        todayEnd.setUTCHours(23, 59, 59);

        setStartDate(todayStart);
        setEndDate(todayEnd);
        setCsvToExportName(`export_${format(new Date(), 'yyyy-MM-dd')}`);
        fetchUptimeMonitor();
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
            download(csvConfig)(generateCsv(csvConfig)(uptimeMonitor));
        }
    };

    /**
     * Renders a Material-UI CircularProgress spinner when the loader is active.
     *
     * @returns {JSX.Element} CircularProgress spinner if loader is active, otherwise null.
     *
     * Author: Muhammad Rooman
     * Date: 22 Sep, 2023
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
                <title>Uptime Monitor</title>
            </Helmet>
            <Container className="dashboard_width">
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
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
                                <Typography color="text.primary"> Uptime Monitor</Typography>
                            </Breadcrumbs>
                        </div>
                    </Typography>
                    <div className="domain_btn_wrap">
                        <input
                            className="mr-4"
                            type="date"
                            max={new Date().toISOString().split('T')[0]}
                            value={startDate.toISOString().split('T')[0]}
                            onChange={(e) => {
                                const selectedDate = new Date(e.target.value);
                                selectedDate.setUTCHours(0, 0, 0, 0);
                                setStartDate(selectedDate);
                            }}
                        />
                        <input
                            className="mr-4"
                            type="date"
                            max={new Date().toISOString().split('T')[0]}
                            value={endDate.toISOString().split('T')[0]}
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
                            variant="contained"
                            disabled={!uptimeMonitor.length}
                            onClick={exportCSV}
                            startIcon={<Iconify icon="bi:file-earmark-arrow-down" />}
                        >
                            Export To CSV
                        </Button>
                           {checkPermission('Create-Uptime-Monitor') ? (
                            <>                          
                                <Button
                                    variant="contained"
                                    startIcon={<Iconify icon="eva:plus-fill" />}
                                    onClick={() => navigate('/dashboard/uptime-monitor/create', { replace: true })}
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
                        {checkPermission('List-Uptime-Monitor') ? (
                            <DataTable
                                columns={columns}
                                data={filteredItems}
                                pagination
                                paginationResetDefaultPage={resetPaginationToggle}
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
                                Are you sure to delete this Ping?
                            </Typography>
                            <Button onClick={handleClose} sx={{ mt: 3, mr: 2 }}>
                                No
                            </Button>
                            <Button
                                onClick={() => {
                                    deleteUptimeMonitor();
                                    handleClose();
                                }}
                                variant="contained"
                                color="error"
                                sx={{ mt: 3 }}
                            >
                                Yes, Delete
                            </Button>
                        </Box>
                    </Modal>
                    <Modal
                        open={open}
                        onClose={handleClose}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                    >
                        <form onSubmit={(event) => handleCsvFileSubmit(event)}>
                            <Box sx={style}>
                                <a
                                    href={`${ENV.appClientUrl}assets/sample/monitor-sample.csv`}
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
