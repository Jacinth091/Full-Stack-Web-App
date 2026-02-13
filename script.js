let currentUser = null;

function navigateTo(hash) {
  // const urlHash =
  window.location.hash = hash;
  handleRouting();
}

// window.addEventListener("hashchange", (hash) => {
//   window.alert("Url  has changed!");
//   console.log(hash);
// });

function handleRouting() {
  const currentHash = "#" + window.location.hash.substring(2);
  console.log(currentHash);
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.remove("active");
  });

  const matchingPage = document.querySelector(currentHash);
  if (matchingPage) {
    matchingPage.classList.add("active");
  }
}

function setAuthState(isAuth, user) {}
