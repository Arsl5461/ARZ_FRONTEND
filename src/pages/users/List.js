import { Helmet } from 'react-helmet-async';
import DataTable from 'react-data-table-component';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { Link } from 'react-router-dom';
// @mui
import { Card, Stack, Button, Container, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
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
import { checkPermission } from '../../utils/Permissions';

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
    const [open, setOpen] = useState(false);
    const [USERLIST, setUSERLIST] = useState([]);
    const [delId, setDelId] = useState('');
    const [csv, setCsv] = useState(null);
    const [csvToExportName, setCsvToExportName] = useState(`export_${format(new Date(), 'yyyy-MM-dd')}`);
    const [filterText, setFilterText] = useState('');
    const [endDate, setEndDate] = useState(todayEnd);
    const [startDate, setStartDate] = useState(dayStart);
    const [filteredUser, setFilteredUser] = useState([]);
    const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
    const [loader, setLoader] = useState(true);

    const csvConfig = mkConfig({ useKeysAsHeaders: true, filename: csvToExportName });

    /**
     * Handle model
     *
     * Author: Ali Haider
     * Date: 07 Sep, 2023
     */
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    /**
     * Filtering logic for search in data table
     *
     * Author: Ali Haider
     * Date: 07 Sep, 2023
     */
    const filteredItems = USERLIST?.filter((item) => {
        const filterTextLower = filterText.toLowerCase();

        return (
            (item.name && item.name.toLowerCase().includes(filterTextLower)) ||
            (item.status && item.status.toLowerCase().includes(filterTextLower)) ||
            (item?.role?.name && item?.role?.name.toLowerCase().includes(filterTextLower)) ||
            (item?.email && item?.email.includes(filterTextLower)) ||
            (item?.createdAt && item?.createdAt.includes(filterTextLower))
        );
    });


    /**
     * Fetch user data from the server
     *
     * Author: Ali Haider
     * Date: 07 Sep, 2023
     */
    async function fetchUser() {
        setLoader(true);
        try {
            const response = await api.get(`${ENV.appBaseUrl}/user`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });
            if (response?.data?.success) {
                setUSERLIST(response?.data?.users);
                setFilteredUser(response?.data?.users);
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
        fetchUser();
    }, []);

    useEffect(() => {
        if (USERLIST?.length > 0) {
            const flattenedData = USERLIST.map((item) => {
                const roleName = item?.role?.name || '';
                return {
                  name: item.name,
                  email: item.email,
                  status: item.status,
                  
                  role: roleName, 
                };
              });
              const csvConfig = mkConfig({ useKeysAsHeaders: true });
              const newCsv = generateCsv(csvConfig)(flattenedData);
              setCsv(newCsv);
        }
    }, [USERLIST]);

    const handleEdit = (row) => {
        navigate(`/dashboard/users/edit/${row?._id}`, { replace: true });
    };

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
        const filteredData = filteredUser.filter((user) => {
            const filteredData = new Date(user.createdAt);
            return filteredData >= startDate && filteredData <= endDate;
        });
        setUSERLIST(filteredData);
        setLoader(false);
    };

    /**
     * Navigation and Delete User
     *
     * Author: Ali Haider
     * Date: 07 Sep, 2023
     */
    async function deleteUser() {
        try {
            const response = await api.delete(`${ENV.appBaseUrl}/user/${delId}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });
            if (response?.data?.success) {
                toast.success(response?.data?.message);
                fetchUser();
            } else {
                toast.error(response?.data?.message);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message);
        }
    }

    const handleDelete = (row) => {
        handleOpen();
        setDelId(row?._id);
    };

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
        fetchUser();
    };


    /**
     * Define columns for the DataTable
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
     * Handle exportCSV to Export filtered data, based on the search criteria
     *
     * @return {void}
     *
     * Author: Muhammad Rooman
     * Date: 27 October, 2023
     */
     const exportCSV = () => {
        if (filterText.toLowerCase()) {
            // Export filtered data based on the search criteria
            const filteredCsvData = filteredItems.map((item) => {
                const role = item?.role?.name || ''; 
                return {
                    name: item.name,
                    role,
                    email: item.email,
                    status: item.status,
                    createdAt:item.createdAt,
                };
            });
    
            const filteredCsvConfig = mkConfig({
                useKeysAsHeaders: true,
                filename: csvToExportName,
            });
            download(filteredCsvConfig)(generateCsv(filteredCsvConfig)(filteredCsvData));
        } else {
            // Export the full CSV file 
            const fullCsvData = USERLIST.map((item) => {
                const role = item?.role?.name || ''; 
                return {
                    name: item.name,
                    role,
                    email: item.email,
                    status: item.status,
                    createdAt:item.createdAt,
                };
            });
          download(csvConfig)(generateCsv(csvConfig)(fullCsvData));
        }
    };
    
    /**
     * Renders a Material-UI CircularProgress spinner when the loader is active.
     *
     * Author: Ali Haider
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
                <title> User </title>
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
                        Users
                        <div className='mt-10'>
                            <Breadcrumbs aria-label="breadcrumb">

                                <Link
                                    to="/dashboard"
                                    className="domain_bread"
                                >
                                    Dashboard
                                </Link>
                                <Typography color="text.primary">Users</Typography>
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
                            disabled={!USERLIST.length}
                            onClick={exportCSV}
                            startIcon={<Iconify icon="bi:file-earmark-arrow-down" />}
                        >
                            Export To CSV

                        </Button>
                        {checkPermission('Create-User') ? (
                            <Button
                                variant="contained"
                                startIcon={<Iconify icon="eva:plus-fill" />}
                                onClick={() => navigate('/dashboard/users/create', { replace: true })}
                            >
                                Add
                            </Button>
                        ) : (
                            ''
                        )}
                    </div>
                </Stack>
                <Card>
                <div className='monitor_dtb_wraper'>
                    {checkPermission('List-Users') ? (
                        <DataTable
                            scrollX
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
                                Are you sure to delete this user?
                            </Typography>
                            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                                Deleting the user will remove all associated data.
                            </Typography>
                            <Button onClick={handleClose} sx={{ mt: 3, mr: 2 }}>
                                No
                            </Button>
                            <Button
                                onClick={() => {
                                    deleteUser();
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
                </div>
            </Container>
        </>
    );
}
