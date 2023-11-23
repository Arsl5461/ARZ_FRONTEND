import { Button } from '@mui/material';
import { toast } from 'react-toastify';
import { checkPermission } from '../../utils/Permissions';
import { formatDate } from '../../utils/formatTime';

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
        toast.success('Doamin has been Copied');
    };

    const columns = [
        {
            name: <span style={{ fontWeight: 'bold' }}>Serial #</span>,
            selector: (row, index) => index + 1,
            sortable: false,
        },
        {
            name: <span style={{ fontWeight: 'bold' }}>Domain </span>,
            selector: (row) => (
                <>
                    {row?.domain}
                    <div className="relative">
                        <a className="mail_gun-icon">
                            {row.isUsingMailGun ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" id="at">
                                    <g
                                        fill="none"
                                        fillRule="evenodd"
                                        stroke="red"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        transform="translate(0 1)"
                                    >
                                        <circle cx="11" cy="10" r="4" />
                                        <path d="M15 10v1a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
                                    </g>
                                </svg>
                            ) : null}
                        </a>
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
                    </div>
                </>
            ),
            sortable: true,
        },
        {
            name: <span style={{ fontWeight: 'bold' }}>Health Status</span>,
            selector: (row) => row?.health,
            sortable: true,
        },
        {
            name: <span style={{ fontWeight: 'bold' }}>Domain Expiration</span>,
            selector: (row) => {
                const domainExpiryDate = new Date(row?.domainExpiryDate);
                if (Number.isNaN(domainExpiryDate)) {
                    return 'N/A';
                }

                const currentDate = new Date();
                const daysRemaining = Math.ceil((domainExpiryDate - currentDate) / (1000 * 60 * 60 * 24));

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
            name: <span style={{ fontWeight: 'bold' }}>Domain Expiry Date </span>,
            selector: (row) => formatDate(row?.domainExpiryDate),
            sortable: true,
        },
        {
            name: <span style={{ fontWeight: 'bold' }}>Load Time </span>,
            selector: (row) => `${row?.loadingTime}s`,
            sortable: true,
        },
        {
            name: <span style={{ fontWeight: 'bold' }}>Domain Status</span>,
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
