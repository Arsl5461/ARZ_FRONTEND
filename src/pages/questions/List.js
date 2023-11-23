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
 * Questions List Component.
 *
 * All rights Reseverd | Arhamsoft Pvt @2023
 *
 * @returns {JSX.Element} - JSX representation of the component.
 */
export default function List() {
    // Initialization and state management
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const [loader, setLoader] = useState(false);
    const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
    const [filterText, setFilterText] = useState('');
    const [questions, setQuestion] = useState([])

    const filteredItems = questions?.filter((item) => {
        const filterTextLowerCase = filterText.toLowerCase();

        return (
            (item?.domain && item?.domain.toLowerCase().includes(filterTextLowerCase)) ||
            (item?.health && item?.health.toLowerCase().includes(filterTextLowerCase))

        );
    });

    const handleEdit = (row) => {

    };
    /**
    * Define columns for the DataTable and pass
    *
    * @param {Function}
    *
    * DataTable and Filter
    * Author: Ali Haider
    * Date: 07 Sep, 2023
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
                <title> Questions </title>
            </Helmet>
            <Container className="dashboard_width">
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
                    <Typography variant="h4" gutterBottom>
                        <Link to="/dashboard">
                            <Button className="back_btn" variant="contained">
                                <Iconify icon="bi:arrow-left" />
                            </Button>
                        </Link>
                        Questions
                        <div className="mt-10">
                            <Breadcrumbs aria-label="breadcrumb">
                                <Link to="/dashboard" className="domain_bread">
                                    Dashboard
                                </Link>
                                <Typography color="text.primary">Questions</Typography>
                            </Breadcrumbs>
                        </div>
                    </Typography>
                    <div className="domain_btn_wrap">
                        {checkPermission('Create-Domain') ? (
                            <>
                                {' '}
                                <Button
                                    onClick={() => navigate('/dashboard/question/create')}
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

            </Container>
        </>
    );
}
