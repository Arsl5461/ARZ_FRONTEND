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
            name: <span style={{ fontWeight: 'bold' }}>Name</span>,
            selector: (row) => row?.name,
            sortable: true,
        },
        {
            name: <span style={{ fontWeight: 'bold' }}>Role</span>,
            selector: (row) => row?.role?.name,
            sortable: true,
        },
        {
            name: <span style={{ fontWeight: 'bold' }}>Status</span>,
            selector: (row) => row?.status,
            cell: (row) => (
                <div>
                    {row.status === "Active" ? (
                        <span style={{ color: 'green' }}>Active</span>
                    ) : (
                        <span style={{ color: 'red' }}>Inactive</span>
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
                    {checkPermission('Update-User') ? (
                        <Button className="update_btn" onClick={() => handleEdit(row)}>
                            Update
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
