import React, {useState, useCallback} from "react";
import {
    Box,
    Container,
    CssBaseline,
    Avatar,
    Typography,
    TextField,
    Alert,
    Button,
} from "@mui/material";
import { LockOutlined } from "@mui/icons-material";
import {useSignIn} from "../hooks/useSignIn";




const Login = () => {

    const [formData, setFormData] = useState({ username: '', password: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const { onSignIn, error, isLoading } = useSignIn();



    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        const data = new FormData(e.currentTarget);

        await onSignIn(
            data.get('username'),
            data.get('password')
        );
    },
        []
    );

    return (
        <Container component="main" maxWidth="xs">
            {error && <Alert severity="error">{error}</Alert>}
            <CssBaseline />

            <Box
                sx={{
                    marginTop: 8,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
                    <LockOutlined />
                </Avatar>

                <Typography component="h1" variant="h5">
                    ResearchFusion
                </Typography>

                <Box
                    component="form"
                    noValidate
                    width={"100%"}
                    sx={{ mt: 1 }}

                    onSubmit={handleSubmit}
                >
                    <TextField
                        margin="normal"
                        fullWidth
                        label="Username"
                        variant="outlined"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        autoFocus
                    />
                    <TextField
                        margin="normal"
                        fullWidth
                        label="Password"
                        variant="outlined"
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={isLoading}
                    >
                        {isLoading ? "Loading ..." : "Log In"}
                    </Button>


                </Box>
            </Box>
        </Container>
    );
};


export default Login;