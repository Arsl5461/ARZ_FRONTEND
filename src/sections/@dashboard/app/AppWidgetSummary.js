// @mui
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import { Card, Typography } from '@mui/material';
// utils
import { fShortenNumber } from '../../../utils/formatNumber';
// components
import SvgColor from '../../../components/svg-color';

// ----------------------------------------------------------------------

const StyledIcon = styled('div')(({ theme }) => ({
    margin: '0',
    display: 'flex',
    borderRadius: '50%',
    alignItems: 'center',
    width: theme.spacing(8),
    height: theme.spacing(8),
    justifyContent: 'center',
    marginRight: theme.spacing(3),
}));

// ----------------------------------------------------------------------

AppWidgetSummary.propTypes = {
    color: PropTypes.string,
    icon: PropTypes.string,
    title: PropTypes.string.isRequired,
    subheader: PropTypes.string.isRequired,
    total: PropTypes.number,
    sx: PropTypes.object,
};

export default function AppWidgetSummary({ title, total, subheader, icon, color = 'primary', sx, ...other }) {
    return (
        <Card
            sx={{
                py: 5,
                boxShadow: 0,
                textAlign: 'center',
                color: (theme) => theme.palette[color].darker,
                bgcolor: (theme) => theme.palette[color].lighter,
                ...sx,
            }}
            {...other}
        >
            <div className="flex items-center">
                <StyledIcon
                    sx={{
                        color: (theme) => theme.palette[color].dark,
                    }}
                >
                    <SvgColor src={`/assets/icons/navbar/${icon}.svg`} sx={{ width: 1, height: 1 }} />
                </StyledIcon>

                <Typography variant="h3">{fShortenNumber(total)}</Typography>
            </div>

            <div className="sub_header">{subheader}</div>
            <Typography variant="subtitle2" sx={{ opacity: 0.72 }} className="adsasd">
                {title}
            </Typography>
        </Card>
    );
}
