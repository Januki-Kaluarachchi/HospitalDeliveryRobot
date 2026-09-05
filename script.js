const correctPassword = "4826"; // ඔයා දුන් ටෙස්ට් පාස්වර්ඩ් එක

function verifyPassword() {
    const enteredPass = document.getElementById("password-input").value;
    const statusBadge = document.getElementById("status-badge");
    
    if (enteredPass === correctPassword) {
        alert("Access Granted! Unlocking compartment and lifting cup...");
        statusBadge.innerText = "UNLOCKED";
        statusBadge.className = "unlocked";
        
        startCountdown();
    } else {
        alert("Wrong Password! Try again.");
    }
}

function startCountdown() {
    let timeLeft = 30;
    const timerDisplay = document.getElementById("timer");
    
    let downloadTimer = setInterval(function(){
        if(timeLeft <= 0){
            clearInterval(downloadTimer);
            timerDisplay.innerText = "0";
            alert("Time's up! Lowering cup and re-locking.");
            
            // Reset to locked state
            document.getElementById("status-badge").innerText = "LOCKED";
            document.getElementById("status-badge").className = "locked";
            document.getElementById("timer").innerText = "30";
            document.getElementById("password-input").value = "";
        } else {
            timerDisplay.innerText = timeLeft;
        }
        timeLeft -= 1;
    }, 1000);
}