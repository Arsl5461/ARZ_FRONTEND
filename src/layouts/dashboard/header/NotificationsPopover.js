import PropTypes from "prop-types";
import { noCase } from "change-case";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
// @mui
import {
  Box,
  List,
  Badge,
  Button,
  Avatar,
  Divider,
  Popover,
  Typography,
  IconButton,
  ListItemText,
  ListSubheader,
  ListItemAvatar,
  ListItemButton,
  Tooltip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
// utils
import { formatToNow } from "../../../utils/formatTime";
// components
import Iconify from "../../../components/iconify";
import Scrollbar from "../../../components/scrollbar";
import { io } from "socket.io-client";
import api from "../../../config/axios-instance";
import { ENV } from "../../../config/config";

// ----------------------------------------------------------------------

/**
 * Notifications  Component.
 *
 * All rights Reseverd | Arhamsoft Pvt @2023
 *
 * @returns {JSX.Element} - JSX representation of the component.
 */
export default function NotificationsPopover() {
  const navigate = useNavigate();
  const authToken = JSON.parse(localStorage.getItem("token"));
  const [notifications, setNotifications] = useState(null);

  /**
   * Fetch fetchLog data from the server
   *
   * Author: Ali Haider
   * Date: 28 Sep, 2023
   */
  async function fetchLog() {
    try {
      const response = await api.get(`${ENV.appBaseUrl}/notification`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (response?.data?.success) {
        setNotifications(response?.data?.notifications);
      } else {
        toast.error(response?.data?.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  }

  useEffect(() => {
    fetchLog();
    const socket = io(`${process.env.REACT_APP_NOTIFICATION_URL}`);
    socket.on("notification", (msg) => {
      console.log(msg);
      fetchLog();
    });
  }, []);
  const totalUnRead = notifications?.filter(
    (item) => item?.read === false
  )?.length;

  const [open, setOpen] = useState(null);

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(null);
  };

  const handleNavigation = () => {
    navigate(`/dashboard/logs`);
  };

  /**
   * Handles marking all notifications as read.
   * Sends a request to the server to mark all notifications as read,
   * and then redirects to the dashboard logs page upon success.
   *
   * @async
   * @function handleMarkAllAsRead
   * @throws {Error} If an API error occurs, it displays an error message.
   */
  const handleMarkAllAsRead = async () => {
    try {
      const response = await api.get(`${ENV.appBaseUrl}/notification/readAll`);

      if (response?.data?.success) {
        fetchLog();
        navigate(`/dashboard/logs`);
      } else {
        toast.error(response?.data?.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
      console.error("API error:", error);
    }
  };

  return (
    <>
      <IconButton
        color={open ? "primary" : "default"}
        onClick={handleOpen}
        sx={{ width: 40, height: 40 }}
      >
        <Badge badgeContent={totalUnRead} color="error">
          <Iconify icon="eva:bell-fill" />
        </Badge>
      </IconButton>

      <Popover
        className="notify_popover_header"
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            mt: 1.5,
            ml: 0.75,
            width: 360,
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", py: 2, px: 2.5 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1">Notifications</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              You have {totalUnRead} unread messages
            </Typography>
          </Box>

          {totalUnRead > 0 && (
            <Tooltip title=" Mark all as read">
              <IconButton color="primary" onClick={handleMarkAllAsRead}>
                <Iconify icon="eva:done-all-fill" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Divider sx={{ borderStyle: "dashed" }} />

        <Scrollbar sx={{ height: { xs: 340, sm: "auto" } }}>
          <List
            disablePadding
            subheader={
              <ListSubheader
                disableSticky
                sx={{ py: 1, px: 2.5, typography: "overline" }}
              >
                New
              </ListSubheader>
            }
          >
            {notifications?.length > 0 ? (
              notifications.every(
                (notification) => notification?.read !== false
              ) ? (
                <div className="no_notify">No Notification Found</div>
              ) : (
                notifications
                  .filter((notification) => notification?.read === false)
                  .slice(0, 2)
                  .map((notification) => (
                    <NotificationItem
                      key={notification?._id}
                      notification={notification}
                    />
                  ))
              )
            ) : (
              <div className="no_notify">No Notification Found</div>
            )}
          </List>

          <List
            disablePadding
            subheader={
              <ListSubheader
                disableSticky
                sx={{ py: 1, px: 2.5, typography: "overline" }}
              >
                Before that
              </ListSubheader>
            }
          >
            {notifications?.length > 0 ? (
              notifications.every(
                (notification) => notification?.read !== true
              ) ? (
                <div className="no_notify">No Notification Found</div>
              ) : (
                notifications
                  .filter((notification) => notification?.read === true)
                  .slice(0, 5)
                  .map((notification) => (
                    <NotificationItem
                      key={notification?._id}
                      notification={notification}
                    />
                  ))
              )
            ) : (
              <div className="no_notify">No Notification Found</div>
            )}
          </List>
        </Scrollbar>

        <Divider sx={{ borderStyle: "dashed" }} />
        <Box sx={{ p: 1 }}>
          <Button fullWidth disableRipple onClick={handleMarkAllAsRead}>
            View All
          </Button>
        </Box>
      </Popover>
    </>
  );
}

// ----------------------------------------------------------------------

NotificationItem.propTypes = {
  notification: PropTypes.shape({
    createdAt: PropTypes.instanceOf(Date),
    _id: PropTypes.string,
    read: PropTypes.bool,
    message: PropTypes.string,
    type: PropTypes.string,
    avatar: PropTypes.any,
  }),
};

function NotificationItem({ notification }) {
  const { avatar, message } = renderContent(notification);
  const navigate = useNavigate();

  const handleReadStatus = async () => {
    try {
      const response = await api.put(
        `${ENV.appBaseUrl}/notification/${notification?._id}`
      );

      if (response?.data?.success) {
        navigate(`/dashboard/logs/${response?.data?.notification?._id}`);
      } else {
        toast.error(response?.data?.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
      console.error("API error:", error);
    }
  };
  return (
    <ListItemButton
      sx={{
        py: 1.5,
        px: 2.5,
        mt: "1px",
        ...(notification?.read && {
          bgcolor: "action.selected",
        }),
      }}
      onClick={handleReadStatus}
    >
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: "background.neutral" }}>{avatar}</Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={message}
        secondary={
          <Typography
            variant="caption"
            sx={{
              mt: 0.5,
              display: "flex",
              alignItems: "center",
              color: "text.disabled",
            }}
          >
            <Iconify
              icon="eva:clock-outline"
              sx={{ mr: 0.5, width: 16, height: 16 }}
            />
            {formatToNow(notification?.createdAt)}
          </Typography>
        }
      />
    </ListItemButton>
  );
}

// ----------------------------------------------------------------------

function renderContent(notification) {
  const message = (
    <Typography variant="subtitle2">
      {notification?.action}
      <Typography
        component="span"
        variant="body2"
        sx={{ color: "text.secondary" }}
      >
        &nbsp; {noCase(notification?.message)}
      </Typography>
    </Typography>
  );

  if (notification?.read === "Read") {
    return {
      avatar: (
        <img
          alt={notification?.message}
          src={`${ENV.appClientUrl}assets/icons/ic_notification_mail.svg`}
        />
      ),
      message,
    };
  }
  return {
    avatar: (
      <img
        alt={notification?.message}
        src={`${ENV.appClientUrl}assets/icons/ic_notification_chat.svg`}
      />
    ),
    message,
  };
}
