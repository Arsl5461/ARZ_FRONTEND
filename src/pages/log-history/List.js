import { Helmet } from 'react-helmet-async';
import DataTable from 'react-data-table-component';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { Link } from 'react-router-dom';
// @mui
import { Card, Stack, Button, Container, Typography } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { toast } from 'react-toastify';
import { mkConfig, generateCsv, download } from 'export-to-csv';
import { format } from 'date-fns';
import api from '../../config/axios-instance';
import FilterComponent from '../../utils/FilterComponent';
import { ENV } from '../../config/config';

// components
import Iconify from '../../components/iconify';
import Columns from './Columns';

/**
 * User List Component.
 *
 * All rights Reseverd | Arhamsoft Pvt @2023
 *
 * @returns {JSX.Element} - JSX representation of the component.
 */

export default function UserPage() {

    // Initialization and state management
    const navigate = useNavigate();
    const dayStart = new Date();
    dayStart.setUTCHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setUTCHours(23, 59, 59);
    const authToken = JSON.parse(localStorage.getItem('token'));
    const [logs, setLogs] = useState([]);
    const [logsDownload, setLogsDownload] = useState([]);
    const [csv, setCsv] = useState(null);
    const [csvToExportName, setCsvToExportName] = useState(`export_${format(new Date(), 'yyyy-MM-dd')}`);
    const [filterText, setFilterText] = useState('');
    const [endDate, setEndDate] = useState(todayEnd);
    const [startDate, setStartDate] = useState(dayStart);
    const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
    const [loader, setLoader] = useState(true);
    const [totalRows, setTotalRows] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const csvConfig = mkConfig({ useKeysAsHeaders: true, filename: csvToExportName });

    /**
  * Fetch log data from the server, paginating and filtering as needed.
  *
  * This function makes an API request to retrieve log data from the server, including pagination and filtering based on the provided parameters.
  *
  * @param {number} page - The page number to retrieve log data for.
  * @returns {Promise<void>} - A promise that resolves when the log data is successfully fetched and updated in the component state.
  *
  * Author: Ali Haider
  * Date: 25 Oct, 2023
  */

    async function fetchLog(page) {
        setLoader(true);
        try {
            const response = await api.get(`${ENV.appBaseUrl}/notification?page=${page}&per_page=${perPage}&filter=${filterText}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });
            if (response?.data?.success) {
                setLogs(response?.data?.notifications);
                setLogsDownload(response?.data?.download)
                setTotalRows(response.data?.total);
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

    /**
 * Handle a page change event in the component.
 *
 * This function is called when a page change event occurs in the component. It updates the current page to the provided page number.
 *
 * @param {number} page - The new page number to set as the current page.
 *
 * Author: Ali Haider
 * Date: 25 Oct, 2023
 */
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    useEffect(() => {
        // Initial data fetch
        fetchLog(currentPage, perPage);
    }, [currentPage, perPage, filterText]);

    /**
 * Handle a change in the number of rows per page in the component.
 *
 * This function is called when the number of rows per page changes in the component. It updates the number of rows per page and sets the current page to the first page.
 *
 * @param {number} newPerPage - The new number of rows to display per page.
 *
 * Author: Ali Haider
 * Date: 25 Oct, 2023
 */
    const handlePerRowsChange = (newPerPage) => {
        setPerPage(newPerPage);
        setCurrentPage(1);
    };

    /**
 * Update CSV data when log downloads change.
 *
 * This effect runs when the `logsDownload` data changes. It modifies the data and generates a new CSV file for download.
 *
 * @param {Array} logsDownload - The log download data to convert to CSV.
 *
 * Author: Ali Haider
 * Date: 25 Oct, 2023
 */
    useEffect(() => {
        if (logsDownload?.length > 0) {
            const modifiedData = logsDownload?.map((item) => {
                const modifiedItem = { ...item };
                return modifiedItem;
            });
            
            const csvConfig = mkConfig({ useKeysAsHeaders: true });
            const newCsv = generateCsv(csvConfig)(modifiedData);
            setCsv(newCsv);
        }
    }, [logsDownload]);

    const handleEdit = (row) => {
        navigate(`/dashboard/logs/${row?._id}`, { replace: true });
    };

    /**
  * Handle the selection of a date range for log data filtering.
  *
  * This function is responsible for filtering log data based on a user-selected date range. It performs the following actions:
  * 1. Validates that the selected start date is not greater than the end date, displaying an error message if it is.
  * 2. Calculates an adjusted end date to ensure it is inclusive of the selected range.
  * 3. Generates a meaningful name for the exported CSV file based on the selected date range.
  * 4. Initiates an API request to fetch log data with the selected date filter, updating the component's state with the results.
  * 5. Handles error messages and updates the component's loading state as necessary.
  *
  * @throws {Error} - Throws an error if the API request fails or returns an error response.
  * 
  * Author: Ali Haider
  * Date: 28 Sep, 2023
  */
    const handleDateSelect = async () => {
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
        try {
            setLoader(true);
            const response = await api.get(`${ENV.appBaseUrl}/notification?page=${currentPage}&per_page=${perPage}&filter=${filterText}&startDate=${startDate}&endDate=${endDate}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });
            if (response?.data?.success) {
                setLogs(response?.data?.notifications);
                setLogsDownload(response?.data?.download)
                setTotalRows(response.data?.total);
                setLoader(false);
            } else {
                toast.error(response?.data?.message);
                setLoader(false);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message);
            setLoader(false);
        }
    };

    /**
  * Clear the date range filter and reset it to today's date.
  *
  * @return {void}
  *
  * Author: Ali Haider
  * Date: 28 Sep, 2023
  */
    const clearDateRangeFilter = () => {
        const todayStart = new Date();
        todayStart.setUTCHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setUTCHours(23, 59, 59);
        setStartDate(todayStart);
        setEndDate(todayEnd);
        setFilterText('')
        setCsvToExportName(`export_${format(new Date(), 'yyyy-MM-dd')}`);
        fetchLog();
    };


    /**
     * Define columns for the DataTable
     *
     * DataTable and Filter
     * Author: Ali Haider
     * Date: 28 Sep, 2023
     */
    const columns = useMemo(() => Columns({ handleEdit }), []);

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


    return (
        <>
            <Helmet>
                <title> Logs </title>
            </Helmet>
            <Container className='dashboard_width'>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
                    <Typography variant="h4" gutterBottom>
                        <Link to="/dashboard">
                            <Button
                                className='back_btn'
                                variant="contained"
                            >
                                <Iconify icon="bi:arrow-left" />
                            </Button>
                        </Link>
                        Logs
                        <div className='mt-10'>
                            <Breadcrumbs aria-label="breadcrumb">

                                <Link
                                    to="/dashboard"
                                    className="domain_bread"
                                >
                                    Dashboard
                                </Link>
                                <Typography color="text.primary">Logs</Typography>
                            </Breadcrumbs>
                        </div>
                    </Typography>
                    <div className="domain_btn_wrap">
                        <input className="mr-4"
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
                        <Button className="mr-4" color="primary" variant="contained"
                            onClick={handleDateSelect}
                        >
                            Apply
                        </Button>
                        <Button
                            className="mr-4 cancel_btn"
                            variant="contained"
                            onClick={clearDateRangeFilter}
                        >
                            Clear
                        </Button>
                        <Button
                            className='mr-4'
                            variant="contained"
                            disabled={!logsDownload?.length}
                            onClick={() => download(csvConfig)(csv)}
                            startIcon={<Iconify icon="bi:file-earmark-arrow-down" />}
                        >
                            Export To CSV

                        </Button>
                    </div>
                </Stack>
                <Card>
                    <div className='monitor_dtb_wraper'>
                        <DataTable
                            scrollX
                            columns={columns}
                            data={logs}
                            progressPending={loader}
                            pagination
                            paginationServer
                            progressComponent={<CircularProgress value={100} />}
                            paginationTotalRows={totalRows}
                            onChangeRowsPerPage={handlePerRowsChange}
                            onChangePage={handlePageChange}
                            paginationResetDefaultPage={resetPaginationToggle}
                            subHeader
                            subHeaderComponent={subHeaderComponentMemo}
                            persistTableHead
                        />
                    </div>
                </Card>
            </Container>
        </>
    );
}
