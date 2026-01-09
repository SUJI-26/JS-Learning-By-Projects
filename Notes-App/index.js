const notesContainer = document.querySelector(".notes-container");
const createBtn = document.querySelector(".btn");

function showNotes() {
    notesContainer.innerHTML = localStorage.getItem("notes") || "";
}
showNotes();

function updateStorage() {
    localStorage.setItem("notes", notesContainer.innerHTML);
}

createBtn.addEventListener("click", () => {
    const inputBox = document.createElement("p");
    const img = document.createElement("img");

    inputBox.className = "input-box";
    inputBox.setAttribute("contenteditable", "true");

    img.src = "./Images/delete.png";
    img.alt = "Delete";

    inputBox.appendChild(img);
    notesContainer.appendChild(inputBox);

    updateStorage();
});

notesContainer.addEventListener("click", (e) => {
    const note = e.target.closest(".input-box");

    if (e.target.tagName === "IMG" && note) {
        note.remove();
        updateStorage();
    }
});

notesContainer.addEventListener("keyup", () => {
    updateStorage();
});
