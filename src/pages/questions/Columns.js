import { Button } from '@mui/material';
import { toast } from 'react-toastify';
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
            name: <span style={{ fontWeight: 'bold' }}>Question </span>,
            selector: (row) => (
                <>
                    {row?.domain}
                   
                </>
            ),
            sortable: true,
        },
        {
            name: <span style={{ fontWeight: 'bold' }}>Answer</span>,
            selector: (row) => row?.health,
            sortable: true,
        },
        
        {
            name: <span style={{ fontWeight: 'bold' }}> Status</span>,
            selector: (row) => row.domainExpired,
            cell: (row) => (
                <div>
                    {row.domainExpired === 'Expired' ? (
                        <span style={{ color: 'red' }}>Expired</span>
                    ) : (
                        <span style={{ color: 'green' }}>Active</span>
                    )}
                </div>
            ),
            sortable: true,
        },
        {
            name: <span style={{ fontWeight: 'bold' }}>Created Date </span>,
            selector: (row) => formatDate(row?.createdAt),
            sortable: true,
        },
        {
            name: <span style={{ fontWeight: 'bold' }}>Actions </span>,
            cell: (row) => (
                <>
                    {checkPermission('Update-Domain') ? (
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
