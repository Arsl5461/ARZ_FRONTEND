import React, { useEffect, useCallback, useState } from "react";

import {
  CardHeader,
  TextField,
  CircularProgress,
  Stack,
  Grid,
  CardContent,
  Card,
  Button,
  Typography,
} from "@mui/material"; // @mui
import { useForm } from "react-hook-form";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import { toast } from "react-toastify";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link, useNavigate } from "react-router-dom";
import api from "../../config/axios-instance";
import { ENV } from "../../config/config";
import { checkPermission } from "../../utils/Permissions";
import Iconify from "../../components/iconify";

const Create = () => {
  const questionSchema = yup.object().shape({
    question: yup
      .string()
      .required("Domain is Required")
      .trim()
      .min(3, "Domain Must be at Least 3 Characters Long"),
    awnser: yup.string().required("User is Required").trim(),
  });

  // Initialization and state management
  const navigate = useNavigate();
  const [integrationType, setIntegrationType] = useState("email");
  const [emailIntegration, setEmailIntegration] = useState({});
  const [smsIntegration, setSMSIntegration] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const authToken = JSON.parse(localStorage.getItem("token")); // Retrieve the authentication token from local storage

  // They are part of the schema, form management and validation logic for Email
  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(questionSchema),
  });
  return (
    <div>
      <Grid container spacing={2}>
        <Grid item xs={12} md={12}>
          <Stack spacing={1} direction="row" className="space-between">
            <Typography variant="h4" gutterBottom>
              <Button
                onClick={() => navigate("/dashboard")}
                className="back_btn"
                variant="contained"
              >
                <Iconify icon="bi:arrow-left" />
              </Button>
              FAQ'S
              <div className="mt-10">
                <Breadcrumbs aria-label="breadcrumb">
                  <Link
                    underline="hover"
                    to="/dashboard"
                    className="domain_bread"
                  >
                    Dashboard
                  </Link>
                  <Typography color="text.primary">FAQ'S</Typography>
                </Breadcrumbs>
              </div>
            </Typography>
          </Stack>

          <form>
            <Card sx={{ p: 2, height: "750px" }}>
              <CardHeader title="FAQ's" />
              <CardContent>
                <Grid container spacing={2}>
                  {" "}
                  <Grid item xs={12}>
                    {" "}
                    <TextField
                      {...registerEmail("question")}
                      defaultValue={emailIntegration?.user}
                      id="outlined-basic"
                      label="Question"
                      variant="outlined"
                      sx={{ width: "100%" }}
                      error={errors.question}
                      helperText={errors.question?.message}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      {...registerEmail("awnser")}
                      defaultValue={emailIntegration?.domain}
                      id="outlined-basic"
                      label="Answer"
                      variant="outlined"
                      multiline
                      rows={4}
                      sx={{ width: "100%" }}
                      error={errors.awnser}
                      helperText={errors.awnser?.message}
                    />
                  </Grid>
                </Grid>
              </CardContent>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "16px",
                  marginRight: "22px",
                }}
              >
                <Stack spacing={2} direction="row">
                  {checkPermission("Create-Email-Integration") ? (
                    <Button variant="contained" type="submit" color="primary">
                      {!emailIntegration?._id ? "Create" : "Update"}
                    </Button>
                  ) : (
                    ""
                  )}
                </Stack>
              </div>
            </Card>
          </form>
        </Grid>
      </Grid>
    </div>
  );
};

export default Create;
