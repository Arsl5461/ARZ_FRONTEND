import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import ReactApexChart from 'react-apexcharts';
import { Breadcrumbs, Button, CircularProgress, Grid, Typography } from '@mui/material';
import Iconify from '../../components/iconify';
import api from '../../config/axios-instance';
import { ENV } from '../../config/config';

/**
 * View Graph Uptime Monitor Component.
 *
 * All rights Reseverd | Arhamsoft Pvt @2023
 *
 * @returns {JSX.Element} - JSX representation of the component.
 */
function ViewGraph() {

    const { id } = useParams()
    const navigate = useNavigate();

    const [loader, setLoader] = useState(true);
    const [monitor, setMonitor] = useState([]);
    const [avg, setAvg] = useState(null);
    const [avgUp, setAvgUp] = useState(null);
    const [timestamps, setTimestamps] = useState([]); // Define timestamps state
    const [responseTimes, setResponseTimes] = useState([]); // Define responseTimes state


    async function fetchMonitor() {
        setLoader(true);
        try {
            const response = await api.get(`${ENV.appBaseUrl}/monitor-logs/${id}`);
            if (response?.data?.success) {
                const monitorLogs = response?.data?.monitorLogs || [];
                setAvg(response?.data?.averageResponseTime);
                setAvgUp(response?.data?.averageResponseUpTime)
                setMonitor(monitorLogs);

                const extractedTimestamps = monitorLogs?.map((item) => new Date(item?.createdAt));
                const extractedResponseTimes = monitorLogs?.map((item) => item?.responseTime);
                setTimestamps(extractedTimestamps);
                setResponseTimes(extractedResponseTimes);
                setLoader(false);
            } else {
                toast.error(response?.data?.message);
                setLoader(false);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message);
            setLoader(false);
        }
    }

    useEffect(() => {
        // Initial data fetch
        fetchMonitor();
    }, []);


    // Calculate the time range
    const maxTimestamp = new Date(Math.max(...timestamps));
    const minTimestamp = new Date(maxTimestamp);
    minTimestamp.setHours(maxTimestamp.getHours() - 24);

    // Create an array of time labels for the x-axis with a two-hour delay
    const timeLabels = timestamps.map((timestamp) => {
        if (timestamp >= minTimestamp) {
            const labelDate = new Date(timestamp);
            labelDate.setHours(labelDate.getHours() );
            return labelDate.toLocaleTimeString();
        }
        return "";
    });

    // Create a data array that includes null values for points outside the 2-hour range
    const chartData = timestamps.map((timestamp, index) => {
        if (timestamp < minTimestamp) {
            return null;
        }
        return responseTimes[index];
    });


    // Define chart options
    const chartOptions = {
        chart: {
            id: 'response-time',
            group: 'uptime-monitor',
            type: 'line',
            height: 400,
            width: '100%',
        },
        xaxis: {
            categories: timeLabels,
            title: {
                style: {
                    color: '#ffffff',
                },
            },
            labels: {
                rotate: -45,
                style: {
                    colors: '#ffffff',
                },
            },
        },
        yaxis: {
            title: {
                text: 'Response Time (ms)',
                style: {
                    color: '#ffffff',
                },
            },
            labels: {

                style: {
                    colors: '#ffffff',
                },
            },
        },
    };

    const chartSeries = [
        {
            name: 'Response Time',
            data: chartData,
        },
    ];

    if (loader) {
        return (
            <div className="spinner-wrapper">
                <CircularProgress value={100} />
            </div>
        );
    }
    return (
        <div className="padding_px">
            <Grid container spacing={2}>
                <Grid item xs={12} md={12}>
                    <Typography variant="h4" gutterBottom>
                        <Button onClick={() => navigate('/dashboard')} className="back_btn" variant="contained">
                            <Iconify icon="bi:arrow-left" />
                        </Button>
                        Uptime Monitor
                        <div className="mt-10">
                            <Breadcrumbs aria-label="breadcrumb">
                                <Link className="domain_bread" to={'/dashboard'}>
                                    Dashboard
                                </Link>
                                <Link
                                    underline="hover"
                                    href="/material-ui/getting-started/installation/"
                                    className="domain_bread"
                                    to={'/dashboard/uptime-monitor'}
                                >
                                    Uptime Monitor
                                </Link>
                                <Typography color="text.primary"> View Graph </Typography>
                            </Breadcrumbs>
                        </div>
                    </Typography>
                    <div style={{ height: '700px', padding: '30px' }}>
                        <Grid container className='custome_container' maxWidth="lg" spacing={2}>
                            <Grid style={{ backgroundColor: '#333' }} item xs={12} md={6} lg={8}>
                                <Typography color="'tex't.primary" variant="h4">
                                    Uptime
                                </Typography>
                                <ul>
                                    <li
                                        style={{
                                            height: '20px',
                                            width: '100%',
                                            backgroundColor: 'green',
                                            marginBottom: '15px',
                                        }}
                                    />
                                </ul>
                                <div className='response_time white'>
                                    <h3>
                                        Response Time <small className='greenlgh'>last 24 hours ({avg}ms av.)</small>

                                    </h3>
                                </div>
                                <ReactApexChart options={chartOptions} series={chartSeries} type="line" height={400} width="100%" />
                            </Grid>
                            <Grid style={{ backgroundColor: '#333' }} item xs={12} md={6} lg={4}>
                                <div style={{ marginTop: '30px' }}>
                                 
                                    <div className='uptime_wrap inner-shadow'>
                                        <div className='signals_image' style={{ height: '50px', width: '70%', backgroundColor: '#333', color: 'white' }}>
                                            <img src="/assets/icons/signal.png" alt="signals" /> Up-Down Time
                                        </div>
                                        <h3 className='green_color'> {avgUp   || ""}%<span className='white'> (last 24 hours)</span></h3>
                                    </div>
                                </div>

                            </Grid>
                        </Grid>
                    </div>
                </Grid>
            </Grid>
        </div>
    );
}

export default ViewGraph;
