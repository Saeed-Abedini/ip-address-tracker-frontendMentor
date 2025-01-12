const searchForm = document.querySelector(".search-form");
const submitBtn = document.querySelector(".submit-btn");
const ipAddress = document.getElementById("ipAddress");
const countryLocation = document.getElementById("location");
const timezone = document.getElementById("timezone");
const isp = document.getElementById("isp");
const locationTitle = document.querySelector(".location-title");

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
  country,
  city,
  timezone_gmt,
  org,
  country_flag,
  latitude,
  longitude,
}) => {
  ipAddress.textContent = ip || "-";
  countryLocation.textContent = `${country || "-"}, ${city || "-"}`;
  timezone.textContent = timezone_gmt || "-";
  isp.textContent = org || "-";

  const existingFlag = document.getElementById("countryFlag");
  if (existingFlag) existingFlag.remove();
  if (country_flag) {
    const img = document.createElement("img");
    img.id = "countryFlag";
    img.src = country_flag;
    locationTitle.appendChild(img);
  }

  if (!map) {
    map = L.map("map").setView([latitude, longitude], 15);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
  } else {
    map.setView([latitude, longitude], 15);
  }

  if (marker) marker.remove();
  marker = L.marker([latitude, longitude], { icon: customIcon }).addTo(map);
};

const getUserData = async (customIp = "") => {
  setLoadingState(true);
  try {
    const response = await fetch(`https://ipwhois.app/json/${customIp}`);
    const location = await response.json();

    if (location.success) {
      updateLocationInfo(location);
    } else if (customIp.trim()) {
      alert(location.message); // Show alert only if a custom IP was provided
    }
  } catch (error) {
    console.error("Error fetching location:", error);
  } finally {
    setLoadingState(false);
  }
};

document.addEventListener("DOMContentLoaded", () => getUserData());

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  getUserData(document.querySelector(".search-input").value.trim());
});
