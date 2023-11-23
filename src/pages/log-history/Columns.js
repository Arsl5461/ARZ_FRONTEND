import { Button } from '@mui/material';
import { checkPermission } from '../../utils/Permissions';
import { formatDate } from '../../utils/formatTime';

const Columns = ({ handleEdit }) => {
    const columns = [
        {
            name: <span style={{ fontWeight: 'bold' }}>Serial #</span>,
            selector: (row, index) => index + 1,
            sortable: false,
        },
        {
            name: <span style={{ fontWeight: 'bold' }}>Action Performed</span>,
            selector: (row) => row?.action,
            sortable: true,
        },
        {
            name: <span style={{ fontWeight: 'bold' }}>Created By</span>,
            selector: (row) => row?.createdBy,
            sortable: true,
        },
        {
            name: <span style={{ fontWeight: 'bold' }}>Role</span>,
            selector: (row) => row?.role,
            sortable: true,
        },
        {
            name: <span style={{ fontWeight: 'bold' }}>Type</span>,
            selector: (row) => row?.type,
            sortable: true,
        },
        {
            name: <span style={{ fontWeight: 'bold' }}>Status</span>,
            selector: (row) => row?.read,
            cell: (row) => (
                <div>
                    {row?.read === true ? (
                        <span style={{ color: 'green' }}>Read</span>
                    ) : (
                        <span style={{ color: 'red' }}>Unread</span>
                    )}
                </div>
            ),
            sortable: true,
        },
        {
            name: <span style={{ fontWeight: 'bold' }}>Created Date</span>,
            selector: (row) => `${formatDate(row?.createdAt)}`,
            sortable: true,
        },
        {
            name: <span style={{ fontWeight: 'bold' }}>Actions</span>,
            cell: (row) => (
                <>
                    {checkPermission('View-Notification') ? (
                        <Button className="update_btn" onClick={() => handleEdit(row)}>
                            View
                        </Button>
                    ) : (
                        ''
                    )}
                </>
            ),
            allowOverflow: true,
            button: true,
        },
    ];
    return columns;
};

export default Columns;
