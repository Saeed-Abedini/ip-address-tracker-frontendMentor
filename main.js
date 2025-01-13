const searchForm = document.querySelector(".search-form");
const submitBtn = document.querySelector(".submit-btn");
const locationTitle = document.querySelector(".location-title");
const ipAddress = document.querySelector("#ipAddress");
const countryLocation = document.querySelector("#location");
const timezone = document.querySelector("#timezone");
const isp = document.querySelector("#isp");

let map, marker;
const customIcon = L.icon({
  iconUrl: "./images/icon-location.svg",
  iconSize: [35, 45],
});

const setLoadingState = (isLoading) => {
  submitBtn.style.backgroundColor = isLoading ? "hsl(0, 0%, 17%)" : "black";
  submitBtn.style.cursor = isLoading ? "not-allowed" : "pointer";
  submitBtn.disabled = isLoading;
  submitBtn.querySelector(".fa-spinner").style.display = isLoading
    ? "inline-block"
    : "none";
  submitBtn.querySelector(".fa-angle-right").style.display = isLoading
    ? "none"
    : "inline-block";
};

const updateLocationInfo = ({
  ip,
  country_name,
  city,
  time_zone,
  isp: ispData,
  country_flag,
  latitude,
  longitude,
}) => {
  ipAddress.textContent = ip || "-";
  countryLocation.textContent = `${country_name || "-"}, ${city || "-"}`;
  timezone.textContent = "UTC " + time_zone.offset || "-";
  isp.textContent = ispData || "-";

  const existingFlag = document.getElementById("countryFlag");
  if (existingFlag) existingFlag.remove();
  if (country_flag) {
    const img = document.createElement("img");
    img.id = "countryFlag";
    img.alt = "Country flag";
    img.src = country_flag;
    locationTitle.appendChild(img);
  }

  if (!map) {
    map = L.map("map").setView([latitude, longitude], 16);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
  } else {
    map.setView([latitude, longitude], 16);
  }

  if (marker) marker.remove();
  marker = L.marker([latitude, longitude], { icon: customIcon }).addTo(map);
};

const getUserData = async (customIp = "") => {
  setLoadingState(true);
  try {
    const response = await fetch(
      `https://api.ipgeolocation.io/ipgeo?apiKey=977cd59e01f145e08c675be02182de98&ip=${customIp}`
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const location = await response.json();
    updateLocationInfo(location);
  } catch (error) {
    console.error("Error fetching location:", error);
    alert(
      "Error fetching data or the IP address entered is incorrect. Please check and try again."
    );
  } finally {
    setLoadingState(false);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  getUserData();
});

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let input = document.querySelector(".search-input").value.trim();

  input = input.replace(/^https?:\/\//, "");

  function isValidIP(str) {
    const regex =
      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return regex.test(str);
  }

  if (isValidIP(input)) {
    getUserData(input);
  } else {
    // Convert domain to IP address
    fetch(`http://ip-api.com/json/${input}`)
      .then((response) => response.json())
      .then((data) => {
        const ip = data.query;
        getUserData(ip);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
});
