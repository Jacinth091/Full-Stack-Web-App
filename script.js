let currentUser = null;
const STORAGE_KEY = "ipt_demo_v1";

const admin = {
  id: Date.now(),
  first_name: "Admin User",
  last_name: "Admin",
  email: "admin@example.com",
  password: "Password123!",
  verified: true,
  role: "Admin",
};

loadFromStorage();
const adminExists = window.db.accounts.some((acc) => acc.email === admin.email);
if (!adminExists) {
  window.db.accounts.push(admin);
  saveToStorage();
}

function navigateTo(hash) {
  window.location.hash = hash;
}

window.addEventListener("load", () => {
  const currentLoggedEmail = localStorage.getItem("auth_token");
  if (currentLoggedEmail) {
    const user = window.db.accounts.find((u) => u.email === currentLoggedEmail);
    if (user) {
      setAuthState(true, user);
      configureNavbar(true, user);
      renderProfile();
    }
  }

  if (!window.location.hash) {
    window.location.hash = "#/home";
  } else {
    handleRouting();
  }
});
window.addEventListener("hashchange", () => {
  handleRouting();
});

function handleRouting() {
  let currentHash = window.location.hash;

  if (currentHash === "" || currentHash === "#/") {
    configureNavbar(false, null);
    currentHash = "#/home";
  }
  const targId = "#" + currentHash.replace("#/", "");

  document.querySelectorAll(".page").forEach((page) => {
    page.classList.remove("active");
  });

  const isAuthenticated = document.body.classList.contains("authenticated");
  if (!isAuthenticated && authenticatedRoutes(targId)) {
    window.alert("You are not authenticated, please login first.");
    window.location.hash = "#/home";
    return;
  }
  const isUserAdmin = currentUser?.role === "Admin";

  if (isAuthenticated && !isUserAdmin && adminPages(targId)) {
    window.alert("Invalid Request. Unauthorized User.");
    window.location.hash = isAuthenticated ? "#/profile" : "#/home";
    return;
  }
  try {
    const matchingPage = document.querySelector(targId);
    if (matchingPage) {
      matchingPage.classList.add("active");
    } else {
      console.warn("Page not found!");
      z;
    }
  } catch (error) {
    console.error("Invalid hash", targId);
    window.location.hash = "#/home";
    configureNavbar(false, null);
  }
}
function authenticatedRoutes(hash) {
  return (
    hash === "#profile" ||
    hash === "#account" ||
    hash === "#employee" ||
    hash === "#department" ||
    hash === "#request"
    // hash === "#verify"
  );
}
function adminPages(hash) {
  return hash === "#account" || hash === "#employee" || hash === "#department";
}

function setAuthState(isAuth, user) {
  const body = document.body;
  if (!isAuth) {
    body.className = "not_authenticated";
    body.classList.remove("is-admin");
    return;
  }

  currentUser = user;

  body.className = "authenticated";
  if (user.role === "Admin") {
    body.classList.add("is-admin");
  }
}

function configureNavbar(isAuth, user) {
  const authLink = document.getElementById("auth-link");
  const userLink = document.getElementById("user-link");
  const nameHolder = document.getElementById("name-holder");

  if (!isAuth) {
    authLink.classList.remove("d-none");
    authLink.classList.add("d-flex");
    userLink.classList.add("d-none");
    return;
  } else {
    authLink.classList.add("d-none");
    authLink.classList.remove("d-flex");
    userLink.classList.remove("d-none");
  }
  if (user && user.first_name) {
    nameHolder.textContent = user.first_name;
  }
  const adminItems = document.querySelectorAll("#drop-menu .role-admin");

  adminItems.forEach((item) => {
    if (user && user.role === "Admin") {
      item.classList.remove("d-none");
    } else {
      item.classList.add("d-none");
    }
  });
}

const registerForm = document.getElementById("registerForm");
registerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  try {
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    console.log(data);

    const uniqueEmail = window.db.accounts.find(
      (em) => em.email === data.email,
    );
    if (uniqueEmail) {
      window.alert("Email is already taken!");
      return;
    }
    const newUser = {
      id: Date.now(),
      first_name: data.firstname,
      last_name: data.lastname,
      email: data.email,
      password: data.password,
      verified: false,
      role: "Employee",
    };
    localStorage.setItem("unverified_email", data.email);
    window.db.accounts.push(newUser);

    saveToStorage();

    navigateTo("#/verify");
  } catch (error) {
    console.error("An error occurred: ", error);
  }
});

const loginForm = document.getElementById("loginForm");
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  try {
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    const user = window.db.accounts.find((em) => em.email === data.email);

    if (!user) {
      throw new Error("Account not Found!");
    }

    const verifyPassword = user.password === data.password;

    if (!verifyPassword) {
      throw new Error("Invalid Credentials");
    }

    if (!user.verified) {
      throw new Error("Account is not verified, verify email first!");
    }
    localStorage.setItem("auth_token", user.email);
    window.history.replaceState(
      null,
      "",
      window.location.pathname + window.location.hash,
    );
    setAuthState(true, user);
    configureNavbar(true, user);
    renderProfile();
    navigateTo("#/profile");
    alert("Logged In Successfully!");
  } catch (error) {
    console.error("An error occurred: ", error);
    alert(error);
  }
});

const logoutLink = document.getElementById("logout");
logoutLink.addEventListener("click", (e) => {
  e.preventDefault();
  logout();
});

function logout() {
  console.log("HelloWoirladwadawdwad");
  localStorage.removeItem("auth_token");
  setAuthState(false, null);
  configureNavbar(false, null);
  navigateTo("#/home");
}

function verifyEmail() {
  try {
    const userEmail = localStorage.getItem("unverified_email");
    if (!userEmail) {
      throw new Error("There is no unverified email, register first!");
    }
    const account = window.db.accounts.find((em) => em.email === userEmail);

    if (!account) {
      throw new Error("Account not found!");
    }
    account.verified = true;
    saveToStorage();
    localStorage.removeItem("unverified_email");
    alert("Email Verfied Successfully!");
    navigateTo("#/login");
  } catch (error) {
    console.error("An error ocurred: ", error);
    alert(error);
  }
}

function saveToStorage() {
  const data = JSON.stringify(window.db);
  localStorage.setItem(STORAGE_KEY, data);
}

function loadFromStorage() {
  const data = localStorage.getItem(STORAGE_KEY);

  if (data) {
    window.db = JSON.parse(data);
  } else {
    window.db = {
      accounts: [
        {
          id: Date.now(),
          first_name: "Admin User",
          last_name: "Admin",
          email: "admin@example.com",
          password: "Password123!",
          verified: true,
          role: "Admin",
        },
      ],
      departments: [
        {
          name: "Engineer",
          description: "Software Team",
        },
        {
          name: "HR",
          description: "Human Resources",
        },
      ],
    };
  }
}

function renderProfile() {
  const accountName = document.getElementById("user-name");
  const accountEmail = document.getElementById("user-email");
  const accountRole = document.getElementById("user-role");
  const editButton = document.getElementById("edit-profile");

  const name = currentUser.first_name + " " + currentUser.last_name;

  accountName.innerText = name;
  accountEmail.innerText = currentUser.email;
  accountRole.innerText = currentUser.role;

  // navigateTo("#/profile");
  editButton.onclick = () => {
    alert("Not Implemented Yet, Tehee :>");
  };
}

function addItem() {
  const container = document.getElementById("item-container");
  const newItemRow = `
  <div class="d-flex align-items-center gap-1 w-100 item-row"> 
    <div class="flex-grow-1">
      <input type="text" class="form-control outline-none" placeholder="Item">
    </div>
    <div class="w-25">
      <input type="number" class="form-control" placeholder="Qty">
    </div>
    <div class=""> <button type="button" class="btn btn-danger remove-btn">&times;</button>
    </div>
  </div>`;
  container.insertAdjacentHTML("beforeend", newItemRow);
}

document
  .getElementById("item-container")
  .addEventListener("click", function (e) {
    console.log("hello");
    const button = e.target.classList.contains("remove-btn");
    if (button) {
      const row = e.target.closest(".item-row");
      row.remove();
    }
  });
