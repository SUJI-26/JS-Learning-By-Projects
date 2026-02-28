const inputBox = document.getElementById("inputBox");
const listContainer = document.getElementById("listContainer");

function addTask(){
    if(inputBox.value.trim() ===""){
        alert ("Please Enter Your ")
    }
    else{
        const li = document.createElement("li");
        li.innerHTML = inputBox.value;
        listContainer.appendChild(li)


        let span = document.createElement("span")
        span.innerHTML = "\u00d7";
        li.appendChild(span)
    }

    inputBox.value = "";
    saveData()
}


listContainer.addEventListener("click" ,function(add){
    if(add.target.tagName === "LI"){
        add.target.classList.toggle("checked")
        saveData();
    }
    else if(add.target.tagName === "SPAN"){
        add.target.parentElement.remove();
        saveData()
    }
})


function saveData(){
    localStorage.setItem("data",listContainer.innerHTML)
}

function showData(){
    listContainer.innerHTML = localStorage.getItem("data")
}

showData()