import { Button } from '@mui/material';
import { toast } from 'react-toastify';
import { checkPermission } from '../../utils/Permissions';
import { formatDate, formatDateTime } from '../../utils/formatTime';

const Columns = ({ handleEdit, handleDelete }) => {
    /**
     * Copies the specified text (Domain) to the clipboard.
     *
     * @param {string} textToCopy - The text to be copied to the clipboard.
     * @return {void}
     *
     * Author: Muhammad Rooman
     * Date: October 24, 2023
     */
    const copyTextToClipboard = (textToCopy) => {
        window.navigator.clipboard.writeText(textToCopy);
        toast.success('Domain has been Copied');
    };

    const columns = [
        {
            name: <span style={{ fontWeight: 'bold' }}>Serial #</span>,
            selector: (row, index) => index + 1,
            sortable: false,
        },
        {
            name: <span style={{ fontWeight: 'bold' }}>Domain</span>,
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
            name: <span style={{ fontWeight: 'bold' }}>SSL Issuer</span>,
            selector: (row) => row?.sslIssuer,
            sortable: true,
        },
        {
            name: <span style={{ fontWeight: 'bold' }}>SSL Expiration</span>,
            selector: (row) => {
                const sslExpiryDate = new Date(row?.sslExpiryDate);
                if (Number.isNaN(sslExpiryDate)) {
                    return 'N/A';
                }

                const currentDate = new Date();
                const daysRemaining = Math.ceil((sslExpiryDate - currentDate) / (1000 * 60 * 60 * 24));

                if (daysRemaining < 0) {
                    return <span style={{ color: 'red' }}>Expired</span>;
                }
                if (daysRemaining === 0) {
                    return <span style={{ color: 'red' }}>Today</span>;
                }
                if (daysRemaining < 30) {
                    return <span style={{ color: 'red' }}>{`${daysRemaining} days`}</span>;
                }
                return `${daysRemaining} days`;
            },
            sortable: true,
        },
        {
            name: <span style={{ fontWeight: 'bold' }}>SSL Expiry Date</span>,
            selector: (row) => formatDate(row?.sslExpiryDate),
            sortable: true,
        },
        {
            name: <span style={{ fontWeight: 'bold' }}>Created Date </span>,
            selector: (row) => formatDate(row?.createdAt),
            sortable: true,
        },
        {
            name: <span style={{ fontWeight: 'bold' }}>Last Checked</span>,
            selector: () => {
                const now = new Date();
                return formatDateTime(now);
            },
            sortable: true,
        },
        {
            name: <span style={{ fontWeight: 'bold' }}>SSL Status</span>,
            selector: (row) => row.sslExpired,
            cell: (row) => (
                <div>
                    {row.sslExpired === 'Expired' ? (
                        <span style={{ color: 'red' }}>Expired</span>
                    ) : (
                        <span style={{ color: 'green' }}>Active</span>
                    )}
                </div>
            ),
            sortable: true,
        },
        {
            name: <span style={{ fontWeight: 'bold' }}>Actions</span>,
            cell: (row) => (
                <>
                    {checkPermission('Update-SSL') ? (
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
