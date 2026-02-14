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

// const inputButton = document.getElementById("modalButton");
// const modalDialog = document.getElementById("requestModal");

// modalDialog.addEventListener("shown.bs.modal", () => {
//   console.log("Pressed");
//   inputButton.focus();
// });\

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
