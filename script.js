let generatedOTP = "";
let selectedDestination = "";
let activeTimer = null;
let bluetoothDevice, bluetoothServer, rxCharacteristic;

// 1. Connect to Arduino via Web Bluetooth (HC-05)
async function connectBluetooth() {
    try {
        console.log("Requesting Bluetooth Device...");
        bluetoothDevice = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: ['0000ffe0-0000-1000-8000-00805f9b34fb'] // Standard HC-05 UUID
        });

        bluetoothServer = await bluetoothDevice.gatt.connect();
        const service = await bluetoothServer.getPrimaryService('0000ffe0-0000-1000-8000-00805f9b34fb');
        rxCharacteristic = await service.getCharacteristic('0000ffe1-0000-1000-8000-00805f9b34fb');

        await rxCharacteristic.startNotifications();
        rxCharacteristic.addEventListener('characteristicvaluechanged', handleIncomingBluetoothData);
        
        alert("Bluetooth Connected Successfully to Robot!");
        document.getElementById("robot-status-banner").innerText = "BLUETOOTH CONNECTED - READY";

    } catch (error) {
        console.log("Bluetooth Connection Failed: ", error);
        alert("Could not connect to HC-05 Bluetooth. Please check pairing.");
    }
}

// 2. Send Command to Arduino via Bluetooth
async function sendBluetoothCommand(command) {
    if (rxCharacteristic) {
        try {
            const encoder = new TextEncoder();
            await rxCharacteristic.writeValue(encoder.encode(command + "\n"));
            console.log("Sent to Arduino: " + command);
        } catch (error) {
            console.log("Error sending data: ", error);
        }
    } else {
        console.log("Bluetooth not connected. Command simulated: " + command);
    }
}

// 3. Set Destination and Send Signal to Arduino
function setDestination(destination) {
    selectedDestination = destination;
    document.getElementById("selected-dest").innerText = destination;
    document.getElementById("robot-status-banner").innerText = "🧭 NAVIGATING TO " + destination.toUpperCase();
    
    // Send destination command to Arduino (e.g., GO:Ward_A or GO:Ward_B)
    let cmd = (destination === "Ward A") ? "GO:Ward_A" : "GO:Ward_B";
    sendBluetoothCommand(cmd);
}

// 4. Handle Incoming Messages from Arduino (IR Sensor arrivals & Buzzer triggers)
function handleIncomingBluetoothData(event) {
    const value = event.target.value;
    const decoder = new TextDecoder('utf-8');
    const message = decoder.decode(value).trim();
    
    console.log("Robot Message: " + message);

    if (message.includes("ARRIVED: Ward_A") || message.includes("ARRIVED: Ward_B")) {
        robotArrivedAtDestination();
    } else if (message.includes("ARRIVED: Pharmacy")) {
        resetRobotToPharmacy("Robot returned to Pharmacy and reset.");
    } else if (message.includes("BUZZER: ON")) {
        document.getElementById("buzzer-status").innerText = "ACTIVE (Beep Beep!)";
        document.getElementById("buzzer-status").style.color = "#ef4444";
    } else if (message.includes("BUZZER: OFF")) {
        document.getElementById("buzzer-status").innerText = "Standby";
        document.getElementById("buzzer-status").style.color = "#fbbf24";
    }
}

function robotArrivedAtDestination() {
    // Generate OTP
    generatedOTP = Math.floor(1000 + Math.random() * 9000).toString();
    console.log("Generated OTP: " + generatedOTP);
    
    // UI Updates
    document.getElementById("buzzer-status").innerText = "ACTIVE (Beep Beep!)";
    document.getElementById("buzzer-status").style.color = "#ef4444";
    
    alert("🚨 BUZZER BEEPING! Robot arrived at " + selectedDestination + ".\n🔑 Verification OTP: " + generatedOTP);

    document.getElementById("mode-prompt-card").style.display = "block";
    document.getElementById("robot-status-banner").innerText = "🔔 ARRIVED AT " + selectedDestination.toUpperCase() + " - OTP: " + generatedOTP;

    startArrivalTimeout();
}

function selectMode(mode) {
    if(mode === 'Unlock') {
        alert("Please enter the 4-digit OTP below to unlock the compartment.");
    } else {
        alert("New delivery task workflow selected.");
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
            alert("⚠️ Timeout! No one collected the items. Robot is automatically returning to the Pharmacy.");
            sendBluetoothCommand("TIMEOUT_RETURN");
            resetRobotToPharmacy("TIMEOUT: Returned to Pharmacy");
        }
    }, 1000);
}

function verifyPassword() {
    const enteredPass = document.getElementById("password-input").value;
    const statusBadge = document.getElementById("status-badge");
    
    if (enteredPass === generatedOTP) {
        clearInterval(activeTimer); 
        
        statusBadge.innerText = "🔓 UNLOCKED";
        statusBadge.className = "badge unlocked";
        document.getElementById("robot-status-banner").innerText = "✓ OTP VERIFIED - COMPARTMENT OPEN";
        document.getElementById("buzzer-status").innerText = "Standby";
        document.getElementById("buzzer-status").style.color = "#fbbf24";
        document.getElementById("mode-prompt-card").style.display = "none";

        // Send unlock command to Arduino (triggers servo lock & syringe lift)
        sendBluetoothCommand("UNLOCK_ME");

        startRetrievalWindow();
    } else {
        alert("❌ Authentication Failed: Invalid OTP code!");
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
            
            statusBadge.innerText = "🔒 LOCKED";
            statusBadge.className = "badge locked";
            document.getElementById("password-input").value = "";
            
            checkForNextCommandOrReturn();
        }
    }, 1000);
}

function checkForNextCommandOrReturn() {
    document.getElementById("robot-status-banner").innerText = "🔍 Checking for next room command...";
    
    setTimeout(() => {
        let hasNewCommand = confirm("Do you want to send the robot to another room/ward? (Click Cancel to return to Pharmacy)");
        if(hasNewCommand) {
            alert("Please select a new destination ward from the panel.");
            document.getElementById("robot-status-banner").innerText = "🚀 READY FOR NEXT COMMAND";
        } else {
            sendBluetoothCommand("RETURN_PHARMACY");
            resetRobotToPharmacy("No further commands. Returning to Pharmacy.");
        }
    }, 3000);
}

function resetRobotToPharmacy(reason) {
    if(activeTimer) clearInterval(activeTimer);
    document.getElementById("robot-status-banner").innerText = "🔄 " + reason;
    alert("🏥 Robot returning to Pharmacy automatically.");
    
    document.getElementById("status-badge").innerText = "🔒 LOCKED";
    document.getElementById("status-badge").className = "badge locked";
    document.getElementById("mode-prompt-card").style.display = "none";
    document.getElementById("selected-dest").innerText = "Pharmacy (Returned)";
    document.getElementById("timer").innerText = "120";
    document.getElementById("timer-label-desc").innerText = "System in standby.";
    selectedDestination = "";
    generatedOTP = "";
}