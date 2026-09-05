let staffEmail = "";
let generatedOTP = "";
let selectedDestination = "";
let activeTimer = null;

function staffLogin() {
    const emailInput = document.getElementById("staff-email").value;
    if(emailInput.trim() === "") {
        alert("Please enter a valid ward computer email!");
        return;
    }
    staffEmail = emailInput;
    document.getElementById("logged-email-display").innerText = "Logged: " + staffEmail;
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("main-dashboard").style.display = "block";
}

function setDestination(destination) {
    selectedDestination = destination;
    document.getElementById("selected-dest").innerText = destination;
    document.getElementById("robot-status-banner").innerText = "🧭 NAVIGATING TO " + destination.toUpperCase();
    
    // Simulate Robot reaching destination after a brief delay
    setTimeout(() => {
        robotArrivedAtDestination();
    }, 3000);
}

function robotArrivedAtDestination() {
    // 1. Generate OTP and send to staff email
    generatedOTP = Math.floor(1000 + Math.random() * 9000).toString();
    console.log("Email OTP sent to " + staffEmail + ": " + generatedOTP);
    
    // 2. Buzzer Sound Trigger Simulation
    document.getElementById("buzzer-status").innerText = "ACTIVE (Beep Beep!)";
    document.getElementById("buzzer-status").style.color = "#ef4444";
    alert("🚨 BUZZER BEEPING! Robot arrived at " + selectedDestination + ".\n📧 OTP (" + generatedOTP + ") sent to " + staffEmail);

    // 3. Prompt user on GUI: Ask if they want to unlock or deliver
    document.getElementById("mode-prompt-card").style.display = "block";
    document.getElementById("robot-status-banner").innerText = "🔔 ARRIVED AT " + selectedDestination.toUpperCase() + " - WAITING FOR ACTION";

    // 4. Start 2-minute (120 seconds) waiting timer for password entry
    startArrivalTimeout();
}

function selectMode(mode) {
    if(mode === 'Unlock') {
        alert("Please enter the 4-digit OTP below to unlock.");
    } else {
        alert("New delivery workflow selected.");
    }
}

function startArrivalTimeout() {
    let timeLeft = 120; // 2 minutes
    const timerDisplay = document.getElementById("timer");
    document.getElementById("timer-label-desc").innerText = "2-min window to enter OTP.";

    if(activeTimer) clearInterval(activeTimer);

    activeTimer = setInterval(() => {
        timeLeft--;
        timerDisplay.innerText = timeLeft;

        if(timeLeft <= 0) {
            clearInterval(activeTimer);
            // TIMEOUT: Nobody entered password in 2 minutes!
            alert("⚠️ Timeout! Badu tika kawruwth gaththe na e nisa aye pharmacy ekatama return una.");
            resetRobotToPharmacy("TIMEOUT: Returned to Pharmacy");
        }
    }, 1000);
}

function verifyPassword() {
    const enteredPass = document.getElementById("password-input").value;
    const statusBadge = document.getElementById("status-badge");
    
    if (enteredPass === generatedOTP) {
        clearInterval(activeTimer); // Stop 2-min timeout
        
        statusBadge.innerText = "🔓 UNLOCKED";
        statusBadge.className = "badge unlocked";
        document.getElementById("robot-status-banner").innerText = "✓ OTP VERIFIED - COMPARTMENT OPEN";
        document.getElementById("buzzer-status").innerText = "Standby";
        document.getElementById("buzzer-status").style.color = "#fbbf24";
        document.getElementById("mode-prompt-card").style.display = "none";

        // Start 1-minute (60 seconds) open retrieval window
        startRetrievalWindow();
    } else {
        alert("❌ Authentication Failed: Invalid OTP!");
    }
}

function startRetrievalWindow() {
    let timeLeft = 60; // 1 minute retrieval window
    const timerDisplay = document.getElementById("timer");
    document.getElementById("timer-label-desc").innerText = "Compartment open. Auto re-lock in 1 min.";

    activeTimer = setInterval(() => {
        timeLeft--;
        timerDisplay.innerText = timeLeft;

        if(timeLeft <= 0) {
            clearInterval(activeTimer);
            alert("🔒 1 minute passed. Compartment automatically re-locked.");
            
            // Re-lock state
            document.getElementById("status-badge").innerText = "🔒 LOCKED";
            document.getElementById("status-badge").className = "badge locked";
            document.getElementById("password-input").value = "";
            
            // Check for next room command or return to pharmacy
            checkForNextCommandOrReturn();
        }
    }, 1000);
}

function checkForNextCommandOrReturn() {
    document.getElementById("robot-status-banner").innerText = "🔍 Checking for next room command...";
    
    // Simulating check for new room command (e.g. if user clicks another ward within 5 secs, else return to pharmacy)
    setTimeout(() => {
        let hasNewCommand = confirm("Do you want to send the robot to another room/ward? (Click Cancel to return to Pharmacy)");
        if(hasNewCommand) {
            alert("Select new destination ward from the panel.");
            document.getElementById("robot-status-banner").innerText = "🚀 READY FOR NEXT COMMAND";
        } else {
            resetRobotToPharmacy("No further commands. Returning to Pharmacy.");
        }
    }, 3000);
}

function resetRobotToPharmacy(reason) {
    if(activeTimer) clearInterval(activeTimer);
    document.getElementById("robot-status-banner").innerText = "🔄 " + reason;
    alert("🏥 Robot returning to Pharmacy automatically.");
    
    // Reset UI states
    document.getElementById("status-badge").innerText = "🔒 LOCKED";
    document.getElementById("status-badge").className = "badge locked";
    document.getElementById("mode-prompt-card").style.display = "none";
    document.getElementById("selected-dest").innerText = "Pharmacy (Returned)";
    document.getElementById("timer").innerText = "120";
    document.getElementById("timer-label-desc").innerText = "System in standby.";
    selectedDestination = "";
    generatedOTP = "";
}