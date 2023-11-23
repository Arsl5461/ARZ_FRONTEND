import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
// @mui
import { Grid, Container, CircularProgress, Typography } from "@mui/material";
import { toast } from "react-toastify";
import { ENV } from "../config/config";
// sections
import { AppCurrentVisits, AppWidgetSummary } from "../sections/@dashboard/app";
import api from "../config/axios-instance";

// ----------------------------------------------------------------------
/**
 * Dashboard Component.
 *
 * All rights Reseverd | Arhamsoft Pvt @2023
 *
 * @returns {JSX.Element} - JSX representation of the component.
 */
export default function DashboardAppPage() {
  // Initialization and state management
  const token = JSON.parse(localStorage.getItem("token"));
  const [dashboard, setDashboard] = useState();
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Fetch Dashboard data from API
   *
   * Author: Ali Haider
   * Date: 12 sep, 2023
   *
   * This function is responsible for fetching dashboard data from an API endpoint. It performs the following actions:
   * 1. Sets the loading state to indicate that data retrieval is in progress.
   * 2. Sends a GET request to the API's dashboard endpoint, including the user's authorization token and specifying the content type.
   * 3. If the response from the API contains a "success" property:
   *    - Sets the dashboard state with the retrieved dashboard data.
   *    - Sets the loading state to indicate that data retrieval is complete.
   * 4. If the response does not indicate success:
   *    - Displays an error message to the user using a toast notification.
   *    - Sets the loading state to indicate that data retrieval is complete.
   * 5. In case of any error during the process (e.g., network issues or server errors):
   *    - Logs the error for debugging purposes.
   *    - Displays an error message to the user using a toast notification.
   */
  async function FetchData() {
    setIsLoading(true);
    try {
      const response = await api.get(`${ENV.appBaseUrl}/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response?.data?.success) {
        setDashboard(response?.data?.dashboardData);
        setIsLoading(false);
      } else {
        toast.error(response?.data?.message);
        setIsLoading(false);
      }
    } catch (error) {
      console.log("Error", error);
      toast.error(error?.response?.data?.message);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    // Initial data fetch
    FetchData();
  }, []);

  /**
   * Renders a Material-UI CircularProgress spinner when the loader is active.
   *
   * @returns {JSX.Element} CircularProgress spinner if loader is active, otherwise null.
   *
   * Author: Ali Haider
   * Date: 31 Oct, 2023
   */
  if (isLoading) {
    return (
      <div className="spinner-wrapper">
        <CircularProgress value={100} />
      </div>
    );
  }
  return (
    <>
      <Helmet>
        <title> Dashboard </title>
      </Helmet>
      <Container className="dashboard_width">
        <Typography variant="h4" sx={{ mb: 5 }} style={{ color: "#078CDD" }}>
          Dashboard
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Link to="/dashboard/users" className="dash_box">
              <div className="box_wrapper user_box_wraper">
                {" "}
                <AppWidgetSummary
                  style={{
                    backgroundColor: "unset",
                    margin: "0",
                    padding: "0",
                  }}
                  className=""
                  total={dashboard?.totalUser}
                  icon={"ic_user"}
                  color="info"
                />
                <p className="total_user green_color">Total Users</p>
              </div>
            </Link>
          </Grid>
          {/* <Grid item xs={12} sm={6} md={2.4}>
                        <Link to="/dashboard/domains" className="dash_box">
                            <div className="box_wrapper domain_box_wraper">
                                {' '}
                                <AppWidgetSummary
                                    style={{ backgroundColor: 'unset', margin: '0', padding: '0' }}
                                    total={dashboard?.totalDomains}
                                    color="info"
                                    icon={'ic_user'}
                                />
                                <p className="total_user brown_color">Active Users</p>
                            </div>
                        </Link>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <Link to="/dashboard/users" className="dash_box">
                            <div className="box_wrapper user_box_wraper">
                                {' '}
                                <AppWidgetSummary
                                    style={{ backgroundColor: 'unset', margin: '0', padding: '0' }}
                                    className=""
                                    total={dashboard?.totalUser}
                                    icon={'ic_user'}
                                    color="info"
                                />
                                <p className="total_user green_color">New Deposit Request</p>
                            </div>
                        </Link>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <Link to="/dashboard/ssl" className="dash_box">
                            <div className="box_wrapper ssl_box_wraper">
                                {' '}
                                <AppWidgetSummary
                                    style={{ backgroundColor: 'unset', margin: '0', padding: '0' }}
                                    total={dashboard?.websiteSslNonExpiredCount}
                                    color="success"
                                    icon={'activeSsl'}
                                />
                                <p className="total_user light_blue">Approved Deposit</p>
                            </div>
                        </Link>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <Link to="/dashboard/uptime-monitor?errorsLog=up" className="dash_box">
                            <div className="box_wrapper user_box_wraper">
                                {' '}
                                <AppWidgetSummary
                                    style={{ backgroundColor: 'unset', margin: '0', padding: '0' }}
                                    className=""
                                    total={dashboard?.upMonitors}
                                    icon={'timer'}
                                    color="info"
                                />
                                <p className="total_user green_color">New Withdrawal Request</p>
                            </div>
                        </Link>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <Link to="/dashboard/users" className="dash_box">
                            <div className="box_wrapper user_box_wraper">
                                {' '}
                                <AppWidgetSummary
                                    style={{ backgroundColor: 'unset', margin: '0', padding: '0' }}
                                    className=""
                                    total={dashboard?.totalUser}
                                    icon={'ic_user'}
                                    color="info"
                                />
                                <p className="total_user green_color">Total Partner</p>
                            </div>
                        </Link>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <Link to="/dashboard/uptime-monitor?errorsLog=down" className="dash_box">
                            <div className="box_wrapper expiry_box_wraper">
                                {' '}
                                <AppWidgetSummary
                                    style={{ backgroundColor: 'unset', margin: '0', padding: '0' }}
                                    total={dashboard?.downMonitors}
                                    color="error"
                                    icon={'timer'}
                                />
                                <p className="total_user marron_color">New complaint</p>
                            </div>
                        </Link>
                    </Grid>   
                    <Grid item xs={12} sm={6} md={2.4}>
                        <Link to="/dashboard/ssl?sslExpired=true" className="dash_box">
                            <div className="box_wrapper exprry_ssl_box_wraper">
                                {' '}
                                <AppWidgetSummary
                                    style={{ backgroundColor: 'unset', margin: '0', padding: '0' }}
                                    total={dashboard?.websiteSslExpiredCount}
                                    color="error"
                                    icon={'expiresdSsl'}
                                />
                                <p className="total_user dark_blue">Trade Inprogress</p>
                            </div>
                        </Link>
                    </Grid> 
                     <Grid item xs={12} sm={6} md={2.4}>
                        <Link to="/dashboard/users" className="dash_box">
                            <div className="box_wrapper user_box_wraper">
                                {' '}
                                <AppWidgetSummary
                                    style={{ backgroundColor: 'unset', margin: '0', padding: '0' }}
                                    className=""
                                    total={dashboard?.totalUser}
                                    icon={'ic_user'}
                                    color="info"
                                />
                                <p className="total_user green_color">Completed trades</p>
                            </div>
                        </Link>
                    </Grid>                */}
        </Grid>
        {/* <Grid container spacing={2} className='mt-25' >
                <Grid xs={12} md={6} lg={6}>
                    <div className='domain_box_expiry'>
                    <AppCurrentVisits
                            title="Domains"
                            chart={{
                                series: [
                                    { label: 'Active Domains', value: dashboard?.totalDomains },
                                    { label: 'Expiry Domains', value: dashboard?.expireDomains },

                                ],
                            }}
                        />
                    </div>
                     
                    </Grid>
                    <Grid xs={12} md={6} lg={6}>
                        <div className='ssl_expiry_box'>
                        <AppCurrentVisits
                            title="SSL"
                            chart={{
                                series: [
                                    { label: 'Active SSL', value: dashboard?.websiteSslNonExpiredCount },
                                    { label: 'Expiry SSL', value: dashboard?.websiteSslExpiredCount },

                                ],
                            }}
                        />
                        </div>
                    
                    </Grid>
                </Grid> */}
      </Container>
    </>
  );
}
