import React from 'react';
import Checkbox from '@mui/material/Checkbox';
import SvgIcon from '@mui/material/SvgIcon';
import { useTheme } from '@mui/material/styles';

const UncheckedIcon = (props) => {
    const theme = useTheme();

    return (
        <SvgIcon {...props}>
            <circle cx="12" cy="12" r="11" stroke={theme.palette.primary.main} strokeWidth="2" fill="none" />
        </SvgIcon>
    );
};

const CheckedIcon = (props) => {
    const theme = useTheme();

    return (
        <SvgIcon {...props}>
            <circle cx="12" cy="12" r="11" stroke={theme.palette.primary.main} strokeWidth="2" fill="none" />
            <path d="M4 12l5 5L20 6" stroke="green" strokeWidth="3" fill="none" />
        </SvgIcon>
    );
};

export default function CustomCheckbox(props) {
    return (
        <Checkbox
            icon={<UncheckedIcon />}
            checkedIcon={<CheckedIcon />}
            {...props}
        />
    );
}
