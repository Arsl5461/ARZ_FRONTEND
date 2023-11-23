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
import api from '../../config/axios-instance';
import { checkPermission } from '../../utils/Permissions';
import FilterComponent from '../../utils/FilterComponent';
import { ENV } from '../../config/config';
// components
import Iconify from '../../components/iconify';
import Columns from './Columns';


// ----------------------------------------------------------------------
/**
 * Delete model style
 *
 * Author: Ali Haider
 * Date: 08 Sep, 2023
 */
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
 * Roles List Component.
 *
 * All rights Reseverd | Arhamsoft Pvt @2023
 *
 * @returns {JSX.Element} - JSX representation of the component.
 */

export default function List() {
    // Initialization and state management

    const navigate = useNavigate();
    const authToken = JSON.parse(localStorage.getItem('token'));
    const [open, setOpen] = useState(false);
    const [roles, setRoles] = useState([]);
    const [delId, setDelId] = useState('');
    const [filterText, setFilterText] = useState('');
    const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
    const [loader, setLoader] = useState(true);

    /**
     * Handle model
     *
     * Author: Ali Haider
     * Date: 08 Sep, 2023
     */
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    /**
     * Filtering logic for search in data table
     *
     * Author: Ali Haider
     * Date: 08 Sep, 2023
     */
    const filteredItems = roles?.filter(
        (item) =>
            (item.name && item.name.toLowerCase().includes(filterText.toLowerCase())) ||
            (item.phone && item.phone.includes(filterText)) ||
            (item.email && item.email.includes(filterText)) ||
            (item.status && String(item.status).toLowerCase() === filterText.toLowerCase()) ||
            (item?.createdAt && item?.createdAt.includes(filterText))
    );

    /**
     * Fetch roles data from the server
     *
     * Author: Ali Haider
     * Date: 08 Sep, 2023
     */
    async function FetchRole() {
        try {
            const response = await api.get(`${ENV.appBaseUrl}/role`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (response?.data?.success) {
                setRoles(response?.data?.roles);
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
        FetchRole();
    }, []);

    const handleEdit = (row) => {
        navigate(`/dashboard/roles/edit/${row?._id}`, { replace: true });
    };

    /**
     * Navigation and Delete Role
     *
     * Author: Ali Haider
     * Date: 08 Sep, 2023
     */
    async function DeleteRole() {
        try {
            const response = await api.delete(`${ENV.appBaseUrl}/role/${delId}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });
            if (response?.data?.success) {
                toast.success(response?.data?.message);
                FetchRole();
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
     * Define columns for the DataTable
     *
     * DataTable and Filter
     * Author: Ali Haider
     * Date: 08 Sep, 2023
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
     * Set loder
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
                <title> Roles </title>
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
                        Roles
                        <div className='mt-10'>
                            <Breadcrumbs aria-label="breadcrumb">

                                <Link
                                    to="/dashboard"
                                    className="domain_bread"
                                >
                                    Dashboard
                                </Link>
                                <Typography color="text.primary">Roles</Typography>
                            </Breadcrumbs>
                        </div>
                    </Typography>
                    {checkPermission('Create-Role') ? (
                        <Button
                            variant="contained"
                            startIcon={<Iconify icon="eva:plus-fill" />}
                            onClick={() => navigate('/dashboard/roles/create', { replace: true })}
                        >
                            Add
                        </Button>
                    ) : (
                        ''
                    )}
                </Stack>
                <Card>
                <div className='monitor_dtb_wraper'>
                    {checkPermission('List-Roles') ? (
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
                                Are you sure to delete this role?
                            </Typography>
                            <Button onClick={handleClose} sx={{ mt: 3, mr: 2 }}>
                                No
                            </Button>
                            <Button
                                onClick={() => {
                                    DeleteRole();
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
            </Container>
        </>
    );
}
