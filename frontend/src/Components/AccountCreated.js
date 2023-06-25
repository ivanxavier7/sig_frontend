import React, { useEffect, useContext } from "react";
import Axios from "axios";
import { useNavigate } from "react-router-dom";
import { useImmerReducer } from "use-immer";
// MUI
import {
	Grid,
	AppBar,
	Typography,
	Button,
	Card,
	CardHeader,
	CardMedia,
	CardContent,
	CircularProgress,
	TextField,
	Snackbar,
	Alert,
} from "@mui/material";

// Contexts
import DispatchContext from "../Contexts/DispatchContext";
import StateContext from "../Contexts/StateContext";

function AccountCreated() {
	const navigate = useNavigate();

	const GlobalDispatch = useContext(DispatchContext);
	const GlobalState = useContext(StateContext);

	return (
		<div
			className="custom-body custom-spacer"
		>
			<Typography variant="h4">
			Obrigado por inscrever-se! Para ativar sua conta, clique no link
			que foi enviado por email!
			</Typography>
		</div>
	);
}

export default AccountCreated;
