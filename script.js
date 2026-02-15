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
    currentHash = "#/home";
    configureNavbar(false, null);
    logout();
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
    console.log(matchingPage);
    console.log(targId);
    if (matchingPage) {
      matchingPage.classList.add("active");

      if (currentUser) {
        if (targId === "#account") {
          renderAccountsList();
        }
      }
    } else {
      console.warn("Page not found!");
      window.location.hash = isAuthenticated ? "#/profile" : "#/home";
    }
  } catch (error) {
    console.error("Invalid hash", targId);
    window.location.hash = "#/home";
    configureNavbar(false, null);
    logout();
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

// ===================================================================== Accounts Part
const tableItemContainer = document.getElementById("table-items");
const saveAccountBtn = document.getElementById("save-acc-btn");
const accFormContainer = document.getElementById("acc-form-cont");
const accountForm = document.getElementById("acc-form");
const modalAccountForm = document.getElementById("acc-modal-form");
const accountModal = document.getElementById("reset-pw");
const confirmModal = document.getElementById("delete-confirm-modal");
const accConfirmDeleteBtn = document.getElementById("confirm-delete-btn");

console.log(accConfirmDeleteBtn);
let editId = null; //Current Editing Id
let selectedId = null;
function renderAccountsList() {
  const accounts = window.db.accounts;
  tableItemContainer.innerHTML = "";

  accounts.forEach((acc) => {
    let row = `
    <tr>
      <td>${acc.first_name}</td>
      <td>${acc.email}</td>
      <td>${acc.role}</td>
      <td>${acc.verified ? "✅" : "❌"}</td>
      <td>
        <button
          type="button"
          class="btn btn-outline-primary edit-acc-btn"
          data-id=${acc.id}
        >
          Edit
        </button>
        <button
          type="button"
          class="btn btn-outline-warning reset-acc-btn"
          data-id=${acc.id}
          data-bs-toggle="modal"
          data-bs-target="#reset-pw"
        >
          Reset Password
        </button>
        <button
          type="button"
          class="btn btn-outline-danger delete-acc-btn"
          data-id=${acc.id}
          data-bs-toggle="modal"
          data-bs-target="#delete-confirm-modal"
        >
          Delete
        </button>
      </td>
    </tr>`;

    if (accounts >= 0) {
      row = `
      <td colspan="5" class="text-center bg-secondary-subtle">
        No accounts.
      </td>
      `;
    }
    tableItemContainer.insertAdjacentHTML("beforeend", row);
  });
}

function renderAccountDetails() {
  try {
    if (!selectedId) {
      alert("There is no selected id, try again.");
      return;
    }

    const modal_body = confirmModal.querySelector(".modal-body");
    modal_body.innerHTML = "";

    const user = window.db.accounts.find((u) => u.id === Number(selectedId));

    if (!user) {
      alert("Account Not Found!");
    }
    const name = user.first_name + " " + user.last_name;
    const item = `
    <div class="container-fluid">
      <div
        class="d-flex flex-column align-items-start justify-content-center gap-2"
      >
        <p class="lead-4 fs-4" id="confirm-modal-header">
          Are you sure you want to delete this account?
        </p>
        <div class="container-fluid p-0">
          <div class="row mb-2 align-items-center">
            <div class="col-4 col-sm-3 fw-bold fs-5 text-secondary">Name:</div>
            <div class="col-8 col-sm-9 fs-5">${name}</div>
          </div>

          <div class="row mb-2 align-items-center">
            <div class="col-4 col-sm-3 fw-bold fs-5 text-secondary">Email:</div>
            <div class="col-8 col-sm-9 fs-5 text-break">${user.email}</div>
          </div>

          <div class="row mb-2 align-items-center">
            <div class="col-4 col-sm-3 fw-bold fs-5 text-secondary">Role:</div>
            <div class="col-8 col-sm-9">
              <span class="badge ${user.role === "Admin" ? "bg-danger" : "bg-primary"}">${user.role}</span>
            </div>
          </div>

          <div class="row mb-2 align-items-center">
            <div class="col-4 col-sm-3 fw-bold fs-5 text-secondary">Status:</div>
            <div class="col-8 col-sm-9">
              ${user.verified ? '<span class="text-success">Verified ✅</span>' : '<span class="text-warning">Pending ❌</span>'}
            </div>
          </div>
        </div>

        </div>
      </div>
    </div>`;
    modal_body.insertAdjacentHTML("beforeend", item);
  } catch (error) {
    console.error(error);
  }
}

function openAccountForm() {
  accFormContainer.classList.remove("d-none");
}
function clearForm() {
  const fields = accFormContainer.querySelectorAll('input[id*="acc-"]');
  console.log(fields);

  fields.forEach((f) => {
    const suffix = f.id.replace("acc-", "");
    if (suffix === "check") {
      f.checked = false;
    } else {
      f.value = "";
    }
  });

  const modal_fields = accountModal
    .querySelector(".modal-body")
    .querySelectorAll("input");
  console.log(modal_fields);
  modal_fields.forEach((mf) => {
    mf.value = "";
  });
}
function closeAccountForm() {
  clearForm();
  accFormContainer.classList.add("d-none");
  selectedId = null;
}
function getDataFromTarget(e) {
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());
  return data;
}

function prefillAccountForm() {
  try {
    if (selectedId === null) {
      alert("There is no selected id, try again.");
      return;
    }
    const user = window.db.accounts.find((u) => u.id === Number(selectedId));
    if (!user) {
      alert("User not found!");
      return;
    }

    openAccountForm();
    const fields = accFormContainer.querySelectorAll('input[id*="acc-"]');
    console.log(fields);

    const fieldMap = {
      fname: "first_name",
      lname: "last_name",
      email: "email",
      pw: "password",
      role: "role",
    };

    fields.forEach((f) => {
      const suffix = f.id.replace("acc-", "");
      const dataKey = fieldMap[suffix];
      if (dataKey) {
        f.value = user[dataKey];
      } else if (suffix === "check") {
        f.checked = user.verified;
      }
    });
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}

function resetAccountPassword(formData) {
  try {
    if (selectedId === null) {
      alert("There is no selected id, try again.");
      return;
    }
    if (!formData.password.trim() || !formData.confirm_password.trim()) {
      throw new Error("Important Fields should not be empty!");
    }

    if (
      formData.password.trim().length < 6 ||
      formData.confirm_password.trim().length < 6
    ) {
      throw new Error("Passwords must contain minimum of 6 characters.");
    }

    if (formData.password.trim() !== formData.confirm_password.trim()) {
      throw new Error("Passwords doesn't match!");
    }

    const userIndex = window.db.accounts.findIndex(
      (u) => u.id === Number(selectedId),
    );
    if (userIndex !== -1) {
      window.db.accounts[userIndex] = {
        ...window.db.accounts[userIndex],
        password: formData.password,
      };
      alert("Pasword resetted successfully!");
      selectedId = null;
      saveToStorage();
      clearForm();
      renderAccountsList();
      bootstrap.Modal.getOrCreateInstance(accountModal).hide();
    } else {
      alert("Unsuccesfull password reset.");
      clearForm();
      selectedId = null;
      bootstrap.Modal.getOrCreateInstance(accountModal).hide();

      return;
    }
  } catch (error) {
    console.error("An Error Occurred: ", error);
    alert(error.message);
  }
}
function saveOrEditUserAccount(formData) {
  try {
    if (
      !formData.first_name.trim() ||
      !formData.last_name.trim() ||
      !formData.email.trim() ||
      !formData.role.trim()
    ) {
      throw new Error("Important fields should not be empty.");
    }

    if (formData.password.trim().length < 6) {
      throw new Error("Passwords must contain minimum of 6 characters.");
    }

    if (
      formData.role.trim().toString() !== "Admin" &&
      formData.role.trim().toString() !== "Employee"
    ) {
      throw new Error("Invalid Role, Only Admin and Employee");
    }

    if (selectedId === null) {
      const isEmailExist = window.db.accounts.find(
        (u) => u.email === formData.email,
      );
      if (isEmailExist) {
        throw new Error("Email already taken, please try another.");
      }
      const newUser = {
        id: Date.now(),
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        verified: formData.verified,
      };

      window.db.accounts.push(newUser);
      alert("Account Added Successfully!");
    } else {
      const userIndex = window.db.accounts.findIndex(
        (u) => u.id === Number(selectedId),
      );
      console.log(userIndex);
      if (userIndex !== -1) {
        console.log("HELLOOOOOOOOOO");
        window.db.accounts[userIndex] = {
          ...window.db.accounts[userIndex],
          ...formData,
        };
        console.log(
          "Edited Data: ",
          (window.db.accounts[userIndex] = {
            ...window.db.accounts[userIndex],
            ...formData,
          }),
        );
        alert("Update Successful!");
      } else {
        throw new Error("Unsuccessful Update, try again");
      }
      selectedId = null;
    }
    saveToStorage();
    closeAccountForm();
    renderAccountsList();
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}

function deleteUserAccount() {
  try {
    if (selectedId === null) {
      alert("There is no selected id, try again.");
      return;
    }

    if (Number(selectedId) === Number(currentUser.id)) {
      throw new Error("You can't delete your own account.");
    }

    const userIndex = window.db.accounts.findIndex(
      (u) => u.id === Number(selectedId),
    );
    if (userIndex !== -1) {
      window.db.accounts.splice(userIndex, 1);
      selectedId = null;
      saveToStorage();
      renderAccountsList();
      const modalInstance = bootstrap.Modal.getOrCreateInstance(
        document.getElementById("delete-confirm-modal"),
      );
      modalInstance.hide();
      alert("Account Deleted Successfully!");
    } else {
      alert("Account Deletion Unsuccessfull.");
      selectedId = null;
      return;
    }
  } catch (error) {
    console.log("An Error Occurred: ", error);
    alert(error.message);
  }
}

accountForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = getDataFromTarget(e);
  data.verified = e.target.elements["acc-check"].checked;
  saveOrEditUserAccount(data);
});
accountForm.querySelector("#role-menu").addEventListener("click", (e) => {
  if (e.target.classList.contains("dropdown-item")) {
    e.preventDefault();
    const selectedValue = e.target.textContent;
    accountForm.querySelector("#acc-role").value = selectedValue;
  }
});
tableItemContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("edit-acc-btn")) {
    selectedId = e.target.dataset.id;
    prefillAccountForm();
    console.log("Edit is Pressed");
  } else if (e.target.classList.contains("reset-acc-btn")) {
    selectedId = e.target.dataset.id;
  } else if (e.target.classList.contains("delete-acc-btn")) {
    selectedId = e.target.dataset.id;
    renderAccountDetails();
  }
});

accConfirmDeleteBtn.addEventListener("click", (e) => {
  e.preventDefault();
  deleteUserAccount();
});

modalAccountForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = getDataFromTarget(e);
  resetAccountPassword(data);
});

// ====================================================================================

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

function initializePasswordToggles() {
  const passwordFields = document.querySelectorAll(".password-toggleable");

  passwordFields.forEach((input) => {
    const wrapper = document.createElement("div");
    wrapper.className = "input-group";
    input.parentNode.insertBefore(wrapper, input);

    wrapper.appendChild(input);
    wrapper.insertAdjacentHTML(
      "beforeend",
      `
      <button class="btn btn-outline-secondary" type="button">
        <i class="bi bi-eye"></i>
      </button>
    `,
    );

    const btn = wrapper.querySelector("button");
    const icon = btn.querySelector("i");

    btn.onclick = () => {
      const isPw = input.type === "password";
      input.type = isPw ? "text" : "password";
      icon.className = isPw ? "bi bi-eye-slash" : "bi bi-eye";
    };
  });
}

initializePasswordToggles();
