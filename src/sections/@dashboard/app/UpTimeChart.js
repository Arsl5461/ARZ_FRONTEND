import React from 'react';
import ReactApexChart from 'react-apexcharts';

const UptimeChart = ({ data }) => {
  const chartOptions = {
    chart: {
      id: 'response-time',
      group: 'uptime-monitor',
      type: 'line',
      height: 400,
      width: '100%',
    },
    xaxis: {
      categories: [
        '14:00',
        '16:00',
        '18:00',
        '20:00',
        '22:00',
        '00:00',
        '02:00',
        '04:00',
        '06:00',
        '08:00',
        '10:00',
        '12:00',
      ],
    },
  };

  return <ReactApexChart options={chartOptions} series={data} type="line" height={400} width="100%" />;
};

export default UptimeChart;
