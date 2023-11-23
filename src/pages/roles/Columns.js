import { Button } from '@mui/material';
import { checkPermission } from '../../utils/Permissions';
import { formatDate } from '../../utils/formatTime';

const Columns = ({ handleEdit, handleDelete }) => {
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
            name: <span style={{ fontWeight: 'bold' }}>Created Date</span>,
            selector: (row) => `${formatDate(row?.createdAt)}`,
            sortable: true,
        },
        {
            name: <span style={{ fontWeight: 'bold' }}>Actions</span>,
            cell: (row) => (
                <>
                    {row.name !== 'Super Admin' && (
                        <>
                            {checkPermission('Update-Role') ? (
                                <Button className="update_btn" onClick={() => handleEdit(row)}>
                                    Update
                                </Button>
                            ) : (
                                ''
                            )}
                        </>
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
