const correctPassword = "4826"; // Dynamic/One-time test password
let selectedDestination = "";

function setDestination(destination) {
    selectedDestination = destination;
    document.getElementById("selected-dest").innerText = destination;
    document.getElementById("robot-status-banner").innerText = "🧭 NAVIGATING TO " + destination.toUpperCase() + " VIA IR SENSORS";
}

function verifyPassword() {
    const enteredPass = document.getElementById("password-input").value;
    const statusBadge = document.getElementById("status-badge");
    const liftStatus = document.getElementById("lift-status");
    
    if (selectedDestination === "") {
        alert("Please select a target destination ward first!");
        return;
    }

    if (enteredPass === correctPassword) {
        // Update UI to Unlocked State
        statusBadge.innerText = "🔓 UNLOCKED & LIFTED";
        statusBadge.className = "badge unlocked";
        liftStatus.innerText = "Elevated (120°)";
        liftStatus.style.color = "#34d399";
        
        document.getElementById("robot-status-banner").innerText = "✓ DELIVERED AT " + selectedDestination.toUpperCase() + " - COMPARTMENT OPEN";
        
        startCountdown();
    } else {
        alert("Authentication Failed: Invalid or Expired Dynamic Password!");
    }
}

function startCountdown() {
    let timeLeft = 30;
    const timerDisplay = document.getElementById("timer");
    const statusBadge = document.getElementById("status-badge");
    const liftStatus = document.getElementById("lift-status");
    
    let countdownInterval = setInterval(function() {
        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            timerDisplay.innerText = "0";
            
            // Auto Re-lock and Reset
            alert("Retrieval window expired! Lowering syringe cup and securing compartment.");
            
            statusBadge.innerText = "🔒 SYSTEM LOCKED";
            statusBadge.className = "badge locked";
            liftStatus.innerText = "Stowed (0°)";
            liftStatus.style.color = "#fbbf24";
            
            document.getElementById("timer").innerText = "30";
            document.getElementById("password-input").value = "";
            document.getElementById("robot-status-banner").innerText = "🚀 ROBOT READY FOR NEXT MISSION";
            selectedDestination = "";
            document.getElementById("selected-dest").innerText = "None Selected";
        } else {
            timerDisplay.innerText = timeLeft;
        }
        timeLeft -= 1;
    }, 1000);
}