
import finduserbymail from "../models/database.js";

// recuperation des elements DOM
const mailInput = document.getElementById("mail");
const passwordInput  = document.getElementById("password");
const submitBtn = document.getElementById("submitbtn");
const display   = document.getElementById("display");
// event listener sur le bouton Se connecter
submitBtn.addEventListener("click", handleSubmit);

function handleSubmit() {
    let mail = mailInput.value;
    let password = passwordInput.value;

    if (!mail || !password) {
        return;
    } else {
        submitBtn.textContent = "Checking!!!";
        const user = finduserbymail(mail, password);

        setTimeout(() => {
          
if (user) {
    const stored = sessionStorage.getItem(`user_${user.id}`);
    const currentUser = stored ? JSON.parse(stored) : user;
    sessionStorage.setItem("currentUser", JSON.stringify(currentUser));
    document.location = "/src/view/dashboard.html";
} else {
                
                submitBtn.textContent = "Se connecter";
            }
        }, 2000);
    }
}
