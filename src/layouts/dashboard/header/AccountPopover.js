import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { alpha } from '@mui/material/styles';
import { toast } from 'react-toastify';
import { Box, Divider, Typography, Stack, MenuItem, Avatar, IconButton, Popover } from '@mui/material';
import { ENV } from '../../../config/config';
import api from '../../../config/axios-instance';

const MENU_OPTIONS = [
    {
        label: 'Profile',
        icon: 'eva:person-fill',
    },
];

export default function AccountPopover() {
    const navigate = useNavigate();
    const token = JSON.parse(localStorage.getItem('token'));
    const userId = JSON.parse(localStorage.getItem('userId'));
    const [profileData, setProfileData] = useState(null); // Initialize to null
    const [open, setOpen] = useState(null);

    const handleOpen = (event) => {
        setOpen(event.currentTarget);
    };

    const fetchData = async () => {
        try {
            const response = await api.get(`${ENV.appBaseUrl}/user/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setProfileData(response.data?.user);
        } catch (error) {
            console.log('error', error.message);
        }
    };

    useEffect(() => {
        fetchData();
    }, []); 

    const handleClose = (label) => {
        setOpen(null);
        if (label === 'Profile') {
            navigate('/dashboard/profile');
        }
        if (label === 'Settings') {
            navigate('/dashboard/setting');
        }
        if (label === 'Home') {
            navigate('/dashboard/app');
        }
    };

    const handleLogout = async() => {
        try {
            const response = await api.post(`${ENV.appBaseUrl}/auth/logout/${userId}`);
            if(response.data.success){
                setOpen(null);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('userId');
                navigate('/login');
            }
            else {
                toast.error(response.data?.message);
            }
        } catch (error) {
            console.log('error', error.message);
        }
       
    };

    return (
        <>
            <IconButton
                onClick={handleOpen}
                sx={{
                    p: 0,
                    ...(open && {
                        '&:before': {
                            zIndex: 1,
                            content: "''",
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            position: 'absolute',
                            bgcolor: (theme) => alpha(theme.palette.grey[900], 0.8),
                        },
                    }),
                }}
            >
                <Avatar src={`${ENV.file_Url}/${profileData?.profileImage}`} alt={profileData?.name} />
            </IconButton>

            <Popover
                open={Boolean(open)}
                anchorEl={open}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                    sx: {
                        p: 0,
                        mt: 1.5,
                        ml: 0.75,
                        width: 180,
                        '& .MuiMenuItem-root': {
                            typography: 'body2',
                            borderRadius: 0.75,
                        },
                    },
                }}
            >
                <Box sx={{ my: 1.5, px: 2.5 }}>
                    <Typography variant="subtitle2" noWrap>
                        {profileData?.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                        {profileData?.email}
                    </Typography>
                </Box>

                <Divider sx={{ borderStyle: 'dashed' }} />

                <Stack sx={{ p: 1 }}>
                    {MENU_OPTIONS.map((option) => (
                        <MenuItem key={option.label} onClick={() => handleClose(option.label)}>
                            {option.label}
                        </MenuItem>
                    ))}
                </Stack>

                <Divider sx={{ borderStyle: 'dashed' }} />

                <MenuItem onClick={handleLogout} sx={{ m: 1 }}>
                    Logout
                </MenuItem>
            </Popover>
        </>
    );
}
