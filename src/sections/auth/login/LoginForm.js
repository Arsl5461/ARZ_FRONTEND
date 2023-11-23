import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
// @mui
import { Stack, IconButton, InputAdornment, TextField, Modal, Button, Typography, Box } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { ENV } from '../../../config/config';
// components
import Iconify from '../../../components/iconify';

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

export default function LoginForm() {
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [open, setOpen] = useState(false);
    const [userInfo, setUserInfo] = useState(null)

    /**
     * Design login form schema with validation
     * 
     * Author: Ali Haider
     * Date: 07 sep, 2023
     */
    const schema = yup.object().shape({
        email: yup.string().email('Invalid email').required('Email is required'),
        password: yup.string().required('Password is required'),
    });

    /**
     * Handle model
     *
     * Author: Ali Haider
     * Date: 06 Oct, 2023
     * 
     * This section contains functions related to handling a model or modal component.
     */
    const handleOpen = () => setOpen(true);
    const close = () => setOpen(false);

    /**
 * Function to Handle Modal Closure with Confirmation
 *
 * Author: Ali Haider
 * Date: 06 Oct, 2023
 * 
 * This function handles the closure of a modal with a confirmation process.
 * It performs the following actions:
 * 1. Closes the modal.
 * 2. Prepares user data for confirmation by adding a "confirmation" property with the value "yes."
 * 3. Sends a POST request to the authentication API for user login.
 * 4. If the login is successful (response data contains "success"):
 *    - Encrypts and stores user data.
 *    - Navigates to the dashboard page.
 * 5. If the login is not successful (response data does not contain "success"):
 *    - Displays an error message using a toast notification.
 * 6. In case of any error during the process (e.g., network issues or server errors):
 *    - Displays an error message to the user.
 */
    const handleClose = async () => {
        setOpen(false)
        try {
            const data = {
                ...userInfo,
                confirmation: "yes"
            }
            const response = await axios.post(`${process.env.REACT_APP_BASE_ADMIN_API}/auth/login`, data);
            if (response?.data?.success) {
                ENV.encryptUserData(response?.data?.user, response?.data?.accessToken, response?.data?.user?.id);
                navigate('/dashboard', { replace: true });
            } else {
                toast.error(response?.data?.message);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message);
        }


    };

    const {
        handleSubmit,
        register,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
    });

    /**
     * On form submit call login api and pass from @data in body
     * 
     * Author: Ali Haider
     * Date: 07 sep, 2023
     */

    const onSubmit = async (data) => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_BASE_ADMIN_API}/auth/login`, data);
            if (response?.data?.success) {
                ENV.encryptUserData(response?.data?.user, response?.data?.accessToken, response?.data?.user?.id);
                navigate('/dashboard', { replace: true });
            } else if (response?.data?.status === 302) {
                handleOpen();
                setUserInfo(data)
                toast.error(response?.data?.message);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={3}>
                    <TextField
                        name="email"
                        label="Email address"
                        {...register('email')}
                        error={!!errors.email}
                        helperText={errors.email?.message}
                    />
                    <TextField
                        name="password"
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        {...register('password')}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                        <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        error={!!errors.password}
                        helperText={errors.password?.message}
                    />
                </Stack>

                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 2 }} />

                <LoadingButton className="login_btn" size="large" type="submit" variant="contained">
                    Login
                </LoadingButton>
            </form>
            <div>
                <Modal
                    open={open}
                    onClose={close}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={style}>
                        <Typography id="modal-modal-title" variant="h6" component="h2">
                            Do you want to log out from another device?'
                        </Typography>
                        <Button onClick={close} sx={{ mt: 3, mr: 2 }}>
                            No
                        </Button>
                        <Button
                            onClick={() => {
                                handleClose(); // Close the modal after deletion
                            }}
                            variant="contained"
                            color="error"
                            sx={{ mt: 3 }}
                        >
                            Yes
                        </Button>
                    </Box>
                </Modal>
            </div>
        </>
    );
}
