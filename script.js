let currentUser = null;
const STORAGE_KEY = "ipt_demo_v1";

// Toast notification helper
// type: "success" | "danger" | "warning" | "info"
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  const icons = {
    success: "bi-check-circle-fill",
    danger: "bi-x-circle-fill",
    warning: "bi-exclamation-triangle-fill",
    info: "bi-info-circle-fill",
  };
  const icon = icons[type] || icons.info;
  const id = "toast-" + Date.now();
  const toastHTML = `
    <div id="${id}" class="toast align-items-center text-bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body d-flex align-items-center gap-2">
          <i class="bi ${icon}"></i> ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>`;
  container.insertAdjacentHTML("beforeend", toastHTML);
  const toastEl = document.getElementById(id);
  const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
  toast.show();
  toastEl.addEventListener("hidden.bs.toast", () => toastEl.remove());
}

// const admin = {
//   id: Date.now(),
//   first_name: "Admin User",
//   last_name: "Admin",
//   email: "admin@example.com",
//   password: "Password123!",
//   verified: true,
//   role: "Admin",
// };

loadFromStorage();
// const adminExists = window.db.accounts.some((acc) => acc.email === admin.email);
// if (!adminExists) {
//   window.db.accounts.push(admin);
//   saveToStorage();
// }

function navigateTo(hash) {
  window.location.hash = hash;
}

window.addEventListener("load", () => {
  const currentLoggedEmail = localStorage.getItem("auth_token");
  let isLoggedIn = false;
  if (currentLoggedEmail) {
    const user = window.db.accounts.find((u) => u.email === currentLoggedEmail);
    if (user) {
      setAuthState(true, user);
      configureNavbar(true, user);
      renderProfile();
      isLoggedIn = true;
    }
  }
  if (!window.location.hash || window.location.hash === "#/") {
    if (isLoggedIn) {
      window.location.hash = "#/profile";
    } else {
      window.location.hash = "#/home";
    }
  } else {
    handleRouting();
  }

  // if (!window.location.hash) {
  //   window.location.hash = "#/home";
  // } else {
  //   handleRouting();
  // }
});
window.addEventListener("hashchange", () => {
  handleRouting();
});

function handleRouting() {
  let currentHash = window.location.hash;

  if (currentHash === "" || currentHash === "#/") {
    currentHash = "#/home";
    configureNavbar(false, null);
    // logout();
    // return;
  }
  const targId = "#" + currentHash.replace("#/", "");

  const isAuthenticated = document.body.classList.contains("authenticated");

  // if (isAuthenticated && authenticatedRoutes(targId)) {
  //   window.location.hash = "#/profile";
  //   // return;
  // }

  document.querySelectorAll(".page").forEach((page) => {
    page.classList.remove("active");
  });

  if (!isAuthenticated && authenticatedRoutes(targId)) {
    showToast("You are not authenticated, please login first.", "warning");
    window.location.hash = "#/home";
    return;
  }
  const isUserAdmin = currentUser?.role === "Admin";

  if (isAuthenticated && !isUserAdmin && adminPages(targId)) {
    showToast("Invalid Request. Unauthorized User.", "danger");
    window.location.hash = isAuthenticated ? "#/profile" : "#/home";
    return;
  }

  if (isAuthenticated && isUserAdmin && userOnlyPages(targId)) {
    showToast("This page is only available for User accounts.", "warning");
    window.location.hash = "#/profile";
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
        } else if (targId === "#department") {
          renderDepartmentItems();
        } else if (targId === "#employee") {
          console.log("Employeeeeeeesss");
          renderEmployeeItems();
        } else if (targId === "#request") {
          renderRequestItems();
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
    // logout();
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
function userOnlyPages(hash) {
  return hash === "#request";
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

  const userItems = document.querySelectorAll("#drop-menu .role-user");

  userItems.forEach((item) => {
    if (user && user.role !== "Admin") {
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
      showToast("Email is already taken!", "warning");
      return;
    }
    const newUser = {
      id: Date.now(),
      first_name: data.firstname,
      last_name: data.lastname,
      email: data.email,
      password: data.password,
      verified: false,
      role: "user",
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
    showToast("Logged In Successfully!", "success");
  } catch (error) {
    console.error("An error occurred: ", error);
    showToast(error.message || error, "danger");
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
    showToast("Email Verified Successfully!", "success");
    navigateTo("#/login");
  } catch (error) {
    console.error("An error ocurred: ", error);
    showToast(error.message || error, "danger");
  }
}

function saveToStorage() {
  const data = JSON.stringify(window.db);
  localStorage.setItem(STORAGE_KEY, data);
}

function loadFromStorage() {
  const data = localStorage.getItem(STORAGE_KEY);
  console.log("data", data);
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
          id: Date.now(),
          name: "Engineer",
          description: "Software Team",
        },
        {
          id: Date.now(),
          name: "HR",
          description: "Human Resources",
        },
      ],
      employee: [],
      requests: [],
    };
  }
  if (!window.db.requests) {
    window.db.requests = [];
  }
  saveToStorage();
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
    showToast("Not Implemented Yet, Tehee :>", "info");
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

  if (accounts.length <= 0 || !accounts) {
    row = `
      <td colspan="5" class="text-center bg-secondary-subtle">
        No accounts.
      </td>
      `;
    tableItemContainer.insertAdjacentHTML("beforeend", row);
    return;
  }
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
    tableItemContainer.insertAdjacentHTML("beforeend", row);
  });
}

function renderAccountDetails() {
  try {
    if (!selectedId) {
      showToast("There is no selected id, try again.", "warning");
      return;
    }

    const modal_body = confirmModal.querySelector(".modal-body");
    modal_body.innerHTML = "";

    const user = window.db.accounts.find((u) => u.id === Number(selectedId));

    if (!user) {
      showToast("Account Not Found!", "danger");
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
      showToast("There is no selected id, try again.", "warning");
      return;
    }
    const user = window.db.accounts.find((u) => u.id === Number(selectedId));
    if (!user) {
      showToast("User not found!", "danger");
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
    showToast(error.message, "danger");
  }
}

function resetAccountPassword(formData) {
  try {
    if (selectedId === null) {
      showToast("There is no selected id, try again.", "warning");
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
      showToast("Password resetted successfully!", "success");
      selectedId = null;
      saveToStorage();
      clearForm();
      renderAccountsList();
      bootstrap.Modal.getOrCreateInstance(accountModal).hide();
    } else {
      showToast("Unsuccessful password reset.", "danger");
      clearForm();
      selectedId = null;
      bootstrap.Modal.getOrCreateInstance(accountModal).hide();

      return;
    }
  } catch (error) {
    console.error("An Error Occurred: ", error);
    showToast(error.message, "danger");
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
      formData.role.trim().toString() !== "User"
    ) {
      throw new Error("Invalid Role, Only Admin and User");
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
      showToast("Account Added Successfully!", "success");
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
        showToast("Update Successful!", "success");
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
    showToast(error.message, "danger");
  }
}

function deleteUserAccount() {
  try {
    if (selectedId === null) {
      showToast("There is no selected id, try again.", "warning");
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
      showToast("Account Deleted Successfully!", "success");
    } else {
      showToast("Account Deletion Unsuccessful.", "danger");
      selectedId = null;
      return;
    }
  } catch (error) {
    console.log("An Error Occurred: ", error);
    showToast(error.message, "danger");
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

// ======================================== DEPARTMENTS CODE PART
const deptTableCont = document.getElementById("dept-table-cont");
const addDeptButton = document.getElementById("add-department");

function renderDepartmentItems() {
  try {
    const departments = window.db.departments;
    console.log("Departments: ", departments);
    deptTableCont.innerHTML = "";

    if (departments.length <= 0 || !departments) {
      row = `
      <td colspan="5" class="text-center bg-secondary-subtle">
        No department.
      </td>
      `;
      deptTableCont.insertAdjacentHTML("beforeend", row);
      return;
    }
    departments.forEach((d) => {
      let row = `
      <tr>
        <td>${d.name}</td>
        <td>${d.description}</td>
        <td>
          <button type="button" class="btn btn-outline-primary" data-id=${d.id}>
            Edit
          </button>
          <button type="button" class="btn btn-outline-danger" data-id=${d.id}>
            Delete
          </button>
        </td>
      </tr>
      `;
      deptTableCont.insertAdjacentHTML("beforeend", row);
    });
  } catch (error) {
    console.error("Error Occurred: ", error);
  }
}

addDeptButton.onclick = () => {
  showToast("Not Implemented Yet", "info");
};

// ===========================================================

// ======================================== EMPLOYEE CODE PART
const empTableCont = document.getElementById("emp-table-cont");
const addEmpBtn = document.getElementById("add-emp-btn");
const empDetailCont = document.getElementById("emp-detail-cont");
const empForm = document.getElementById("emp-form");
const delEmpForm = document.getElementById("delete-confirm-modal-emp");

function renderEmployeeItems() {
  try {
    const employees = window.db.employee;
    console.log("Employee Items: ", employees);
    empTableCont.innerHTML = "";
    if (employees.length <= 0 || !employees) {
      let row = `
      <td colspan="6" class="text-center bg-secondary-subtle">
        No employees.
      </td>
      `;
      empTableCont.insertAdjacentHTML("beforeend", row);
      return;
    }

    employees.forEach((em) => {
      const dateObj = new Date(em.hire_date);
      const formattedDate = dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      let deptName = "";
      const department = window.db.departments.find(
        (d) => d.id === Number(em.department_id),
      );
      if (!department) {
        deptName = "N/A";
      } else {
        deptName = department.name;
      }
      let email = "";
      const user = window.db.accounts.find(
        (um) => um.id === Number(em.user_id),
      );
      // console.log("User: ", user);
      if (!user) {
        email = "N/A";
      } else {
        email = user.email;
      }
      let row = `
      <tr>
        <th scope="row">${em.id}</th>
        <td>${email}</td>
        <td>${em.position}</td>
        <td>${deptName}</td>
        <td>${formattedDate}</td>
        <td>
          <button type="button"  class="btn btn-outline-primary editEmpBtn" data-id=${em.id}>
            Edit
          </button>
          <button type="button"  class="btn btn-outline-danger delEmpBtn" data-id=${em.id}
            data-bs-toggle="modal"
            data-bs-target="#delete-confirm-modal-emp">
            Delete
          </button>
        </td>
      </tr>`;
      empTableCont.insertAdjacentHTML("beforeend", row);
    });
  } catch (error) {
    console.error("Error Occurred: ", error);
  }
}

function openEmpDetailCont() {
  clearEmpForm();
  empDetailCont.classList.remove("d-none");
  populateDeptDropdown();

  const hireDateField = document.getElementById("emp_date");
  hireDateField.readOnly = false;
  hireDateField.classList.remove("bg-body-secondary");
}
function closeEmpDetailCont() {
  clearEmpForm();
  empDetailCont.classList.add("d-none");
}

function clearEmpForm() {
  const fields = empDetailCont.querySelectorAll('input[id*="emp_"]');
  console.log(fields);

  fields.forEach((f) => {
    if (f.id === "emp_id") {
      f.value = "Employee ID read-only";
      return;
    }
    const suffix = f.id.replace("acc-", "");
    if (suffix === "check") {
      f.checked = false;
    } else {
      f.value = "";
    }
  });
  // selectedId = null;
}

function prefillEmpForm() {
  try {
    if (selectedId === null) {
      showToast("There is no selected id, try again.", "warning");
      return;
    }
    const emp = window.db.employee.find((em) => em.id === Number(selectedId));
    if (!emp) {
      showToast("User not found!", "danger");
      return;
    }
    openEmpDetailCont();
    const fields = empDetailCont.querySelectorAll(
      'input[id*="emp_"], select[id*="emp_"]',
    );
    console.log("Fields found:", fields);

    fields.forEach((f) => {
      const dataKey = f.name;
      if (f.id === "emp_email") {
        const matchedAccount = window.db.accounts.find(
          (acc) => acc.id === emp.user_id,
        );
        if (matchedAccount) {
          f.value = matchedAccount.email;
        } else {
          f.value = "Account not found";
        }
        return;
      }
      if (emp[dataKey] !== undefined && emp[dataKey] !== null) {
        if (f.type === "date") {
          f.value = emp[dataKey].toString().split("T")[0];
        } else {
          f.value = emp[dataKey];
        }
      } else {
        console.log(`No data found for: ${dataKey}`);
      }
    });

    const hireDateField = document.getElementById("emp_date");
    hireDateField.readOnly = true;
    hireDateField.classList.add("bg-body-secondary");
  } catch (error) {
    console.error(error);
    showToast(error.message, "danger");
  }
}

function saveOrEditEmployee(formData) {
  console.log("FormData", formData);
  console.log("Selected Id: ", selectedId);
  try {
    if (!formData.email?.trim()) {
      throw new Error("User email should not be empty.");
    }
    if (!formData.position?.trim()) {
      throw new Error("Position should not be empty.");
    }
    if (!formData.department_id || !formData.department_id.trim()) {
      throw new Error("Please select a department.");
    }
    if (!formData.hire_date?.trim()) {
      throw new Error("Please enter a hire date.");
    }

    if (!charactersOnly(formData.position.trim())) {
      throw new Error("Position contains numerical characters.");
    }
    const hireDate = new Date(formData.hire_date);
    if (isNaN(hireDate.getTime())) {
      throw new Error("Please enter a valid hire date.");
    }

    const todayDateStr = new Date().toLocaleDateString("en-CA");
    if (formData.hire_date > todayDateStr) {
      throw new Error("Hire date cannot be in the future.");
    }

    const user = window.db.accounts.find((u) => u.email === formData.email);
    if (!user) {
      throw new Error("User not found!");
    }
    const department = window.db.departments.find(
      (d) => d.id === Number(formData.department_id),
    );
    if (!department) {
      throw new Error("Department not found!");
    }
    const employees = window.db.employee;
    const empIdCount =
      employees.length === 0 ? 1 : employees[employees.length - 1].id + 1;

    if (selectedId === null) {
      const duplicateEmp = employees.find((em) => em.user_id === user.id);
      if (duplicateEmp) {
        throw new Error(`An employee record already exist.`);
      }
      const newEmp = {
        id: empIdCount,
        // email: user.email,
        user_id: user.id,
        position: formData.position,
        department_id: department.id,
        hire_date: hireDate,
      };

      window.db.employee.push(newEmp);
    } else {
      console.log(selectedId);
      const employee = window.db.employee.find(
        (em) => em.id === Number(selectedId),
      );

      if (!employee) {
        throw new Error("Employee is not found!");
      }
      employee.user_id = user.id;
      employee.position = formData.position;
      employee.department_id = department.id;
      employee.hire_date = hireDate;
    }
    selectedId = null;
    saveToStorage();
    renderEmployeeItems();
    closeEmpDetailCont();
  } catch (error) {
    console.error(error);
    showToast(error.message, "danger");
  }
}

function populateDeptDropdown() {
  try {
    const deptDropdown = document.getElementById("emp_dept");
    deptDropdown.innerHTML =
      '<option value="" disabled selected>Select a department...</option>';

    window.db.departments.forEach((dept) => {
      const option = document.createElement("option");
      option.value = dept.id;
      option.textContent = dept.name;
      deptDropdown.appendChild(option);
    });
  } catch (error) {
    console.error("Error Occurred: ", error);
  }
}

function renderEmployeeDetails() {
  try {
    if (!selectedId) {
      showToast("There is no selected id, try again.", "warning");
      return;
    }
    console.log("dadawd");
    const modal_body = delEmpForm.querySelector(".modal-body");
    modal_body.innerHTML = "";

    const emp = window.db.employee.find((u) => u.id === Number(selectedId));

    if (!emp) {
      showToast("Account Not Found!", "danger");
    }
    const user = window.db.accounts.find((u) => u.id === Number(emp.user_id));

    if (!user) {
      showToast("Account Not Found!", "danger");
    }
    const department = window.db.departments.find(
      (d) => d.id === Number(emp.department_id),
    );
    if (!department) {
      showToast("Department not found!", "danger");
    }
    console.log(emp);

    const dateObj = new Date(emp.hire_date);
    const formattedDate = dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
            <div class="col-4 col-sm-3 fw-bold fs-5 text-secondary">Email:</div>
            <div class="col-8 col-sm-9 fs-5 text-break">${user.email}</div>
          </div>
          <div class="row mb-2 align-items-center">
            <div class="col-4 col-sm-3 fw-bold fs-5 text-secondary">Position:</div>
            <div class="col-8 col-sm-9 fs-5 text-break">${emp.position}</div>
          </div>
          <div class="row mb-2 align-items-center">
            <div class="col-4 col-sm-3 fw-bold fs-5 text-secondary">Department:</div>
            <div class="col-8 col-sm-9 fs-5 text-break">${department.name}</div>
          </div>
          <div class="row mb-2 align-items-center">
            <div class="col-4 col-sm-3 fw-bold fs-5 text-secondary">Hire Date:</div>
            <div class="col-8 col-sm-9 fs-5 text-break">${formattedDate}</div>
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

function deleteEmployee() {
  try {
    if (selectedId === null) {
      showToast("There is no selected id, try again.", "warning");
      return;
    }

    const empIndex = window.db.employee.findIndex(
      (em) => em.id === Number(selectedId),
    );
    if (empIndex !== -1) {
      window.db.employee.splice(empIndex, 1);
      selectedId = null;
      saveToStorage();
      renderEmployeeItems();
      const modalInstance = bootstrap.Modal.getOrCreateInstance(
        document.getElementById("delete-confirm-modal-emp"),
      );
      modalInstance.hide();
      showToast("Employee Deleted Successfully!", "success");
    } else {
      showToast("Employee Deletion Unsuccessful.", "danger");
      selectedId = null;
      return;
    }
  } catch (error) {
    console.error("An Error Occurred: ", error);
    showToast(error.message, "danger");
  }
}

const empConfirmDeleteBtn = document.getElementById("confirm-delete-emp-btn");
empConfirmDeleteBtn.addEventListener("click", (e) => {
  e.preventDefault();
  deleteEmployee();
});

empForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = getDataFromTarget(e);
  saveOrEditEmployee(data);
});

empTableCont.addEventListener("click", (e) => {
  console.log("Hellooo");
  if (e.target.classList.contains("editEmpBtn")) {
    selectedId = e.target.dataset.id;
    console.log("Selected Id: ", selectedId);
    console.log("helloo");
    prefillEmpForm();
  } else if (e.target.classList.contains("delEmpBtn")) {
    selectedId = e.target.dataset.id;
    // renderAccountDetails();
    console.log("daeym");
    renderEmployeeDetails();
  }
});

// ======================================== REQUEST CODE PART
const requestTableCont = document.getElementById("request-table-cont");
const requestForm = document.getElementById("request-form");
const requestItemContainer = document.getElementById("request-item-container");
const requestModal = document.getElementById("requestModal");

function renderRequestItems() {
  try {
    const requests = window.db.requests.filter(
      (r) => r.employeeEmail === currentUser.email,
    );
    requestTableCont.innerHTML = "";

    if (!requests || requests.length <= 0) {
      const row = `
        <tr>
          <td colspan="5" class="text-center bg-secondary-subtle">
            No requests yet.
          </td>
        </tr>`;
      requestTableCont.insertAdjacentHTML("beforeend", row);
      return;
    }

    requests.forEach((req) => {
      const dateObj = new Date(req.date);
      const formattedDate = dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

      let badgeClass = "bg-warning text-dark";
      if (req.status === "Approved") {
        badgeClass = "bg-success";
      } else if (req.status === "Rejected") {
        badgeClass = "bg-danger";
      }

      const itemsList = req.items
        .map((item) => `${item.name} (x${item.qty})`)
        .join(", ");

      const row = `
      <tr>
        <th scope="row">${req.id}</th>
        <td>${req.type}</td>
        <td>${itemsList}</td>
        <td>${formattedDate}</td>
        <td><span class="badge ${badgeClass}">${req.status}</span></td>
      </tr>`;
      requestTableCont.insertAdjacentHTML("beforeend", row);
    });
  } catch (error) {
    console.error("Error Occurred: ", error);
  }
}

function addRequestItem() {
  const newItemRow = `
  <div class="d-flex align-items-center gap-1 w-100 request-item-row">
    <div class="flex-grow-1">
      <input type="text" class="form-control request-item-name" placeholder="Item name">
    </div>
    <div class="w-25">
      <input type="number" class="form-control request-item-qty" placeholder="Qty" min="1">
    </div>
    <div>
      <button type="button" class="btn btn-danger remove-request-item-btn">&times;</button>
    </div>
  </div>`;
  requestItemContainer.insertAdjacentHTML("beforeend", newItemRow);
}

requestItemContainer.addEventListener("click", function (e) {
  if (e.target.classList.contains("add-request-item-btn")) {
    addRequestItem();
  } else if (e.target.classList.contains("remove-request-item-btn")) {
    const row = e.target.closest(".request-item-row");
    row.remove();
  }
});

function clearRequestForm() {
  requestForm.reset();
  requestItemContainer.innerHTML = `
    <div class="d-flex align-items-center gap-1 w-100 request-item-row">
      <div class="flex-grow-1">
        <input type="text" class="form-control request-item-name" placeholder="Item name">
      </div>
      <div class="w-25">
        <input type="number" class="form-control request-item-qty" placeholder="Qty" min="1">
      </div>
      <div>
        <button type="button" class="btn btn-secondary add-request-item-btn">+</button>
      </div>
    </div>`;
}

requestForm.addEventListener("submit", (e) => {
  e.preventDefault();
  try {
    const type = document.getElementById("request-type").value;
    if (!type) {
      throw new Error("Please select a request type.");
    }

    const itemRows = requestItemContainer.querySelectorAll(".request-item-row");
    const items = [];

    itemRows.forEach((row) => {
      const name = row.querySelector(".request-item-name").value.trim();
      const qty = parseInt(row.querySelector(".request-item-qty").value);

      if (name && qty > 0) {
        items.push({ name, qty });
      }
    });

    if (items.length === 0) {
      throw new Error(
        "Please add at least one item with a valid name and quantity.",
      );
    }

    const requests = window.db.requests;
    const reqIdCount =
      requests.length === 0 ? 1 : requests[requests.length - 1].id + 1;

    const newRequest = {
      id: reqIdCount,
      type: type,
      items: items,
      status: "Pending",
      date: new Date().toISOString(),
      employeeEmail: currentUser.email,
    };

    window.db.requests.push(newRequest);
    saveToStorage();
    clearRequestForm();
    renderRequestItems();
    bootstrap.Modal.getOrCreateInstance(requestModal).hide();
    showToast("Request submitted successfully!", "success");
  } catch (error) {
    console.error("An Error Occurred: ", error);
    showToast(error.message, "danger");
  }
});

// ==========================================================
function charactersOnly(str) {
  const nameRegex = /^[a-zA-Z\s]+$/;
  return nameRegex.test(str.trim());
}
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
