import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import Breadcrumbs from '@mui/material/Breadcrumbs';
// @mui
import { Card, Stack, Button, Container, Typography, Modal, Box, CircularProgress } from '@mui/material';
// components
import api from '../../config/axios-instance';
import { ENV } from '../../config/config';
import { checkPermission } from '../../utils/Permissions';
import FilterComponent from '../../utils/FilterComponent';
import Iconify from '../../components/iconify';
import Columns from './Columns';

// ----------------------------------------------------------------------

/**
 * Delete model style
 *
 * Author: Zain Ashraf
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
 * Email template List Component.
 *
 * All rights Reseverd | Arhamsoft Pvt @2023
 *
 * @returns {JSX.Element} - JSX representation of the component.
 */

export default function List() {
    // Initialization and state management

    const navigate = useNavigate();
    const [emailTemplates, setEmailTemplates] = useState([]);
    const [filterText, setFilterText] = useState('');
    const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
    const [open, setOpen] = useState(false);
    const [delId, setDelId] = useState('');
    const [loader, setLoader] = useState(true);
    const token = JSON.parse(localStorage.getItem('token'));

    /**
     * Handle delete model
     *
     * Author: Zain Ashraf
     * Date: 08 Sep, 2023
     */
    const handleOpen = useCallback(() => setOpen(true), [setOpen]);
    const handleClose = useCallback(() => setOpen(false), [setOpen]);

    /**
     * Filtering logic for search in data table
     *
     * Author: Zain Ashraf
     * Date: 08 Sep, 2023
     */
    const filteredItems = emailTemplates?.filter((item) => {
        const filterTextLowerCase = filterText.toLowerCase();

        return (
            (item.name && item.name.toLowerCase().includes(filterTextLowerCase)) ||
            (item.status && item.status.toLowerCase().includes(filterTextLowerCase)) ||
            (item.type && item.type.toLowerCase().includes(filterTextLowerCase)) ||
            (item.subject && item.subject.toLowerCase().includes(filterTextLowerCase))
        );
    });

    /**
     * Fetch email template data from the server
     *
     * Author: Zain Ashraf
     * Date: 08 Sep, 2023
     */
    const FetchEmailTemplate = useCallback(async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            };
            const response = await api.get(`${ENV.appBaseUrl}/email`, config);
            if (response?.data?.success) {
                setEmailTemplates(response?.data?.templates);
                setLoader(false);
            } else {
                setLoader(false);
                toast.error(response?.data?.message);
            }
        } catch (error) {
            setLoader(false);
            toast.error(error?.response?.data?.message);
        }
    }, [token, setEmailTemplates]);

    useEffect(() => {
        // Initial data fetch
        FetchEmailTemplate();
    }, [FetchEmailTemplate]);

    const handleEdit = useCallback(
        (row) => {
            navigate(`/dashboard/email-templates/edit/${row._id}`);
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
     * Define columns for the DataTable
     *
     * DataTable and Filter
     * Author: Zain Ashraf
     * Date: 08 Sep, 2023
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
     * Navigation and Delete email template
     *
     * Author: Zain Ashraf
     * Date: 08 Sep, 2023
     */
    async function DeleteTemplate() {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            };
            const response = await api.delete(`${ENV.appBaseUrl}/email/${delId}`, config);
            if (response?.data?.success) {
                toast.success(response?.data?.message);
                FetchEmailTemplate();
            } else {
                toast.error(response?.data?.message);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message);
        }
    }

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
                <title> Email Templates </title>
            </Helmet>
            <Container className="dashboard_width">
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
                    <Typography variant="h4" gutterBottom>
                        <Link to="/dashboard">
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
                                <Typography color="text.primary">Email Templates</Typography>
                            </Breadcrumbs>
                        </div>
                    </Typography>
                    {checkPermission('Create-Email-Template') ? (
                        <Button
                            onClick={() => navigate('/dashboard/email-templates/create')}
                            variant="contained"
                            startIcon={<Iconify icon="eva:plus-fill" />}
                        >
                            Add
                        </Button>
                    ) : (
                        ''
                    )}
                </Stack>
                <Card>
                    <div className="monitor_dtb_wraper">
                        {checkPermission('List-Email-Templates') ? (
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
                                Are you sure to delete this email template?
                            </Typography>
                            <Button onClick={handleClose} sx={{ mt: 3, mr: 2 }}>
                                No
                            </Button>
                            <Button
                                onClick={() => {
                                    DeleteTemplate();
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
