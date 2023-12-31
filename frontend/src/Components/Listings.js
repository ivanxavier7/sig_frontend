import React, { useState, useEffect } from "react";
import Axios from "axios";
import { useImmerReducer } from "use-immer";
import { useNavigate, useParams } from "react-router-dom";

// React leaflet
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Polygon,
  useMap,
} from "react-leaflet";
import { Icon } from "leaflet";
// MUI
import { createTheme, ThemeProvider } from "@mui/material/styles";
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
  IconButton,
  CardActions,
  ToggleButton,
  ToggleButtonGroup,
  Slider,
  Box,
  Fab,
  FormGroup,
  FormControlLabel,
  Checkbox,
  ButtonGroup,
  Chip,
} from "@mui/material";

import RoomIcon from "@mui/icons-material/Room";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
//Filter Card Icons
import HikingIcon from "@mui/icons-material/Hiking";
import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";
import DriveEtaIcon from "@mui/icons-material/DriveEta";
import SatelliteAltIcon from "@mui/icons-material/SatelliteAlt";
import MapIcon from "@mui/icons-material/Map";
//Choose starting place Button Icon
import HomeIcon from "@mui/icons-material/Home";
// Map icons
import curricularIconPng from "./Assets/Mapicons/curricular.png";
import profissionalIconPng from "./Assets/Mapicons/profissional.png";
import voluntarioIconPng from "./Assets/Mapicons/voluntario.png";
// Assets
import img1 from "./Assets/img1.jpg";
import myListings from "./Assets/Data/Dummydata";

import { useCallback, useMemo, useRef } from "react";

function Listings() {
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [userMarker, setUserMarker] = useState(null);

  const fetchUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setLocation(userLocation);
          setUserMarker(userLocation); // meter o marker
          console.log(
            "COORDS = " +
              position.coords.latitude +
              "latitude:" +
              position.coords.longitude
          );
        },
        (error) => {
          console.error("Error occurred: " + error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  let counter = 0;
  const limit = 11;
  const params = useParams();
  //Funcao do button group dos filtros, mudar para mostrar os tempos diferentes - Tomás
  const ref = React.useRef(null);
  const [alignment, setAlignment] = React.useState("web");
  const skillMapping = {
    programming_lang_python: "Python",
    programming_lang_java: "Java",
    programming_lang_c_1: "C e C++",
    programming_lang_c_2: "C#",
    programming_lang_javascript: "JavaScript",
    programming_lang_sql: "SQL",
    programming_lang_php: "PHP",
    programming_lang_go: "Go",
    programming_lang_kotlin: "Kotlin",
    programming_lang_matlab: "MATLAB",
    programming_lang_swift: "Swift",
    programming_lang_rust: "Rust",
    programming_lang_ruby: "Ruby",
    programming_lang_dart: "Dart",
    programming_lang_scala: "Scala",
    programming_fw_frontend_angular: "Angular",
    programming_fw_frontend_jquery: "jQuery",
    programming_fw_frontend_react: "React",
    programming_fw_frontend_ruby: "Ruby on Rails",
    programming_fw_frontend_vuejs: "Vue.js",
    programming_fw_backend_aspnet: "ASP.Net",
    programming_fw_backend_django: "Django",
    programming_fw_backend_express: "Express",
    programming_fw_backend_laravel: "Laravel",
    programming_fw_backend_nodejs: "Node.js",
    programming_fw_backend_spring: "Spring",
  };
  const normalMap =
    "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png";
  const satelliteMap =
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

  const [mapLayer, setMapLayer] = React.useState(true);

  useEffect(() => {
    if (ref.current) {
      ref.current.setUrl(mapLayer ? satelliteMap : normalMap);
    }
  }, [mapLayer]);

  const handleChange = (event, newAlignment) => {
    setAlignment(newAlignment);
  };

  const navigate = useNavigate();
  const curricularIcon = new Icon({
    iconUrl: curricularIconPng,
    iconSize: [40, 40],
  });

  const profissionalIcon = new Icon({
    iconUrl: profissionalIconPng,
    iconSize: [40, 40],
  });

  const voluntarioIcon = new Icon({
    iconUrl: voluntarioIconPng,
    iconSize: [40, 40],
  });
  const initialState = {
    mapInstance: null,
  };

  function ReducerFuction(draft, action) {
    switch (action.type) {
      case "getMap":
        draft.mapInstance = action.mapData;
        break;
    }
  }

  const [state, dispatch] = useImmerReducer(ReducerFuction, initialState);

  function TheMapComponent() {
    const map = useMap();
    dispatch({ type: "getMap", mapData: map });
    return null;
  }

  const [allListings, setAllListings] = useState([]);
  const [dataIsLoading, setDataIsLoading] = useState(true);
  const [transportMode, setTransportMode] = useState("driving-car"); // define modo de transporte
  const [tempoViagem, setTempoViagem] = useState(30); // initial value
  const [filteredResults, setFilteredResults] = useState(allListings);
  //mensagem de erro
  const [errorMsg, setErrorMsg] = useState("");
  const [errorColor, setErrorColor] = useState("#9e9e9e");

  useEffect(() => {
    const source = Axios.CancelToken.source();
    async function GetAllListings() {
      try {
        const response = await Axios.get(
          "https://www.uaestagios.com/api/listings/",
          { cancelToken: source.token }
        );

        setAllListings(response.data);
        setFilteredResults(response.data); // filteredResults
        setDataIsLoading(false);
      } catch (error) {}
    }
    GetAllListings();
    return () => {
      source.cancel();
    };
  }, []);

  useEffect(() => {
    async function GetListingInfo() {
      try {
        const response = await Axios.get(
          `https://www.uaestagios.com/api/listings/${params.id}/`
        );

        dispatch({
          type: "catchListingInfo",
          listingObject: response.data,
        });
      } catch (e) {}
    }
    GetListingInfo();
  }, []);

  if (dataIsLoading === true) {
    return (
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        style={{ height: "10vh" }}
      >
        <CircularProgress />
      </Grid>
    );
  }

  const theme = createTheme({
    palette: {
      primary: {
        main: "#73A800",
      },
      secondary: {
        main: "#ffffff",
      },
      error: {
        main: "#e57373",
      },
      divider: "#73A800",
    },
  });

  function valuetext(value) {
    return `${value} minutos`;
  }

  function FlyToUserMarker({ userMarker }) {
    const map = useMap();

    React.useEffect(() => {
      if (userMarker) {
        map.flyTo([userMarker.latitude, userMarker.longitude], map.getZoom());
      }
    }, [userMarker, map]);

    return null;
  }

  async function fetchMatrixData() {
    if (userMarker === null) {
      setErrorMsg("Localização não definida!");
      setErrorColor("#f44336");
      return;
    }

    try {
      setErrorMsg("O tempo de viagem é em minutos");
      setErrorColor("#9e9e9e");
      // dar fetch aos listings
      const response = await Axios.get("https://www.uaestagios.com/api/listings/");
      const listings = response.data;

      // preparar dados para request (posição do utilizador)
      const locations = [[userMarker.longitude, userMarker.latitude]];

      console.log("LOCATION" + locations);
      const listingIDs = [];
      listings.forEach((listing) => {
        locations.push([listing.longitude, listing.latitude]);
        listingIDs.push(listing.id);
      });

      // preparar POST
      const postData = {
        locations,
        metrics: ["duration"],
        units: "km",
        sources: [0],
      };

      // dar fetch ao matrix do API e mandar header com API key (encriptar(?) depois para n ser visivel no front end)
      const matrixResponse = await Axios.post(
        `https://api.openrouteservice.org/v2/matrix/${transportMode}`,
        postData,
        {
          headers: {
            Authorization:
              "5b3ce3597851110001cf62488b0d6f5e08f64786b7d400a1ec74d4ac",
            "Content-Type": "application/json",
            Accept:
              "application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8",
          },
        }
      );

      // filtar por destino [0] e extrair tempo que demora
      const times = matrixResponse.data.durations[0];
      console.log(times);
      console.log(transportMode);

      // filtar listings < tempo
      const filteredListings = listings.filter((listing, index) => {
        // converter de segundos para minutos
        const travelTimeMinutes = times[index + 1] / 60;
        console.log("Listing: " + listing + " Tempo:" + travelTimeMinutes);
        return travelTimeMinutes > 0 && travelTimeMinutes <= tempoViagem;
      });

      console.log("Listings Filtrados <= tempo " + filteredListings);
      //mandar para hook e mostrar so listings filtrados
      setFilteredResults(filteredListings);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <Grid container>
        <Grid item xs={4} className="custom-body-listings">
          {filteredResults.map((listing) => {
            let counter = 0;
            return (
              <Card
                className="internship-info-card component-box-shadow"
                key={listing.id}
                style={{
                  cursor: "pointer",
                  backgroundImage: `url(${listing.picture1})`,
                  display: "flex", // Set the Card as a flex container
                  flexDirection: "column", // Set direction of elements inside card as column
                }}
              >
                <CardHeader
                  action={
                    <IconButton
                      color="secondary"
                      aria-label="settings"
                      onClick={() =>
                        state.mapInstance.flyTo(
                          [listing.latitude, listing.longitude],
                          16
                        )
                      }
                    >
                      <RoomIcon />
                    </IconButton>
                  }
                  title={
                    <Box>
                      <Typography
                        className="internship-card-title"
                        onClick={() => navigate(`/listings/${listing.id}`)}
                        variant="h4"
                        color="secondary"
                      >
                        {listing.seller_agency_name}
                      </Typography>
                      <Typography
                        className="internship-card-subtitle"
                        onClick={() => navigate(`/listings/${listing.id}`)}
                        variant="h5"
                        color="secondary"
                      >
                        {listing.title}
                      </Typography>
                    </Box>
                  }
                />
                {/* 
                <CardMedia
                  className="internship-card-image"
                  component="img"
                  image={listing.picture1}
                  alt={listing.title}
                  onClick={() => navigate(`/listings/${listing.id}`)}
                />
                */}
                <CardContent
                  style={{ flexGrow: 1 }}
                  onClick={() => navigate(`/listings/${listing.id}`)}
                >
                  <Typography variant="body1">
                    Estágio {listing.listing_type}{" "}
                    {listing.total_hours && `- ${listing.total_hours} horas`}
                  </Typography>
                  <Typography variant="body1">
                    {listing.internship_status}
                  </Typography>
                  <Typography variant="body2">
                    {listing.description.length > 100
                      ? `${listing.description.substring(0, 100)}...`
                      : listing.description}
                  </Typography>
                </CardContent>
                <CardActions
                  onClick={() => navigate(`/listings/${listing.id}`)}
                  disableSpacing
                >
                  {/* 
                  <IconButton aria-label="add to favorites">
                    {listing.seller_agency_name}
                  </IconButton>
                  */}
                  <Grid container spacing={1}>
                    {Object.keys(skillMapping).map((skill) => {
                      if (counter >= limit) return null;
                      if (listing[skill]) {
                        counter++;
                        return (
                          <Grid item>
                            <Chip
                              label={skillMapping[skill]}
                              color="primary"
                              className={`${skillMapping[skill]
                                .toLowerCase()
                                .replace(/\s+/g, "")
                                .replace(/\./g, "")} chip-text-color`}
                            />
                          </Grid>
                        );
                      }
                      return null;
                    })}
                    {counter === limit ? (
                      <Grid item>
                        <Chip
                          label="..."
                          color="primary"
                          className="chip-text-color"
                        />
                      </Grid>
                    ) : null}
                  </Grid>
                </CardActions>
              </Card>
            );
          })}
        </Grid>

        <Grid item xs={8} style={{ position: "relative" }}>
          <AppBar position="sticky">
            <div style={{ height: "100vh" }}>
              <div className="filter-container">
                <div id="filter-sub-container">
                  <Card className="filter-card">
                    <CardContent sx={{ padding: 0 }}>
                      <ToggleButtonGroup
                        sx={{ width: "100%" }}
                        color="primary"
                        value={alignment}
                        exclusive
                        onChange={(event, newMode) => {
                          handleChange(event, newMode);
                          if (newMode) {
                            let newTransportMode;
                            switch (newMode) {
                              case "walking":
                                newTransportMode = "foot-walking"; //caminhar
                                break;
                              case "bike":
                                newTransportMode = "cycling-regular"; //bicicleta
                                break;
                              case "driving":
                                newTransportMode = "driving-car"; //carro
                                break;
                              default:
                                newTransportMode = "driving-car";
                            }
                            setTransportMode(newTransportMode);
                          }
                        }}
                        aria-label="Platform"
                      >
                        <ToggleButton
                          value="walking"
                          sx={{ flexGrow: 1, width: "33.33%" }}
                        >
                          <Box
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                          >
                            <HikingIcon />
                            <Typography variant="body2" sx={{ fontSize: 13 }}>
                              A pé
                            </Typography>
                          </Box>
                        </ToggleButton>
                        <ToggleButton
                          value="bike"
                          sx={{
                            flexGrow: 1,
                            width: "33.33%",
                          }}
                        >
                          <Box
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                            sx={{
                              paddingLeft: "20px",
                              paddingRight: "20px",
                            }}
                          >
                            <DirectionsBikeIcon />
                            <Typography variant="body2" sx={{ fontSize: 13 }}>
                              Bicicleta
                            </Typography>
                          </Box>
                        </ToggleButton>
                        <ToggleButton
                          value="driving"
                          sx={{ flexGrow: 1, width: "33.33%" }}
                        >
                          <Box
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                          >
                            <DriveEtaIcon />
                            <Typography variant="body2" sx={{ fontSize: 13 }}>
                              Carro
                            </Typography>
                          </Box>
                        </ToggleButton>
                      </ToggleButtonGroup>
                      <div className="filter-card-content">
                        <Typography
                          sx={{ fontSize: 14, mt: "15px", mb: 0 }}
                          color="text.secondary"
                          gutterBottom
                        >
                          Tempo de viagem
                        </Typography>
                        <Slider
                          aria-label="TempoViagem"
                          defaultValue={30}
                          getAriaValueText={valuetext}
                          valueLabelDisplay="auto"
                          step={10}
                          marks
                          min={10}
                          max={120}
                          value={tempoViagem} // bind the state variable to the value
                          onChange={(event, newValue) =>
                            setTempoViagem(newValue)
                          } // update the state when the value changes
                        />
                        <FormGroup>
                          <Typography
                            sx={{ fontSize: 14 }}
                            variant="body1"
                            color={errorColor}
                          >
                            {errorMsg || "O tempo de viagem é em minutos"}
                          </Typography>
                        </FormGroup>
                      </div>
                    </CardContent>
                    <CardActions id="filter-card-bottom" color="error">
                      <Button variant="text" onClick={fetchMatrixData}>
                        Aplicar
                      </Button>
                      <Button
                        variant="text"
                        onClick={() => setFilteredResults(allListings)}
                      >
                        Reset
                      </Button>
                    </CardActions>
                  </Card>

                  <ButtonGroup
                    fullWidth="true"
                    id="filter-button-group"
                    variant="contained"
                    aria-label="outlined primary button group"
                  >
                    <Button
                      onClick={fetchUserLocation}
                      className="starting-point-button "
                      color="secondary"
                    >
                      <HomeIcon color="primary" />
                      <Typography
                        variant="body1"
                        sx={{ fontSize: 14, fontWeight: "500" }}
                        color="primary"
                      ></Typography>
                    </Button>

                    <Button
                      className="map-layer-button"
                      color="secondary"
                      onClick={() => setMapLayer(!mapLayer)}
                    >
                      <MapIcon />
                    </Button>
                  </ButtonGroup>
                  {/* 
                  <Fab
                    className="starting-point-button"
                    variant="extended"
                    size="small"
                    color="primary"
                    aria-label="add"
                  >
                    <HomeIcon sx={{ mr: 2 }} />
                    ponto de partida
                  </Fab>
                  */}
                </div>
                {/* 
                <Fab
                  className="map-layer-button"
                  variant=""
                  size="small"
                  color="secondary"
                  aria-label="add"
                  onClick={() => setMapLayer(!mapLayer)}
                >
                  <MapIcon />
                </Fab>
                 */}
              </div>
              <MapContainer
                center={[40.574436706354, -8.44588251531503]}
                zoom={12}
                scrollWheelZoom={true}
              >
                <FlyToUserMarker userMarker={userMarker} />
                <TileLayer
                  ref={ref}
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url={mapLayer ? normalMap : satelliteMap}
                />
                <TheMapComponent />

                {filteredResults.map((listing) => {
                  function IconDisplay() {
                    if (listing.listing_type === "Curricular") {
                      return curricularIcon;
                      return curricularIcon;
                    } else if (listing.listing_type === "Profissional") {
                      return profissionalIcon;
                      return profissionalIcon;
                    } else if (listing.listing_type === "Voluntário") {
                      return voluntarioIcon;
                    }
                  }

                  return (
                    <Marker
                      key={listing.id}
                      icon={IconDisplay()}
                      position={[listing.latitude, listing.longitude]}
                    >
                      <Popup>
                        <Typography variant="h5">{listing.title}</Typography>
                        <img
                          src={listing.picture1}
                          style={{
                            height: "14rem",
                            width: "18rem",
                            cursor: "pointer",
                          }}
                          onClick={() => navigate(`/listings/${listing.id}`)}
                        />
                        <Typography variant="body1">
                          {listing.description.substring(0, 150)}...
                        </Typography>
                        <Button
                          variant="contained"
                          fullWidth
                          onClick={() => navigate(`/listings/${listing.id}`)}
                        >
                          Details
                        </Button>
                      </Popup>
                    </Marker>
                  );
                })}

                {userMarker && (
                  <Marker
                    position={[userMarker.latitude, userMarker.longitude]}
                    draggable={true}
                    eventHandlers={{
                      dragend: (event) => {
                        const newLatLng = event.target.getLatLng();
                        setUserMarker({
                          latitude: newLatLng.lat,
                          longitude: newLatLng.lng,
                        });
                        console.log(
                          userMarker.latitude +
                            "longitude:" +
                            userMarker.longitude
                        );
                      },
                    }}
                  >
                    <Popup>A tua casa esta aqui!</Popup>
                  </Marker>
                )}
              </MapContainer>
            </div>
          </AppBar>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}

export default Listings;
