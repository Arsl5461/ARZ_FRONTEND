import { Button } from '@mui/material';
import { toast } from 'react-toastify';
import { checkPermission } from '../../utils/Permissions';
import { formatDate } from '../../utils/formatTime';

/**
 * Author: Muhammad Rooman
 * Date: September 19, 2023
 *
 * Columns component for configuring the columns of a data table.
 * @param {Object} - An object containing the following props:
 * @param {function} handleEdit - Function to handle the edit action for rows.
 *
 * @returns {Array} - An array of column configurations for the data table.
 */
const Columns = ({ handleEdit, handleViewGraph }) => {
    const copyTextToClipboard = (textToCopy) => {
        window.navigator.clipboard.writeText(textToCopy);
        toast.success('URL has been Copied');
    };
    const columns = [
        {
            name: <span style={{ fontWeight: 'bold' }}>Serial #</span>,
            selector: (row, index) => index + 1,
        },
        {
            name: <span style={{ fontWeight: 'bold' }}>Friendly Name </span>,
            selector: (row) => `${row?.name}`,
            sortable: true,
        },
        {
            name: <span style={{ fontWeight: 'bold' }}>API URL</span>,
            selector: (row) => (
                <>
                    {row?.domain}
                    <div className="relative">
                        <a
                            className="copy-icon"
                            href=""
                            role="button"
                            onClick={(e) => {
                                e.preventDefault();
                                copyTextToClipboard(row?.domain);
                            }}
                        >
                            <img src="/assets/icons/navbar/copy.svg" alt="Copy" />
                        </a>
                    </div>
                </>
            ),
            sortable: true,
        },
        {
            name: <span style={{ fontWeight: 'bold' }}>Monitoring Interval </span>,
            selector: (row) => `${row?.interval / 60000} (Min)`,
            sortable: true,
        },
        {
            name: <span style={{ fontWeight: 'bold' }}>Monitoring TimeOut </span>,
            selector: (row) => `${row?.timeOut / 1000} (Sec)`,
            sortable: true,
        },
        {
            name: <span style={{ fontWeight: 'bold' }}>Monitor SSL Errors </span>,
            selector: (row) => `${row?.errorsLog}`,
            cell: (row) => (
                <div>
                    <span style={{ color: row?.errorsLog === 'up' ? 'green' : 'red' }}>
                        {row?.errorsLog && row.errorsLog.charAt(0).toUpperCase() + row.errorsLog.slice(1)}
                    </span>
                </div>
            ),
            sortable: true,
        },
        {
            name: <span style={{ fontWeight: 'bold' }}>Created Date </span>,
            selector: (row) => `${formatDate(row?.createdAt)}`,
            sortable: true,
        },
        {
            name: <span style={{ fontWeight: 'bold' }}>Status</span>,
            selector: (row) => row.status,
            cell: (row) => (
                <div>
                    {row.status === 'Active' ? (
                        <span style={{ color: 'green' }}>Active</span>
                    ) : (
                        <span style={{ color: 'red' }}>Inactive</span>
                    )}
                </div>
            ),
            sortable: true,
        },
        {
            name: <span style={{ fontWeight: 'bold' }}>Actions </span>,
            cell: (row) => (
                <>
                    <div>
                        {checkPermission('Update-Uptime-Monitor') ? (
                            <Button onClick={() => handleViewGraph(row)}>View</Button>
                        ) : (
                            ''
                        )}
                    </div>
                    <div className="update__btn">
                        {checkPermission('Update-Uptime-Monitor') ? (
                            <Button onClick={() => handleEdit(row)}>Update</Button>
                        ) : (
                            ''
                        )}
                    </div>
                </>
            ),
            allowOverflow: true,
            button: true,
        },
    ];
    return columns;
};

export default Columns;
